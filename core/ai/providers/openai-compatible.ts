import type { ChatRequest, ChatResponse, ChatStreamChunk, ModelCapabilities } from "../types";
import { AIError, ProviderNotConfiguredError } from "../errors";
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

    return createResponse(this.config.id, request.model, data.choices?.[0]?.message?.content);
  }

  async *chatStream(request: ChatRequest): AsyncIterable<ChatStreamChunk> {
    const key = await this.credentials.get(this.config.id);
    if (!key) throw new ProviderNotConfiguredError(this.config.id);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);

    let response: Response;
    try {
      response = await fetch(this.config.baseUrl + "/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer " + key
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          stream: true,
          ...(request.temperature === undefined ? {} : { temperature: request.temperature }),
          ...(request.maxTokens === undefined ? {} : { max_tokens: request.maxTokens })
        }),
        signal: controller.signal
      });
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === "AbortError") {
        throw new AIError("TIMEOUT", "The cloud AI streaming request timed out.", error);
      }
      throw new AIError("PROVIDER_FAILURE", "The cloud AI provider could not be reached.", error);
    }

    clearTimeout(timeout);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new AIError("AUTHENTICATION", "The cloud AI credentials were rejected.");
      }
      if (response.status === 429) {
        throw new AIError("RATE_LIMIT", "The cloud AI provider rate limit was reached.");
      }
      throw new AIError(
        response.status >= 400 && response.status < 500 ? "INVALID_REQUEST" : "PROVIDER_FAILURE",
        "The cloud AI provider rejected the streaming request."
      );
    }

    if (!response.body) {
      throw new AIError("PROVIDER_FAILURE", "The cloud AI provider returned no streaming body.");
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
        if (totalBytes > 1_000_000_000) {
          await reader.cancel();
          throw new AIError("PROVIDER_FAILURE", "The cloud AI streaming response exceeded the 1000 MB limit.");
        }
        buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload) continue;
          if (payload === "[DONE]") {
            yield { id, provider: this.id, model: request.model, delta: "", done: true };
            return;
          }

          try {
            const event = JSON.parse(payload) as {
              choices?: Array<{ delta?: { content?: unknown } }>;
            };
            const delta = event.choices?.[0]?.delta?.content;
            if (typeof delta === "string" && delta.length > 0) {
              yield { id, provider: this.id, model: request.model, delta, done: false };
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
}
