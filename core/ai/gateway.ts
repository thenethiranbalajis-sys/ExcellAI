import type { AIProvider, ChatRequest, ChatResponse } from "./types";

export class AIGateway {
  private readonly providers = new Map<string, AIProvider>();

  registerProvider(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  getProvider(providerId: string): AIProvider {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`AI provider not registered: ${providerId}`);
    }
    return provider;
  }

  async chat(providerId: string, request: ChatRequest): Promise<ChatResponse> {
    return this.getProvider(providerId).chat(request);
  }
}
