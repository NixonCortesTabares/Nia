"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAgentTurn = runAgentTurn;
exports.runAgentTurnAnthropic = runAgentTurnAnthropic;
exports.runAgentTurnGroq = runAgentTurnGroq;
const openai_1 = __importDefault(require("openai"));
const tools_1 = require("./tools");
const tools_groq_1 = require("./tools.groq");
const prompt_1 = require("./prompt");
const handlers_1 = require("./handlers");
const client = new openai_1.default({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
async function runAgentTurn(params) {
    const provider = process.env.LLM_PROVIDER === "groq" ? "groq" : "anthropic";
    console.log("LLM provider usado:", provider);
    if (provider === "groq") {
        return runAgentTurnGroq(params);
    }
    return runAgentTurnAnthropic(params);
}
async function runAgentTurnAnthropic(params) {
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
        console.error("Error en runAgentTurnAnthropic:", error);
        return "Tuve un problema procesando tu mensaje. Intenta de nuevo.";
    }
}
async function runAgentTurnGroq(params) {
    if (params.negocio.activo === false) {
        return null;
    }
    try {
        const model = process.env.GROQ_MODEL ?? DEFAULT_GROQ_MODEL;
        console.log("Modelo Groq usado:", model);
        const messages = [
            {
                role: "system",
                content: (0, prompt_1.buildSystemPrompt)(params.negocio),
            },
            ...params.historial
                .filter((mensaje) => hasContent(mensaje.contenido))
                .map((mensaje) => ({
                role: mensaje.rol === "cliente" ? "user" : "assistant",
                content: mensaje.contenido,
            })),
        ];
        if (hasContent(params.mensajeCliente)) {
            messages.push({
                role: "user",
                content: params.mensajeCliente,
            });
        }
        const response = await client.chat.completions.create({
            model,
            max_tokens: 1024,
            tools: tools_groq_1.toolsGroq,
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
            const resultado = await (0, handlers_1.ejecutarHerramienta)(toolName, toolInput, params.negocio.id, params.conversacion.id);
            const toolMessage = {
                role: "tool",
                tool_call_id: toolCall.id,
                content: typeof resultado === "string" ? resultado : JSON.stringify(resultado),
            };
            messages.push(toolMessage);
        }
        const response2 = await client.chat.completions.create({
            model,
            max_tokens: 1024,
            tools: tools_groq_1.toolsGroq,
            messages,
        });
        const choice2 = response2.choices[0];
        if (!choice2 || !choice2.message) {
            console.error("Groq no devolvio choice.message en la segunda llamada.");
            return "No pude procesar tu mensaje en este momento.";
        }
        return choice2.message.content ?? "";
    }
    catch (error) {
        console.error("Error en runAgentTurnGroq:", error);
        return "Tuve un problema procesando tu mensaje. Intenta de nuevo.";
    }
}
function hasContent(content) {
    return typeof content === "string" && content.trim().length > 0;
}
function parseToolArguments(argumentsText) {
    try {
        return JSON.parse(argumentsText || "{}");
    }
    catch (error) {
        console.error("Error parseando argumentos de tool_call:", error);
        return {};
    }
}
