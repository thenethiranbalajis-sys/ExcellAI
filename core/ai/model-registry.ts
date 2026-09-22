import type { AIModelId, ModelCapabilities } from "./types";

export interface ModelDefinition {
  id: AIModelId;
  providerId: string;
  displayName: string;
  capabilities: ModelCapabilities;
}

export class ModelRegistry {
  private readonly models = new Map<AIModelId, ModelDefinition>();

  register(model: ModelDefinition): void {
    if (!model.id.trim()) throw new Error("AI model id is required.");
    if (!model.providerId.trim()) throw new Error("AI model provider is required.");
    if (!model.displayName.trim()) throw new Error("AI model display name is required.");
    this.models.set(model.id, model);
  }

  get(modelId: AIModelId): ModelDefinition {
    const model = this.models.get(modelId);
    if (!model) throw new Error(`AI model not registered: ${modelId}`);
    return model;
  }

  list(): ModelDefinition[] {
    return [...this.models.values()];
  }

  listByProvider(providerId: string): ModelDefinition[] {
    return this.list().filter((model) => model.providerId === providerId);
  }

  has(modelId: AIModelId): boolean {
    return this.models.has(modelId);
  }
}
