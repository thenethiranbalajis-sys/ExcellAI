import type { CredentialStore } from "../credentials/types";
import { OpenAICompatibleProvider } from "./openai-compatible";

export class CohereProvider extends OpenAICompatibleProvider {
  constructor(credentials: CredentialStore) {
    super(credentials, {
      id: "cohere",
      name: "Cohere",
      baseUrl: "https://api.cohere.ai/compatibility/v1",
      capabilities: { streaming: true, vision: true, toolCalling: true, structuredOutput: true }
    });
  }
}
