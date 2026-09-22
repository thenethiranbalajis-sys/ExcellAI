import { ipcMain } from "electron";
import { modelRegistry } from "../../core/ai/runtime-models";

export function registerModelHandlers(): void {
  ipcMain.handle("models:list", () => modelRegistry.list());
}
