import type { CloudProviderId, CredentialStore } from "./types";

export class MemoryCredentialStore implements CredentialStore {
  private readonly values = new Map<CloudProviderId, string>();

  async has(providerId: CloudProviderId): Promise<boolean> {
    return this.values.has(providerId);
  }

  async get(providerId: CloudProviderId): Promise<string | null> {
    return this.values.get(providerId) ?? null;
  }

  async set(providerId: CloudProviderId, apiKey: string): Promise<void> {
    if (!apiKey.trim()) {
      throw new Error("API key cannot be empty.");
    }
    this.values.set(providerId, apiKey);
  }

  async delete(providerId: CloudProviderId): Promise<void> {
    this.values.delete(providerId);
  }
}
