import type { AIProvider, ChatRequest, ChatResponse } from "./types";
import { modelRegistry } from "./runtime-models";
import { AIError, ModelNotFoundError, ProviderNotFoundError } from "./errors";

export class AIGateway {
  private readonly providers = new Map<string, AIProvider>();

  registerProvider(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  getProvider(providerId: string): AIProvider {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new ProviderNotFoundError(providerId);
    }
    return provider;
  }

  async chat(providerId: string, request: ChatRequest): Promise<ChatResponse> {
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

    return this.getProvider(providerId).chat(request);
  }
}
