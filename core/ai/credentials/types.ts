export type CloudProviderId = "openai" | "gemini" | "anthropic";

export interface ProviderCredential {
  providerId: CloudProviderId;
  apiKey: string;
}

export interface CredentialStore {
  has(providerId: CloudProviderId): Promise<boolean>;
  get(providerId: CloudProviderId): Promise<string | null>;
  set(providerId: CloudProviderId, apiKey: string): Promise<void>;
  delete(providerId: CloudProviderId): Promise<void>;
}
