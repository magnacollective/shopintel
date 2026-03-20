"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LiquidPreviewProps {
  code: string;
  componentType: string;
  previewProducts?: unknown[];
  previewHtml?: string;
}

export function LiquidPreview({ code, componentType, previewHtml }: LiquidPreviewProps) {
  const [copied, setCopied] = useState(false);
  const hasPreview = !!previewHtml;
  const [tab, setTab] = useState<"preview" | "code">(hasPreview ? "preview" : "code");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full ${isFullscreen ? "bg-zinc-950 flex flex-col h-screen" : ""}`}
    >
      <Card className={`w-full border border-border/50 ${isFullscreen ? "border-0 rounded-none flex flex-col flex-1 min-h-0" : ""}`}>
        <CardHeader className="pb-2 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                Generated Liquid Section
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">
                {componentType}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTab("preview")}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                  tab === "preview"
                    ? "bg-[#D33167]/20 text-[#D33167]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setTab("code")}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                  tab === "code"
                    ? "bg-[#D33167]/20 text-[#D33167]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                Code
              </button>
              <button
                onClick={toggleFullscreen}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
                title={isFullscreen ? "Exit full screen" : "Full screen"}
              >
                <span className="material-symbols-rounded text-sm">
                  {isFullscreen ? "close_fullscreen" : "open_in_full"}
                </span>
              </button>
              <button
                onClick={handleCopy}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted ml-1"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className={isFullscreen ? "flex-1 min-h-0 p-0" : ""}>
          {tab === "preview" && previewHtml ? (
            <div className={`overflow-hidden border border-border/50 ${isFullscreen ? "h-full border-0 rounded-none flex flex-col" : "rounded-lg"}`}>
              <div className="bg-zinc-800 px-3 py-1.5 flex items-center gap-1.5 border-b border-border/50 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                <span className="text-[10px] text-zinc-500 ml-2">storefront preview</span>
              </div>
              <iframe
                srcDoc={previewHtml}
                className={`w-full bg-white ${isFullscreen ? "flex-1" : ""}`}
                style={isFullscreen ? { border: "none" } : { height: "600px", border: "none" }}
                title="Liquid section preview"
              />
            </div>
          ) : tab === "preview" ? (
            <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
              Preview unavailable — switch to Code tab
            </div>
          ) : (
            <pre className={`bg-zinc-950 text-zinc-100 rounded-lg p-4 overflow-auto text-xs leading-relaxed ${isFullscreen ? "h-full max-h-none rounded-none" : "max-h-[500px]"}`}>
              <code>{code}</code>
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
