import { app } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import type { Conversation } from "../../core/chat/types";
import { isConversation } from "../../core/chat/types";

export class ConversationStore {
  private readonly filePath = path.join(app.getPath("userData"), "conversations.json");
  private queue: Promise<void> = Promise.resolve();

  private async read(): Promise<Conversation[]> {
    try {
      const raw = await fs.readFile(this.filePath, "utf8");
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("Stored conversations are invalid.");
      return parsed.filter(isConversation);
    } catch (error) {
      const code =
        error && typeof error === "object" && "code" in error
          ? String((error as { code?: unknown }).code)
          : undefined;
      if (code === "ENOENT") return [];
      if (error instanceof SyntaxError) throw new Error("Stored conversations are corrupted.");
      throw error;
    }
  }

  private async write(conversations: Conversation[]): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    const temp = this.filePath + ".tmp";
    try {
      await fs.writeFile(temp, JSON.stringify(conversations), { encoding: "utf8", mode: 0o600 });
      await fs.rm(this.filePath, { force: true });
      await fs.rename(temp, this.filePath);
    } finally {
      await fs.rm(temp, { force: true }).catch(() => undefined);
    }
  }

  private async serialized<T>(operation: () => Promise<T>): Promise<T> {
    const previous = this.queue;
    let release!: () => void;
    this.queue = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await operation();
    } finally {
      release();
    }
  }

  async list(): Promise<Conversation[]> {
    return this.serialized(async () =>
      (await this.read()).sort((a, b) => b.updatedAt - a.updatedAt)
    );
  }

  async get(id: string): Promise<Conversation | null> {
    return this.serialized(async () => (await this.read()).find((item) => item.id === id) ?? null);
  }

  async save(conversation: Conversation): Promise<void> {
    await this.serialized(async () => {
      const conversations = await this.read();
      const index = conversations.findIndex((item) => item.id === conversation.id);
      if (index >= 0) conversations[index] = conversation;
      else conversations.push(conversation);
      await this.write(conversations);
    });
  }

  async delete(id: string): Promise<void> {
    await this.serialized(async () => {
      const conversations = (await this.read()).filter((item) => item.id !== id);
      await this.write(conversations);
    });
  }
}
