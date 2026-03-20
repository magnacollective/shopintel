import { getAnalytics, getProducts, getOrders, getCustomers, getInventory } from "@/lib/shopify/queries";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Dashboard } from "@/components/dashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [analytics, products, orders, customers, inventoryData] = await Promise.all([
    getAnalytics({}),
    getProducts({ limit: 25 }),
    getOrders({ limit: 20 }),
    getCustomers({ limit: 20 }),
    getInventory({ limit: 50, lowStockThreshold: 10 }),
  ]);

  return (
    <Dashboard
      analytics={analytics}
      products={products}
      orders={orders}
      customers={customers}
      inventoryData={inventoryData}
      user={session}
    />
  );
}
