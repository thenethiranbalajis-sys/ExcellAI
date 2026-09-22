import { MemoryCredentialStore } from "./memory-store";
import type { CredentialStore } from "./types";

let credentialStore: CredentialStore = new MemoryCredentialStore();

export function getCredentialStore(): CredentialStore {
  return credentialStore;
}

export function setCredentialStore(store: CredentialStore): void {
  credentialStore = store;
}
