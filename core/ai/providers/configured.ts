import { aiGateway } from "../runtime";
import { credentialStore } from "../credentials/runtime";
import { OpenAIProvider } from "./openai";
import { GeminiProvider } from "./gemini";
import { AnthropicProvider } from "./anthropic";

let registered = false;

export function registerCloudProviders(): void {
  if (registered) return;

  aiGateway.registerProvider(new OpenAIProvider(credentialStore));
  aiGateway.registerProvider(new GeminiProvider(credentialStore));
  aiGateway.registerProvider(new AnthropicProvider(credentialStore));

  registered = true;
}
