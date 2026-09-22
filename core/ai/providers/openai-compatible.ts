import type { ChatRequest, ChatResponse, ModelCapabilities } from "../types";
import { ProviderNotConfiguredError } from "../errors";
import type { CloudProviderId, CredentialStore } from "../credentials/types";
import { postJson } from "./http";
import { createResponse } from "./normalize";

interface CompatibleProviderConfig {
  id: CloudProviderId;
  name: string;
  baseUrl: string;
  capabilities: ModelCapabilities;
}

export class OpenAICompatibleProvider {
  readonly id: CloudProviderId;
  readonly name: string;

  constructor(
    private readonly credentials: CredentialStore,
    private readonly config: CompatibleProviderConfig
  ) {
    this.id = config.id;
    this.name = config.name;
  }

  getCapabilities(_model: string): ModelCapabilities {
    return this.config.capabilities;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const key = await this.credentials.get(this.config.id);
    if (!key) throw new ProviderNotConfiguredError(this.config.id);

    const result = await postJson(
      this.config.baseUrl + "/chat/completions",
      { authorization: "Bearer " + key },
      {
        model: request.model,
        messages: request.messages,
        ...(request.temperature === undefined ? {} : { temperature: request.temperature }),
        ...(request.maxTokens === undefined ? {} : { max_tokens: request.maxTokens })
      }
    );

    const data = result.data as {
      choices?: Array<{ message?: { content?: unknown } }>;
    };

    return createResponse(
      this.config.id,
      request.model,
      data.choices?.[0]?.message?.content
    );
  }
}
