import type { AIGateway } from "../gateway";
import type { CredentialStore } from "../credentials/types";
import { OpenAIProvider } from "./openai";
import { GeminiProvider } from "./gemini";
import { AnthropicProvider } from "./anthropic";
import { XAIProvider } from "./xai";
import { MistralCloudProvider } from "./mistral-cloud";
import { DeepSeekProvider } from "./deepseek";
import { CohereProvider } from "./cohere";

export function registerCloudProviders(
  gateway: AIGateway,
  credentials: CredentialStore
): void {
  gateway.registerProvider(new OpenAIProvider(credentials));
  gateway.registerProvider(new GeminiProvider(credentials));
  gateway.registerProvider(new AnthropicProvider(credentials));
  gateway.registerProvider(new XAIProvider(credentials));
  gateway.registerProvider(new MistralCloudProvider(credentials));
  gateway.registerProvider(new DeepSeekProvider(credentials));
  gateway.registerProvider(new CohereProvider(credentials));
}
