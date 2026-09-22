import type { AIProvider, ChatRequest, ChatResponse, ChatStreamChunk } from "./types";
import { modelRegistry } from "./runtime-models";
import { AIError, ModelNotFoundError, ProviderNotFoundError } from "./errors";

export class AIGateway {
  private readonly providers = new Map<string, AIProvider>();

  registerProvider(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  getProvider(providerId: string): AIProvider {
    const provider = this.providers.get(providerId);
    if (!provider) throw new ProviderNotFoundError(providerId);
    return provider;
  }

  private validateModel(providerId: string, request: ChatRequest): void {
    let model;
    try {
      model = modelRegistry.get(request.model);
    } catch {
      throw new ModelNotFoundError(request.model);
    }
    if (model.providerId !== providerId) {
      throw new AIError(
        "INVALID_REQUEST",
        'Model "' + request.model + '" belongs to provider "' + model.providerId + '".'
      );
    }
  }

  async chat(providerId: string, request: ChatRequest): Promise<ChatResponse> {
    this.validateModel(providerId, request);
    return this.getProvider(providerId).chat(request);
  }

  chatStream(providerId: string, request: ChatRequest): AsyncIterable<ChatStreamChunk> {
    this.validateModel(providerId, request);
    const provider = this.getProvider(providerId);
    if (!provider.chatStream) {
      throw new AIError("PROVIDER_FAILURE", "Streaming is not available for this AI provider.");
    }
    return provider.chatStream(request);
  }
}
