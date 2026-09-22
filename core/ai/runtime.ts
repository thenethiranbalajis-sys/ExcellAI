import { AIGateway } from "./gateway";
import { MockProvider } from "./providers/mock";

export const aiGateway = new AIGateway();

aiGateway.registerProvider(new MockProvider());
