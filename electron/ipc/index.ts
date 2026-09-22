import { registerAIHandlers } from "./ai";
import { registerCredentialHandlers } from "./settings";
import { registerModelHandlers } from "./models";

export function registerIPCHandlers(): void {
  registerAIHandlers();
  registerCredentialHandlers();
  registerModelHandlers();
}
