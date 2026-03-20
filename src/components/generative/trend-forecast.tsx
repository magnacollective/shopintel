"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TrendForecastProps {
  weekOverWeekGrowth: number | null;
  monthOverMonthGrowth: number | null;
  thisWeekRevenue: number;
  lastWeekRevenue: number;
  currency: string;
  topGrowingProducts: { title: string; growthPct: number; recentRevenue: number }[];
  decliningProducts: { title: string; growthPct: number; recentRevenue: number }[];
  anomalies: { date: string; revenue: number; type: "spike" | "dip"; deviations: number }[];
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

function GrowthBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-zinc-500">N/A</span>;
  const isPositive = value >= 0;
  return (
    <span className={`text-sm font-semibold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
      {isPositive ? "+" : ""}{value}%
    </span>
  );
}

export function TrendForecast({
  weekOverWeekGrowth,
  monthOverMonthGrowth,
  thisWeekRevenue,
  lastWeekRevenue,
  currency,
  topGrowingProducts,
  decliningProducts,
  anomalies,
}: TrendForecastProps) {
  return (
    <div className="space-y-3 w-full">
      {/* Growth Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border border-border/50">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Week over Week</p>
            <div className="flex items-baseline gap-2">
              <GrowthBadge value={weekOverWeekGrowth} />
              <span className="text-[11px] text-zinc-600">
                {formatMoney(thisWeekRevenue, currency)} vs {formatMoney(lastWeekRevenue, currency)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border/50">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Month over Month</p>
            <GrowthBadge value={monthOverMonthGrowth} />
          </CardContent>
        </Card>
      </div>

      {/* Growing Products */}
      {topGrowingProducts.length > 0 && (
        <Card className="border border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Trending Up
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topGrowingProducts.map((p) => (
              <div key={p.title} className="flex items-center justify-between text-sm">
                <span className="text-zinc-300 truncate max-w-[60%]">{p.title}</span>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500 text-xs">{formatMoney(p.recentRevenue, currency)}</span>
                  <span className="text-emerald-400 font-medium text-xs">+{p.growthPct}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Declining Products */}
      {decliningProducts.length > 0 && (
        <Card className="border border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              Trending Down
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {decliningProducts.map((p) => (
              <div key={p.title} className="flex items-center justify-between text-sm">
                <span className="text-zinc-300 truncate max-w-[60%]">{p.title}</span>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500 text-xs">{formatMoney(p.recentRevenue, currency)}</span>
                  <span className="text-red-400 font-medium text-xs">{p.growthPct}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Anomalies */}
      {anomalies.length > 0 && (
        <Card className="border border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Revenue Anomalies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {anomalies.map((a) => (
              <div key={a.date} className="flex items-center justify-between text-sm">
                <span className="text-zinc-400 text-xs">{a.date}</span>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-300">{formatMoney(a.revenue, currency)}</span>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${a.type === "spike" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                    {a.type === "spike" ? "Spike" : "Dip"} ({a.deviations > 0 ? "+" : ""}{a.deviations}σ)
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
