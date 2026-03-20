"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PreviewProduct {
  title: string;
  price: string;
  currency: string;
  image: string;
  vendor: string;
  handle: string;
}

interface LiquidPreviewProps {
  code: string;
  componentType: string;
  previewProducts?: PreviewProduct[];
  previewHtml?: string;
}

function formatPrice(amount: string, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(parseFloat(amount));
  } catch {
    return `$${amount}`;
  }
}

/**
 * Build a simple product grid preview as a guaranteed fallback.
 * This always produces visible output regardless of Liquid parsing.
 */
function buildFallbackGrid(products: PreviewProduct[]): string {
  const cards = products.map((p) => `
    <div style="break-inside:avoid">
      ${p.image ? `<img src="${p.image}" alt="${p.title}" style="width:100%;aspect-ratio:3/4;object-fit:cover;display:block;background:#f5f5f0">` : `<div style="width:100%;aspect-ratio:3/4;background:#f5f5f0"></div>`}
      <div style="padding:12px 0">
        <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.12em;color:rgba(0,0,0,0.5);margin:0 0 4px">${p.vendor}</p>
        <h3 style="font-size:14px;font-weight:600;margin:0 0 6px;color:#000">${p.title}</h3>
        <span style="font-size:14px;font-weight:600;color:#000">${formatPrice(p.price, p.currency)}</span>
      </div>
    </div>
  `).join("");

  return `
    <section style="padding:60px 32px;background:#fff">
      <div style="max-width:1100px;margin:0 auto">
        <div style="display:grid;grid-template-columns:repeat(${Math.min(products.length, 4)},1fr);gap:24px">
          ${cards}
        </div>
      </div>
    </section>
  `;
}

/**
 * Parse Liquid code into renderable HTML by substituting product data.
 * Returns the parsed HTML body content (CSS is extracted separately).
 */
function parseLiquidToHtml(code: string, products: PreviewProduct[]): { body: string; css: string } {
  let html = code;
  const allCss: string[] = [];

  // Extract CSS from {% style %} and <style>
  html = html.replace(/\{%[-\s]*style\s*%\}([\s\S]*?)\{%[-\s]*endstyle\s*%\}/gi, (_m, css) => { allCss.push(css); return ""; });
  html = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_m, css) => { allCss.push(css); return ""; });

  // Remove schema
  html = html.replace(/\{%[-\s]*schema\s*%\}[\s\S]*?\{%[-\s]*endschema\s*%\}/gi, "");

  // Unroll for-loops
  let safety = 0;
  while (safety++ < 10) {
    const match = html.match(/\{%[-\s]*for\s+(\w+)\s+in\s+[^%]+%\}([\s\S]*?)\{%[-\s]*endfor\s*%\}/i);
    if (!match) break;
    const v = match[1];
    const body = match[2];
    const expanded = products.map((p) => {
      let b = body;
      b = b.replace(new RegExp(`\\{\\{[-\\s]*${v}\\.[^}]*(?:image|media|img|photo|src)[^}]*\\}\\}`, "gi"), p.image || "");
      b = b.replace(new RegExp(`\\{\\{[-\\s]*${v}\\.[^}]*price[^}]*\\}\\}`, "gi"), formatPrice(p.price, p.currency));
      b = b.replace(new RegExp(`\\{\\{[-\\s]*${v}\\.title[^}]*\\}\\}`, "gi"), p.title);
      b = b.replace(new RegExp(`\\{\\{[-\\s]*${v}\\.vendor[^}]*\\}\\}`, "gi"), p.vendor);
      b = b.replace(new RegExp(`\\{\\{[-\\s]*${v}\\.handle[^}]*\\}\\}`, "gi"), p.handle);
      b = b.replace(new RegExp(`\\{\\{[-\\s]*${v}\\.url[^}]*\\}\\}`, "gi"), `#${p.handle}`);
      b = b.replace(new RegExp(`\\{\\{[-\\s]*${v}\\.[^}]*\\}\\}`, "gi"), "");
      b = b.replace(/\{%[^%]*%\}/g, "");
      return b;
    }).join("\n");
    html = html.replace(match[0], expanded);
  }

  // Replace section.settings
  html = html.replace(/\{\{[-\s]*section\.settings\.(\w+)[^}]*\}\}/g, (_m, s: string) => {
    const l = s.toLowerCase();
    if (l.includes("title") || l.includes("heading")) return "Featured Collection";
    if (l.includes("subtitle") || l.includes("description") || l.includes("text")) return "Discover our curated selection";
    if (l.includes("button") || l.includes("cta")) return "Shop Now";
    if (l.includes("url") || l.includes("link")) return "#";
    return "";
  });

  // Strip remaining Liquid
  html = html.replace(/\{%[^%]*%\}/g, "");
  html = html.replace(/\{\{[^}]*\}\}/g, "");

  return { body: html, css: allCss.join("\n") };
}

