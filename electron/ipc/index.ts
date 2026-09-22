import { registerAIHandlers } from "./ai";
import { registerCredentialHandlers } from "./settings";
import { registerModelHandlers } from "./models";
import { registerConversationHandlers } from "./conversations";

export function registerIPCHandlers(): void {
  registerAIHandlers();
  registerCredentialHandlers();
  registerModelHandlers();
  registerConversationHandlers();
}
