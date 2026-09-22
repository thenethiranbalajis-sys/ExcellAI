import { BrowserWindow, ipcMain } from "electron";
import { AIError } from "../../core/ai/errors";
import { isChatRequest } from "../../core/ai/types";
import { aiGateway } from "../../core/ai/runtime";
import { aiOrchestrator } from "../../core/ai/orchestrator/orchestrator";

export function registerAIHandlers(): void {
  ipcMain.handle("ai:chat", async (_event, providerId: unknown, request: unknown) => {
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
  });

  ipcMain.handle("ai:stream", async (event, providerId: unknown, request: unknown) => {
    if (typeof providerId !== "string" || !providerId.trim()) {
      throw new AIError("INVALID_REQUEST", "A valid AI provider is required.");
    }
    if (!isChatRequest(request)) {
      throw new AIError("INVALID_REQUEST", "The AI chat request is invalid.");
    }

    const stream = aiGateway.chatStream(providerId, request);
    for await (const chunk of stream) {
      if (!event.sender.isDestroyed()) {
        event.sender.send("ai:stream-chunk", chunk);
      }
      if (chunk.done) break;
    }
    return { complete: true };
  });
}
