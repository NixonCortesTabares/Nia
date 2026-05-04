import { ChatCompletionTool } from "openai/resources/chat/completions";
import { tools } from "./tools";

export const toolsGroq: ChatCompletionTool[] = tools.map((tool) => ({
  type: "function",
  function: {
    name: tool.name,
    description: tool.description,
    parameters: tool.input_schema,
  },
}));
