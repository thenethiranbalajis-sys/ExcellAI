import type { AIGateway } from "../gateway";
import { credentialStore } from "../credentials/runtime";
import { OpenAIProvider } from "./openai";
import { GeminiProvider } from "./gemini";
import { AnthropicProvider } from "./anthropic";

export function registerCloudProviders(gateway: AIGateway): void {
  gateway.registerProvider(new OpenAIProvider(credentialStore));
  gateway.registerProvider(new GeminiProvider(credentialStore));
  gateway.registerProvider(new AnthropicProvider(credentialStore));
}
