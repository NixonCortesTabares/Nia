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
  ChatCompletionToolMessageParam,
} from "openai/resources/chat/completions";
import { Negocio } from "../domain/entities/Negocio";
import { Cliente } from "../domain/entities/Cliente";
import { Conversacion } from "../domain/entities/Conversacion";
import { Mensaje } from "../domain/entities/Mensaje";
import { tools } from "./tools";
import { toolsGroq } from "./tools.groq";
import { toolsGemini } from "./tools.gemini";
import { buildSystemPrompt } from "./prompt";
import { ejecutarHerramienta } from "./handlers";

type AgentTurnParams = {
  negocio: Negocio;
  cliente: Cliente;
  conversacion: Conversacion;
  historial: Mensaje[];
  mensajeCliente: string;
};

type ClaudeMessage = {
  role: "user" | "assistant";
  content: string | unknown[];
};

type ClaudeContentBlock = {
  type: string;
  text?: string;
  id?: string;
  name?: string;
  input?: unknown;
};

type ClaudeResponse = {
  stop_reason?: string;
  content: ClaudeContentBlock[];
};

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const geminiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const MAX_TOOL_STEPS = 4;

export async function runAgentTurn(
  params: AgentTurnParams
): Promise<string | null> {
  const provider = process.env.LLM_PROVIDER ?? "anthropic";
  console.log("LLM provider usado:", provider);

  if (provider === "groq") {
    return runAgentTurnGroq(params);
  }

  if (provider === "gemini") {
    return runAgentTurnGemini(params);
  }

  return runAgentTurnAnthropic(params);
}

export async function runAgentTurnAnthropic(
  params: AgentTurnParams
): Promise<string | null> {
  if (params.negocio.activo === false) {
    return null;
  }

  try {
    const messages: ClaudeMessage[] = params.historial.map((mensaje) => ({
      role: mensaje.rol === "cliente" ? "user" : "assistant",
      content: mensaje.contenido,
    }));

    if (
      hasContent(params.mensajeCliente) &&
      !mensajeActualYaEstaEnHistorial(params.historial, params.mensajeCliente)
    ) {
      messages.push({
        role: "user",
        content: params.mensajeCliente,
      });
    }
    const MAX_ITERACIONES = 5;
    let iteraciones = 0;

    // Loop hasta que Claude devuelva end_turn
    while (true) {

      if (iteraciones >= MAX_ITERACIONES) {
        console.error('Límite de iteraciones alcanzado — posible loop infinito');
        return "En este momento no puedo completar tu solicitud. Intenta de nuevo.";
      }
      iteraciones++;
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system: buildSystemPrompt(params.negocio),
          tools,
          messages,
        }),
      });

      const data = (await response.json()) as ClaudeResponse;
      console.log("Anthropic status:", response.status);
      console.log("Anthropic stop_reason:", data.stop_reason);

      // Claude terminó — devuelve el texto
      if (data.stop_reason === "end_turn") {
        const textBlock = data.content.find(b => b.type === "text");
        return textBlock?.text ?? "";
      }

      // Claude quiere usar herramientas
      if (data.stop_reason === "tool_use") {
        const toolUseBlocks = data.content.filter(b => b.type === "tool_use");

        if (toolUseBlocks.length === 0) {
          return "No pude procesar tu mensaje en este momento.";
        }

        // Agregar respuesta del assistant al historial
        messages.push({
          role: "assistant",
          content: data.content,
        });

        // Ejecutar todas las herramientas y agregar resultados
        const toolResults = [];
        for (const toolUse of toolUseBlocks) {
          if (!toolUse.name || !toolUse.id) continue;

          console.log("Tool ejecutada:", toolUse.name);

          const resultado = await ejecutarHerramienta(
            toolUse.name,
            toolUse.input,
            params.negocio.id,
            params.conversacion.id,
            params.cliente.id
          );

          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: resultado,
          });
        }

        // Agregar resultados al historial y continuar el loop
        messages.push({
          role: "user",
          content: toolResults,
        });

        continue;
      }

      // Caso inesperado
      return "No pude procesar tu mensaje en este momento.";
    }

  } catch (error) {
    console.error("Error en runAgentTurnAnthropic:", error);
    return "Tuve un problema procesando tu mensaje. Intenta de nuevo.";
  }
}

