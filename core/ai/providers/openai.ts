import type { ChatRequest, ChatResponse, ChatStreamChunk, ModelCapabilities } from "../types";
import { ProviderNotConfiguredError, AIError } from "../errors";
import type { CredentialStore } from "../credentials/types";
import { postJson } from "./http";
import { createResponse } from "./normalize";

interface ResponsesOutputItem {
  type?: string;
  content?: Array<{ type?: string; text?: unknown }>;
}

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
      "https://api.openai.com/v1/responses",
      { authorization: "Bearer " + key },
      {
        model: request.model,
        input: request.messages,
        ...(request.temperature === undefined ? {} : { temperature: request.temperature }),
        ...(request.maxTokens === undefined ? {} : { max_output_tokens: request.maxTokens })
      }
    );

    const data = result.data as { output?: ResponsesOutputItem[] };
    const content = data.output
      ?.filter((item) => item.type === "message")
      .flatMap((item) => item.content ?? [])
      .filter((part) => part.type === "output_text")
      .map((part) => part.text)
      .filter((text): text is string => typeof text === "string")
      .join("") ?? "";

    return createResponse(this.id, request.model, content);
  }

  async *chatStream(request: ChatRequest): AsyncIterable<ChatStreamChunk> {
    const key = await this.credentials.get("openai");
    if (!key) throw new ProviderNotConfiguredError(this.id);

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer " + key
      },
      body: JSON.stringify({
        model: request.model,
        input: request.messages,
        stream: true,
        ...(request.temperature === undefined ? {} : { temperature: request.temperature }),
        ...(request.maxTokens === undefined ? {} : { max_output_tokens: request.maxTokens })
      })
    });

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
          throw new AIError("PROVIDER_FAILURE", "The OpenAI streaming response exceeded the 1000 MB limit.");
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

          let event: { type?: string; delta?: unknown };
          try {
            event = JSON.parse(payload) as { type?: string; delta?: unknown };
          } catch {
            continue;
          }

          if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
            yield { id, provider: this.id, model: request.model, delta: event.delta, done: false };
          }

          if (event.type === "response.completed") {
            yield { id, provider: this.id, model: request.model, delta: "", done: true };
            return;
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
