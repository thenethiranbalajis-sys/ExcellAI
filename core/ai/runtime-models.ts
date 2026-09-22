import { ModelRegistry } from "./model-registry";

export const modelRegistry = new ModelRegistry();

modelRegistry.register({
  id: "gpt-4o",
  providerId: "openai",
  displayName: "OpenAI GPT-4o",
  capabilities: { streaming: true, vision: true, toolCalling: true, structuredOutput: true }
});

modelRegistry.register({
  id: "gemini-2.5-pro",
  providerId: "gemini",
  displayName: "Google Gemini 2.5 Pro",
  capabilities: { streaming: true, vision: true, toolCalling: true, structuredOutput: true }
});

modelRegistry.register({
  id: "claude-sonnet",
  providerId: "anthropic",
  displayName: "Anthropic Claude",
  capabilities: { streaming: true, vision: true, toolCalling: true, structuredOutput: true }
});

modelRegistry.register({
  id: "grok-4.6",
  providerId: "xai",
  displayName: "xAI Grok 4.6",
  capabilities: { streaming: true, vision: true, toolCalling: true, structuredOutput: true }
});

modelRegistry.register({
  id: "mistral-medium-3.5",
  providerId: "mistral",
  displayName: "Mistral Medium 3.5",
  capabilities: { streaming: true, vision: true, toolCalling: true, structuredOutput: true }
});

modelRegistry.register({
  id: "deepseek-v4-pro",
  providerId: "deepseek",
  displayName: "DeepSeek V4 Pro",
  capabilities: { streaming: true, vision: false, toolCalling: true, structuredOutput: true }
});

modelRegistry.register({
  id: "command-a-plus-05-2026",
  providerId: "cohere",
  displayName: "Cohere Command A+",
  capabilities: { streaming: true, vision: true, toolCalling: true, structuredOutput: true }
});
