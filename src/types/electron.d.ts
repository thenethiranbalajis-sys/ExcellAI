export interface ExcellAIAppInfo {
  name: string;
  version: string;
}

export interface ExcellAIElectronAPI {
  getAppInfo(): Promise<ExcellAIAppInfo>;
}

declare global {
  interface Window {
    excellAI?: ExcellAIElectronAPI;
  }
}

export {};
