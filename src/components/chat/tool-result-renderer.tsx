"use client";

import { KPICards } from "@/components/generative/kpi-cards";
import { RevenueChart } from "@/components/generative/revenue-chart";
import { TopProductsChart } from "@/components/generative/top-products-chart";
import { ProductGrid } from "@/components/generative/product-grid";
import { OrdersTable } from "@/components/generative/orders-table";
import { CustomerList } from "@/components/generative/customer-list";
import { InventoryTable } from "@/components/generative/inventory-table";
import { LiquidPreview } from "@/components/generative/liquid-preview";

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
      };
      return (
        <LiquidPreview
          code={data.code}
          componentType={data.componentType}
          previewProducts={data.previewProducts}
        />
      );
    }

    default:
      return null;
  }
}
