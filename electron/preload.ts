import { contextBridge, ipcRenderer } from "electron";
import type { ChatRequest, ChatStreamChunk } from "../core/ai/types";
import type { CloudProviderId } from "../core/ai/credentials/types";

contextBridge.exposeInMainWorld("excellAI", {
  getAppInfo: () => ipcRenderer.invoke("app:get-info"),
  aiChat: (providerId: string, request: ChatRequest) =>
    ipcRenderer.invoke("ai:chat", providerId, request),
  aiStream: (providerId: string, request: ChatRequest) =>
    ipcRenderer.invoke("ai:stream", providerId, request),
  onAIStreamChunk: (listener: (chunk: ChatStreamChunk) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, chunk: ChatStreamChunk) => listener(chunk);
    ipcRenderer.on("ai:stream-chunk", handler);
    return () => ipcRenderer.removeListener("ai:stream-chunk", handler);
  },
  listModels: () => ipcRenderer.invoke("models:list"),
  listConversations: () => ipcRenderer.invoke("conversations:list"),
  getConversation: (id: string) => ipcRenderer.invoke("conversations:get", id),
  saveConversation: (conversation: unknown) => ipcRenderer.invoke("conversations:save", conversation),
  deleteConversation: (id: string) => ipcRenderer.invoke("conversations:delete", id),
  setCredential: (providerId: CloudProviderId, apiKey: string) =>
    ipcRenderer.invoke("credentials:set", providerId, apiKey),
  getCredentialStatus: (providerId: CloudProviderId) =>
    ipcRenderer.invoke("credentials:status", providerId),
  deleteCredential: (providerId: CloudProviderId) =>
    ipcRenderer.invoke("credentials:delete", providerId)
});
