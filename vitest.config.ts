import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
     resolve: {
        alias: {
            "@": resolve(__dirname, "./src"),
        },
    test: {
        environment: "node",
        globals: true,
    },
});
