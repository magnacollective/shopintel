"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { getToolName } from "ai";
import DOMPurify from "dompurify";
import type { Product, Order, Customer } from "@/lib/shopify/types";
import { VantaBackground } from "@/components/vanta-background";
import { KPICards } from "@/components/generative/kpi-cards";
import { RevenueChart } from "@/components/generative/revenue-chart";
import { TopProductsChart } from "@/components/generative/top-products-chart";
import { StatusChart } from "@/components/generative/status-chart";
import { OrdersTable } from "@/components/generative/orders-table";
import { CustomerList } from "@/components/generative/customer-list";
import { InventoryTable } from "@/components/generative/inventory-table";
import { ToolResultRenderer } from "@/components/chat/tool-result-renderer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowUp } from "lucide-react";
import type { UIMessage } from "ai";

interface AnalyticsData {
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  currency: string;
  topProducts: { title: string; revenue: number; quantity: number }[];
  revenueTimeline: { date: string; revenue: number }[];
  statusBreakdown: Record<string, number>;
}

interface InventoryData {
  totalProducts: number;
  lowStockCount: number;
  threshold: number;
  inventory: {
    productTitle: string;
    totalInventory: number;
    isLowStock: boolean;
    variants: {
      variantTitle: string;
      sku: string | null;
      quantity: number | null;
      price: string;
      isLowStock: boolean;
    }[];
  }[];
}

interface UserSession {
  id: string;
  email: string;
  name: string;
  role: "admin" | "client";
}

interface DashboardProps {
  analytics: AnalyticsData;
  products: Product[];
  orders: Order[];
  customers: Customer[];
  inventoryData: InventoryData;
  user: UserSession;
}

