import type { CredentialStore } from "../credentials/types";
import { OpenAICompatibleProvider } from "./openai-compatible";

export class DeepSeekProvider extends OpenAICompatibleProvider {
  constructor(credentials: CredentialStore) {
    super(credentials, {
      id: "deepseek",
      name: "DeepSeek",
      baseUrl: "https://api.deepseek.com",
      capabilities: { streaming: true, vision: false, toolCalling: true, structuredOutput: true }
    });
  }
}
