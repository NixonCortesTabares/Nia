import OpenAI from "openai";
import {
  Content,
  FunctionCall,
  FunctionCallingConfigMode,
  GoogleGenAI,
  Part,
} from "@google/genai";
import {
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
  ChatCompletionToolMessageParam,
} from "openai/resources/chat/completions";
import { Negocio } from "../domain/entities/Negocio";
import { Cliente } from "../domain/entities/Cliente";
import { Conversacion, PedidoBorrador, PedidoBorradorItem } from "../domain/entities/Conversacion";
import { Mensaje } from "../domain/entities/Mensaje";
import { tools } from "./tools";
import { toolsGroq } from "./tools.groq";
import { toolsGemini } from "./tools.gemini";
import { buildSystemPrompt } from "./prompt";
import { ejecutarHerramienta, ToolResultado } from "./handlers";
import { resolverPedidoBorradorUseCase } from "../application/conversaciones/ResolverPedidoBorradorUseCase";
import { PedidoRepository } from "../infraestructure/repositories/PedidoRepository";

type AgentTurnParams = {
  negocio: Negocio;
  cliente: Cliente;
  conversacion: Conversacion;
  historial: Mensaje[];
  mensajeCliente: string;
  pedidoBorrador: PedidoBorrador;
  menu: string
};

export type AgentTurnResult = {
  mensajeCliente: string;
  pedidoBorrador: PedidoBorrador;
  ok: boolean
};

const geminiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

export async function runAgentTurn(
  params: AgentTurnParams
): Promise<AgentTurnResult | null> {
  const provider = process.env.LLM_PROVIDER ?? "anthropic";
  console.log("LLM provider usado:", provider);
  return runAgentTurnGemini(params);
}