export async function runAgentTurnGroq(
  params: AgentTurnParams
): Promise<string | null> {
  if (params.negocio.activo === false) {
    return null;
  }

  try {
    const model = process.env.GROQ_MODEL ?? DEFAULT_GROQ_MODEL;
    console.log("Modelo Groq usado:", model);

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: buildSystemPrompt(params.negocio),
      },
      ...params.historial
        .filter((mensaje) => hasContent(mensaje.contenido))
        .map<ChatCompletionMessageParam>((mensaje) => ({
          role: mensaje.rol === "cliente" ? "user" : "assistant",
          content: mensaje.contenido,
        })),
    ];

    if (
      hasContent(params.mensajeCliente) &&
      !mensajeActualYaEstaEnHistorial(params.historial, params.mensajeCliente)
    ) {
      messages.push({
        role: "user",
        content: params.mensajeCliente,
      });
    }

    for (let step = 1; step <= MAX_TOOL_STEPS; step++) {
      console.log("Groq paso de herramientas:", step);

      const response = await client.chat.completions.create({
        model,
        max_tokens: 1024,
        tools: toolsGroq,
        tool_choice: "auto",
        messages,
      });

      const choice = response.choices[0];

      if (!choice || !choice.message) {
        console.error("Groq no devolvio choice.message.");
        return "No pude procesar tu mensaje en este momento.";
      }

      const assistantMessage = choice.message;
      const toolCalls = assistantMessage.tool_calls ?? [];
      console.log("Groq tuvo tool_calls:", toolCalls.length > 0);

      if (toolCalls.length === 0) {
        const finalText = assistantMessage.content?.trim();

        if (finalText) {
          return finalText;
        }

        return "No pude generar una respuesta final en este momento.";
      }

      messages.push({
        role: "assistant",
        content: assistantMessage.content ?? "",
        tool_calls: toolCalls,
      });

      for (const toolCall of toolCalls) {
        if (toolCall.type !== "function") {
          console.error("Groq devolvio un tool_call no soportado:", toolCall.type);
          continue;
        }

        const toolName = toolCall.function.name;
        console.log("Tool ejecutada:", toolName);

        const toolInput = parseToolArguments(toolCall.function.arguments);
        console.log("Input de tool:", JSON.stringify(toolInput, null, 2));

        const resultado = await ejecutarHerramienta(
          toolName,
          toolInput,
          params.negocio.id,
          params.conversacion.id,
          params.cliente.id
        );

        console.log("Resultado de tool:", JSON.stringify(resultado, null, 2));

        const toolMessage: ChatCompletionToolMessageParam = {
          role: "tool",
          tool_call_id: toolCall.id,
          content: stringifyToolResult(resultado),
        };

        messages.push(toolMessage);
      }
    }

    console.error("Groq alcanzó el límite máximo de pasos de herramientas.");
    messages.push({
      role: "user",
      content:
        "Con la información disponible, responde al cliente de forma breve y clara. No intentes usar más herramientas.",
    });

    const finalResponse = await client.chat.completions.create({
      model,
      max_tokens: 1024,
      messages,
    });

    const finalText = finalResponse.choices[0]?.message?.content?.trim();

    if (finalText) {
      return finalText;
    }

    return "No pude completar la solicitud en este momento.";
  } catch (error) {
    console.error("Error en runAgentTurnGroq:", error);
    return "Tuve un problema procesando tu mensaje. Intenta de nuevo.";
  }
}

export async function runAgentTurnGemini(
  params: AgentTurnParams
): Promise<string | null> {
  if (params.negocio.activo === false) {
    return null;
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY no esta configurada para Gemini.");
    return "El agente no está configurado correctamente.";
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

    const systemInstruction = buildSystemPrompt(params.negocio);
    const geminiTools = [
      {
        functionDeclarations: toolsGemini,
      },
    ];

    for (let step = 1; step <= MAX_TOOL_STEPS; step++) {
      console.log("Gemini paso de herramientas:", step);

      const response = await geminiClient.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          maxOutputTokens: 1024,
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

      if (functionCalls.length === 0) {
        const finalText = response.text?.trim();

        if (finalText) {
          return finalText;
        }

        return "No pude generar una respuesta final en este momento.";
      }

      contents.push({
        role: "model",
        parts: functionCalls.map<Part>((functionCall) => ({
          functionCall,
        })),
      });

      const functionResponseParts: Part[] = [];

      for (const functionCall of functionCalls) {
        if (!functionCall.name) {
          console.error("Gemini devolvio functionCall sin name.");
          continue;
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

        functionResponseParts.push({
          functionResponse: buildGeminiFunctionResponse(functionCall, resultado),
        });
      }

      contents.push({
        role: "user",
        parts: functionResponseParts,
      });
    }

    console.error("Gemini alcanzó el límite máximo de pasos de herramientas.");
    const finalContents: Content[] = [
      ...contents,
      {
        role: "user",
        parts: [
          {
            text: "Con la información disponible, responde al cliente de forma breve y clara. No intentes usar más herramientas.",
          },
        ],
      },
    ];

    const finalResponse = await geminiClient.models.generateContent({
      model,
      contents: finalContents,
      config: {
        systemInstruction,
        maxOutputTokens: 1024,
        tools: geminiTools,
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.NONE,
          },
        },
      },
    });

    const finalText = finalResponse.text?.trim();

    if (finalText) {
      return finalText;
    }

    return "No pude completar la solicitud en este momento.";
  } catch (error) {
    console.error("Error en runAgentTurnGemini:", error);
    return "Tuve un problema procesando tu mensaje. Intenta de nuevo.";
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

function buildGeminiFunctionResponse(
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
}

function stringifyToolResult(resultado: unknown): string {
  if (typeof resultado === "string") {
    return resultado;
  }

  return JSON.stringify(
    resultado ?? { ok: false, message: "La herramienta no devolvió resultado." }
  );
}
