import type { AIProvider, ChatRequest, ChatResponse, ModelCapabilities } from "../types";
import { AIError } from "../errors";

export abstract class CloudProviderPlaceholder implements AIProvider {
  abstract readonly id: string;
  abstract readonly name: string;

  abstract getCapabilities(model: string): ModelCapabilities;

  async chat(_request: ChatRequest): Promise<ChatResponse> {
    throw new AIError(
      "PROVIDER_NOT_CONFIGURED",
      this.name + " is not configured yet. Add its secure Electron-side credential adapter before enabling it."
    );
  }
}
