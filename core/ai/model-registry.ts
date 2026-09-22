import type { AIModelId, ModelCapabilities } from "./types";

export interface ModelDefinition {
  id: AIModelId;
  providerId: string;
  displayName: string;
  capabilities: ModelCapabilities;
}

export class ModelRegistry {
  private readonly models = new Map<AIModelId, ModelDefinition>();
  register(model: ModelDefinition): void { this.models.set(model.id, model); }
  get(modelId: AIModelId): ModelDefinition { const model = this.models.get(modelId); if (!model) throw new Error(`AI model not registered: ${modelId}`); return model; }
  list(): ModelDefinition[] { return [...this.models.values()]; }
}
