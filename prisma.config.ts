import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

// .envファイルを明示的に読み込む
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://placeholder:placeholder@localhost:5432/placeholder";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: databaseUrl,
  },
});
