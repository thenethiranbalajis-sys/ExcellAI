import { AIGateway } from "./gateway";
import { MockProvider } from "./providers/mock";
import { registerCloudProviders } from "./providers/configured";

export const aiGateway = new AIGateway();

aiGateway.registerProvider(new MockProvider());
registerCloudProviders();
