import type { ChatRequest, ChatResponse, ModelCapabilities } from "../types";
import { ProviderNotConfiguredError } from "../errors";
import type { CredentialStore } from "../credentials/types";
import { postJson } from "./http";
import { createResponse } from "./normalize";

export class AnthropicProvider {
  readonly id = "anthropic";
  readonly name = "Anthropic Claude";

  constructor(private readonly credentials: CredentialStore) {}

  getCapabilities(_model: string): ModelCapabilities {
    return { streaming: true, vision: true, toolCalling: true, structuredOutput: true };
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const key = await this.credentials.get("anthropic");
    if (!key) throw new ProviderNotConfiguredError(this.id);

    const systemMessage = request.messages.find((message) => message.role === "system");
    const messages = request.messages
      .filter((message) => message.role !== "system")
      .map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: message.content
      }));

    const result = await postJson(
      "https://api.anthropic.com/v1/messages",
      {
        "x-api-key": key,
        "anthropic-version": "2023-06-01"
      },
      {
        model: request.model,
        max_tokens: request.maxTokens ?? 4096,
        ...(systemMessage ? { system: systemMessage.content } : {}),
        messages,
        ...(request.temperature === undefined ? {} : { temperature: request.temperature })
      }
    );

    const data = result.data as {
      id?: unknown;
      content?: Array<{ type?: string; text?: unknown }>;
    };
    const text = data.content?.filter((block) => block.type === "text").map((block) => block.text).filter(Boolean).join("") ?? "";

    return createResponse(this.id, request.model, text);
  }
}
