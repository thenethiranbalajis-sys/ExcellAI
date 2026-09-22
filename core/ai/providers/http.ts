export interface JsonHttpResponse {
  status: number;
  data: unknown;
}

export async function postJson(
  url: string,
  headers: Record<string, string>,
  body: unknown
): Promise<JsonHttpResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body)
  });

  const text = await response.text();
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    throw new Error("Cloud provider request failed with HTTP " + response.status + ".");
  }

  return { status: response.status, data };
}
