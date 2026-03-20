import { z } from "zod";
import { tool } from "ai";
import { Liquid } from "liquidjs";
import { getProducts, getOrders, getCustomers, getAnalytics, getInventory, pushSectionToTheme, forecastTrends } from "../shopify/queries";

interface PreviewProduct {
  title: string;
  price: string;
  currency: string;
  image: string;
  vendor: string;
  handle: string;
}

function formatPrice(amount: string, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(parseFloat(amount));
}

const liquid = new Liquid({ strictFilters: false, strictVariables: false });

// Register Shopify-specific filters that LiquidJS doesn't have
liquid.registerFilter("money", (v) => {
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return `$${isNaN(n) ? "0.00" : n.toFixed(2)}`;
});
liquid.registerFilter("money_with_currency", (v) => {
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return `$${isNaN(n) ? "0.00" : n.toFixed(2)} USD`;
});
liquid.registerFilter("img_url", (v) => typeof v === "string" ? v : "");
liquid.registerFilter("image_url", (v) => typeof v === "string" ? v : "");
liquid.registerFilter("asset_url", (v) => typeof v === "string" ? v : "");
liquid.registerFilter("stylesheet_tag", (v) => `<link rel="stylesheet" href="${v}">`);
liquid.registerFilter("script_tag", (v) => `<script src="${v}"><\/script>`);

/**
 * Preprocess Shopify Liquid to strip Shopify-specific blocks that
 * liquidjs doesn't understand ({% style %}, {% schema %}).
 * Converts {% style %} to <style>, removes {% schema %} entirely.
 */
function preprocessLiquid(code: string): string {
  // Convert {% style %} ... {% endstyle %} to <style> ... </style>
  let result = code.replace(/\{%[-\s]*style\s*%\}/gi, "<style>");
  result = result.replace(/\{%[-\s]*endstyle\s*%\}/gi, "</style>");
  // Remove {% schema %} ... {% endschema %} entirely
  result = result.replace(/\{%[-\s]*schema\s*%\}[\s\S]*?\{%[-\s]*endschema\s*%\}/gi, "");
  return result;
}

async function renderLiquidPreview(liquidCode: string, products: PreviewProduct[]): Promise<string> {
  // Build the Liquid context with Shopify-like data structures
  const liquidProducts = products.map((p) => ({
    title: p.title,
    vendor: p.vendor,
    handle: p.handle,
    url: `/products/${p.handle}`,
    price: parseFloat(p.price) * 100, // Shopify stores price in cents
    price_min: parseFloat(p.price) * 100,
    featured_image: p.image,
    featured_media: { preview_image: { src: p.image } },
    images: [p.image],
    media: [{ preview_image: { src: p.image } }],
    available: true,
    compare_at_price: null,
    description: "",
    tags: [],
    type: "",
    variants: [{ price: parseFloat(p.price) * 100, title: "Default" }],
  }));

  const context = {
    collection: { products: liquidProducts },
    collections: { all: { products: liquidProducts }, frontpage: { products: liquidProducts } },
    section: {
      id: "preview",
      settings: {
        title: "Featured Collection",
        heading: "Featured Collection",
        subtitle: "Discover our curated selection",
        description: "Discover our curated selection",
        subheading: "Discover our curated selection",
        button_text: "Shop Now",
        button_label: "Shop Now",
        button_link: "#",
        button_url: "#",
        collection: { products: liquidProducts },
        columns: 4,
        rows: 1,
        products_to_show: 4,
        show_vendor: true,
        show_price: true,
        show_image: true,
        bg_color: "#ffffff",
        text_color: "#000000",
        accent_color: "#D33167",
      },
    },
    products: liquidProducts,
  };

  try {
    const preprocessed = preprocessLiquid(liquidCode);
    const rendered = await liquid.parseAndRender(preprocessed, context);

    const fonts = `<link href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&family=Roboto:ital,wght@0,300;0,400;0,700;1,400&display=swap" rel="stylesheet">`;
    const baseStyles = `*{margin:0;padding:0;box-sizing:border-box}body{font-family:Roboto,sans-serif;-webkit-font-smoothing:antialiased}:root{--accent:#D33167;--text:#000;--muted:rgba(0,0,0,0.55);--bg-warm:#FAFAF7}img{max-width:100%;height:auto;display:block}a{color:inherit;text-decoration:none}`;

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${fonts}<style>${baseStyles}</style></head><body>${rendered}</body></html>`;
  } catch (err) {
    console.error("[liquid] Render error:", err);
    return "";
  }
}

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
      "Generate a Shopify Liquid section. Put ALL Liquid code in the 'liquidCode' parameter. Do NOT put code in any other field.",
    inputSchema: z.object({
      componentType: z
        .enum(["featured-products", "hero-banner", "product-grid", "newsletter", "testimonials", "custom"])
        .describe("Section type for preview layout"),
      liquidCode: z
        .string()
        .describe("The complete Shopify Liquid section. Must include HTML, a {% style %} block with all CSS, and a {% schema %} block with settings and presets. This is the ONLY field for code."),
    }),
    execute: async (params) => {
      const products = await getProducts({ limit: 4 });
      const previewProducts = products.map((p) => ({
        title: p.title,
        price: p.priceRangeV2.minVariantPrice.amount,
        currency: p.priceRangeV2.minVariantPrice.currencyCode,
        image: p.featuredImage?.url || "",
        vendor: p.vendor,
        handle: p.handle,
      }));

      // Render preview HTML using the real Liquid engine with product data
      const previewHtml = await renderLiquidPreview(params.liquidCode, previewProducts);

      return {
        code: params.liquidCode,
        componentType: params.componentType,
        previewProducts,
        previewHtml,
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
