"use client";

import { useChat } from "@ai-sdk/react";
import { getToolName } from "ai";
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToolResultRenderer } from "./tool-result-renderer";
import { ArrowUp } from "lucide-react";
import type { UIMessage } from "ai";

const SUGGESTED_PROMPTS = [
  { text: "How are sales this month?", icon: "monitoring" },
  { text: "Show me my top products", icon: "trophy" },
  { text: "Any low stock items?", icon: "inventory_2" },
  { text: "Who are my best customers?", icon: "group" },
  { text: "Build me a store dashboard", icon: "dashboard" },
  { text: "Create a featured products Liquid section", icon: "code_blocks" },
];

export function ChatInterface() {
  const { messages, sendMessage, status } = useChat();

  const [input, setInput] = useState("");
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
    <div className="flex flex-col h-full">
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
                  Welcome to ShopIntel
                </h2>
                <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
                  Your AI-powered Shopify command center. Ask me anything about
                  your store — products, orders, customers, inventory, or analytics.
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

          {messages.map((message, msgIdx) => (
            <MessageBubble key={message.id} message={message} index={msgIdx} />
          ))}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-3 animate-fade-in-up">
              <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="material-symbols-rounded text-white text-base">auto_awesome</span>
              </div>
              <div className="space-y-3 pt-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
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
  );
}

function MessageBubble({ message, index }: { message: UIMessage; index: number }) {
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
                className="flex items-center gap-2.5 text-xs text-muted-foreground py-2 animate-fade-in"
              >
                <div className="h-4 w-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                <span className="text-indigo-400">Fetching {toolName}...</span>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

function formatMarkdown(text: string): string {
  return text
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
}
