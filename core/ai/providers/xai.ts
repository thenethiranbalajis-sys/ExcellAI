import type { CredentialStore } from "../credentials/types";
import { OpenAICompatibleProvider } from "./openai-compatible";

export class XAIProvider extends OpenAICompatibleProvider {
  constructor(credentials: CredentialStore) {
    super(credentials, {
      id: "xai",
      name: "xAI",
      baseUrl: "https://api.x.ai/v1",
      capabilities: { streaming: true, vision: true, toolCalling: true, structuredOutput: true }
    });
  }
}