function buildFullHtml(bodyContent: string, extraCss: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&family=Roboto:ital,wght@0,300;0,400;0,700;1,400&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Roboto,sans-serif;-webkit-font-smoothing:antialiased}
:root{--accent:#D33167;--text:#000;--muted:rgba(0,0,0,0.55);--bg-warm:#FAFAF7}
img{max-width:100%;height:auto;display:block}
a{color:inherit;text-decoration:none}
${extraCss}
</style>
</head>
<body>${bodyContent}</body>
</html>`;
}

export function LiquidPreview({ code, componentType, previewProducts, previewHtml: serverHtml }: LiquidPreviewProps) {
  const [copied, setCopied] = useState(false);
  const hasProducts = !!(previewProducts && previewProducts.length > 0);
  const [tab, setTab] = useState<"preview" | "code">(hasProducts ? "preview" : "code");
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build preview: use server HTML if available, otherwise parse client-side, fallback to simple grid
  const previewHtml = useMemo(() => {
    if (serverHtml) return serverHtml;
    if (!hasProducts) return "";

    const products = previewProducts as PreviewProduct[];

    // Try parsing the Liquid code
    const parsed = parseLiquidToHtml(code, products);
    // Check if parsing produced meaningful content (more than just whitespace/empty tags)
    const strippedBody = parsed.body.replace(/<[^>]*>/g, "").trim();
    if (strippedBody.length > 10) {
      return buildFullHtml(parsed.body, parsed.css);
    }

    // Fallback: simple product grid that always works
    return buildFullHtml(buildFallbackGrid(products), "");
  }, [code, previewProducts, hasProducts, serverHtml]);

  const showTabs = hasProducts;

  if (expanded) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-white">Storefront Preview</span>
            <Badge variant="outline" className="text-[10px]">{componentType}</Badge>
          </div>
          <div className="flex items-center gap-2">
            {showTabs && (
              <>
                <button
                  onClick={() => setTab("preview")}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    tab === "preview" ? "bg-indigo-500/20 text-indigo-300" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setTab("code")}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    tab === "code" ? "bg-indigo-500/20 text-indigo-300" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Code
                </button>
              </>
            )}
            <button onClick={handleCopy} className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded-md hover:bg-white/10">
              {copied ? "Copied!" : "Copy"}
            </button>
            <button onClick={() => setExpanded(false)} className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-white/10 ml-2">
              <span className="material-symbols-rounded text-lg">close</span>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {tab === "preview" && previewHtml ? (
            <iframe srcDoc={previewHtml} className="w-full h-full bg-white" style={{ border: "none" }} title="Liquid section preview" />
          ) : (
            <pre className="bg-zinc-950 text-zinc-100 p-6 overflow-auto text-xs leading-relaxed h-full">
              <code>{code}</code>
            </pre>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full border border-border/50">
      <CardHeader className="pb-2">
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
            {showTabs && (
              <>
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
              </>
            )}
            <button
              onClick={() => setExpanded(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
              title="Full screen"
            >
              <span className="material-symbols-rounded text-sm">open_in_full</span>
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
      <CardContent>
        {tab === "preview" && previewHtml ? (
          <div className="rounded-lg overflow-hidden border border-border/50">
            <div className="bg-zinc-800 px-3 py-1.5 flex items-center gap-1.5 border-b border-border/50">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              <span className="text-[10px] text-zinc-500 ml-2">storefront preview</span>
            </div>
            <iframe
              srcDoc={previewHtml}
              className="w-full bg-white"
              style={{ height: "600px", border: "none" }}
              title="Liquid section preview"
            />
          </div>
        ) : (
          <pre className="bg-zinc-950 text-zinc-100 rounded-lg p-4 overflow-x-auto text-xs leading-relaxed max-h-[500px]">
            <code>{code}</code>
          </pre>
        )}
      </CardContent>
    </Card>
  );
}