export function Dashboard({ analytics, products, orders, customers, inventoryData, user }: DashboardProps) {
  const isAdmin = user.role === "admin";
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (chatOpen && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, chatOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    setChatOpen(true);
    sendMessage({ text: input });
    setInput("");
  };

  const handleSuggestion = (prompt: string) => {
    if (isLoading) return;
    setChatOpen(true);
    sendMessage({ text: prompt });
  };

  return (
    <VantaBackground>
      <div className="min-h-screen text-white noise-overlay">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-white/[0.06] backdrop-blur-2xl bg-[#0b0f14]/70">
          <div className="max-w-[1400px] mx-auto px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/15">
                <span className="material-symbols-rounded text-white text-xl">auto_awesome</span>
              </div>
              <div>
                <h1 className="text-sm font-display font-bold leading-none tracking-tight">ShopIntel</h1>
                <p className="text-[11px] text-zinc-500 mt-0.5">Command Center</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && ["Show revenue trends", "Low stock alerts", "Generate Liquid section"].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSuggestion(prompt)}
                  className="hidden lg:block text-xs px-3 py-1.5 rounded-lg border border-white/[0.06] text-zinc-500 hover:text-indigo-400 hover:border-indigo-500/20 hover:bg-indigo-500/[0.04] transition-all duration-300 font-display"
                >
                  {prompt}
                </button>
              ))}
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/[0.06]">
                <span className="text-xs text-zinc-500 hidden sm:block font-display">{user.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium font-display ${isAdmin ? "bg-indigo-500/15 text-indigo-400" : "bg-zinc-700/50 text-zinc-400"}`}>
                  {isAdmin ? "Admin" : "Client"}
                </span>
                <button
                  onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/login"; }}
                  className="text-zinc-600 hover:text-white transition-colors p-1"
                  title="Sign out"
                >
                  <span className="material-symbols-rounded text-base">logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-[1400px] mx-auto px-6 py-8 space-y-8 pb-28">
          {/* KPIs */}
          <section className="animate-fade-in-up">
            <KPICards
              totalRevenue={analytics.totalRevenue}
              orderCount={analytics.orderCount}
              averageOrderValue={analytics.averageOrderValue}
              currency={analytics.currency}
              lowStockCount={inventoryData.lowStockCount}
            />
          </section>

          {/* Charts Row - asymmetric layout */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in-up stagger-2">
            <div className="lg:col-span-5">
              <RevenueChart data={analytics.revenueTimeline} currency={analytics.currency} />
            </div>
            <div className="lg:col-span-4">
              <TopProductsChart data={analytics.topProducts} currency={analytics.currency} />
            </div>
            <div className="lg:col-span-3">
              <StatusChart data={analytics.statusBreakdown} title="Fulfillment" />
            </div>
          </section>

          {/* Orders & Customers Row */}
          {isAdmin && (
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in-up stagger-3">
              <div className="lg:col-span-8">
                <OrdersTable orders={orders} />
              </div>
              <div className="lg:col-span-4">
                <CustomerList customers={customers} />
              </div>
            </section>
          )}

          {/* Inventory (admin only) */}
          {isAdmin && (
            <section className="animate-fade-in-up stagger-4">
              <InventoryTable
                inventory={inventoryData.inventory}
                lowStockCount={inventoryData.lowStockCount}
                threshold={inventoryData.threshold}
              />
            </section>
          )}
        </main>

        {/* AI Chat Overlay (admin only) */}
        {isAdmin && messages.length > 0 && (
          <div className="fixed inset-x-0 bottom-20 z-40 flex justify-center px-6 pointer-events-none">
            {!chatOpen ? (
              <button
                onClick={() => setChatOpen(true)}
                className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-sm shadow-lg shadow-indigo-500/20 transition-all duration-300 font-display font-medium"
              >
                <span className="material-symbols-rounded text-base">chat</span>
                <span>Show AI Chat</span>
                {isLoading && (
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                )}
              </button>
            ) : (
              <Card className="w-full max-w-2xl max-h-[60vh] flex flex-col bg-[#0f1318]/95 backdrop-blur-2xl border-white/[0.08] shadow-2xl shadow-black/50 pointer-events-auto rounded-2xl">
                <div className="flex items-center justify-between p-4 pb-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-rounded text-indigo-400 text-lg">auto_awesome</span>
                    <span className="text-sm font-display font-medium text-zinc-300">AI Assistant</span>
                  </div>
                  <button
                    onClick={() => setChatOpen(false)}
                    className="text-zinc-600 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                  >
                    <span className="material-symbols-rounded text-lg">keyboard_arrow_down</span>
                  </button>
                </div>
                <div ref={chatScrollRef} className="overflow-y-auto px-4 pb-4 space-y-4">
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex items-center gap-1.5 py-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Sticky AI Input Bar (admin only) */}
        {isAdmin && <div className="fixed bottom-0 inset-x-0 z-50 border-t border-white/[0.06] bg-[#0b0f14]/70 backdrop-blur-2xl">
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-6 py-3 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the AI anything about your store..."
              className="pr-12 h-11 rounded-xl bg-white/[0.04] border-white/[0.08]
                focus:border-indigo-500/40 focus:ring-indigo-500/15
                placeholder:text-zinc-600 transition-all duration-300 text-sm"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="icon"
              className="absolute right-7.5 top-4 h-8 w-8 rounded-lg
                bg-gradient-to-r from-indigo-500 to-purple-600
                hover:from-indigo-400 hover:to-purple-500
                shadow-lg shadow-indigo-500/20
                disabled:opacity-30 disabled:shadow-none
                transition-all duration-300"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </form>
        </div>}
      </div>
    </VantaBackground>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl rounded-br-sm text-sm max-w-[80%]">
          {message.parts
            .filter((p): p is { type: "text"; text: string } => p.type === "text")
            .map((p) => p.text)
            .join("")}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {message.parts.map((part, idx) => {
        if (part.type === "text") {
          const text = (part as { type: "text"; text: string }).text;
          if (!text.trim()) return null;
          return (
            <div
              key={idx}
              className="text-sm text-zinc-300 leading-relaxed"
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
              <div key={idx}>
                <ToolResultRenderer
                  toolName={toolName}
                  result={toolPart.output as Record<string, unknown>}
                />
              </div>
            );
          }

          return (
            <div key={idx} className="flex items-center gap-2 text-xs text-zinc-500 py-1">
              <div className="h-3.5 w-3.5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
              <span>Fetching {toolName}...</span>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function formatMarkdown(text: string): string {
  const html = text
    .replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      '<pre class="bg-white/[0.03] rounded-lg p-3 overflow-x-auto text-xs my-2 border border-white/[0.06]"><code>$2</code></pre>'
    )
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded text-xs">$1</code>'
    )
    .replace(/\*\*([^*]+)\*\*/g, "<strong class='text-white font-semibold'>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br />");

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["strong", "em", "br", "pre", "code", "p", "span"],
    ALLOWED_ATTR: ["class"],
  });
}
