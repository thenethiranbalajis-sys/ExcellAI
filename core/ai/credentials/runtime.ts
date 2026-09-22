import { MemoryCredentialStore } from "./memory-store";
import type { CredentialStore } from "./types";

export let credentialStore: CredentialStore = new MemoryCredentialStore();

export function setCredentialStore(store: CredentialStore): void {
  credentialStore = store;
}
