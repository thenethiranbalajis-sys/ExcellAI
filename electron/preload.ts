import { contextBridge, ipcRenderer } from "electron";
import type { ChatRequest } from "../core/ai/types";

contextBridge.exposeInMainWorld("excellAI", {
  getAppInfo: () => ipcRenderer.invoke("app:get-info"),
  aiChat: (providerId: string, request: ChatRequest) => ipcRenderer.invoke("ai:chat", providerId, request)
});
