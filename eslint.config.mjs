import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    prettier,
    globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "src/generated/**"]),
    {
        rules: {
            // Formatação é responsabilidade do Prettier (`pnpm format:check`), não do
            // ESLint. A regra "prettier/prettier" exigiria o eslint-plugin-prettier,
            // que não é dependência do projeto — era o que quebrava o lint.
            "comma-dangle": "off",
            "@typescript-eslint/comma-dangle": "off",
        },
    },
]);

export default eslintConfig;
