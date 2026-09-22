import { ModelRegistry } from "./model-registry";

export const modelRegistry = new ModelRegistry();

modelRegistry.register({
  id: "mock",
  providerId: "mock",
  displayName: "ExcellAI Test Model",
  capabilities: {
    streaming: false,
    vision: false,
    toolCalling: false,
    structuredOutput: true
  }
});

modelRegistry.register({
  id: "gpt-4o",
  providerId: "openai",
  displayName: "OpenAI GPT-4o",
  capabilities: {
    streaming: true,
    vision: true,
    toolCalling: true,
    structuredOutput: true
  }
});

modelRegistry.register({
  id: "gemini-2.5-pro",
  providerId: "gemini",
  displayName: "Google Gemini 2.5 Pro",
  capabilities: {
    streaming: true,
    vision: true,
    toolCalling: true,
    structuredOutput: true
  }
});

modelRegistry.register({
  id: "claude-sonnet",
  providerId: "anthropic",
  displayName: "Anthropic Claude",
  capabilities: {
    streaming: true,
    vision: true,
    toolCalling: true,
    structuredOutput: true
  }
});
