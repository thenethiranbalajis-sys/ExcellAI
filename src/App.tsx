import { useEffect, useMemo, useState } from "react";
import type { ChatMessage } from "../core/ai/types";
import type { ModelDefinition } from "../core/ai/model-registry";
import type { CloudProviderId } from "../core/ai/credentials/types";

type Message = ChatMessage & { id: string };

const welcome: Message = {
  id: "welcome",
  role: "assistant",
  content: "Welcome to ExcellAI. Choose any configured cloud model and use the same workspace across multiple AI providers."
};

const providerNames: Record<CloudProviderId, string> = {
  openai: "OpenAI",
  gemini: "Google Gemini",
  anthropic: "Anthropic",
  xai: "xAI",
  mistral: "Mistral AI",
  deepseek: "DeepSeek",
  cohere: "Cohere"
};

const providers = Object.keys(providerNames) as CloudProviderId[];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [models, setModels] = useState<ModelDefinition[]>([]);
  const [modelId, setModelId] = useState("gpt-4o");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [keys, setKeys] = useState<Partial<Record<CloudProviderId, string>>>({});
  const [configured, setConfigured] = useState<Partial<Record<CloudProviderId, boolean>>>({});
  const [savingProvider, setSavingProvider] = useState<CloudProviderId | null>(null);
  const [settingsMessage, setSettingsMessage] = useState("");

  const selectedModel = useMemo(
    () => models.find((model) => model.id === modelId),
    [models, modelId]
  );

  useEffect(() => {
    void (async () => {
      if (!window.excellAI) return;
      const available = await window.excellAI.listModels();
      setModels(available);
      if (available.length && !available.some((model) => model.id === modelId)) {
        setModelId(available[0].id);
      }
      const statusEntries = await Promise.all(
        providers.map(async (providerId) => [
          providerId,
          (await window.excellAI!.getCredentialStatus(providerId)).configured
        ] as const)
      );
      setConfigured(Object.fromEntries(statusEntries));
    })();
  }, [modelId]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || busy || !selectedModel) return;

    const user: Message = { id: crypto.randomUUID(), role: "user", content: text };
    const nextMessages = [...messages, user];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setBusy(true);

    try {
      if (!window.excellAI) throw new Error("ExcellAI desktop bridge is unavailable.");

      const response = await window.excellAI.aiChat(selectedModel.providerId, {
        model: selectedModel.id,
        messages: nextMessages.map(({ role, content }) => ({ role, content }))
      });

      setMessages((current) => [
        ...current,
        { id: response.id, role: "assistant", content: response.content }
      ]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The AI request failed.");
    } finally {
      setBusy(false);
    }
  }

  async function saveKey(providerId: CloudProviderId) {
    const apiKey = keys[providerId]?.trim();
    if (!apiKey || !window.excellAI) return;
    setSavingProvider(providerId);
    setSettingsMessage("");
    try {
      await window.excellAI.setCredential(providerId, apiKey);
      setKeys((current) => ({ ...current, [providerId]: "" }));
      setConfigured((current) => ({ ...current, [providerId]: true }));
      setSettingsMessage(providerNames[providerId] + " credentials saved securely on this device.");
    } catch (cause) {
      setSettingsMessage(cause instanceof Error ? cause.message : "Could not save credentials.");
    } finally {
      setSavingProvider(null);
    }
  }

  async function removeKey(providerId: CloudProviderId) {
    if (!window.excellAI) return;
    await window.excellAI.deleteCredential(providerId);
    setConfigured((current) => ({ ...current, [providerId]: false }));
    setSettingsMessage(providerNames[providerId] + " credentials removed.");
  }

  function newChat() {
    setMessages([welcome]);
    setInput("");
    setError("");
  }

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <aside className="sidebar">
          <div className="brand"><span className="brand-mark">E</span><span>ExcellAI</span></div>
          <button className="new-chat" onClick={newChat}>＋ New chat</button>
          <div className="nav-section">
            <span>Workspace</span>
            <button onClick={newChat}>⌂ Home</button>
            <button>◫ Chats</button>
            <button>◈ Projects</button>
            <button onClick={() => setSettingsOpen((value) => !value)}>⚙ Settings</button>
          </div>
          <div className="sidebar-footer">Cloud AI only · {models.length} models · v0.1</div>
        </aside>
      )}

      <main className="main">
        <header className="topbar">
          <button className="icon-button" onClick={() => setSidebarOpen((v) => !v)}>☰</button>
          <select className="model-select" value={modelId} onChange={(e) => setModelId(e.target.value)} disabled={!models.length || busy}>
            {models.map((model) => (
              <option key={model.id} value={model.id}>{model.displayName}</option>
            ))}
          </select>
          <div className="topbar-spacer" />
          <button className="icon-button" onClick={() => setSettingsOpen((value) => !value)}>⚙</button>
        </header>

        {settingsOpen && (
          <section className="settings-panel">
            <div className="settings-header">
              <div>
                <h2>Cloud AI providers</h2>
                <p>ExcellAI uses cloud providers only. API keys stay behind the Electron security boundary.</p>
              </div>
              <button className="icon-button" onClick={() => setSettingsOpen(false)}>×</button>
            </div>
            <div className="provider-grid">
              {providers.map((providerId) => (
                <div className="provider-card" key={providerId}>
                  <div className="provider-title">
                    <strong>{providerNames[providerId]}</strong>
                    <span className={configured[providerId] ? "status configured" : "status"}>{configured[providerId] ? "Configured" : "Not configured"}</span>
                  </div>
                  <input
                    type="password"
                    value={keys[providerId] ?? ""}
                    onChange={(e) => setKeys((current) => ({ ...current, [providerId]: e.target.value }))}
                    placeholder="Enter API key"
                    autoComplete="off"
                  />
                  <div className="provider-actions">
                    <button onClick={() => void saveKey(providerId)} disabled={savingProvider === providerId || !keys[providerId]?.trim()}>
                      {savingProvider === providerId ? "Saving…" : "Save securely"}
                    </button>
                    {configured[providerId] && <button className="danger-button" onClick={() => void removeKey(providerId)}>Remove</button>}
                  </div>
                </div>
              ))}
            </div>
            {settingsMessage && <div className="settings-message">{settingsMessage}</div>}
          </section>
        )}

        <section className="chat">
          <div className="messages">
            {messages.map((message) => (
              <article className={message.role === "user" ? "message user" : "message assistant"} key={message.id}>
                <div className="avatar">{message.role === "user" ? "U" : "E"}</div>
                <div className="message-content">
                  <div className="message-role">{message.role === "user" ? "You" : "ExcellAI"}</div>
                  <div>{message.content}</div>
                </div>
              </article>
            ))}
            {busy && (
              <article className="message assistant">
                <div className="avatar">E</div>
                <div className="message-content">
                  <div className="message-role">ExcellAI</div>
                  <div>Routing through {selectedModel?.displayName ?? "cloud AI"}…</div>
                </div>
              </article>
            )}
          </div>

          <div className="composer-wrap">
            {error && <div className="error-banner">{error}</div>}
            <div className="composer">
              <textarea
                value={input}
                disabled={busy || !selectedModel}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder={busy ? "ExcellAI is processing…" : selectedModel ? "Message ExcellAI..." : "Select a cloud model"}
                rows={1}
              />
              <div className="composer-actions">
                <button className="attach" disabled>＋</button>
                <span>Cloud AI · Enter to send · Shift + Enter for new line</span>
                <button className="send" disabled={busy || !input.trim() || !selectedModel} onClick={() => void sendMessage()} aria-label="Send">↑</button>
              </div>
            </div>
            <p className="disclaimer">ExcellAI can make mistakes. Verify important information.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
