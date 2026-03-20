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

  // Truncate long product names
  const chartData = data.map((d) => ({
    ...d,
    name: d.title.length > 25 ? d.title.slice(0, 22) + "..." : d.title,
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
                formatter={(value, name) => [
                  name === "revenue" ? formatCurrency(Number(value)) : value,
                  name === "revenue" ? "Revenue" : "Units Sold",
                ]}
                labelFormatter={(label) => {
                  const item = data.find(
                    (d) => d.title === label || d.title.startsWith(String(label).replace("...", ""))
                  );
                  return item?.title || label;
                }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: "12px",
                  backgroundColor: "#111",
                  color: "#fff",
                }}
                labelStyle={{ color: "#fff", fontWeight: 600, marginBottom: 4 }}
                itemStyle={{ color: "#ccc" }}
              />
              <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
