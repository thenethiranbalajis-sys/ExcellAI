import { ipcMain } from "electron";
import type { ChatRequest } from "../../core/ai/types";
import { aiGateway } from "../../core/ai/runtime";

export function registerAIHandlers(): void {
  ipcMain.handle("ai:chat", async (_event, providerId: string, request: ChatRequest) => {
    return aiGateway.chat(providerId, request);
  });
}
