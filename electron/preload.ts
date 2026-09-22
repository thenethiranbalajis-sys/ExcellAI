import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("excellAI", {
  getAppInfo: () => ipcRenderer.invoke("app:get-info")
});