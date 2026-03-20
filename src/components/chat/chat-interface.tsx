"use client";

import { getToolName } from "ai";
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToolResultRenderer } from "./tool-result-renderer";
import { ArrowUp } from "lucide-react";
import DOMPurify from "dompurify";
import { usePersistedChat } from "@/lib/hooks/use-persisted-chat";
import type { UIMessage } from "ai";

const SUGGESTED_PROMPTS = [
  { text: "How are sales this month?", icon: "monitoring" },
  { text: "Show me my top products", icon: "trophy" },
  { text: "Any low stock items?", icon: "inventory_2" },
  { text: "Who are my best customers?", icon: "group" },
  { text: "What's trending? Give me predictions", icon: "trending_up" },
  { text: "Create a featured products Liquid section", icon: "code_blocks" },
];

export function ChatInterface() {
  const {
    messages,
    sendMessage,
    status,
    conversations,
    activeConversationId,
    loadConversation,
    deleteConversation,
    startNewChat,
    chatKey,
  } = usePersistedChat();

  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleSuggestion = (prompt: string) => {
    if (isLoading) return;
    sendMessage({ text: prompt });
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full" key={chatKey}>
      {/* Conversation Sidebar */}
      <div className={`${sidebarOpen ? "w-64" : "w-0"} shrink-0 transition-all duration-200 overflow-hidden border-r border-white/[0.06]`}>
        <div className="w-64 h-full flex flex-col bg-black/20">
          <div className="p-3 border-b border-white/[0.06] flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">History</span>
            <button
              onClick={startNewChat}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-rounded text-sm">add</span>
              New
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm ${
                  activeConversationId === conv.id
                    ? "bg-indigo-500/15 text-indigo-300"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                }`}
                onClick={() => loadConversation(conv.id)}
              >
                <span className="material-symbols-rounded text-sm opacity-50">chat_bubble</span>
                <span className="flex-1 truncate text-xs">{conv.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all"
                >
                  <span className="material-symbols-rounded text-sm">close</span>
                </button>
              </div>
            ))}
            {conversations.length === 0 && (
              <p className="text-[11px] text-zinc-600 text-center py-4">No conversations yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="shrink-0 px-4 py-2 border-b border-white/[0.06] flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-zinc-500 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
          >
            <span className="material-symbols-rounded text-lg">
              {sidebarOpen ? "menu_open" : "menu"}
            </span>
          </button>
          <span className="text-xs text-zinc-500">
            {activeConversationId
              ? conversations.find((c) => c.id === activeConversationId)?.title || "Conversation"
              : "New Conversation"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-4" ref={scrollRef}>
          <div className="max-w-3xl mx-auto py-8 space-y-6">
            {isEmpty && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-in">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/25 animate-pulse-glow">
                    <span className="material-symbols-rounded text-white text-3xl">auto_awesome</span>
                  </div>
                </div>
                <div className="text-center space-y-3">
                  <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                    ShopIntel Agent
                  </h2>
                  <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
                    Your autonomous Shopify agent. I analyze trends, predict growth,
                    deploy code, and take action on your store data.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <button
                      key={prompt.text}
                      onClick={() => handleSuggestion(prompt.text)}
                      className={`group flex items-center text-sm px-4 py-3.5 rounded-xl border border-border/50
                        hover:bg-white/5 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5
                        transition-all duration-200 whitespace-nowrap animate-fade-in-up stagger-${i + 1}`}
                    >
                      <span className="material-symbols-rounded text-base mr-2.5 text-indigo-400 group-hover:text-indigo-300 transition-colors align-middle">
                        {prompt.icon}
                      </span>
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                        {prompt.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isLoading && (
              <div className="flex gap-3 animate-fade-in-up">
                <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <span className="material-symbols-rounded text-white text-base">auto_awesome</span>
                </div>
                <div className="flex items-center gap-2 pt-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs text-zinc-500 animate-pulse">Agent is working...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/5 bg-black/40 backdrop-blur-md p-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your store..."
              className="pr-12 h-12 rounded-xl bg-muted/50 border-border/50
                focus:border-indigo-500/50 focus:ring-indigo-500/20
                placeholder:text-muted-foreground/50 transition-all"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="icon"
              className="absolute right-1.5 top-1.5 h-9 w-9 rounded-lg
                bg-gradient-to-r from-indigo-500 to-purple-600
                hover:from-indigo-600 hover:to-purple-700
                shadow-lg shadow-indigo-500/25
                disabled:opacity-30 disabled:shadow-none
                transition-all duration-200"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex gap-3 justify-end animate-slide-in-right">
        <Card className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white border-0 max-w-[85%] shadow-lg shadow-indigo-500/15 rounded-2xl rounded-br-md">
          <p className="text-sm leading-relaxed">
            {message.parts
              .filter((p): p is { type: "text"; text: string } => p.type === "text")
              .map((p) => p.text)
              .join("")}
          </p>
        </Card>
        <div className="shrink-0 w-8 h-8 rounded-xl bg-zinc-700 flex items-center justify-center mt-0.5">
          <span className="material-symbols-rounded text-zinc-300 text-base">person</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 justify-start animate-fade-in-up">
      <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mt-0.5 shadow-lg shadow-indigo-500/20">
        <span className="material-symbols-rounded text-white text-base">auto_awesome</span>
      </div>
      <div className="max-w-[85%] space-y-3 min-w-0">
        {message.parts.map((part, idx) => {
          if (part.type === "text") {
            const text = (part as { type: "text"; text: string }).text;
            if (!text.trim()) return null;
            return (
              <div
                key={idx}
                className="text-sm leading-relaxed prose prose-sm prose-invert max-w-none
                  prose-p:my-1.5 prose-headings:my-2 prose-strong:text-white
                  prose-code:text-indigo-300 prose-code:bg-indigo-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                  animate-fade-in"
                dangerouslySetInnerHTML={{ __html: formatMarkdown(text) }}
              />
            );
          }

          if (part.type.startsWith("tool-")) {
            const toolPart = part as {
              type: string;
              state: string;
              output?: unknown;
              toolCallId: string;
            };
            const toolName = getToolName(toolPart as Parameters<typeof getToolName>[0]);

            if (toolPart.state === "output-available" && toolPart.output) {
              return (
                <div key={idx} className="animate-scale-in">
                  <ToolResultRenderer
                    toolName={toolName}
                    result={toolPart.output as Record<string, unknown>}
                  />
                </div>
              );
            }

            return (
              <div
                key={idx}
                className="flex items-center gap-2.5 text-xs py-2 animate-fade-in animate-pulse"
              >
                <div className="h-4 w-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                <span className="text-indigo-400">{getToolLabel(toolName)}</span>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

function getToolLabel(toolName: string): string {
  const labels: Record<string, string> = {
    generateLiquid: "Generating Liquid section...",
    getProducts: "Fetching products...",
    getOrders: "Fetching orders...",
    getCustomers: "Fetching customers...",
    getAnalytics: "Analyzing store data...",
    getInventory: "Checking inventory...",
    forecastTrends: "Analyzing trends...",
    deploySection: "Deploying to theme...",
  };
  return labels[toolName] || `Running ${toolName}...`;
}

function formatMarkdown(text: string): string {
  const html = text
    .replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      '<pre class="bg-zinc-900 text-zinc-100 rounded-xl p-4 overflow-x-auto text-xs my-3 border border-border/50"><code>$2</code></pre>'
    )
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded text-xs">$1</code>'
    )
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br />");

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["strong", "em", "br", "pre", "code", "p", "span"],
    ALLOWED_ATTR: ["class"],
  });
}
