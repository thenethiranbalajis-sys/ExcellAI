import type { ChatRequest, ChatResponse } from "../../core/ai/types";

export interface ExcellAIApi {
  getAppInfo(): Promise<{ name: string; version: string }>;
  aiChat(providerId: string, request: ChatRequest): Promise<ChatResponse>;
}
