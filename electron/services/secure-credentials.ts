import { app, safeStorage } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import type { CloudProviderId, CredentialStore } from "../../core/ai/credentials/types";

type StoredCredentials = Partial<Record<CloudProviderId, string>>;

export class SecureCredentialStore implements CredentialStore {
  private readonly filePath = path.join(app.getPath("userData"), "credentials.bin");
  private operationQueue: Promise<void> = Promise.resolve();

  private async read(): Promise<StoredCredentials> {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("OS credential encryption is unavailable.");
    }

    try {
      const encrypted = await fs.readFile(this.filePath);
      const plain = safeStorage.decryptString(encrypted);
      const parsed: unknown = JSON.parse(plain);

      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Stored credential data is invalid.");
      }

      return parsed as StoredCredentials;
    } catch (error) {
      const code =
        error && typeof error === "object" && "code" in error
          ? String((error as { code?: unknown }).code)
          : undefined;

      if (code === "ENOENT") return {};
      if (error instanceof SyntaxError) {
        throw new Error("Stored credential data is corrupted.");
      }
      throw error;
    }
  }

  private async write(values: StoredCredentials): Promise<void> {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("OS credential encryption is unavailable.");
    }

    await fs.mkdir(path.dirname(this.filePath), { recursive: true });

    const encrypted = safeStorage.encryptString(JSON.stringify(values));
    const tempPath = this.filePath + ".tmp";

    try {
      await fs.writeFile(tempPath, encrypted, { mode: 0o600 });
      await fs.rm(this.filePath, { force: true });
      await fs.rename(tempPath, this.filePath);
    } catch (error) {
      await fs.rm(tempPath, { force: true }).catch(() => undefined);
      throw error;
    }
  }

  private async serialized<T>(operation: () => Promise<T>): Promise<T> {
    const previous = this.operationQueue;
    let release!: () => void;
    this.operationQueue = new Promise<void>((resolve) => {
      release = resolve;
    });

    await previous;
    try {
      return await operation();
    } finally {
      release();
    }
  }

  async has(providerId: CloudProviderId): Promise<boolean> {
    return Boolean(await this.get(providerId));
  }

  async get(providerId: CloudProviderId): Promise<string | null> {
    return this.serialized(async () => {
      const values = await this.read();
      return values[providerId] ?? null;
    });
  }

  async set(providerId: CloudProviderId, apiKey: string): Promise<void> {
    const normalized = apiKey.trim();
    if (!normalized) throw new Error("API key cannot be empty.");

    await this.serialized(async () => {
      const values = await this.read();
      values[providerId] = normalized;
      await this.write(values);
    });
  }

  async delete(providerId: CloudProviderId): Promise<void> {
    await this.serialized(async () => {
      const values = await this.read();
      delete values[providerId];
      await this.write(values);
    });
  }
}
