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
}

const PREVIEW_FONTS = `<link href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&family=Roboto:ital,wght@0,300;0,400;0,700;1,400&display=swap" rel="stylesheet">`;

const PREVIEW_BASE_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Roboto, sans-serif; -webkit-font-smoothing: antialiased; }
  :root {
    --accent: #D33167;
    --text: #000;
    --muted: rgba(0,0,0,0.55);
    --light: rgba(0,0,0,0.25);
    --bg-warm: #FAFAF7;
  }
`;

export function LiquidPreview({ code, componentType, previewProducts }: LiquidPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"preview" | "code">(previewProducts?.length ? "preview" : "code");
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const previewHtml = useMemo(() => {
    if (!code) return "";
    return buildPreviewFromCode(code, previewProducts || []);
  }, [code, previewProducts]);

  if (expanded) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-white">Storefront Preview</span>
            <Badge variant="outline" className="text-[10px]">{componentType}</Badge>
          </div>
          <div className="flex items-center gap-2">
            {previewProducts?.length ? (
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
            ) : null}
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
            <iframe srcDoc={previewHtml} className="w-full h-full bg-white" style={{ border: "none" }} sandbox="allow-same-origin" title="Liquid section preview" />
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
            {previewProducts?.length ? (
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
            ) : null}
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
              sandbox="allow-same-origin"
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

function formatPrice(amount: string, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(parseFloat(amount));
}

function buildPreviewFromCode(code: string, products: PreviewProduct[]): string {
  let html = code;

  // 1. Extract CSS from {% style %} blocks AND regular <style> tags
  const allCss: string[] = [];
  // Liquid {% style %} blocks
  html = html.replace(/\{%[-\s]*style\s*%\}([\s\S]*?)\{%[-\s]*endstyle\s*%\}/gi, (_m, css) => {
    allCss.push(css);
    return "";
  });
  // Regular <style> tags
  html = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_m, css) => {
    allCss.push(css);
    return "";
  });

  // 2. Remove {% schema %} block (JSON config, not renderable)
  html = html.replace(/\{%[-\s]*schema\s*%\}[\s\S]*?\{%[-\s]*endschema\s*%\}/gi, "");

  // 3. Unroll ALL for-loops with product data
  // Very flexible: handles any collection path, limit params, whitespace variations
  const forLoopRegex = /\{%[-\s]*for\s+(\w+)\s+in\s+[^%]+%\}([\s\S]*?)\{%[-\s]*endfor\s*%\}/gi;
  let loopMatch;
  while ((loopMatch = forLoopRegex.exec(html)) !== null) {
    if (products.length === 0) break;
    const itemVar = loopMatch[1];
    const loopBody = loopMatch[2];
    const unrolled = products.map((p) => {
      let block = loopBody;
      // Image — catch any variant: featured_image, images[0], media[0], image, etc.
      block = block.replace(new RegExp(`\\{\\{[-\\s]*${itemVar}\\.[^}]*(?:image|media|img)[^}]*\\}\\}`, "gi"), p.image || "");
      // Price — catch any variant with | money, | money_with_currency, etc.
      block = block.replace(new RegExp(`\\{\\{[-\\s]*${itemVar}\\.[^}]*price[^}]*\\}\\}`, "gi"), formatPrice(p.price, p.currency));
      // Title
      block = block.replace(new RegExp(`\\{\\{[-\\s]*${itemVar}\\.title[^}]*\\}\\}`, "gi"), p.title);
      // Vendor
      block = block.replace(new RegExp(`\\{\\{[-\\s]*${itemVar}\\.vendor[^}]*\\}\\}`, "gi"), p.vendor);
      // Handle
      block = block.replace(new RegExp(`\\{\\{[-\\s]*${itemVar}\\.handle[^}]*\\}\\}`, "gi"), p.handle);
      // URL
      block = block.replace(new RegExp(`\\{\\{[-\\s]*${itemVar}\\.url[^}]*\\}\\}`, "gi"), `#${p.handle}`);
      // Any remaining {{ product.* }} — blank them out
      block = block.replace(new RegExp(`\\{\\{[-\\s]*${itemVar}\\.[^}]*\\}\\}`, "gi"), "");
      // Strip inner Liquid tags (conditionals, assigns, etc.)
      block = block.replace(/\{%[^%]*%\}/g, "");
      return block;
    }).join("\n");
    html = html.replace(loopMatch[0], unrolled);
    forLoopRegex.lastIndex = 0;
  }

  // 4. Replace section.settings references with defaults
  html = html.replace(/\{\{[-\s]*section\.settings\.(\w+)[^}]*\}\}/g, (_match, setting: string) => {
    const s = setting.toLowerCase();
    if (s.includes("title") || s.includes("heading")) return "Featured Collection";
    if (s.includes("subtitle") || s.includes("description") || s.includes("text")) return "Discover our curated selection";
    if (s.includes("button") || s.includes("cta")) return "Shop Now";
    if (s.includes("url") || s.includes("link")) return "#";
    return "";
  });

  // 5. Strip all remaining Liquid tags and output
  html = html.replace(/\{%[^%]*%\}/g, "");
  html = html.replace(/\{\{[^}]*\}\}/g, "");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${PREVIEW_FONTS}
  <style>
    ${PREVIEW_BASE_STYLES}
    ${allCss.join("\n")}
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
}
