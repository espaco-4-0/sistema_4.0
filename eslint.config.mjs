import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    prettier,
    globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
    {
        rules: {
            "prettier/prettier": "error",

            "comma-dangle": "off",
            "@typescript-eslint/comma-dangle": "off",
        },
    },
]);

export default eslintConfig;
