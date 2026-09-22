import { useState } from "react";

type Message = { id: string; role: "user" | "assistant"; content: string };

const welcome: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hello! I’m ExcellAI. I’m ready to help you think, create, code, research, and build."
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    const user: Message = { id: crypto.randomUUID(), role: "user", content: text };
    const assistant: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "I received your message. The ExcellAI provider/orchestrator layer will connect this interface to real AI models without hard-coded API keys."
    };
    setMessages((current) => [...current, user, assistant]);
    setInput("");
  }

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <aside className="sidebar">
          <div className="brand"><span className="brand-mark">E</span><span>ExcellAI</span></div>
          <button className="new-chat" onClick={() => setMessages([welcome])}>＋ New chat</button>
          <div className="nav-section">
            <span>Workspace</span>
            <button>⌂ Home</button>
            <button>◫ Chats</button>
            <button>◈ Projects</button>
            <button>⚙ Settings</button>
          </div>
          <div className="sidebar-footer">AI workspace · v0.1</div>
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
          </div>

          <div className="composer-wrap">
            <div className="composer">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Message ExcellAI..."
                rows={1}
              />
              <div className="composer-actions">
                <button className="attach">＋</button>
                <span>Shift + Enter for new line</span>
                <button className="send" onClick={sendMessage} aria-label="Send">↑</button>
              </div>
            </div>
            <p className="disclaimer">ExcellAI can make mistakes. Verify important information.</p>
          </div>
        </section>
      </main>
    </div>
  );
}