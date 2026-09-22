import { ipcMain } from "electron";
import { ConversationStore } from "../services/conversations";
import type { Conversation } from "../../core/chat/types";

const store = new ConversationStore();

function requireId(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) throw new Error("Conversation id is required.");
  return value;
}

function requireConversation(value: unknown): Conversation {
  if (!value || typeof value !== "object") throw new Error("Invalid conversation.");
  const item = value as Conversation;
  if (
    typeof item.id !== "string" ||
    typeof item.title !== "string" ||
    typeof item.modelId !== "string" ||
    typeof item.providerId !== "string" ||
    !Array.isArray(item.messages)
  ) {
    throw new Error("Invalid conversation.");
  }
  return item;
}

export function registerConversationHandlers(): void {
  ipcMain.handle("conversations:list", () => store.list());
  ipcMain.handle("conversations:get", (_event, id: unknown) => store.get(requireId(id)));
  ipcMain.handle("conversations:save", async (_event, value: unknown) => {
    await store.save(requireConversation(value));
    return { saved: true };
  });
  ipcMain.handle("conversations:delete", async (_event, id: unknown) => {
    await store.delete(requireId(id));
    return { deleted: true };
  });
}
