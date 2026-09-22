import type { ChatRequest, ChatResponse } from "../../core/ai/types";

export interface ExcellAIAppInfo {
  name: string;
  version: string;
}

export interface ExcellAIElectronAPI {
  getAppInfo(): Promise<ExcellAIAppInfo>;
  aiChat(providerId: string, request: ChatRequest): Promise<ChatResponse>;
}

declare global {
  interface Window {
    excellAI?: ExcellAIElectronAPI;
  }
}

export {};
