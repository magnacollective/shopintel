import { z } from "zod";
import { tool } from "ai";
import { Liquid } from "liquidjs";
import { getProducts, getOrders, getCustomers, getAnalytics, getInventory, pushSectionToTheme, forecastTrends } from "../shopify/queries";

interface PreviewProduct {
  title: string;
  price: string;
  compare_at_price: string | null;
  currency: string;
  image: string;
  image_alt: string;
  images: string[];
  vendor: string;
  handle: string;
  description: string;
  product_type: string;
  tags: string[];
  available: boolean;
  total_inventory: number;
  variants: {
    title: string;
    price: string;
    sku: string | null;
    available: boolean;
  }[];
}

function formatPrice(amount: string, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(parseFloat(amount));
}

const liquid = new Liquid({ strictFilters: false, strictVariables: false });

// Register Shopify-specific filters that LiquidJS doesn't have
// Shopify prices are in cents — divide by 100 for display
liquid.registerFilter("money", (v) => {
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  const dollars = n >= 100 ? n / 100 : n; // handle both cents and dollar formats
  return `$${isNaN(dollars) ? "0.00" : dollars.toFixed(2)}`;
});
liquid.registerFilter("money_with_currency", (v) => {
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  const dollars = n >= 100 ? n / 100 : n;
  return `$${isNaN(dollars) ? "0.00" : dollars.toFixed(2)} USD`;
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
  // Build the Liquid context with full Shopify-like data structures
  const liquidProducts = products.map((p) => {
    const priceCents = Math.round(parseFloat(p.price) * 100);
    const comparePrice = p.compare_at_price ? Math.round(parseFloat(p.compare_at_price) * 100) : null;
    const allImages = p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
    return {
      title: p.title,
      vendor: p.vendor,
      handle: p.handle,
      url: `/products/${p.handle}`,
      description: p.description,
      type: p.product_type,
      product_type: p.product_type,
      price: priceCents,
      price_min: priceCents,
      price_max: priceCents,
      compare_at_price: comparePrice,
      compare_at_price_min: comparePrice,
      compare_at_price_max: comparePrice,
      available: p.available,
      featured_image: p.image,
      featured_media: { preview_image: { src: p.image } },
      images: allImages,
      media: allImages.map((img) => ({ preview_image: { src: img } })),
      image: { src: p.image, alt: p.image_alt, width: 800, height: 1067 },
      tags: p.tags,
      options: [],
      variants: p.variants.map((v) => ({
        price: Math.round(parseFloat(v.price) * 100),
        compare_at_price: comparePrice,
        title: v.title,
        sku: v.sku,
        available: v.available,
        image: { src: p.image },
      })),
      has_only_default_variant: p.variants.length <= 1,
      total_inventory: p.total_inventory,
    };
  });

  const collectionObj = {
    title: "All Products",
    handle: "all",
    description: "",
    products: liquidProducts,
    products_count: liquidProducts.length,
    all_products_count: liquidProducts.length,
  };

  // Section settings act as schema defaults — the AI defines the schema,
  // and these are the values that populate the preview
  const context = {
    collection: collectionObj,
    collections: { all: collectionObj, frontpage: collectionObj },
    section: {
      id: "preview-section",
      settings: {
        collection: collectionObj,
        columns: 4,
        columns_desktop: 4,
        columns_mobile: 2,
        rows: 1,
        products_to_show: liquidProducts.length,
        show_vendor: true,
        show_price: true,
        show_image: true,
        show_secondary_image: false,
        enable_quick_add: true,
        image_ratio: "portrait",
        padding_top: 80,
        padding_bottom: 80,
      },
    },
    products: liquidProducts,
    shop: {
      name: products[0]?.vendor || "Store",
      url: "#",
      currency: products[0]?.currency || "USD",
      money_format: "${{amount}}",
    },
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
      // Pull real products from the store
      const storeProducts = await getProducts({ limit: 8 });

      // Use real store data directly — no hardcoded fallbacks
      const previewProducts = storeProducts.map((p) => ({
        title: p.title,
        price: p.priceRangeV2.minVariantPrice.amount,
        compare_at_price: parseFloat(p.priceRangeV2.maxVariantPrice.amount) > parseFloat(p.priceRangeV2.minVariantPrice.amount) ? p.priceRangeV2.maxVariantPrice.amount : null,
        currency: p.priceRangeV2.minVariantPrice.currencyCode,
        image: p.featuredImage?.url || "",
        image_alt: p.featuredImage?.altText || p.title,
        images: p.images.nodes.map((img) => img.url),
        vendor: p.vendor,
        handle: p.handle,
        description: p.description,
        product_type: p.productType,
        tags: p.tags,
        available: p.totalInventory > 0,
        total_inventory: p.totalInventory,
        variants: p.variants.nodes.map((v) => ({
          title: v.title,
          price: v.price,
          sku: v.sku,
          available: (v.inventoryQuantity ?? 0) > 0,
        })),
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
