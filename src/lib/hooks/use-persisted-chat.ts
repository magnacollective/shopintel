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
  // Track conversation ID in a ref so we can update it without re-rendering useChat
  const convIdRef = useRef<string | null>(null);
  convIdRef.current = activeConversationId;

  const chat = useChat({
    // Use chatKey as the stable ID — only changes on explicit conversation switch
    id: `chat-${chatKey}`,
    messages: initialMessages.length > 0 ? initialMessages : undefined,
    onFinish: async ({ message }) => {
      if (!convIdRef.current || savingRef.current) return;
      savingRef.current = true;
      try {
        await saveMessage(convIdRef.current, "assistant", JSON.stringify(message.parts));
      } finally {
        savingRef.current = false;
      }
    },
    onError: (error) => {
      console.error("[chat] Error:", error);
    },
  });

  // Load conversation list on mount and auto-restore the most recent one
  const restoredRef = useRef(false);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/conversations");
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
          // Auto-load the most recent conversation if it has messages
          if (!restoredRef.current && data.length > 0) {
            restoredRef.current = true;
            const latest = data[0]; // already sorted by updatedAt desc
            const convRes = await fetch(`/api/conversations/${latest.id}`);
            if (convRes.ok) {
              const convData = await convRes.json();
              if (convData.messages?.length > 0) {
                const msgs: UIMessage[] = convData.messages.map((m: { id: string; role: string; content: string }) => {
                  let parts: UIMessage["parts"];
                  try {
                    parts = JSON.parse(m.content);
                  } catch {
                    parts = [{ type: "text" as const, text: m.content }];
                  }
                  return { id: m.id, role: m.role as "user" | "assistant", parts };
                });
                setActiveConversationId(latest.id);
                setInitialMessages(msgs);
                setChatKey((k) => k + 1);
              }
            }
          }
        }
      } catch {
        // silently fail
      }
    })();
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
    // Stop any in-flight request
    chat.stop();
    // Delete the active conversation from DB so it doesn't auto-restore
    if (activeConversationId) {
      try {
        await fetch(`/api/conversations/${activeConversationId}`, { method: "DELETE" });
        setConversations((prev) => prev.filter((c) => c.id !== activeConversationId));
      } catch {
        // silently fail
      }
    }
    setActiveConversationId(null);
    setInitialMessages([]);
    setChatKey((k) => k + 1);
  }, [chat, activeConversationId]);

  // Prevent double-click race conditions
  const sendingRef = useRef(false);

  // Wrap sendMessage: fire AI request FIRST, persist conversation in background
  const sendMessage = useCallback(async (opts: { text: string }) => {
    if (sendingRef.current) return;
    sendingRef.current = true;

    try {
      // Fire AI request immediately — no blocking
      chat.sendMessage(opts);

      // Persist conversation in background (doesn't affect the AI stream)
      const convId = activeConversationId;
      if (convId) {
        saveMessage(convId, "user", JSON.stringify([{ type: "text", text: opts.text }]));
      } else {
        // First message — create conversation after AI is already running
        const title = opts.text.slice(0, 60) + (opts.text.length > 60 ? "..." : "");
        createConversation(title).then((newId) => {
          if (newId) {
            setActiveConversationId(newId);
            saveMessage(newId, "user", JSON.stringify([{ type: "text", text: opts.text }]));
          }
        });
      }
    } finally {
      sendingRef.current = false;
    }
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
