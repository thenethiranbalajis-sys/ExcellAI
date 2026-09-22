import type { ChatRequest, ChatResponse, ModelCapabilities } from "../types";
import { ProviderNotConfiguredError } from "../errors";
import type { CredentialStore } from "../credentials/types";
import { postJson } from "./http";
import { createResponse } from "./normalize";

export class OpenAIProvider {
  readonly id = "openai";
  readonly name = "OpenAI";

  constructor(private readonly credentials: CredentialStore) {}

  getCapabilities(_model: string): ModelCapabilities {
    return { streaming: true, vision: true, toolCalling: true, structuredOutput: true };
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const key = await this.credentials.get("openai");
    if (!key) throw new ProviderNotConfiguredError(this.id);

    const result = await postJson(
      "https://api.openai.com/v1/chat/completions",
      { authorization: "Bearer " + key },
      {
        model: request.model,
        messages: request.messages,
        ...(request.temperature === undefined ? {} : { temperature: request.temperature }),
        ...(request.maxTokens === undefined ? {} : { max_tokens: request.maxTokens })
      }
    );

    const data = result.data as { choices?: Array<{ message?: { content?: unknown } }> };
    return createResponse(
      this.id,
      request.model,
      data.choices?.[0]?.message?.content
    );
  }
}
