import type { AIGateway } from "../gateway";
import { credentialStore } from "../credentials/runtime";
import { OpenAIProvider } from "./openai";
import { GeminiProvider } from "./gemini";
import { AnthropicProvider } from "./anthropic";
import { XAIProvider } from "./xai";
import { MistralCloudProvider } from "./mistral-cloud";
import { DeepSeekProvider } from "./deepseek";
import { CohereProvider } from "./cohere";

export function registerCloudProviders(gateway: AIGateway): void {
  gateway.registerProvider(new OpenAIProvider(credentialStore));
  gateway.registerProvider(new GeminiProvider(credentialStore));
  gateway.registerProvider(new AnthropicProvider(credentialStore));
  gateway.registerProvider(new XAIProvider(credentialStore));
  gateway.registerProvider(new MistralCloudProvider(credentialStore));
  gateway.registerProvider(new DeepSeekProvider(credentialStore));
  gateway.registerProvider(new CohereProvider(credentialStore));
}
