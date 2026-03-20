"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RevenueChartProps {
  data: { date: string; revenue: number }[];
  currency: string;
}

export function RevenueChart({ data, currency }: RevenueChartProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(value);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Card className="w-full border border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Revenue Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                className="text-xs"
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickFormatter={(v) => formatCurrency(v)}
                className="text-xs"
                tick={{ fontSize: 11 }}
                width={70}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div style={{
                      backgroundColor: "#111",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "8px",
                      padding: "8px 14px",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                    }}>
                      <p style={{ color: "#fff", fontWeight: 600, marginBottom: 4 }}>
                        {formatDate(String(label))}
                      </p>
                      <p style={{ color: "#ccc", margin: 0 }}>
                        Revenue: {formatCurrency(Number(payload[0].value))}
                      </p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
