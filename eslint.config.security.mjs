import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypescript,
  globalIgnores([
    "node_modules/**",
    ".next/**",
    "coverage/**",
    "tests/**",
    "src/__tests__/**",
    "jest.config.js",
    "jest.setup.js",
    "**/*.test.{ts,tsx,js,jsx}",
    "**/*.spec.{ts,tsx,js,jsx}",
    "**/coverage/**",
    "**/build/**",
    "**/dist/**",
    "**/.next/**",
    "**/out/**",
  ]),
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      // Security-focused rules
      "no-console": "warn",
      "no-debugger": "error",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",
      "no-unsafe-finally": "error",
      "require-atomic-updates": "error",

      // Code quality rules that improve security
      "no-unused-vars": "error",
      "no-undef": "error",
      "no-global-assign": "error",

      // Best practices
      "prefer-const": "error",
      "no-var": "error",
      "no-redeclare": "error",
      "no-shadow": "error",
      "no-unreachable": "error",
    },
  },
]);
