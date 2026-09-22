import type { ChatRequest, ChatResponse, ModelCapabilities } from "../types";
import { ProviderNotConfiguredError } from "../errors";
import type { CredentialStore } from "../credentials/types";
import { postJson } from "./http";
import { createResponse } from "./normalize";

export class GeminiProvider {
  readonly id = "gemini";
  readonly name = "Google Gemini";

  constructor(private readonly credentials: CredentialStore) {}

  getCapabilities(_model: string): ModelCapabilities {
    return { streaming: true, vision: true, toolCalling: true, structuredOutput: true };
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const key = await this.credentials.get("gemini");
    if (!key) throw new ProviderNotConfiguredError(this.id);

    const contents = request.messages
      .filter((message) => message.role !== "system")
      .map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }]
      }));

    const systemMessage = request.messages.find((message) => message.role === "system");

    const result = await postJson(
      "https://generativelanguage.googleapis.com/v1beta/models/" + request.model + ":generateContent",
      { "x-goog-api-key": key },
      {
        contents,
        ...(systemMessage ? { systemInstruction: { parts: [{ text: systemMessage.content }] } } : {}),
        generationConfig: {
          ...(request.temperature === undefined ? {} : { temperature: request.temperature }),
          ...(request.maxTokens === undefined ? {} : { maxOutputTokens: request.maxTokens })
        }
      }
    );

    const data = result.data as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: unknown }> } }>;
    };
    const content = data.candidates?.[0]?.content?.parts?.map((part) => part.text).filter(Boolean).join("") ?? "";

    return createResponse(this.id, request.model, content);
  }
}
