import type { ChatRequest, ChatResponse, ModelCapabilities } from "../types";
import { ProviderNotConfiguredError } from "../errors";
import type { CredentialStore } from "../credentials/types";

export class AnthropicProvider {
  readonly id = "anthropic";
  readonly name = "Anthropic Claude";

  constructor(private readonly credentials: CredentialStore) {}

  getCapabilities(_model: string): ModelCapabilities {
    return { streaming: true, vision: true, toolCalling: true, structuredOutput: true };
  }

  async chat(_request: ChatRequest): Promise<ChatResponse> {
    const key = await this.credentials.get("anthropic");
    if (!key) throw new ProviderNotConfiguredError(this.id);
    throw new Error("Anthropic transport adapter is the next implementation step.");
  }
}
