import type { ChatRequest, ChatResponse, ChatStreamChunk, ModelCapabilities } from "../types";
import { AIError, ProviderNotConfiguredError } from "../errors";
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

  async *chatStream(request: ChatRequest): AsyncIterable<ChatStreamChunk> {
    const key = await this.credentials.get("anthropic");
    if (!key) throw new ProviderNotConfiguredError(this.id);

    const systemMessage = request.messages.find((message) => message.role === "system");
    const messages = request.messages
      .filter((message) => message.role !== "system")
      .map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: message.content
      }));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);

    let response: Response;
    try {
      response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: request.model,
          max_tokens: request.maxTokens ?? 4096,
          stream: true,
          ...(systemMessage ? { system: systemMessage.content } : {}),
          messages,
          ...(request.temperature === undefined ? {} : { temperature: request.temperature })
        }),
        signal: controller.signal
      });
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === "AbortError") {
        throw new AIError("TIMEOUT", "The Anthropic streaming request timed out.", error);
      }
      throw new AIError("PROVIDER_FAILURE", "Anthropic could not be reached.", error);
    }

    clearTimeout(timeout);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new AIError("AUTHENTICATION", "Anthropic credentials were rejected.");
      }
      if (response.status === 429) {
        throw new AIError("RATE_LIMIT", "Anthropic rate limit was reached.");
      }
      throw new AIError(
        response.status >= 400 && response.status < 500 ? "INVALID_REQUEST" : "PROVIDER_FAILURE",
        "Anthropic rejected the streaming request."
      );
    }

    if (!response.body) {
      throw new AIError("PROVIDER_FAILURE", "Anthropic returned no streaming body.");
    }

    const id = crypto.randomUUID();
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let totalBytes = 0;

    try {
      while (true) {
        const { value, done } = await reader.read();
        totalBytes += value?.byteLength ?? 0;
        if (totalBytes > 4 * 1024 * 1024) {
          await reader.cancel();
          throw new AIError("PROVIDER_FAILURE", "The Anthropic streaming response was unexpectedly large.");
        }

        buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;

          const payload = trimmed.slice(5).trim();
          if (!payload) continue;

          try {
            const event = JSON.parse(payload) as {
              type?: string;
              delta?: { type?: string; text?: unknown };
            };

            if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
              if (typeof event.delta.text === "string" && event.delta.text.length > 0) {
                yield {
                  id,
                  provider: this.id,
                  model: request.model,
                  delta: event.delta.text,
                  done: false
                };
              }
            } else if (event.type === "message_stop") {
              yield {
                id,
                provider: this.id,
                model: request.model,
                delta: "",
                done: true
              };
              return;
            }
          } catch {
            // Ignore malformed SSE records and continue the stream.
          }
        }

        if (done) break;
      }
    } finally {
      reader.releaseLock();
    }

    yield { id, provider: this.id, model: request.model, delta: "", done: true };
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
