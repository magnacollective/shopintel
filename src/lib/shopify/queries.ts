import { shopifyGraphQL } from "./client";
import type { Product, Order, Customer } from "./types";

// ─── Products ────────────────────────────────────────────────────────────────

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query, sortKey: TITLE) {
      nodes {
        id
        title
        handle
        description
        productType
        vendor
        status
        totalInventory
        createdAt
        updatedAt
        featuredImage {
          url
          altText
        }
        variants(first: 5) {
          nodes {
            id
            title
            price
            inventoryQuantity
            sku
          }
        }
        priceRangeV2 {
          minVariantPrice { amount currencyCode }
          maxVariantPrice { amount currencyCode }
        }
      }
    }
  }
`;

export async function getProducts(params: {
  limit?: number;
  searchQuery?: string;
}) {
  const data = await shopifyGraphQL<{ products: { nodes: Product[] } }>(
    PRODUCTS_QUERY,
    {
      first: params.limit || 20,
      query: params.searchQuery || null,
    }
  );
  return data.products.nodes;
}

// ─── Orders ──────────────────────────────────────────────────────────────────

const ORDERS_QUERY = `
  query GetOrders($first: Int!, $query: String) {
    orders(first: $first, query: $query, sortKey: CREATED_AT, reverse: true) {
      nodes {
        id
        name
        createdAt
        displayFinancialStatus
        displayFulfillmentStatus
        totalPriceSet { shopMoney { amount currencyCode } }
        subtotalPriceSet { shopMoney { amount currencyCode } }
        totalShippingPriceSet { shopMoney { amount currencyCode } }
        totalTaxSet { shopMoney { amount currencyCode } }
        customer {
          id
          displayName
          email
        }
        lineItems(first: 10) {
          nodes {
            title
            quantity
            originalTotalSet { shopMoney { amount currencyCode } }
          }
        }
      }
    }
  }
`;

export async function getOrders(params: {
  limit?: number;
  searchQuery?: string;
}) {
  const data = await shopifyGraphQL<{ orders: { nodes: Order[] } }>(
    ORDERS_QUERY,
    {
      first: params.limit || 25,
      query: params.searchQuery || null,
    }
  );
  return data.orders.nodes;
}

// ─── Customers ───────────────────────────────────────────────────────────────

const CUSTOMERS_QUERY = `
  query GetCustomers($first: Int!, $query: String) {
    customers(first: $first, query: $query, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id
        displayName
        email
        phone
        numberOfOrders
        amountSpent { amount currencyCode }
        createdAt
        updatedAt
        defaultAddress {
          city
          province
          country
        }
      }
    }
  }
`;

export async function getCustomers(params: {
  limit?: number;
  searchQuery?: string;
}) {
  const data = await shopifyGraphQL<{ customers: { nodes: Customer[] } }>(
    CUSTOMERS_QUERY,
    {
      first: params.limit || 25,
      query: params.searchQuery || null,
    }
  );
  return data.customers.nodes;
}

// ─── Analytics (computed from orders) ────────────────────────────────────────

export async function getAnalytics(params: {
  dateFrom?: string;
  dateTo?: string;
}) {
  const queryParts: string[] = [];
  if (params.dateFrom) queryParts.push(`created_at:>=${params.dateFrom}`);
  if (params.dateTo) queryParts.push(`created_at:<=${params.dateTo}`);

  const orders = await getOrders({
    limit: 100,
    searchQuery: queryParts.length > 0 ? queryParts.join(" ") : undefined,
  });

  const totalRevenue = orders.reduce(
    (sum, o) => sum + parseFloat(o.totalPriceSet.shopMoney.amount),
    0
  );
  const orderCount = orders.length;
  const aov = orderCount > 0 ? totalRevenue / orderCount : 0;

  // Top products by revenue
  const productRevenue: Record<string, { title: string; revenue: number; quantity: number }> = {};
  for (const order of orders) {
    for (const item of order.lineItems.nodes) {
      if (!productRevenue[item.title]) {
        productRevenue[item.title] = { title: item.title, revenue: 0, quantity: 0 };
      }
      productRevenue[item.title].revenue += parseFloat(item.originalTotalSet.shopMoney.amount);
      productRevenue[item.title].quantity += item.quantity;
    }
  }
  const topProducts = Object.values(productRevenue)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Revenue by day
  const revenueByDay: Record<string, number> = {};
  for (const order of orders) {
    const day = order.createdAt.split("T")[0];
    revenueByDay[day] = (revenueByDay[day] || 0) + parseFloat(order.totalPriceSet.shopMoney.amount);
  }
  const revenueTimeline = Object.entries(revenueByDay)
    .map(([date, revenue]) => ({ date, revenue: Math.round(revenue * 100) / 100 }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Order status breakdown
  const statusBreakdown: Record<string, number> = {};
  for (const order of orders) {
    const status = order.displayFulfillmentStatus;
    statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
  }

  const currency = orders[0]?.totalPriceSet.shopMoney.currencyCode || "USD";

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    orderCount,
    averageOrderValue: Math.round(aov * 100) / 100,
    currency,
    topProducts,
    revenueTimeline,
    statusBreakdown,
    dateRange: {
      from: params.dateFrom || "all time",
      to: params.dateTo || "now",
    },
  };
}

// ─── Inventory ───────────────────────────────────────────────────────────────

const INVENTORY_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query, sortKey: TITLE) {
      nodes {
        id
        title
        totalInventory
        variants(first: 10) {
          nodes {
            id
            title
            sku
            inventoryQuantity
            price
          }
        }
      }
    }
  }
`;

export async function getInventory(params: {
  limit?: number;
  lowStockThreshold?: number;
}) {
  const data = await shopifyGraphQL<{
    products: {
      nodes: {
        id: string;
        title: string;
        totalInventory: number;
        variants: {
          nodes: {
            id: string;
            title: string;
            sku: string | null;
            inventoryQuantity: number | null;
            price: string;
          }[];
        };
      }[];
    };
  }>(INVENTORY_QUERY, { first: params.limit || 50, query: null });

  const threshold = params.lowStockThreshold || 10;
  const products = data.products.nodes;

  const inventory = products.map((p) => {
    const variantTotal = p.variants.nodes.reduce((sum, v) => sum + (v.inventoryQuantity ?? 0), 0);
    const effectiveTotal = p.totalInventory > 0 ? p.totalInventory : variantTotal;
    return {
      productTitle: p.title,
      totalInventory: effectiveTotal,
      isLowStock: effectiveTotal <= threshold,
      variants: p.variants.nodes.map((v) => ({
        variantTitle: v.title,
        sku: v.sku,
        quantity: v.inventoryQuantity,
        price: v.price,
        isLowStock: (v.inventoryQuantity ?? 0) <= threshold,
      })),
    };
  });

  const lowStockItems = inventory.filter((i) => i.isLowStock);

  return {
    totalProducts: products.length,
    lowStockCount: lowStockItems.length,
    threshold,
    inventory,
    lowStockItems,
  };
}
