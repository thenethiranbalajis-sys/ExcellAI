import type { ChatMessage } from "../ai/types";

export interface ConversationMessage extends ChatMessage {
  id: string;
  createdAt: number;
}

export interface Conversation {
  id: string;
  title: string;
  modelId: string;
  providerId: string;
  messages: ConversationMessage[];
  createdAt: number;
  updatedAt: number;
}

export function isConversation(value: unknown): value is Conversation {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.modelId === "string" &&
    typeof item.providerId === "string" &&
    Array.isArray(item.messages) &&
    typeof item.createdAt === "number" &&
    typeof item.updatedAt === "number"
  );
}
