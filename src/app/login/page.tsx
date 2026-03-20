"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f14] relative overflow-hidden noise-overlay">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary emerald orb - top left */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[120px] animate-float-slow" />
        {/* Teal orb - bottom right */}
        <div className="absolute -bottom-48 -right-32 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px] animate-float-slow-reverse" />
        {/* Amber accent orb - subtle warmth */}
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[80px] animate-float-diagonal" />
      </div>

      {/* Geometric grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Diagonal decorative line */}
      <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent transform rotate-12 translate-x-[-200px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[420px] px-6">
        {/* Logo & Brand */}
        <div className="mb-12 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/25 animate-pulse-glow">
              <span className="material-symbols-rounded text-white text-2xl">auto_awesome</span>
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold tracking-tight text-white">ShopIntel</h1>
              <p className="text-[13px] text-zinc-500 tracking-wide">Command Center</p>
            </div>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-[320px]">
            AI-powered intelligence for your Shopify store. Real-time analytics, inventory insights, and generative tools.
          </p>
        </div>

        {/* Login form */}
        <div className="animate-fade-in-up stagger-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-[0.15em] font-display">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@growthcapital.com"
                className="h-12 bg-white/[0.04] border-white/[0.08] focus:border-emerald-500/40 focus:ring-emerald-500/15 placeholder:text-zinc-600 rounded-xl text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-[0.15em] font-display">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="h-12 bg-white/[0.04] border-white/[0.08] focus:border-emerald-500/40 focus:ring-emerald-500/15 placeholder:text-zinc-600 rounded-xl text-sm"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-500/8 border border-red-500/15 rounded-xl px-4 py-3 animate-fade-in">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/20 font-display font-semibold tracking-wide transition-all duration-300 disabled:opacity-50 rounded-xl text-[13px]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

        </div>

        <p className="text-center text-[11px] text-zinc-700 mt-10 animate-fade-in-up stagger-3 tracking-wider font-display">
          Growth Capital Intelligence Platform
        </p>
      </div>
    </div>
  );
}
