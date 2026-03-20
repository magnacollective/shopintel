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
    if (!previewProducts?.length) return "";
    return buildPreviewHtml(componentType, previewProducts);
  }, [componentType, previewProducts]);

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
            <iframe srcDoc={previewHtml} className="w-full h-full bg-white" style={{ border: "none" }} sandbox="" title="Liquid section preview" />
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
              sandbox=""
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

function buildPreviewHtml(componentType: string, products: PreviewProduct[]): string {
  const productCards = products
    .map(
      (p) => `
    <article style="position:relative">
      <a href="#" style="text-decoration:none;color:inherit;display:block">
        <div style="overflow:hidden;background:#f5f5f0;margin-bottom:14px">
          ${p.image ? `<img src="${p.image}" style="width:100%;aspect-ratio:3/4;object-fit:cover;display:block;transition:transform 0.6s ease" alt="${p.title}" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">` : '<div style="width:100%;aspect-ratio:3/4;background:#f5f5f0;display:flex;align-items:center;justify-content:center;color:rgba(0,0,0,0.25);font-size:13px">No image</div>'}
        </div>
        <div>
          <span style="display:block;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;color:rgba(0,0,0,0.55);margin-bottom:4px;font-weight:500">${p.vendor}</span>
          <h3 style="font-size:14px;font-weight:500;margin:0 0 6px;color:#000;line-height:1.3">${p.title}</h3>
          <span style="font-size:14px;font-weight:600;color:#000">${formatPrice(p.price, p.currency)}</span>
        </div>
      </a>
      <button style="display:inline-block;margin-top:10px;padding:0 0 2px;border:none;background:none;color:#000;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.1em;cursor:pointer;border-bottom:1px solid #000;transition:color 0.3s,border-color 0.3s" onmouseover="this.style.color='#D33167';this.style.borderColor='#D33167'" onmouseout="this.style.color='#000';this.style.borderColor='#000'">Add to Bag</button>
    </article>`
    )
    .join("");

  const wrapHtml = (body: string) =>
    `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">${PREVIEW_FONTS}<style>${PREVIEW_BASE_STYLES}</style></head><body>${body}</body></html>`;

  switch (componentType) {
    case "featured-products":
    case "product-grid":
      return wrapHtml(`
  <section style="padding:72px 32px;background:#fff">
    <div style="max-width:1000px;margin:0 auto">
      <span style="display:block;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.14em;color:#D33167;text-align:center;margin-bottom:10px">Curated for You</span>
      <h2 style="font-family:'Roboto Condensed',sans-serif;font-size:36px;font-weight:700;text-align:center;margin:0 0 8px;color:#000;letter-spacing:-0.01em;line-height:1.05">Bestsellers</h2>
      <p style="text-align:center;color:rgba(0,0,0,0.55);margin:0 0 48px;font-size:15px;font-weight:400">The essentials your routine has been missing</p>
      <div style="display:grid;grid-template-columns:repeat(${Math.min(products.length, 4)},1fr);gap:28px">
        ${productCards}
      </div>
    </div>
  </section>`);

    case "hero-banner":
      return wrapHtml(`
  <section style="min-height:420px;background:#000;display:flex;align-items:center;justify-content:center;text-align:center;padding:60px 24px;position:relative;overflow:hidden">
    <div style="position:absolute;inset:0;background:linear-gradient(135deg,#1a1a1a 0%,#0d0d0d 100%)"></div>
    <div style="position:relative;z-index:2;max-width:600px">
      <span style="display:inline-block;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.18em;color:#D33167;margin-bottom:20px">New Arrival</span>
      <h1 style="font-family:'Roboto Condensed',sans-serif;font-size:52px;font-weight:700;color:#fff;line-height:0.95;margin:0 0 20px;letter-spacing:-0.02em">Makeup for<br>Skincare Freaks</h1>
      <p style="font-size:16px;color:rgba(255,255,255,0.65);margin:0 0 36px;line-height:1.6;font-weight:300">Clean, clinically-proven formulas that do more for your skin</p>
      <a href="#" style="display:inline-block;padding:14px 44px;background:#fff;color:#000;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.14em;text-decoration:none;transition:background 0.3s,color 0.3s" onmouseover="this.style.background='#D33167';this.style.color='#fff'" onmouseout="this.style.background='#fff';this.style.color='#000'">Shop Now</a>
    </div>
  </section>`);

    case "newsletter":
      return wrapHtml(`
  <section style="padding:88px 24px;background:#000;color:#fff">
    <div style="max-width:480px;margin:0 auto;text-align:center">
      <span style="display:inline-block;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.18em;color:#D33167;margin-bottom:16px">Stay in the Know</span>
      <h2 style="font-family:'Roboto Condensed',sans-serif;font-size:32px;font-weight:700;line-height:1.05;margin:0 0 14px;letter-spacing:-0.01em">Join the Inner Circle</h2>
      <p style="font-size:15px;color:rgba(255,255,255,0.55);margin:0 0 36px;line-height:1.6;font-weight:300">First access to new drops, exclusive offers, and clean beauty intel</p>
      <div style="display:flex;gap:0">
        <input type="email" placeholder="Enter your email" style="flex:1;padding:14px 18px;border:1px solid rgba(255,255,255,0.25);background:transparent;color:#fff;font-size:14px;outline:none;font-family:Roboto,sans-serif">
        <button style="padding:14px 28px;background:#fff;color:#000;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.14em;border:none;cursor:pointer;white-space:nowrap;transition:background 0.3s,color 0.3s" onmouseover="this.style.background='#D33167';this.style.color='#fff'" onmouseout="this.style.background='#fff';this.style.color='#000'">Subscribe</button>
      </div>
    </div>
  </section>`);

    case "testimonials":
      return wrapHtml(`
  <section style="padding:80px 32px;background:#FAFAF7">
    <div style="max-width:1000px;margin:0 auto">
      <span style="display:block;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.18em;color:#D33167;text-align:center;margin-bottom:10px">Reviews</span>
      <h2 style="font-family:'Roboto Condensed',sans-serif;font-size:32px;font-weight:700;text-align:center;margin:0 0 52px;color:#000;letter-spacing:-0.01em">In Their Words</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:32px">
        <blockquote style="margin:0;padding:36px;background:#fff;border:1px solid rgba(0,0,0,0.06)">
          <div style="display:flex;gap:3px;margin-bottom:18px">${'<svg width="14" height="14" viewBox="0 0 24 24" fill="#D33167"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'.repeat(5)}</div>
          <p style="font-size:15px;line-height:1.7;color:#000;margin:0 0 24px;font-style:italic">"This serum transformed my skin in just two weeks. The glow is unreal."</p>
          <footer style="display:flex;align-items:center;gap:10px">
            <cite style="font-size:12px;font-weight:600;font-style:normal;text-transform:uppercase;letter-spacing:0.08em">Sarah M.</cite>
            <span style="font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.08em;color:#D33167">Verified</span>
          </footer>
        </blockquote>
        <blockquote style="margin:0;padding:36px;background:#fff;border:1px solid rgba(0,0,0,0.06)">
          <div style="display:flex;gap:3px;margin-bottom:18px">${'<svg width="14" height="14" viewBox="0 0 24 24" fill="#D33167"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'.repeat(5)}</div>
          <p style="font-size:15px;line-height:1.7;color:#000;margin:0 0 24px;font-style:italic">"Finally a foundation that actually improves my skin over time. Obsessed."</p>
          <footer style="display:flex;align-items:center;gap:10px">
            <cite style="font-size:12px;font-weight:600;font-style:normal;text-transform:uppercase;letter-spacing:0.08em">Jessica L.</cite>
            <span style="font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.08em;color:#D33167">Verified</span>
          </footer>
        </blockquote>
        <blockquote style="margin:0;padding:36px;background:#fff;border:1px solid rgba(0,0,0,0.06)">
          <div style="display:flex;gap:3px;margin-bottom:18px">${'<svg width="14" height="14" viewBox="0 0 24 24" fill="#D33167"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'.repeat(5)}</div>
          <p style="font-size:15px;line-height:1.7;color:#000;margin:0 0 24px;font-style:italic">"Clean ingredients that deliver. My skin has never felt this good."</p>
          <footer style="display:flex;align-items:center;gap:10px">
            <cite style="font-size:12px;font-weight:600;font-style:normal;text-transform:uppercase;letter-spacing:0.08em">Emily R.</cite>
            <span style="font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.08em;color:#D33167">Verified</span>
          </footer>
        </blockquote>
      </div>
    </div>
  </section>`);

    default:
      return wrapHtml(`
  <section style="padding:72px 32px;background:#fff">
    <div style="max-width:1000px;margin:0 auto">
      <span style="display:block;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.14em;color:#D33167;text-align:center;margin-bottom:10px">Custom Section</span>
      <h2 style="font-family:'Roboto Condensed',sans-serif;font-size:36px;font-weight:700;text-align:center;margin:0 0 8px;color:#000;letter-spacing:-0.01em;line-height:1.05">Your Collection</h2>
      <p style="text-align:center;color:rgba(0,0,0,0.55);margin:0 0 48px;font-size:15px;font-weight:400">Preview with your store products</p>
      <div style="display:grid;grid-template-columns:repeat(${Math.min(products.length, 4)},1fr);gap:28px">
        ${productCards}
      </div>
    </div>
  </section>`);
  }
}
