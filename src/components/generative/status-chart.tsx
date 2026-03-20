"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatusChartProps {
  data: Record<string, number>;
  title: string;
}

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#e0e7ff"];

export function StatusChart({ data, title }: StatusChartProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name: name.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
    value,
  }));

  return (
    <Card className="w-full border border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0];
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
                        {item.name}
                      </p>
                      <p style={{ color: "#ccc", margin: 0 }}>
                        {Number(item.value)} orders
                      </p>
                    </div>
                  );
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px" }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
