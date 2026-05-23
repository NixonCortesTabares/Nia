import { FunctionDeclaration } from "@google/genai";
import { tools } from "./tools";

export const toolsGemini: FunctionDeclaration[] = tools.map((tool) => ({
  name: tool.name,
  description: tool.description,
  parametersJsonSchema: tool.input_schema,
}));
