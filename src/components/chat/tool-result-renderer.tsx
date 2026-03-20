"use client";

import { KPICards } from "@/components/generative/kpi-cards";
import { RevenueChart } from "@/components/generative/revenue-chart";
import { TopProductsChart } from "@/components/generative/top-products-chart";
import { ProductGrid } from "@/components/generative/product-grid";
import { OrdersTable } from "@/components/generative/orders-table";
import { CustomerList } from "@/components/generative/customer-list";
import { InventoryTable } from "@/components/generative/inventory-table";
import { LiquidPreview } from "@/components/generative/liquid-preview";
import { TrendForecast } from "@/components/generative/trend-forecast";

interface ToolResultRendererProps {
  toolName: string;
  result: Record<string, unknown>;
}

export function ToolResultRenderer({ toolName, result }: ToolResultRendererProps) {
  switch (toolName) {
    case "getProducts": {
      const { products } = result as { products: unknown[] };
      if (!products?.length) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return <ProductGrid products={products as any} />;
    }

    case "getOrders": {
      const { orders } = result as { orders: unknown[] };
      if (!orders?.length) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return <OrdersTable orders={orders as any} />;
    }

    case "getCustomers": {
      const { customers } = result as { customers: unknown[] };
      if (!customers?.length) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return <CustomerList customers={customers as any} />;
    }

    case "getAnalytics": {
      const data = result as {
        totalRevenue: number;
        orderCount: number;
        averageOrderValue: number;
        currency: string;
        topProducts: { title: string; revenue: number; quantity: number }[];
        revenueTimeline: { date: string; revenue: number }[];
      };
      return (
        <div className="space-y-3 w-full">
          <KPICards
            totalRevenue={data.totalRevenue}
            orderCount={data.orderCount}
            averageOrderValue={data.averageOrderValue}
            currency={data.currency}
          />
          {data.revenueTimeline?.length > 1 && (
            <RevenueChart data={data.revenueTimeline} currency={data.currency} />
          )}
          {data.topProducts?.length > 0 && (
            <TopProductsChart data={data.topProducts} currency={data.currency} />
          )}
        </div>
      );
    }

    case "getInventory": {
      const data = result as {
        inventory: unknown[];
        lowStockCount: number;
        threshold: number;
      };
      return (
        <InventoryTable
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          inventory={data.inventory as any}
          lowStockCount={data.lowStockCount}
          threshold={data.threshold}
        />
      );
    }

    case "generateLiquid": {
      const data = result as {
        code: string;
        componentType: string;
        previewProducts?: { title: string; price: string; currency: string; image: string; vendor: string; handle: string }[];
        previewHtml?: string;
      };
      return (
        <LiquidPreview
          code={data.code}
          componentType={data.componentType}
          previewProducts={data.previewProducts}
          previewHtml={data.previewHtml}
        />
      );
    }

    case "deploySection": {
      const data = result as { success: boolean; filename: string; error?: string };
      return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm ${
          data.success
            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
            : "border-red-500/20 bg-red-500/10 text-red-300"
        }`}>
          <span className="material-symbols-rounded text-lg">
            {data.success ? "check_circle" : "error"}
          </span>
          <div>
            <p className="font-medium">
              {data.success ? "Deployed successfully" : "Deploy failed"}
            </p>
            <p className="text-xs opacity-70">
              {data.success ? data.filename : data.error}
            </p>
          </div>
        </div>
      );
    }

    case "forecastTrends": {
      const data = result as {
        currency: string;
        weekOverWeekGrowth: number | null;
        monthOverMonthGrowth: number | null;
        thisWeekRevenue: number;
        lastWeekRevenue: number;
        topGrowingProducts: { title: string; growthPct: number; recentRevenue: number }[];
        decliningProducts: { title: string; growthPct: number; recentRevenue: number }[];
        anomalies: { date: string; revenue: number; type: "spike" | "dip"; deviations: number }[];
      };
      return (
        <TrendForecast
          weekOverWeekGrowth={data.weekOverWeekGrowth}
          monthOverMonthGrowth={data.monthOverMonthGrowth}
          thisWeekRevenue={data.thisWeekRevenue}
          lastWeekRevenue={data.lastWeekRevenue}
          currency={data.currency}
          topGrowingProducts={data.topGrowingProducts}
          decliningProducts={data.decliningProducts}
          anomalies={data.anomalies}
        />
      );
    }

    default:
      return null;
  }
}
