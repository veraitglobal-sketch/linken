import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Reset-on-prop-change patterns are intentional; fail CI on real bugs only.
      "react-hooks/set-state-in-effect": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  // OAuth / API starts must full-navigate; Next Link is wrong here.
  {
    files: ["**/scheduling-integrations.tsx", "**/developers/page.tsx"],
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "mcp/**",
    "public/**",
    "supabase/**",
    "docs/**",
    "scripts/**",
    "tests/**",
  ]),
]);

export default eslintConfig;
