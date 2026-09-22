import { app, safeStorage } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import type { CloudProviderId, CredentialStore } from "../../core/ai/credentials/types";

type StoredCredentials = Partial<Record<CloudProviderId, string>>;

export class SecureCredentialStore implements CredentialStore {
  private readonly filePath = path.join(app.getPath("userData"), "credentials.bin");

  private async read(): Promise<StoredCredentials> {
    try {
      const encrypted = await fs.readFile(this.filePath);
      if (!safeStorage.isEncryptionAvailable()) {
        throw new Error("OS encryption is unavailable.");
      }
      const plain = safeStorage.decryptString(encrypted);
      return JSON.parse(plain) as StoredCredentials;
    } catch {
      return {};
    }
  }

  private async write(values: StoredCredentials): Promise<void> {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("OS encryption is unavailable.");
    }
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    const encrypted = safeStorage.encryptString(JSON.stringify(values));
    await fs.writeFile(this.filePath, encrypted);
  }

  async has(providerId: CloudProviderId): Promise<boolean> {
    return Boolean(await this.get(providerId));
  }

  async get(providerId: CloudProviderId): Promise<string | null> {
    const values = await this.read();
    return values[providerId] ?? null;
  }

  async set(providerId: CloudProviderId, apiKey: string): Promise<void> {
    if (!apiKey.trim()) throw new Error("API key cannot be empty.");
    const values = await this.read();
    values[providerId] = apiKey;
    await this.write(values);
  }

  async delete(providerId: CloudProviderId): Promise<void> {
    const values = await this.read();
    delete values[providerId];
    await this.write(values);
  }
}
