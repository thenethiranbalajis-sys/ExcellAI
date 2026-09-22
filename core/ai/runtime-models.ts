import { ModelRegistry } from "./model-registry";

export const modelRegistry = new ModelRegistry();
modelRegistry.register({ id: "mock", providerId: "mock", displayName: "ExcellAI Test Model", capabilities: { streaming: false, vision: false, toolCalling: false, structuredOutput: true } });
