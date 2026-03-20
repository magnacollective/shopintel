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

export function LiquidPreview({ code, componentType, previewProducts }: LiquidPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"preview" | "code">(previewProducts?.length ? "preview" : "code");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const previewHtml = useMemo(() => {
    if (!previewProducts?.length) return "";
    return buildPreviewHtml(componentType, previewProducts);
  }, [componentType, previewProducts]);

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
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setTab("code")}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    tab === "code"
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  Code
                </button>
              </>
            ) : null}
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
              style={{ height: "420px", border: "none" }}
              sandbox="allow-same-origin"
              title="Liquid section preview"
            />
          </div>
        ) : (
          <pre className="bg-zinc-950 text-zinc-100 rounded-lg p-4 overflow-x-auto text-xs leading-relaxed max-h-[400px]">
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
    <div style="border-radius:12px;overflow:hidden;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.08);transition:transform 0.2s">
      ${p.image ? `<img src="${p.image}" style="width:100%;aspect-ratio:1;object-fit:cover" alt="${p.title}">` : '<div style="width:100%;aspect-ratio:1;background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#9ca3af">No image</div>'}
      <div style="padding:16px">
        <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#888;margin:0 0 4px">${p.vendor}</p>
        <h3 style="font-size:15px;font-weight:600;margin:0 0 6px;color:#111">${p.title}</h3>
        <p style="font-size:15px;font-weight:700;color:#111;margin:0">${formatPrice(p.price, p.currency)}</p>
      </div>
      <button style="display:block;width:calc(100% - 32px);margin:0 16px 16px;padding:10px;border:none;border-radius:8px;background:#111;color:#fff;font-weight:600;cursor:pointer;font-size:14px">Add to Cart</button>
    </div>`
    )
    .join("");

  switch (componentType) {
    case "featured-products":
    case "product-grid":
      return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"></head>
<body style="margin:0;font-family:Inter,system-ui,sans-serif;background:#fff">
  <section style="padding:48px 32px">
    <h2 style="font-size:28px;font-weight:800;text-align:center;margin:0 0 6px;color:#111">Featured Products</h2>
    <p style="text-align:center;color:#666;margin:0 0 36px;font-size:15px">Our most popular picks</p>
    <div style="display:grid;grid-template-columns:repeat(${Math.min(products.length, 4)},1fr);gap:20px;max-width:1000px;margin:0 auto">
      ${productCards}
    </div>
  </section>
</body></html>`;

    case "hero-banner":
      return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"></head>
<body style="margin:0;font-family:Inter,system-ui,sans-serif">
  <section style="min-height:400px;background:linear-gradient(135deg,#1e1b4b,#4c1d95,#7c3aed);display:flex;align-items:center;justify-content:center;text-align:center;padding:40px 20px">
    <div style="max-width:600px">
      <h1 style="font-size:42px;font-weight:800;color:#fff;line-height:1.1;margin:0 0 16px">Your Skin Deserves the Best</h1>
      <p style="font-size:18px;color:rgba(255,255,255,0.85);margin:0 0 32px;line-height:1.6">Discover our clean, science-backed skincare formulas crafted for every skin type</p>
      <a href="#" style="display:inline-block;padding:14px 36px;background:#fff;color:#111;font-weight:700;text-decoration:none;border-radius:8px;font-size:16px">Shop Now</a>
    </div>
  </section>
</body></html>`;

    case "newsletter":
      return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"></head>
<body style="margin:0;font-family:Inter,system-ui,sans-serif">
  <section style="padding:80px 20px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%)">
    <div style="max-width:500px;margin:0 auto;text-align:center">
      <h2 style="font-size:28px;font-weight:800;color:#fff;margin:0 0 12px">Join the Glow Club</h2>
      <p style="color:rgba(255,255,255,0.8);font-size:16px;margin:0 0 32px">Get 15% off your first order plus skincare tips</p>
      <div style="display:flex;gap:8px">
        <input type="email" placeholder="Enter your email" style="flex:1;padding:14px 18px;border:2px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.15);border-radius:10px;color:#fff;font-size:15px;outline:none">
        <button style="padding:14px 28px;background:#fff;color:#764ba2;font-weight:700;border:none;border-radius:10px;cursor:pointer;font-size:15px;white-space:nowrap">Subscribe</button>
      </div>
    </div>
  </section>
</body></html>`;

    case "testimonials":
      return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"></head>
<body style="margin:0;font-family:Inter,system-ui,sans-serif;background:#fff">
  <section style="padding:60px 32px">
    <h2 style="font-size:28px;font-weight:700;text-align:center;margin:0 0 40px;color:#111">What Our Customers Say</h2>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1000px;margin:0 auto">
      <div style="background:#fafafa;border-radius:16px;padding:28px;border:1px solid #eee">
        <div style="margin-bottom:12px;color:#f59e0b">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
        <p style="font-size:15px;line-height:1.7;color:#333;margin:0 0 16px">"This serum transformed my skin in just two weeks! I can't believe the difference."</p>
        <div><strong style="font-size:14px">Sarah M.</strong> <span style="font-size:12px;color:#16a34a;background:#f0fdf4;padding:2px 8px;border-radius:4px;margin-left:6px">Verified Buyer</span></div>
      </div>
      <div style="background:#fafafa;border-radius:16px;padding:28px;border:1px solid #eee">
        <div style="margin-bottom:12px;color:#f59e0b">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
        <p style="font-size:15px;line-height:1.7;color:#333;margin:0 0 16px">"Best moisturizer I've ever used. My skin feels amazing and the packaging is beautiful."</p>
        <div><strong style="font-size:14px">Jessica L.</strong> <span style="font-size:12px;color:#16a34a;background:#f0fdf4;padding:2px 8px;border-radius:4px;margin-left:6px">Verified Buyer</span></div>
      </div>
      <div style="background:#fafafa;border-radius:16px;padding:28px;border:1px solid #eee">
        <div style="margin-bottom:12px;color:#f59e0b">&#9733;&#9733;&#9733;&#9733;</div>
        <p style="font-size:15px;line-height:1.7;color:#333;margin:0 0 16px">"Clean ingredients and it actually works. Will definitely repurchase!"</p>
        <div><strong style="font-size:14px">Emily R.</strong> <span style="font-size:12px;color:#16a34a;background:#f0fdf4;padding:2px 8px;border-radius:4px;margin-left:6px">Verified Buyer</span></div>
      </div>
    </div>
  </section>
</body></html>`;

    default:
      return `<!DOCTYPE html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet"></head>
<body style="margin:0;font-family:Inter,system-ui,sans-serif;background:#fff;padding:40px">
  <h2 style="font-size:24px;font-weight:700;margin:0 0 16px">Custom Section</h2>
  <p style="color:#666">Preview not available for custom sections. Check the code tab for the Liquid template.</p>
</body></html>`;
  }
}
