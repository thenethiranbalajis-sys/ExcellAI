import { ipcMain } from "electron";
import { getCredentialStore } from "../../core/ai/credentials/runtime";
import { isCloudProviderId, type CloudProviderId } from "../../core/ai/credentials/types";

function requireProviderId(value: unknown): CloudProviderId {
  if (!isCloudProviderId(value)) {
    throw new Error("Unsupported cloud AI provider.");
  }
  return value;
}

export function registerCredentialHandlers(): void {
  ipcMain.handle("credentials:set", async (_event, providerId: unknown, apiKey: unknown) => {
    const id = requireProviderId(providerId);
    if (typeof apiKey !== "string" || !apiKey.trim()) {
      throw new Error("API key cannot be empty.");
    }

    await getCredentialStore().set(id, apiKey);
    return { configured: true };
  });

  ipcMain.handle("credentials:status", async (_event, providerId: unknown) => {
    const id = requireProviderId(providerId);
    return { configured: await getCredentialStore().has(id) };
  });

  ipcMain.handle("credentials:delete", async (_event, providerId: unknown) => {
    const id = requireProviderId(providerId);
    await getCredentialStore().delete(id);
    return { configured: false };
  });
}
