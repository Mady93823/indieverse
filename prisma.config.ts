import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

// Prisma doesn't read .env on its own; Node's built-in loader does it without a dotenv dependency.
if (existsSync(".env")) process.loadEnvFile(".env");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
