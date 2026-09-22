import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { registerIPCHandlers } from "./ipc";

function createWindow() {
  const win = new BrowserWindow({ width: 1440, height: 920, minWidth: 980, minHeight: 680, backgroundColor: "#0b0d10", webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, nodeIntegration: false, sandbox: true } });
  if (process.env.VITE_DEV_SERVER_URL) void win.loadURL(process.env.VITE_DEV_SERVER_URL); else void win.loadFile(path.join(__dirname, "../dist/index.html"));
}

ipcMain.handle("app:get-info", () => ({ name: "ExcellAI", version: app.getVersion() }));
registerIPCHandlers();
app.whenReady().then(() => { createWindow(); app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); }); });
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
