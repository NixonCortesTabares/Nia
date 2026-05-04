"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAgentTurn = runAgentTurn;
const tools_1 = require("./tools");
const prompt_1 = require("./prompt");
const handlers_1 = require("./handlers");
async function runAgentTurn(params) {
    if (params.negocio.activo === false) {
        return null;
    }
    try {
        const messages = params.historial.map((mensaje) => ({
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
                system: (0, prompt_1.buildSystemPrompt)(params.negocio),
                tools: tools_1.tools,
                messages,
            }),
        });
        const data = (await response.json());
        if (data.stop_reason === "end_turn") {
            return data.content[0].text ?? "";
        }
        if (data.stop_reason === "tool_use") {
            const toolUse = data.content.find((block) => block.type === "tool_use");
            if (!toolUse || !toolUse.name || !toolUse.id) {
                return "No pude procesar tu mensaje en este momento.";
            }
            const resultado = await (0, handlers_1.ejecutarHerramienta)(toolUse.name, toolUse.input, params.negocio.id, params.conversacion.id);
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
                    system: (0, prompt_1.buildSystemPrompt)(params.negocio),
                    tools: tools_1.tools,
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
            const data2 = (await response2.json());
            return data2.content[0].text ?? "";
        }
        return "No pude procesar tu mensaje en este momento.";
    }
    catch (error) {
        return "Tuve un problema procesando tu mensaje. Intenta de nuevo.";
    }
}
