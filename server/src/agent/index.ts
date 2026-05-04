import OpenAI from "openai";
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

const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

export async function runAgentTurn(
  params: AgentTurnParams
): Promise<string | null> {
  const provider = process.env.LLM_PROVIDER === "groq" ? "groq" : "anthropic";
  console.log("LLM provider usado:", provider);

  if (provider === "groq") {
    return runAgentTurnGroq(params);
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

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: buildSystemPrompt(params.negocio),
        tools,
        messages,
      }),
    });

    const data = (await response.json()) as ClaudeResponse;

    console.log("Anthropic status:", response.status);
    console.log("Anthropic stop_reason:", data.stop_reason);

    if (data.stop_reason === "end_turn") {
      return data.content[0].text ?? "";
    }

    if (data.stop_reason === "tool_use") {
      const toolUse = data.content.find((block) => block.type === "tool_use");

      if (!toolUse || !toolUse.name || !toolUse.id) {
        return "No pude procesar tu mensaje en este momento.";
      }

      console.log("Tool ejecutada:", toolUse.name);

      const resultado = await ejecutarHerramienta(
        toolUse.name,
        toolUse.input,
        params.negocio.id,
        params.conversacion.id
      );

      const response2 = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          system: buildSystemPrompt(params.negocio),
          tools,
          messages: [
            ...messages,
            {
              role: "assistant",
              content: data.content,
            },
            {
              role: "user",
              content: [
                {
                  type: "tool_result",
                  tool_use_id: toolUse.id,
                  content: resultado,
                },
              ],
            },
          ],
        }),
      });

      const data2 = (await response2.json()) as ClaudeResponse;

      return data2.content[0].text ?? "";
    }

    return "No pude procesar tu mensaje en este momento.";
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

    const response = await client.chat.completions.create({
      model,
      max_tokens: 1024,
      tools: toolsGroq,
      tool_choice: "auto",
      messages,
    });

    const choice = response.choices[0];

    if (!choice || !choice.message) {
      console.error("Groq no devolvio choice.message en la primera llamada.");
      return "No pude procesar tu mensaje en este momento.";
    }

    const assistantMessage = choice.message;
    const toolCalls = assistantMessage.tool_calls ?? [];
    console.log("Groq tuvo tool_calls:", toolCalls.length > 0);

    if (toolCalls.length === 0) {
      return assistantMessage.content ?? "";
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
        params.conversacion.id
      );

      console.log("Resultado de tool:", JSON.stringify(resultado, null, 2));

      const toolMessage: ChatCompletionToolMessageParam = {
        role: "tool",
        tool_call_id: toolCall.id,
        content:
          typeof resultado === "string" ? resultado : JSON.stringify(resultado),
      };

      messages.push(toolMessage);
    }

    const response2 = await client.chat.completions.create({
      model,
      max_tokens: 1024,
      tools: toolsGroq,
      tool_choice: "none",
      messages,
    });

    const choice2 = response2.choices[0];

    if (!choice2 || !choice2.message) {
      console.error("Groq no devolvio choice.message en la segunda llamada.");
      return "No pude procesar tu mensaje en este momento.";
    }

    console.log(
      "Groq segunda respuesta message:",
      JSON.stringify(choice2.message, null, 2)
    );

    const finalText = choice2.message.content?.trim();

    if (finalText) {
      return finalText;
    }

    return "No pude generar una respuesta final en este momento.";
  } catch (error) {
    console.error("Error en runAgentTurnGroq:", error);
    return "Tuve un problema procesando tu mensaje. Intenta de nuevo.";
  }
}

function hasContent(content: string | null | undefined): content is string {
  return typeof content === "string" && content.trim().length > 0;
}

function parseToolArguments(argumentsText: string | undefined): unknown {
  try {
    return JSON.parse(argumentsText || "{}") as unknown;
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