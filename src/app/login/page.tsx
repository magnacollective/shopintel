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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-float-slow-reverse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/25 mb-6 animate-pulse-glow">
            <span className="material-symbols-rounded text-white text-3xl">auto_awesome</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">ShopIntel</h1>
          <p className="text-zinc-400 text-sm">AI-Powered Shopify Command Center</p>
        </div>

        {/* Login card */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl animate-fade-in-up stagger-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@growthcapital.com"
                className="h-11 bg-zinc-800/50 border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/20 placeholder:text-zinc-600"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="h-11 bg-zinc-800/50 border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/20 placeholder:text-zinc-600"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5 animate-fade-in">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 font-semibold transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-xs text-zinc-500 text-center mb-3">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setEmail("admin@growthcapital.com"); setPassword("growth2026"); }}
                className="text-xs px-3 py-2.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:border-indigo-500/30 hover:bg-white/5 transition-all text-left"
              >
                <span className="block font-medium text-zinc-300">Growth Capital</span>
                <span className="text-zinc-500">Full access</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail("client@glowpure.com"); setPassword("glowpure2026"); }}
                className="text-xs px-3 py-2.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:border-indigo-500/30 hover:bg-white/5 transition-all text-left"
              >
                <span className="block font-medium text-zinc-300">GlowPure</span>
                <span className="text-zinc-500">Analytics only</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-8 animate-fade-in-up stagger-3">
          Built by Growth Capital
        </p>
      </div>
    </div>
  );
}
