
// Prisma 6+ config. Use a placeholder during `npm install` / CI when DATABASE_URL is not set yet
// (e.g. Vercel runs postinstall before env is injected into all contexts). Real URLs are required at runtime.
import "dotenv/config";
import { defineConfig } from "prisma/config";

const buildPlaceholder =
  "postgresql://build:build@127.0.0.1:5432/build?sslmode=disable";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL ?? buildPlaceholder,
  },
});