export async function runAgentTurnGemini(
  params: AgentTurnParams
): Promise<AgentTurnResult | null> {
  if (params.negocio.activo === false) {
    return null;
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY no esta configurada para Gemini.");
    return {
      mensajeCliente: "El agente no está configurado correctamente.",
      pedidoBorrador: params.pedidoBorrador,
      ok: false
    };
  }

  try {
    const model = process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;
    console.log("Modelo Gemini usado:", model);

    const contents: Content[] = params.historial
      .filter((mensaje) => hasContent(mensaje.contenido))
      .map<Content>((mensaje) => ({
        role: mensaje.rol === "cliente" ? "user" : "model",
        parts: [{ text: mensaje.contenido }],
      }));

    if (
      hasContent(params.mensajeCliente) &&
      !mensajeActualYaEstaEnHistorial(params.historial, params.mensajeCliente)
    ) {
      contents.push({
        role: "user",
        parts: [{ text: params.mensajeCliente }],
      });
    }

    const systemInstruction = await buildSystemPromptConBorrador(
      params.negocio,
      params.pedidoBorrador,
      params.menu,
      params.cliente.telefono
    );
    /* console.log("SISTEMA DE INSTRUCCIONES");
     console.log(systemInstruction);*/

    const geminiTools = [
      {
        functionDeclarations: toolsGemini,
      },
    ];

    // Primera y única llamada con tools
    const response = await geminiClient.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        maxOutputTokens: 4096,
        tools: geminiTools,
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.AUTO,
          },
        },
      },
    });

    const functionCalls = response.functionCalls ?? [];

    console.log("Gemini tuvo function calls:", functionCalls.length > 0);
    console.log("Cantidad de function calls:", functionCalls.length);

    // Caso 1: no usó tool, entonces debe responder JSON estructurado
    if (functionCalls.length === 0) {

      const finalText = response.text?.trim();

      if (!finalText) {
        return {
          mensajeCliente: "No pude generar una respuesta final en este momento.",
          pedidoBorrador: params.pedidoBorrador,
          ok: false
        };
      }

      const respuestaAgente = parseAgentStructuredResponse(finalText, params.pedidoBorrador);
      if (respuestaAgente.ok === false) {

      }
      const resultadoResolucion = await resolverPedidoBorradorUseCase(respuestaAgente.pedidoBorrador, params.negocio.id);

      if (!resultadoResolucion.ok) {
        return {
          mensajeCliente: resultadoResolucion.mensajeCliente,
          pedidoBorrador: params.pedidoBorrador,
          ok: false
        };
      }

      return {
        mensajeCliente: respuestaAgente.mensajeCliente,
        pedidoBorrador: resultadoResolucion.pedidoBorrador,
        ok: true
      };

    }

    // Caso 2: si Gemini pide más de una tool, solo ejecutamos la primera
    if (functionCalls.length > 1) {
      console.warn(
        "Gemini devolvió más de una function call. Solo se ejecutará la primera.",
        functionCalls.map((functionCall) => functionCall.name)
      );
    }

    const functionCall = functionCalls[0];

    if (!functionCall || !functionCall.name) {
      console.error("Gemini devolvió functionCall inválida.");

      return {
        mensajeCliente: "No pude procesar esta acción en este momento.",
        pedidoBorrador: params.pedidoBorrador,
        ok: false
      };
    }

    const toolName = functionCall.name;
    const toolInput = normalizarGeminiArgs(functionCall.args);

    console.log("Tool ejecutada:", toolName);
    console.log("Input de tool:", JSON.stringify(toolInput, null, 2));

    const resultado = await ejecutarHerramienta(
      toolName,
      toolInput,
      params.negocio.id,
      params.conversacion.id,
      params.cliente.id
    );

    console.log("Resultado de tool:", JSON.stringify(resultado, null, 2));

    // Caso 3: la tool fue exitosa.
    // Responde backend directamente. No volvemos a llamar a Gemini.
    if (resultado.ok === true) {
      return {
        mensajeCliente: resultado.mensaje,
        pedidoBorrador: params.pedidoBorrador,
        ok: true
      };
    }

    // Caso 4: la tool falló.
    // Ahora sí dejamos que Gemini explique el error
    const contentsSinTools: Content[] = [
      ...contents,
      {
        role: "user",
        parts: [
          {
            text: `
La herramienta "${toolName}" no pudo completar la acción.

Resultado de la herramienta:
${JSON.stringify(resultado, null, 2)}

Intenta corregir el error que tienes, y reintenta la herramienta.
En caso de que sea necesario, explícale al cliente de forma breve qué debe corregir o aclarar.
No confirmes que el pedido fue registrado.

Responde en el formato JSON estructurado obligatorio:
{
  "mensaje_cliente": "texto que se enviará al cliente",
  "pedido_borrador": {
    "nombre_cliente": string | null,
    "telefono_cliente": string | null,
    "tipo_entrega": "domicilio" | "recoger_en_local" | "consumo_en_local",
    "direccion_entrega": string | null,
    "metodo_pago": "efectivo" | "transferencia" | null,
    "items": [
      {
        "nombre_producto": string,
        "cantidad": number,
        "extras": string[],
        "notas": string | null
      }
    ],
    "notas": string | null
  }
}
            `,
          },
        ],
      },
    ];

    const responseSinTools = await geminiClient.models.generateContent({
      model,
      contents: contentsSinTools,
      config: {
        systemInstruction,
        maxOutputTokens: 4096,
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.AUTO,
          },
        },
      },
    });

    const textoFinal = responseSinTools.text?.trim();

    if (!textoFinal) {
      return {
        mensajeCliente: resultado.mensaje,
        pedidoBorrador: params.pedidoBorrador,
        ok: false
      };
    }

    return parseAgentStructuredResponse(textoFinal, params.pedidoBorrador);
  } catch (error) {
    console.error("Error en runAgentTurnGemini:", error);

    return {
      mensajeCliente: "Tuve un problema procesando tu mensaje. Intenta de nuevo.",
      pedidoBorrador: params.pedidoBorrador,
      ok: false
    };
  }
}

function hasContent(content: string | null | undefined): content is string {
  return typeof content === "string" && content.trim().length > 0;
}

function parseToolArguments(argumentsText: string | undefined): Record<string, unknown> {
  try {
    const parsed = JSON.parse(argumentsText || "{}") as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    const prototype = Object.getPrototypeOf(parsed);
    if (prototype !== Object.prototype && prototype !== null) {
      return {};
    }

    return parsed as Record<string, unknown>;
  } catch (error) {
    console.error("Error parseando argumentos de tool_call:", error);
    return {};
  }
}

function mensajeActualYaEstaEnHistorial(
  historial: Mensaje[],
  mensajeCliente: string
): boolean {
  const ultimoMensaje = historial[historial.length - 1];

  return (
    ultimoMensaje?.rol === "cliente" &&
    ultimoMensaje.contenido?.trim() === mensajeCliente.trim()
  );
}

