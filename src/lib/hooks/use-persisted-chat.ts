"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useCallback, useRef } from "react";
import type { UIMessage } from "ai";

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

export function usePersistedChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [chatKey, setChatKey] = useState(0); // force remount useChat on conversation switch
  const savingRef = useRef(false);

  const chat = useChat({
    id: activeConversationId ?? undefined,
    messages: initialMessages.length > 0 ? initialMessages : undefined,
    onFinish: async ({ message }) => {
      if (!activeConversationId || savingRef.current) return;
      savingRef.current = true;
      try {
        await saveMessage(activeConversationId, "assistant", JSON.stringify(message.parts));
      } finally {
        savingRef.current = false;
      }
    },
  });

  // Load conversation list on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch {
      // silently fail
    }
  }, []);

  const createConversation = useCallback(async (title?: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || "New Conversation" }),
      });
      if (res.ok) {
        const conv = await res.json();
        setConversations((prev) => [conv, ...prev]);
        return conv.id;
      }
    } catch {
      // silently fail
    }
    return null;
  }, []);

  const loadConversation = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        const msgs: UIMessage[] = data.messages.map((m: { id: string; role: string; content: string; createdAt: string }) => {
          let parts: UIMessage["parts"];
          try {
            parts = JSON.parse(m.content);
          } catch {
            parts = [{ type: "text" as const, text: m.content }];
          }
          return {
            id: m.id,
            role: m.role as "user" | "assistant",
            parts,
          };
        });
        setActiveConversationId(id);
        setInitialMessages(msgs);
        setChatKey((k) => k + 1);
      }
    } catch {
      // silently fail
    }
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (activeConversationId === id) {
          setActiveConversationId(null);
          setInitialMessages([]);
          setChatKey((k) => k + 1);
        }
      }
    } catch {
      // silently fail
    }
  }, [activeConversationId]);

  const startNewChat = useCallback(async () => {
    setActiveConversationId(null);
    setInitialMessages([]);
    setChatKey((k) => k + 1);
  }, []);

  // Wrap sendMessage to auto-create conversation and save user message
  const sendMessage = useCallback(async (opts: { text: string }) => {
    let convId = activeConversationId;

    // Auto-create conversation on first message
    if (!convId) {
      const title = opts.text.slice(0, 60) + (opts.text.length > 60 ? "..." : "");
      convId = await createConversation(title);
      if (!convId) return;
      setActiveConversationId(convId);
    }

    // Save user message
    await saveMessage(convId, "user", JSON.stringify([{ type: "text", text: opts.text }]));

    // Send to AI
    chat.sendMessage(opts);
  }, [activeConversationId, createConversation, chat]);

  return {
    ...chat,
    sendMessage,
    conversations,
    activeConversationId,
    loadConversation,
    deleteConversation,
    startNewChat,
    loadConversations,
    chatKey,
  };
}

async function saveMessage(conversationId: string, role: string, content: string) {
  try {
    await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, content }),
    });
  } catch {
    // silently fail
  }
}
