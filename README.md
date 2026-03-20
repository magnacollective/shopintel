# ShopIntel

AI-powered Shopify command center with generative UI. Chat with your store data and get rich, interactive visualizations — charts, tables, KPI cards, and dashboards — rendered directly in the conversation.

## Features

- **AI Agent with Shopify Tools** — Query products, orders, customers, inventory, and analytics through natural language
- **Generative UI** — The agent renders interactive React components (charts, tables, grids) instead of plain text
- **Dynamic Dashboards** — Ask "build me a dashboard" and get a multi-component layout assembled on the fly
- **Shopify Liquid Generation** — Generate production-quality Liquid templates for sections, pages, and snippets
- **Analytics Engine** — Revenue trends, top products, AOV, order status breakdowns with visualizations

## Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **Vercel AI SDK** with **Claude** (Anthropic) — tool calling + streaming
- **Shopify Admin API** (GraphQL)
- **Tailwind CSS + shadcn/ui** — polished component library
- **Recharts** — data visualizations

## Setup

### 1. Prerequisites

- Node.js 18+
- A Shopify development store with a custom app
- An Anthropic API key

### 2. Shopify App Setup

1. Go to your Shopify Partner Dashboard or store admin
2. Create a custom app (or use an existing one)
3. Grant the following Admin API scopes:
   - `read_products`
   - `read_orders`
   - `read_customers`
   - `read_inventory`
4. Install the app on your dev store and copy the Admin API access token

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Fill in your values:

```
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
```

### 4. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage Examples

| Prompt | What You Get |
|--------|-------------|
| "How are sales this month?" | KPI cards + revenue chart + top products chart |
| "Show me my products" | Product grid with images, prices, and stock |
| "Recent orders" | Sortable orders table with status badges |
| "Any low stock items?" | Inventory table with low-stock highlighting |
| "Who are my best customers?" | Customer list ranked by lifetime value |
| "Build me a Q1 dashboard" | Full multi-component dashboard layout |
| "Create a featured products section" | Generated Shopify Liquid code with copy button |

## Architecture

```
User message
  -> Next.js API route (/api/chat)
    -> Claude (Anthropic) with tool definitions
      -> Tool executes Shopify GraphQL query
        -> Result streamed back with UI message protocol
          -> Client renders rich React components based on tool results
```

The key insight: the AI agent decides which tools to call and the client maps each tool's output to a specific React component (chart, table, grid, etc.). This creates a "generative UI" experience where the agent effectively builds interactive dashboards through conversation.
