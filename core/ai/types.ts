export type AIProviderId = string;
export type AIModelId = string;

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
}

export interface ChatRequest {
  model: AIModelId;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  id: string;
  model: AIModelId;
  content: string;
  provider: AIProviderId;
}

export interface ModelCapabilities {
  streaming: boolean;
  vision: boolean;
  toolCalling: boolean;
  structuredOutput: boolean;
}

export interface AIProvider {
  readonly id: AIProviderId;
  readonly name: string;
  getCapabilities(model: AIModelId): ModelCapabilities;
  chat(request: ChatRequest): Promise<ChatResponse>;
}

export function isChatRequest(value: unknown): value is ChatRequest {
  if (!value || typeof value !== "object") return false;

  const request = value as Record<string, unknown>;
  if (typeof request.model !== "string" || !request.model.trim()) return false;
  if (!Array.isArray(request.messages) || request.messages.length === 0) return false;

  for (const message of request.messages) {
    if (!message || typeof message !== "object") return false;
    const item = message as Record<string, unknown>;
    if (!["system", "user", "assistant", "tool"].includes(String(item.role))) return false;
    if (typeof item.content !== "string") return false;
  }

  if (
    request.temperature !== undefined &&
    (typeof request.temperature !== "number" || !Number.isFinite(request.temperature))
  ) return false;

  if (
    request.maxTokens !== undefined &&
    (typeof request.maxTokens !== "number" ||
      !Number.isInteger(request.maxTokens) ||
      request.maxTokens < 1)
  ) return false;

  return true;
}
