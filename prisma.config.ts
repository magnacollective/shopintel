import { defineConfig } from "prisma/config";

// dotenv only needed locally - Vercel/Railway inject env vars directly
try { require("dotenv/config"); } catch {}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
