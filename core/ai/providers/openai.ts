import type { ChatRequest, ChatResponse, ModelCapabilities } from "../types";
import { ProviderNotConfiguredError } from "../errors";
import type { CredentialStore } from "../credentials/types";

export class OpenAIProvider {
  readonly id = "openai";
  readonly name = "OpenAI";

  constructor(private readonly credentials: CredentialStore) {}

  getCapabilities(_model: string): ModelCapabilities {
    return { streaming: true, vision: true, toolCalling: true, structuredOutput: true };
  }

  async chat(_request: ChatRequest): Promise<ChatResponse> {
    const key = await this.credentials.get("openai");
    if (!key) throw new ProviderNotConfiguredError(this.id);
    throw new Error("OpenAI transport adapter is the next implementation step.");
  }
}
