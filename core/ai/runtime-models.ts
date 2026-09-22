import { ModelRegistry } from "./model-registry";

export const modelRegistry = new ModelRegistry();

const generalCloudCapabilities = {
  streaming: true,
  vision: true,
  toolCalling: true,
  structuredOutput: true
} as const;

modelRegistry.register({
  id: "gpt-5.6-luna",
  providerId: "openai",
  displayName: "OpenAI GPT-5.6 Luna",
  capabilities: generalCloudCapabilities
});

modelRegistry.register({
  id: "gemini-2.5-pro",
  providerId: "gemini",
  displayName: "Google Gemini 2.5 Pro",
  capabilities: generalCloudCapabilities
});

modelRegistry.register({
  id: "claude-sonnet-5",
  providerId: "anthropic",
  displayName: "Anthropic Claude Sonnet 5",
  capabilities: generalCloudCapabilities
});

modelRegistry.register({
  id: "claude-sonnet-4-6",
  providerId: "anthropic",
  displayName: "Anthropic Claude Sonnet 4.6",
  capabilities: generalCloudCapabilities
});

modelRegistry.register({
  id: "grok-4.7",
  providerId: "xai",
  displayName: "xAI Grok 4.7",
  capabilities: generalCloudCapabilities
});

modelRegistry.register({
  id: "mistral-medium-3-5",
  providerId: "mistral",
  displayName: "Mistral Medium 3.5",
  capabilities: generalCloudCapabilities
});

modelRegistry.register({
  id: "mistral-large-latest",
  providerId: "mistral",
  displayName: "Mistral Large",
  capabilities: generalCloudCapabilities
});

modelRegistry.register({
  id: "deepseek-v4-pro",
  providerId: "deepseek",
  displayName: "DeepSeek V4 Pro",
  capabilities: {
    streaming: true,
    vision: false,
    toolCalling: true,
    structuredOutput: true
  }
});

modelRegistry.register({
  id: "command-a-plus-05-2026",
  providerId: "cohere",
  displayName: "Cohere Command A+",
  capabilities: generalCloudCapabilities
});