function normalizarGeminiArgs(args: unknown): Record<string, unknown> {
  if (!args || typeof args !== "object" || Array.isArray(args)) {
    return {};
  }

  const prototype = Object.getPrototypeOf(args);
  if (prototype !== Object.prototype && prototype !== null) {
    return {};
  }

  return args as Record<string, unknown>;
}

/*function buildGeminiFunctionResponse(
  functionCall: FunctionCall,
  resultado: unknown
): {
  id?: string;
  name?: string;
  response: Record<string, unknown>;
} {
  return {
    id: functionCall.id,
    name: functionCall.name,
    response: {
      output: stringifyToolResult(resultado),
    },
  };
}*/

/*function stringifyToolResult(resultado: unknown): string {
  if (typeof resultado === "string") {
    return resultado;
  }

  return JSON.stringify(
    resultado ?? { ok: false, message: "La herramienta no devolvió resultado." }
  );
}*/

function buildPedidoBorradorContext(pedidoBorrador: PedidoBorrador, tienePedidoPendiente: boolean): string {
  const sinPedido = `
MEMORIA ESTRUCTURADA DEL PEDIDO

Este es el pedido_borrador actual de la conversación:

${JSON.stringify(pedidoBorrador, null, 2)}

Usa este objeto como la memoria estructurada del pedido actual.

REGLAS PARA ACTUALIZAR pedido_borrador

- Conserva todos los datos existentes salvo que el cliente los corrija explícitamente.
- Si el cliente aporta nuevos datos, actualiza únicamente los campos correspondientes.
- Si el cliente cambia un producto, una cantidad, un extra, una nota, el nombre, el teléfono, la dirección o el método de pago, refleja ese cambio en pedido_borrador.
- Si el cliente no especifica cantidad de un producto nuevo, usa cantidad = 1.
- Si el cliente no especifica extras para un producto nuevo, usa extras = [].
- Si el cliente no especifica notas para un producto nuevo, usa notas = null.
- tipo_entrega debe conservarse como "domicilio" por defecto, salvo que el cliente diga explícitamente que recoge en local o consume en el local.
- No inventes productos, precios, promociones, direcciones, teléfonos ni métodos de pago.
- No elimines items existentes a menos que el cliente indique claramente que quiere quitarlos, cambiarlos o reemplazar el pedido.

FORMATO TÉCNICO OBLIGATORIO

Cuando no estés llamando una herramienta, responde únicamente con JSON válido.
No uses markdown.
No uses bloques de código.
No escribas texto antes ni después del JSON.

Tu respuesta debe tener exactamente esta estructura:

{
  "mensaje_cliente": "texto natural que se enviará al cliente por WhatsApp",
  "pedido_borrador": {
    "nombre_cliente": string | null,
    "telefono_cliente": string | null,
    "tipo_entrega": "domicilio" | "recoger_en_local" | "consumo_en_local",
    "direccion_entrega": string | null,
    "metodo_pago": "efectivo" | "transferencia" | null,
    "items": [
      {
        "nombre_producto": string,
        "cantidad": number,
        "extras": string[],
        "notas": string | null
      }
    ],
    "notas": string | null
  }
}

El cliente nunca verá el JSON completo.
El sistema guardará pedido_borrador y enviará únicamente mensaje_cliente.

IMPORTANTE

Aunque en el historial veas mensajes anteriores del asistente escritos como texto normal, tu respuesta actual debe seguir siendo JSON válido.
El sistema hará JSON.parse() de tu respuesta. Si respondes texto normal, el procesamiento fallará.
`;
  /********************************************************************* */
  const conPedido = `
MEMORIA ESTRUCTURADA DEL PEDIDO

Este es el pedido_borrador actual de la conversación:

${JSON.stringify(pedidoBorrador, null, 2)}

Usa este objeto como la memoria estructurada del pedido actual para responder dudas sobre el pedido del cliente.

FORMATO TÉCNICO OBLIGATORIO

Tu respuesta debe tener exactamente esta estructura:

{
  "mensaje_cliente": "texto natural que se enviará al cliente por WhatsApp",
  "pedido_borrador": {
    "nombre_cliente": string | null,
    "telefono_cliente": string | null,
    "tipo_entrega": "domicilio" | "recoger_en_local" | "consumo_en_local",
    "direccion_entrega": string | null,
    "metodo_pago": "efectivo" | "transferencia" | null,
    "items": [
      {
        "nombre_producto": string,
        "cantidad": number,
        "extras": string[],
        "notas": string | null
      }
    ],
    "notas": string | null
  }
}

El cliente nunca verá el JSON completo.
El sistema guardará pedido_borrador y enviará únicamente mensaje_cliente.

IMPORTANTE

Aunque en el historial veas mensajes anteriores del asistente escritos como texto normal, tu respuesta actual debe seguir siendo JSON válido.
El sistema hará JSON.parse() de tu respuesta. Si respondes texto normal, el procesamiento fallará.
`;

  if (tienePedidoPendiente) {
    return conPedido;
  }
  return sinPedido
}

