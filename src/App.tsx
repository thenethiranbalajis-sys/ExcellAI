import { useState } from "react";
import type { ChatMessage } from "../core/ai/types";

type Message = ChatMessage & { id: string };

const welcome: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hello! I’m ExcellAI. The secure AI pipeline is connected. I can now send messages through Electron IPC to the registered provider layer."
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage() {
    const text = input.trim();
    if (!text || busy) return;

    const user: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text
    };

    const nextMessages = [...messages, user];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setBusy(true);

    try {
      if (!window.excellAI) {
        throw new Error("ExcellAI desktop bridge is unavailable.");
      }

      const response = await window.excellAI.aiChat("mock", {
        model: "mock",
        messages: nextMessages.map(({ role, content }) => ({ role, content }))
      });

      setMessages((current) => [
        ...current,
        {
          id: response.id,
          role: "assistant",
          content: response.content
        }
      ]);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "The AI request failed.";
      setError(message);
    } finally {
      setBusy(false);
    }
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
            <button>⌂ Home</button>
            <button>◫ Chats</button>
            <button>◈ Projects</button>
            <button>⚙ Settings</button>
          </div>
          <div className="sidebar-footer">AI workspace · secure IPC · v0.1</div>
        </aside>
      )}

      <main className="main">
        <header className="topbar">
          <button className="icon-button" onClick={() => setSidebarOpen((v) => !v)}>☰</button>
          <div className="model-name">ExcellAI <span>▾</span></div>
          <div className="topbar-spacer" />
          <button className="icon-button">⋯</button>
        </header>

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
                  <div>Thinking through the provider pipeline…</div>
                </div>
              </article>
            )}
          </div>

          <div className="composer-wrap">
            {error && <div className="error-banner">{error}</div>}
            <div className="composer">
              <textarea
                value={input}
                disabled={busy}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder={busy ? "ExcellAI is processing…" : "Message ExcellAI..."}
                rows={1}
              />
              <div className="composer-actions">
                <button className="attach" disabled>＋</button>
                <span>Enter to send · Shift + Enter for new line</span>
                <button className="send" disabled={busy || !input.trim()} onClick={() => void sendMessage()} aria-label="Send">↑</button>
              </div>
            </div>
            <p className="disclaimer">ExcellAI can make mistakes. Verify important information.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
