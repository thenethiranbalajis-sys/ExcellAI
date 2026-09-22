import { ipcMain } from "electron";
import type { ChatRequest } from "../../core/ai/types";
import { aiOrchestrator } from "../../core/ai/orchestrator/orchestrator";

export function registerAIHandlers(): void {
  ipcMain.handle(
    "ai:chat",
    async (_event, providerId: string, request: ChatRequest) =>
      aiOrchestrator.run({
        providerId,
        model: request.model,
        messages: request.messages
      })
  );
}