async function buildSystemPromptConBorrador(
  negocio: Negocio,
  pedidoBorrador: PedidoBorrador,
  menu: string,
  telCliente: string
): Promise<string> {
  const pedidoRepo = new PedidoRepository();
  const pendientesPorCliente = await pedidoRepo.buscarPendientesPorCliente(negocio.id, telCliente);

  if (pendientesPorCliente === null) {
    return `${buildSystemPrompt(negocio, false)}

  ${menu}

${buildPedidoBorradorContext(pedidoBorrador, false)}`
  }
  else {
    return `
    ${buildSystemPrompt(negocio, true)}
    ${buildPedidoBorradorContext(pedidoBorrador, true)}
    `
  }
}

function parseAgentStructuredResponse(
  text: string,
  pedidoBorradorFallback: PedidoBorrador
): AgentTurnResult {
  try {
    const cleaned = limpiarJsonDelModelo(text);
    const parsed = JSON.parse(cleaned) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("La respuesta del agente no es un objeto JSON.");
    }

    const data = parsed as {
      mensaje_cliente?: unknown;
      pedido_borrador?: unknown;
    };

    if (typeof data.mensaje_cliente !== "string" || !data.mensaje_cliente.trim()) {
      throw new Error("La respuesta del agente no tiene mensaje_cliente válido.");
    }

    if (!esPedidoBorradorValido(data.pedido_borrador)) {
      throw new Error("La respuesta del agente no tiene pedido_borrador válido.");
    }

    return {
      mensajeCliente: data.mensaje_cliente.trim(),
      pedidoBorrador: data.pedido_borrador,
      ok: true
    };
  } catch (error) {
    console.error("Error parseando respuesta JSON del agente:", error);
    console.error("Texto recibido del agente:", text);

    return {
      mensajeCliente:
        `Te has equivocado creando el JSON, aqui esta el error: ${error}`,
      pedidoBorrador: pedidoBorradorFallback,
      ok: false
    };
  }
}

function limpiarJsonDelModelo(text: string): string {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function esPedidoBorradorValido(valor: unknown): valor is PedidoBorrador {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return false;
  }

  const borrador = valor as PedidoBorrador;

  if (
    borrador.tipo_entrega !== "domicilio" &&
    borrador.tipo_entrega !== "recoger_en_local" &&
    borrador.tipo_entrega !== "consumo_en_local"
  ) {
    return false;
  }

  if (
    borrador.metodo_pago !== null &&
    borrador.metodo_pago !== "efectivo" &&
    borrador.metodo_pago !== "transferencia"
  ) {
    return false;
  }

  if (!Array.isArray(borrador.items)) {
    return false;
  }

  for (const item of borrador.items) {
    if (!item || typeof item !== "object") return false;
    if (typeof item.nombre_producto !== "string") return false;
    if (!Number.isInteger(item.cantidad) || item.cantidad < 1) return false;
    if (!Array.isArray(item.extras)) return false;

    for (const extra of item.extras) {
      if (typeof extra !== "string") return false;
    }

    if (item.notas !== null && typeof item.notas !== "string") {
      return false;
    }
  }

  if (
    borrador.nombre_cliente !== null &&
    typeof borrador.nombre_cliente !== "string"
  ) {
    return false;
  }

  if (
    borrador.telefono_cliente !== null &&
    typeof borrador.telefono_cliente !== "string"
  ) {
    return false;
  }

  if (
    borrador.direccion_entrega !== null &&
    typeof borrador.direccion_entrega !== "string"
  ) {
    return false;
  }

  if (borrador.notas !== null && typeof borrador.notas !== "string") {
    return false;
  }

  return true;
}

function esToolResultado(valor: unknown): valor is ToolResultado {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return false;
  }

  const resultado = valor as ToolResultado;

  return (
    typeof resultado.ok === "boolean" &&
    typeof resultado.mensaje === "string"
  );
}
