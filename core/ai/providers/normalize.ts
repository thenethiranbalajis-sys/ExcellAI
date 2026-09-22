import type { ChatResponse } from "../types";
import { AIError } from "../errors";

export function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value) {
    throw new AIError("PROVIDER_FAILURE", "Provider response is missing " + field + ".");
  }
  return value;
}

export function createResponse(
  provider: string,
  model: string,
  content: unknown
): ChatResponse {
  return {
    id: crypto.randomUUID(),
    provider,
    model,
    content: requireString(content, "content")
  };
}
