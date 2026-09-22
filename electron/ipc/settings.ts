import { ipcMain } from "electron";
import { credentialStore } from "../../core/ai/credentials/runtime";
import type { CloudProviderId } from "../../core/ai/credentials/types";

export function registerCredentialHandlers(): void {
  ipcMain.handle("credentials:set", async (_event, providerId: CloudProviderId, apiKey: string) => {
    await credentialStore.set(providerId, apiKey);
    return { configured: true };
  });

  ipcMain.handle("credentials:status", async (_event, providerId: CloudProviderId) => ({
    configured: await credentialStore.has(providerId)
  }));

  ipcMain.handle("credentials:delete", async (_event, providerId: CloudProviderId) => {
    await credentialStore.delete(providerId);
    return { configured: false };
  });
}
