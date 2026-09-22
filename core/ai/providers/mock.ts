import type { AIProvider, ChatRequest, ChatResponse, ModelCapabilities } from "../types";

/**
 * Development-only test double.
 * It is intentionally not registered by the ExcellAI runtime and is never
 * presented as a production/local AI model.
 */
export class MockProvider implements AIProvider {
  readonly id = "mock";
  readonly name = "ExcellAI Test Provider";

  getCapabilities(_model: string): ModelCapabilities {
    return { streaming: false, vision: false, toolCalling: false, structuredOutput: true };
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const last = [...request.messages].reverse().find((message) => message.role === "user");
    return {
      id: crypto.randomUUID(),
      model: request.model,
      provider: this.id,
      content: last ? `Test provider received: ${last.content}` : "Test provider is ready."
    };
  }
}
