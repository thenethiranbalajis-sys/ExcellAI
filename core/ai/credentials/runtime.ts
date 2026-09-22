import { MemoryCredentialStore } from "./memory-store";
import type { CredentialStore } from "./types";

export const credentialStore: CredentialStore = new MemoryCredentialStore();
