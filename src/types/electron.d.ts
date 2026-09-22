import type { ChatRequest, ChatResponse, ChatStreamChunk } from "../../core/ai/types";
import type { ModelDefinition } from "../../core/ai/model-registry";
import type { CloudProviderId } from "../../core/ai/credentials/types";

export interface ExcellAIAppInfo {
  name: string;
  version: string;
}

export interface ExcellAIElectronAPI {
  getAppInfo(): Promise<ExcellAIAppInfo>;
  aiChat(providerId: string, request: ChatRequest): Promise<ChatResponse>;
  aiStream(providerId: string, request: ChatRequest): Promise<{ complete: boolean }>;
  onAIStreamChunk(listener: (chunk: ChatStreamChunk) => void): () => void;
  listModels(): Promise<ModelDefinition[]>;
  setCredential(providerId: CloudProviderId, apiKey: string): Promise<{ configured: boolean }>;
  getCredentialStatus(providerId: CloudProviderId): Promise<{ configured: boolean }>;
  deleteCredential(providerId: CloudProviderId): Promise<{ configured: boolean }>;
}

declare global {
  interface Window {
    excellAI?: ExcellAIElectronAPI;
  }
}

export {};
