import type { ChatRequest, ChatResponse, ModelCapabilities } from "../types";
import { ProviderNotConfiguredError } from "../errors";
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
}
