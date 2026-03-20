import { z } from "zod";
import { tool } from "ai";
import { getProducts, getOrders, getCustomers, getAnalytics, getInventory, pushSectionToTheme, forecastTrends } from "../shopify/queries";
export const shopifyTools = {
  getProducts: tool({
    description:
      "Fetch products from the Shopify store. Use this when the user asks about products, catalog, inventory items, pricing, or what the store sells.",
    inputSchema: z.object({
      searchQuery: z
        .string()
        .max(200)
        .optional()
        .describe("Optional Shopify search query to filter products (e.g. 'title:shirt', 'vendor:Nike', 'product_type:shoes')"),
      limit: z
        .number()
        .min(1)
        .max(50)
        .optional()
        .describe("Number of products to fetch (default 20, max 50)"),
    }),
    execute: async (params) => {
      const products = await getProducts(params);
      return { products };
    },
  }),

  getOrders: tool({
    description:
      "Fetch orders from the Shopify store. Use this when the user asks about orders, sales, purchases, or order statuses.",
    inputSchema: z.object({
      searchQuery: z
        .string()
        .max(200)
        .optional()
        .describe("Optional Shopify search query (e.g. 'financial_status:paid', 'fulfillment_status:unfulfilled', 'created_at:>2024-01-01')"),
      limit: z
        .number()
        .min(1)
        .max(100)
        .optional()
        .describe("Number of orders to fetch (default 25, max 100)"),
    }),
    execute: async (params) => {
      const orders = await getOrders(params);
      return { orders };
    },
  }),

  getCustomers: tool({
    description:
      "Fetch customers from the Shopify store. Use this when the user asks about customers, buyers, customer segments, or customer analytics.",
    inputSchema: z.object({
      searchQuery: z
        .string()
        .max(200)
        .optional()
        .describe("Optional Shopify search query to filter customers (e.g. 'orders_count:>5', 'total_spent:>100')"),
      limit: z
        .number()
        .min(1)
        .max(100)
        .optional()
        .describe("Number of customers to fetch (default 25, max 100)"),
    }),
    execute: async (params) => {
      const customers = await getCustomers(params);
      return { customers };
    },
  }),

  getAnalytics: tool({
    description:
      "Get computed analytics and metrics from Shopify orders — total revenue, average order value, top products, revenue timeline, and order status breakdown. Use this for any analytical, trend, or performance questions.",
    inputSchema: z.object({
      dateFrom: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format")
        .optional()
        .describe("Start date for analytics period (ISO format, e.g. '2024-01-01')"),
      dateTo: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format")
        .optional()
        .describe("End date for analytics period (ISO format, e.g. '2024-12-31')"),
    }),
    execute: async (params) => {
      const analytics = await getAnalytics(params);
      return analytics;
    },
  }),

  getInventory: tool({
    description:
      "Get inventory levels for all products, including low-stock detection. Use this when the user asks about stock levels, inventory, low stock alerts, or restocking needs.",
    inputSchema: z.object({
      lowStockThreshold: z
        .number()
        .min(0)
        .max(1000)
        .optional()
        .describe("Threshold below which items are considered low stock (default 10)"),
      limit: z
        .number()
        .min(1)
        .max(100)
        .optional()
        .describe("Number of products to check (default 50)"),
    }),
    execute: async (params) => {
      const inventory = await getInventory(params);
      return inventory;
    },
  }),

  generateLiquid: tool({
    description:
      "Generate a premium Shopify Liquid section with live preview. Creates production-grade storefront code with a luxury clean beauty aesthetic (Kosas-inspired: Founders Grotesk typography, black/white palette, dusty rose #D33167 accent, refined minimalism). Use this when the user asks to create a section, page, component, or any storefront element.",
    inputSchema: z.object({
      componentType: z
        .enum(["featured-products", "hero-banner", "product-grid", "newsletter", "testimonials", "custom"])
        .describe("Type of section for preview layout. Use the matching type when applicable, or 'custom' for unique requests. You must ALWAYS write your own Liquid code in the 'code' parameter regardless of type."),
      description: z
        .string()
        .optional()
        .describe("Additional design details or customization for the component"),
      code: z
        .string()
        .max(50000)
        .optional()
        .describe("Your complete Liquid section code including {% style %} and {% schema %} blocks. Write production-grade Shopify Liquid with CSS, responsive design, and hover interactions. Keep it focused and efficient."),
      productCount: z
        .number()
        .optional()
        .describe("Number of products to include for preview (default 4)"),
    }),
    execute: async (params) => {
      if (!params.code) {
        return { error: "You must provide your own Liquid code in the 'code' parameter. Write 200+ lines of production-grade Liquid with {% style %} and {% schema %} blocks." };
      }

      const products = await getProducts({ limit: params.productCount || 4 });
      const previewProducts = products.map((p) => ({
        title: p.title,
        price: p.priceRangeV2.minVariantPrice.amount,
        currency: p.priceRangeV2.minVariantPrice.currencyCode,
        image: p.featuredImage?.url || "",
        vendor: p.vendor,
        handle: p.handle,
      }));

      const code = params.code;

      return {
        code,
        componentType: params.componentType,
        previewProducts,
      };
    },
  }),

  deploySection: tool({
    description:
      "Deploy a Liquid section file directly to the active Shopify theme. Use this when the user wants to push, deploy, or publish a generated section to their live store theme.",
    inputSchema: z.object({
      sectionName: z
        .string()
        .max(50)
        .regex(/^[a-z0-9-]+$/, "Must be kebab-case (lowercase letters, numbers, and hyphens only)")
        .describe("The kebab-case filename for the section (e.g. 'featured-hero', 'product-grid')"),
      code: z
        .string()
        .max(50000)
        .describe("The Liquid code content to deploy as the section file"),
    }),
    execute: async (params) => {
      const result = await pushSectionToTheme({
        filename: params.sectionName,
        content: params.code,
      });
      return result;
    },
  }),

  forecastTrends: tool({
    description:
      "Analyze sales trends, predict growth patterns, identify rising/declining products, and flag revenue anomalies. Use this proactively when discussing business performance or when the user asks about trends, forecasts, or predictions.",
    inputSchema: z.object({}),
    execute: async () => {
      const trends = await forecastTrends();
      return trends;
    },
  }),
};
