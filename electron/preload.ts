import { contextBridge, ipcRenderer } from "electron";
import type { ChatRequest } from "../core/ai/types";
import type { CloudProviderId } from "../core/ai/credentials/types";

contextBridge.exposeInMainWorld("excellAI", {
  getAppInfo: () => ipcRenderer.invoke("app:get-info"),
  aiChat: (providerId: string, request: ChatRequest) =>
    ipcRenderer.invoke("ai:chat", providerId, request),
  listModels: () => ipcRenderer.invoke("models:list"),
  setCredential: (providerId: CloudProviderId, apiKey: string) =>
    ipcRenderer.invoke("credentials:set", providerId, apiKey),
  getCredentialStatus: (providerId: CloudProviderId) =>
    ipcRenderer.invoke("credentials:status", providerId),
  deleteCredential: (providerId: CloudProviderId) =>
    ipcRenderer.invoke("credentials:delete", providerId)
});
