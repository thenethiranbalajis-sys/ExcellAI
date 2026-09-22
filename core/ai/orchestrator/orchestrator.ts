import { aiGateway } from "../runtime";
import type { OrchestrationRequest, OrchestrationResult } from "./types";

export class AIOrchestrator {
  async run(request: OrchestrationRequest): Promise<OrchestrationResult> {
    const plan = {
      id: crypto.randomUUID(),
      steps: [
        {
          id: crypto.randomUUID(),
          kind: "model" as const,
          providerId: request.providerId,
          model: request.model,
          reason: "Execute the user's request with the selected cloud AI model."
        }
      ]
    };

    const response = await aiGateway.chat(request.providerId, {
      model: request.model,
      messages: request.messages
    });

    return { plan, response };
  }
}

export const aiOrchestrator = new AIOrchestrator();
