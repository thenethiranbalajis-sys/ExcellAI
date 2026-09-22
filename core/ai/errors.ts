export type AIErrorCode =
  | "PROVIDER_NOT_FOUND"
  | "MODEL_NOT_FOUND"
  | "AUTHENTICATION"
  | "RATE_LIMIT"
  | "TIMEOUT"
  | "INVALID_REQUEST"
  | "PROVIDER_FAILURE"
  | "TOOL_FAILURE";

export class AIError extends Error {
  constructor(
    public readonly code: AIErrorCode,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "AIError";
  }
}

export class ProviderNotFoundError extends AIError {
  constructor(providerId: string) {
    super("PROVIDER_NOT_FOUND", `AI provider not registered: ${providerId}`);
  }
}

export class ModelNotFoundError extends AIError {
  constructor(modelId: string) {
    super("MODEL_NOT_FOUND", `AI model not registered: ${modelId}`);
  }
}
