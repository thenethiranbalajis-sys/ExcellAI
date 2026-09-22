export type CloudProviderId =
  | "openai"
  | "gemini"
  | "anthropic"
  | "xai"
  | "mistral"
  | "deepseek"
  | "cohere";

export const CLOUD_PROVIDER_IDS: readonly CloudProviderId[] = [
  "openai",
  "gemini",
  "anthropic",
  "xai",
  "mistral",
  "deepseek",
  "cohere"
];

export function isCloudProviderId(value: unknown): value is CloudProviderId {
  return typeof value === "string" && CLOUD_PROVIDER_IDS.includes(value as CloudProviderId);
}

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
