import { ipcMain } from "electron";
import { AIError } from "../../core/ai/errors";
import { isChatRequest, type ChatRequest } from "../../core/ai/types";
import { aiOrchestrator } from "../../core/ai/orchestrator/orchestrator";

export function registerAIHandlers(): void {
  ipcMain.handle(
    "ai:chat",
    async (_event, providerId: unknown, request: unknown) => {
      if (typeof providerId !== "string" || !providerId.trim()) {
        throw new AIError("INVALID_REQUEST", "A valid AI provider is required.");
      }

      if (!isChatRequest(request)) {
        throw new AIError("INVALID_REQUEST", "The AI chat request is invalid.");
      }

      const result = await aiOrchestrator.run({
        providerId,
        model: request.model,
        messages: request.messages
      });

      return result.response;
    }
  );
}
