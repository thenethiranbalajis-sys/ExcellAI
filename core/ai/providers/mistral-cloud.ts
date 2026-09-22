import type { CredentialStore } from "../credentials/types";
import { OpenAICompatibleProvider } from "./openai-compatible";

export class MistralCloudProvider extends OpenAICompatibleProvider {
  constructor(credentials: CredentialStore) {
    super(credentials, {
      id: "mistral",
      name: "Mistral AI",
      baseUrl: "https://api.mistral.ai/v1",
      capabilities: { streaming: true, vision: true, toolCalling: true, structuredOutput: true }
    });
  }
}
