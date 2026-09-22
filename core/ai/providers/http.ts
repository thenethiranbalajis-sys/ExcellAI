import { AIError } from "../errors";

export interface JsonHttpResponse {
  status: number;
  data: unknown;
}

export async function postJson(
  url: string,
  headers: Record<string, string>,
  body: unknown,
  timeoutMs = 60_000
): Promise<JsonHttpResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: controller.signal
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new AIError("TIMEOUT", "The cloud AI request timed out.", error);
    }
    throw new AIError("PROVIDER_FAILURE", "The cloud AI provider could not be reached.", error);
  } finally {
    clearTimeout(timeout);
  }

  const text = await response.text();
  if (text.length > 4 * 1024 * 1024) {
    throw new AIError("PROVIDER_FAILURE", "The cloud AI response was unexpectedly large.");
  }

  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new AIError("AUTHENTICATION", "The cloud AI credentials were rejected.");
    }
    if (response.status === 429) {
      throw new AIError("RATE_LIMIT", "The cloud AI provider rate limit was reached.");
    }
    if (response.status >= 400 && response.status < 500) {
      throw new AIError("INVALID_REQUEST", "The cloud AI provider rejected the request.");
    }
    throw new AIError("PROVIDER_FAILURE", "The cloud AI provider returned a server error.");
  }

  return { status: response.status, data };
}
