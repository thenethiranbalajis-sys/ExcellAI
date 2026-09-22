interface Window {
  excellAI: {
    getAppInfo: () => Promise<{ name: string; version: string }>;
  };
}