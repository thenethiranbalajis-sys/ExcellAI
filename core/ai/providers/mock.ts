import type { AIProvider, ChatRequest, ChatResponse, ModelCapabilities } from "../types";

export class MockProvider implements AIProvider {
  readonly id = "mock";
  readonly name = "ExcellAI Local Test Provider";

  getCapabilities(_model: string): ModelCapabilities {
    return { streaming: false, vision: false, toolCalling: false, structuredOutput: true };
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const last = [...request.messages].reverse().find((message) => message.role === "user");
    return { id: crypto.randomUUID(), model: request.model, provider: this.id, content: last ? `Mock provider received: ${last.content}` : "Mock provider is ready." };
  }
}
