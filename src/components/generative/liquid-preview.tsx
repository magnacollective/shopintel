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
  const star = '<svg width="14" height="14" viewBox="0 0 24 24" fill="#D33167"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';

  const animStyles = `
    @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
    @keyframes slideRight { from { opacity:0; transform:translateX(-24px); } to { opacity:1; transform:translateX(0); } }
    .anim { opacity:0; animation-fill-mode:forwards; animation-timing-function:cubic-bezier(0.22,1,0.36,1); }
    .anim-up { animation-name:fadeUp; }
    .anim-in { animation-name:fadeIn; }
    .anim-scale { animation-name:scaleIn; }
    .anim-right { animation-name:slideRight; }
  `;

  const productCard = (p: PreviewProduct, i: number) => `
    <article class="anim anim-up" style="animation-duration:0.7s;animation-delay:${200 + i * 120}ms;position:relative">
      <a href="#" style="text-decoration:none;color:inherit;display:block">
        <div style="overflow:hidden;background:#f5f5f0;margin-bottom:14px;position:relative" class="card-media">
          ${p.image ? `<img src="${p.image}" style="width:100%;aspect-ratio:3/4;object-fit:cover;display:block;transition:transform 0.6s cubic-bezier(0.22,1,0.36,1)" alt="${p.title}">` : '<div style="width:100%;aspect-ratio:3/4;background:#f5f5f0;display:flex;align-items:center;justify-content:center;color:rgba(0,0,0,0.25);font-size:13px">No image</div>'}
          <div class="quick-add" style="position:absolute;bottom:12px;right:12px;opacity:0;transform:translateY(8px);transition:opacity 0.3s,transform 0.3s">
            <button style="width:40px;height:40px;border-radius:50%;background:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 12px rgba(0,0,0,0.15);font-size:20px;color:#000;transition:background 0.3s,color 0.3s,transform 0.2s" onmouseover="this.style.background='#D33167';this.style.color='#fff';this.style.transform='scale(1.1)'" onmouseout="this.style.background='#fff';this.style.color='#000';this.style.transform='scale(1)'">+</button>
          </div>
        </div>
        <div>
          <span style="display:block;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;color:rgba(0,0,0,0.55);margin-bottom:4px;font-weight:500">${p.vendor}</span>
          <h3 style="font-size:14px;font-weight:600;margin:0 0 6px;color:#000;line-height:1.3">${p.title}</h3>
          <span style="font-size:14px;font-weight:600;color:#000">${formatPrice(p.price, p.currency)}</span>
        </div>
      </a>
      <button class="atc-link" style="display:inline-block;margin-top:10px;padding:0 0 2px;border:none;background:none;color:#000;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.1em;cursor:pointer;border-bottom:1px solid #000;transition:color 0.3s,border-color 0.3s" onmouseover="this.style.color='#D33167';this.style.borderColor='#D33167'" onmouseout="this.style.color='#000';this.style.borderColor='#000'">Add to Bag</button>
    </article>`;

  const interactScript = `<script>
    document.querySelectorAll('.card-media').forEach(function(m) {
      var img = m.querySelector('img');
      var qa = m.querySelector('.quick-add');
      if (img) {
        m.parentElement.parentElement.addEventListener('mouseenter', function() {
          img.style.transform='scale(1.05)';
          if (qa) { qa.style.opacity='1'; qa.style.transform='translateY(0)'; }
        });
        m.parentElement.parentElement.addEventListener('mouseleave', function() {
          img.style.transform='scale(1)';
          if (qa) { qa.style.opacity='0'; qa.style.transform='translateY(8px)'; }
        });
      }
    });
  </script>`;

  const wrapHtml = (body: string) =>
    `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">${PREVIEW_FONTS}<style>${PREVIEW_BASE_STYLES}${animStyles}</style></head><body>${body}${interactScript}</body></html>`;

  const cols = Math.min(products.length, 4);

  switch (componentType) {
    case "featured-products":
      return wrapHtml(`
  <section style="padding:88px 32px;background:#fff">
    <div style="max-width:1100px;margin:0 auto">
      <div class="anim anim-up" style="animation-duration:0.7s;animation-delay:0ms;text-align:center;margin-bottom:56px">
        <span style="display:block;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.16em;color:#D33167;margin-bottom:12px">Curated for You</span>
        <h2 style="font-family:'Roboto Condensed',sans-serif;font-size:42px;font-weight:700;margin:0 0 12px;color:#000;letter-spacing:-0.01em;line-height:1.05">Bestsellers</h2>
        <p style="color:rgba(0,0,0,0.5);font-size:15px;font-weight:400;max-width:420px;margin:0 auto;line-height:1.6">The essentials your routine has been missing</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:28px">
        ${products.map((p, i) => productCard(p, i)).join("")}
      </div>
      <div class="anim anim-up" style="animation-duration:0.6s;animation-delay:${400 + products.length * 120}ms;text-align:center;margin-top:48px">
        <a href="#" style="display:inline-block;padding:14px 48px;background:#000;color:#fff;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.14em;text-decoration:none;transition:background 0.3s,transform 0.2s" onmouseover="this.style.background='#D33167';this.style.transform='translateY(-1px)'" onmouseout="this.style.background='#000';this.style.transform='translateY(0)'">View All</a>
      </div>
    </div>
  </section>`);

    case "product-grid":
      return wrapHtml(`
  <section style="padding:88px 32px;background:#fff">
    <div style="max-width:1100px;margin:0 auto">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:48px" class="anim anim-up" style="animation-duration:0.6s">
        <div>
          <h2 style="font-family:'Roboto Condensed',sans-serif;font-size:38px;font-weight:700;margin:0 0 4px;color:#000;letter-spacing:-0.01em">Shop All</h2>
          <p style="color:rgba(0,0,0,0.5);font-size:14px;font-weight:400;margin:0">${products.length} products</p>
        </div>
        <div style="display:flex;gap:8px">
          <select style="padding:8px 16px;border:1px solid rgba(0,0,0,0.15);background:#fff;font-size:12px;font-family:Roboto,sans-serif;color:#000;cursor:pointer;outline:none">
            <option>Sort by: Featured</option><option>Price: Low to High</option><option>Price: High to Low</option><option>Newest</option>
          </select>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:28px">
        ${products.map((p, i) => productCard(p, i)).join("")}
      </div>
    </div>
  </section>`);

    case "hero-banner":
      return wrapHtml(`
  <section style="min-height:520px;background:#000;display:flex;align-items:center;justify-content:center;text-align:center;padding:80px 24px;position:relative;overflow:hidden">
    <div style="position:absolute;inset:0;background:linear-gradient(135deg,#1a1a1a 0%,#0d0d0d 100%)"></div>
    ${products[0]?.image ? `<img src="${products[0].image}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.3;transition:transform 8s ease" class="hero-bg-img">` : ''}
    <div style="position:relative;z-index:2;max-width:640px">
      <span class="anim anim-in" style="animation-duration:0.8s;animation-delay:200ms;display:inline-block;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.2em;color:#D33167;margin-bottom:24px;padding:6px 18px;border:1px solid rgba(211,49,103,0.5)">New Arrival</span>
      <h1 class="anim anim-up" style="animation-duration:0.8s;animation-delay:400ms;font-family:'Roboto Condensed',sans-serif;font-size:56px;font-weight:700;color:#fff;line-height:0.95;margin:0 0 22px;letter-spacing:-0.02em">Makeup for<br>Skincare Freaks</h1>
      <p class="anim anim-up" style="animation-duration:0.7s;animation-delay:600ms;font-size:17px;color:rgba(255,255,255,0.65);margin:0 0 40px;line-height:1.6;font-weight:300">Clean, clinically-proven formulas that do more for your skin</p>
      <div class="anim anim-up" style="animation-duration:0.6s;animation-delay:800ms;display:flex;gap:12px;justify-content:center">
        <a href="#" style="display:inline-block;padding:15px 48px;background:#fff;color:#000;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.14em;text-decoration:none;transition:background 0.3s,color 0.3s,transform 0.2s" onmouseover="this.style.background='#D33167';this.style.color='#fff';this.style.transform='translateY(-1px)'" onmouseout="this.style.background='#fff';this.style.color='#000';this.style.transform='translateY(0)'">Shop Now</a>
        <a href="#" style="display:inline-block;padding:15px 48px;background:transparent;color:#fff;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.14em;text-decoration:none;border:1px solid rgba(255,255,255,0.3);transition:border-color 0.3s,background 0.3s" onmouseover="this.style.borderColor='#fff';this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.3)';this.style.background='transparent'">Learn More</a>
      </div>
    </div>
  </section>
  <section style="padding:64px 32px;background:#fff">
    <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(${cols},1fr);gap:28px">
      ${products.map((p, i) => productCard(p, i)).join("")}
    </div>
  </section>`);

    case "newsletter":
      return wrapHtml(`
  <section style="padding:0;background:#000;color:#fff;overflow:hidden">
    <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;min-height:520px">
      <div style="display:flex;flex-direction:column;justify-content:center;padding:80px 64px">
        <span class="anim anim-right" style="animation-duration:0.6s;animation-delay:200ms;display:inline-block;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.2em;color:#D33167;margin-bottom:20px">Stay in the Know</span>
        <h2 class="anim anim-right" style="animation-duration:0.7s;animation-delay:350ms;font-family:'Roboto Condensed',sans-serif;font-size:40px;font-weight:700;line-height:1.05;margin:0 0 16px;letter-spacing:-0.01em">Join the<br>Inner Circle</h2>
        <p class="anim anim-right" style="animation-duration:0.7s;animation-delay:500ms;font-size:15px;color:rgba(255,255,255,0.55);margin:0 0 36px;line-height:1.7;font-weight:300;max-width:380px">First access to new drops, exclusive offers, and clean beauty intel. We send one email per week — no spam, ever.</p>
        <div class="anim anim-right" style="animation-duration:0.6s;animation-delay:650ms;display:flex;gap:0;max-width:420px">
          <input type="email" placeholder="Enter your email" style="flex:1;padding:14px 18px;border:1px solid rgba(255,255,255,0.25);border-right:none;background:transparent;color:#fff;font-size:14px;outline:none;font-family:Roboto,sans-serif;transition:border-color 0.3s" onfocus="this.style.borderColor='#D33167'" onblur="this.style.borderColor='rgba(255,255,255,0.25)'">
          <button style="padding:14px 32px;background:#fff;color:#000;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.14em;border:none;cursor:pointer;white-space:nowrap;transition:background 0.3s,color 0.3s,transform 0.2s" onmouseover="this.style.background='#D33167';this.style.color='#fff'" onmouseout="this.style.background='#fff';this.style.color='#000'">Subscribe</button>
        </div>
        <p class="anim anim-in" style="animation-duration:0.5s;animation-delay:800ms;font-size:11px;color:rgba(255,255,255,0.3);margin-top:16px">By subscribing, you agree to our Privacy Policy</p>
      </div>
      <div style="position:relative;overflow:hidden" class="anim anim-scale" style="animation-duration:0.8s;animation-delay:400ms">
        ${products[0]?.image ? `<img src="${products[0].image}" style="width:100%;height:100%;object-fit:cover;display:block;transition:transform 8s ease" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">` : '<div style="width:100%;height:100%;background:#1a1a1a"></div>'}
        <div style="position:absolute;inset:0;background:linear-gradient(to right,#000 0%,transparent 30%)"></div>
      </div>
    </div>
  </section>`);

    case "testimonials":
      return wrapHtml(`
  <section style="padding:96px 32px;background:#FAFAF7;overflow:hidden">
    <div style="max-width:1100px;margin:0 auto">
      <div class="anim anim-up" style="animation-duration:0.7s;animation-delay:0ms;text-align:center;margin-bottom:60px">
        <span style="display:block;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.2em;color:#D33167;margin-bottom:12px">Reviews</span>
        <h2 style="font-family:'Roboto Condensed',sans-serif;font-size:40px;font-weight:700;margin:0 0 12px;color:#000;letter-spacing:-0.01em">In Their Words</h2>
        <p style="color:rgba(0,0,0,0.5);font-size:15px;max-width:400px;margin:0 auto;line-height:1.6">Real results from real people — no filters, no faking it</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px">
        ${[
          { text: "This serum transformed my skin in just two weeks. The glow is unreal — I've never gotten so many compliments.", author: "Sarah M.", detail: "Verified Buyer · 2 weeks ago" },
          { text: "Finally a foundation that actually improves my skin over time. I've tried everything and this is the one. Completely obsessed.", author: "Jessica L.", detail: "Verified Buyer · 1 month ago" },
          { text: "Clean ingredients that actually deliver results. My sensitive skin has never felt this calm and radiant.", author: "Emily R.", detail: "Verified Buyer · 3 weeks ago" },
        ].map((r, i) => `
        <blockquote class="anim anim-up" style="animation-duration:0.7s;animation-delay:${200 + i * 150}ms;margin:0;padding:40px;background:#fff;border:1px solid rgba(0,0,0,0.06);transition:transform 0.3s,box-shadow 0.3s" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 32px rgba(0,0,0,0.06)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none'">
          <div style="display:flex;gap:3px;margin-bottom:20px">${star.repeat(5)}</div>
          <p style="font-size:15px;line-height:1.75;color:#000;margin:0 0 28px;font-style:italic">"${r.text}"</p>
          <footer>
            <cite style="display:block;font-size:12px;font-weight:600;font-style:normal;text-transform:uppercase;letter-spacing:0.08em;color:#000">${r.author}</cite>
            <span style="display:block;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.08em;color:#D33167;margin-top:4px">${r.detail}</span>
          </footer>
        </blockquote>`).join("")}
      </div>
    </div>
  </section>
  <section style="padding:72px 32px;background:#fff">
    <div style="max-width:1100px;margin:0 auto">
      <div class="anim anim-up" style="animation-duration:0.6s;animation-delay:800ms;text-align:center;margin-bottom:40px">
        <h3 style="font-family:'Roboto Condensed',sans-serif;font-size:28px;font-weight:700;color:#000;margin:0 0 8px;letter-spacing:-0.01em">Shop the Favorites</h3>
        <p style="color:rgba(0,0,0,0.5);font-size:14px;margin:0">The products they're raving about</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:28px">
        ${products.map((p, i) => productCard(p, i + 4)).join("")}
      </div>
    </div>
  </section>`);

    default:
      return wrapHtml(`
  <section style="min-height:520px;background:#000;display:flex;align-items:center;justify-content:center;text-align:center;padding:80px 24px;position:relative;overflow:hidden">
    ${products[0]?.image ? `<img src="${products[0].image}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.25;transition:transform 8s ease">` : ''}
    <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.3),rgba(0,0,0,0.7))"></div>
    <div style="position:relative;z-index:2;max-width:640px">
      <span class="anim anim-in" style="animation-duration:0.8s;animation-delay:200ms;display:inline-block;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.2em;color:#D33167;margin-bottom:24px;padding:6px 18px;border:1px solid rgba(211,49,103,0.5)">New Collection</span>
      <h1 class="anim anim-up" style="animation-duration:0.8s;animation-delay:400ms;font-family:'Roboto Condensed',sans-serif;font-size:56px;font-weight:700;color:#fff;line-height:0.95;margin:0 0 22px;letter-spacing:-0.02em">Effortless<br>Beauty</h1>
      <p class="anim anim-up" style="animation-duration:0.7s;animation-delay:600ms;font-size:17px;color:rgba(255,255,255,0.65);margin:0 0 40px;line-height:1.6;font-weight:300">Clean, clinically-proven formulas that do more for your skin</p>
      <a class="anim anim-up" style="animation-duration:0.6s;animation-delay:800ms;display:inline-block;padding:15px 48px;background:#fff;color:#000;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.14em;text-decoration:none;transition:background 0.3s,color 0.3s,transform 0.2s" href="#" onmouseover="this.style.background='#D33167';this.style.color='#fff';this.style.transform='translateY(-1px)'" onmouseout="this.style.background='#fff';this.style.color='#000';this.style.transform='translateY(0)'">Shop Now</a>
    </div>
  </section>
  <section style="padding:88px 32px;background:#fff">
    <div style="max-width:1100px;margin:0 auto">
      <div class="anim anim-up" style="animation-duration:0.7s;animation-delay:100ms;text-align:center;margin-bottom:56px">
        <h2 style="font-family:'Roboto Condensed',sans-serif;font-size:42px;font-weight:700;margin:0 0 12px;color:#000;letter-spacing:-0.01em;line-height:1.05">Bestsellers</h2>
        <p style="color:rgba(0,0,0,0.5);font-size:15px;font-weight:400;max-width:420px;margin:0 auto">The essentials your routine has been missing</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:28px">
        ${products.map((p, i) => productCard(p, i)).join("")}
      </div>
    </div>
  </section>
  <section style="background:#FAFAF7;padding:0">
    <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;min-height:440px" class="anim anim-in" style="animation-duration:0.8s;animation-delay:${300 + products.length * 120}ms">
      <div style="display:flex;flex-direction:column;justify-content:center;padding:72px 64px">
        <span style="font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.2em;color:#D33167;margin-bottom:16px">Limited Edition</span>
        <h2 style="font-family:'Roboto Condensed',sans-serif;font-size:38px;font-weight:700;margin:0 0 16px;color:#000;letter-spacing:-0.01em;line-height:1.05">The Edit</h2>
        <p style="font-size:15px;color:rgba(0,0,0,0.5);margin:0 0 32px;line-height:1.7;font-weight:400;max-width:380px">Curated essentials for your daily routine — selected by our editors.</p>
        <a href="#" style="display:inline-block;padding:14px 40px;background:transparent;color:#000;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.14em;text-decoration:none;border:1px solid #000;transition:background 0.3s,color 0.3s,transform 0.2s;align-self:flex-start" onmouseover="this.style.background='#000';this.style.color='#fff';this.style.transform='translateY(-1px)'" onmouseout="this.style.background='transparent';this.style.color='#000';this.style.transform='translateY(0)'">Discover</a>
      </div>
      <div style="overflow:hidden;background:#e5e5e0">
        ${products[0]?.image ? `<img src="${products[0].image}" style="width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.6s cubic-bezier(0.22,1,0.36,1)" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">` : '<div style="width:100%;height:100%;background:#e5e5e0"></div>'}
      </div>
    </div>
  </section>`);
  }
}
