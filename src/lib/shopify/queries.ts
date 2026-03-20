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

// ─── Push Section to Theme ──────────────────────────────────────────────────

const THEMES_QUERY = `
  query {
    themes(first: 1, roles: MAIN) {
      nodes { id }
    }
  }
`;

const THEME_FILES_UPSERT_MUTATION = `
  mutation ThemeFilesUpsert($id: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
    themeFilesUpsert(themeId: $id, files: $files) {
      upsertedThemeFiles { filename }
      userErrors { field message }
    }
  }
`;

export async function pushSectionToTheme(params: {
  filename: string;
  content: string;
}): Promise<{ success: boolean; filename: string; error?: string }> {
  try {
    // 1. Get the active/main theme
    const themesData = await shopifyGraphQL<{
      themes: { nodes: { id: string }[] };
    }>(THEMES_QUERY);

    const themeId = themesData.themes.nodes[0]?.id;
    if (!themeId) {
      return { success: false, filename: params.filename, error: "No main theme found" };
    }

    // 2. Upsert the section file
    const sectionFilename = `sections/${params.filename}.liquid`;
    const upsertData = await shopifyGraphQL<{
      themeFilesUpsert: {
        upsertedThemeFiles: { filename: string }[];
        userErrors: { field: string; message: string }[];
      };
    }>(THEME_FILES_UPSERT_MUTATION, {
      id: themeId,
      files: [
        {
          filename: sectionFilename,
          body: { type: "LIQUID", value: params.content },
        },
      ],
    });

    const userErrors = upsertData.themeFilesUpsert.userErrors;
    if (userErrors.length > 0) {
      return {
        success: false,
        filename: sectionFilename,
        error: userErrors.map((e) => e.message).join(", "),
      };
    }

    return { success: true, filename: sectionFilename };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, filename: params.filename, error: message };
  }
}

// ─── Trend Forecasting ──────────────────────────────────────────────────────

export async function forecastTrends() {
  // 1. Fetch last 100 orders
  const orders = await getOrders({ limit: 100 });

  // 2. Group revenue by day
  const revenueByDay: Record<string, number> = {};
  const productsByPeriod: Record<string, { recent: number; prior: number }> = {};

  const now = new Date();
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

  for (const order of orders) {
    const day = order.createdAt.split("T")[0];
    const amount = parseFloat(order.totalPriceSet.shopMoney.amount);
    revenueByDay[day] = (revenueByDay[day] || 0) + amount;

    const orderDate = new Date(order.createdAt);

    // Track product revenue by period for growth/decline detection
    for (const item of order.lineItems.nodes) {
      const itemRevenue = parseFloat(item.originalTotalSet.shopMoney.amount);
      if (!productsByPeriod[item.title]) {
        productsByPeriod[item.title] = { recent: 0, prior: 0 };
      }
      if (orderDate >= twoWeeksAgo) {
        productsByPeriod[item.title].recent += itemRevenue;
      } else if (orderDate >= fourWeeksAgo) {
        productsByPeriod[item.title].prior += itemRevenue;
      }
    }
  }

  // Sort days chronologically
  const sortedDays = Object.entries(revenueByDay)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // 3. Calculate moving averages
  const timeline = sortedDays.map((day, i) => {
    const last7 = sortedDays.slice(Math.max(0, i - 6), i + 1);
    const last30 = sortedDays.slice(Math.max(0, i - 29), i + 1);
    const avg7 = last7.reduce((s, d) => s + d.revenue, 0) / last7.length;
    const avg30 = last30.reduce((s, d) => s + d.revenue, 0) / last30.length;
    return {
      date: day.date,
      revenue: Math.round(day.revenue * 100) / 100,
      movingAvg7: Math.round(avg7 * 100) / 100,
      movingAvg30: Math.round(avg30 * 100) / 100,
    };
  });

  // 4. Week-over-week and month-over-month growth
  const totalDays = sortedDays.length;

  const thisWeekRevenue = sortedDays
    .slice(Math.max(0, totalDays - 7))
    .reduce((s, d) => s + d.revenue, 0);
  const lastWeekRevenue = sortedDays
    .slice(Math.max(0, totalDays - 14), Math.max(0, totalDays - 7))
    .reduce((s, d) => s + d.revenue, 0);
  const weekOverWeekGrowth =
    lastWeekRevenue > 0
      ? Math.round(((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 10000) / 100
      : null;

  const thisMonthRevenue = sortedDays
    .slice(Math.max(0, totalDays - 30))
    .reduce((s, d) => s + d.revenue, 0);
  const lastMonthRevenue = sortedDays
    .slice(Math.max(0, totalDays - 60), Math.max(0, totalDays - 30))
    .reduce((s, d) => s + d.revenue, 0);
  const monthOverMonthGrowth =
    lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 10000) / 100
      : null;

  // 5. Top growing and declining products
  const productGrowth = Object.entries(productsByPeriod)
    .filter(([, v]) => v.prior > 0 || v.recent > 0)
    .map(([title, v]) => ({
      title,
      recentRevenue: Math.round(v.recent * 100) / 100,
      priorRevenue: Math.round(v.prior * 100) / 100,
      growthPct:
        v.prior > 0
          ? Math.round(((v.recent - v.prior) / v.prior) * 10000) / 100
          : v.recent > 0
            ? 100
            : 0,
    }));

  const topGrowing = [...productGrowth]
    .sort((a, b) => b.growthPct - a.growthPct)
    .slice(0, 5);

  const declining = [...productGrowth]
    .filter((p) => p.growthPct < 0)
    .sort((a, b) => a.growthPct - b.growthPct)
    .slice(0, 5);

  // 6. Anomaly detection (>2 standard deviations from 30-day mean)
  const last30Days = sortedDays.slice(Math.max(0, totalDays - 30));
  const mean30 =
    last30Days.length > 0
      ? last30Days.reduce((s, d) => s + d.revenue, 0) / last30Days.length
      : 0;
  const variance30 =
    last30Days.length > 0
      ? last30Days.reduce((s, d) => s + Math.pow(d.revenue - mean30, 2), 0) / last30Days.length
      : 0;
  const stdDev30 = Math.sqrt(variance30);

  const anomalies = last30Days
    .filter((d) => Math.abs(d.revenue - mean30) > 2 * stdDev30)
    .map((d) => ({
      date: d.date,
      revenue: Math.round(d.revenue * 100) / 100,
      deviations: Math.round(((d.revenue - mean30) / (stdDev30 || 1)) * 100) / 100,
      type: d.revenue > mean30 ? ("spike" as const) : ("dip" as const),
    }));

  const currency = orders[0]?.totalPriceSet.shopMoney.currencyCode || "USD";

  return {
    currency,
    timeline,
    weekOverWeekGrowth,
    monthOverMonthGrowth,
    thisWeekRevenue: Math.round(thisWeekRevenue * 100) / 100,
    lastWeekRevenue: Math.round(lastWeekRevenue * 100) / 100,
    thisMonthRevenue: Math.round(thisMonthRevenue * 100) / 100,
    lastMonthRevenue: Math.round(lastMonthRevenue * 100) / 100,
    topGrowingProducts: topGrowing,
    decliningProducts: declining,
    anomalies,
    stats: {
      mean30DayRevenue: Math.round(mean30 * 100) / 100,
      stdDev30DayRevenue: Math.round(stdDev30 * 100) / 100,
    },
  };
}
