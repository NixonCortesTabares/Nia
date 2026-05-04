import { Negocio } from "../domain/entities/Negocio";
import { Cliente } from "../domain/entities/Cliente";
import { Conversacion } from "../domain/entities/Conversacion";
import { Mensaje } from "../domain/entities/Mensaje";
import { tools } from "./tools";
import { buildSystemPrompt } from "./prompt";
import { ejecutarHerramienta } from "./handlers";

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

export async function runAgentTurn(params: {
  negocio: Negocio;
  cliente: Cliente;
  conversacion: Conversacion;
  historial: Mensaje[];
  mensajeCliente: string;
}): Promise<string | null> {
  if (params.negocio.activo === false) {
    return null;
  }

  try {
    const messages: ClaudeMessage[] = params.historial.map((mensaje) => ({
      role: mensaje.rol === "cliente" ? "user" : "assistant",
      content: mensaje.contenido,
    }));

    messages.push({
      role: "user",
      content: params.mensajeCliente,
    });

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

    console.log("ANTHROPIC STATUS:", response.status);
    console.log("ANTHROPIC RAW RESPONSE:", data);

    if (data.stop_reason === "end_turn") {
      return data.content[0].text ?? "";
    }

    if (data.stop_reason === "tool_use") {
      const toolUse = data.content.find((block) => block.type === "tool_use");

      if (!toolUse || !toolUse.name || !toolUse.id) {
        console.log('ENTRANDO AL IFF');
        return "No pude procesar tu mensaje en este momento.";
      }

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
    console.log(data.stop_reason);

    return "No pude procesar tu mensaje en este momento. Segundo";
  } catch (error) {
    console.error('Error en runAgentTurn:', error);
    return "Tuve un problema procesando tu mensaje. Intenta de nuevo.";
  }
}
