"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TopProductsChartProps {
  data: { title: string; revenue: number; quantity: number }[];
  currency: string;
}

export function TopProductsChart({ data, currency }: TopProductsChartProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(value);

  // Truncate long product names for axis labels
  const chartData = data.map((d) => ({
    ...d,
    name: d.title.length > 25 ? d.title.slice(0, 22) + "..." : d.title,
    fullTitle: d.title,
  }));

  return (
    <Card className="w-full border border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Top Products by Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(v) => formatCurrency(v)}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0].payload;
                  return (
                    <div style={{
                      backgroundColor: "#111",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                    }}>
                      <p style={{ color: "#fff", fontWeight: 600, marginBottom: 6 }}>
                        {item.fullTitle}
                      </p>
                      <p style={{ color: "#ccc", margin: "2px 0" }}>
                        Revenue: {formatCurrency(item.revenue)}
                      </p>
                      <p style={{ color: "#ccc", margin: "2px 0" }}>
                        Units Sold: {item.quantity}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
