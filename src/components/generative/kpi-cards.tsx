"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, TrendingUp, Package } from "lucide-react";

interface KPICardsProps {
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  currency: string;
  lowStockCount?: number;
}

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

export function KPICards({
  totalRevenue,
  orderCount,
  averageOrderValue,
  currency,
  lowStockCount,
}: KPICardsProps) {
  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue, currency),
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-500/10",
    },
    {
      title: "Orders",
      value: orderCount.toString(),
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      title: "Avg Order Value",
      value: formatCurrency(averageOrderValue, currency),
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-500/10",
    },
    ...(lowStockCount !== undefined
      ? [
          {
            title: "Low Stock Items",
            value: lowStockCount.toString(),
            icon: Package,
            color: lowStockCount > 0 ? "text-red-600" : "text-green-600",
            bg: lowStockCount > 0 ? "bg-red-500/10" : "bg-green-500/10",
          },
        ]
      : []),
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
      {cards.map((card, i) => (
        <Card
          key={card.title}
          className={`border border-border/50 hover:border-border transition-all duration-300 animate-fade-in-up stagger-${i + 1}`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-1.5 rounded-lg ${card.bg}`}>
              <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold tracking-tight">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
