// prisma.config.ts
import "dotenv/config";

import { defineConfig } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema", // <-- Volte para como estava originalmente
    migrations: {
        path: "prisma/migrations",
        seed: "pnpm exec tsx prisma/seed.ts",
    },
    datasource: {
        url: process.env["DATABASE_URL"],
    },
});
