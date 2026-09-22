import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { registerIPCHandlers } from "./ipc";
import { setCredentialStore } from "../core/ai/credentials/runtime";
import { SecureCredentialStore } from "./services/secure-credentials";

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 980,
    minHeight: 680,
    backgroundColor: "#0b0d10",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    void win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    void win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

ipcMain.handle("app:get-info", () => ({
  name: "ExcellAI",
  version: app.getVersion()
}));

app.whenReady().then(() => {
  setCredentialStore(new SecureCredentialStore());
  registerIPCHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
