import { defineConfig, env } from "prisma/config";
import dotenv from "dotenv";

// .envファイルを明示的に読み込む
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
