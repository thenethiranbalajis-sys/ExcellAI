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
