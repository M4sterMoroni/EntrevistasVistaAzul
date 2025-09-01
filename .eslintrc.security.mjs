import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const securityConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Security-focused rules
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-unsafe-finally': 'error',
      'require-atomic-updates': 'error',
      
      // Code quality rules that improve security
      'no-unused-vars': 'error',
      'no-undef': 'error',
      'no-global-assign': 'error',
      
      // Best practices
      'prefer-const': 'error',
      'no-var': 'error',
      'no-redeclare': 'error',
      'no-shadow': 'error',
      'no-unreachable': 'error'
    },
    ignores: [
      'node_modules/**',
      '.next/**',
      'coverage/**',
      'tests/**',
      'src/__tests__/**',
      'jest.config.js',
      'jest.setup.js',
      '**/*.test.{ts,tsx,js,jsx}',
      '**/*.spec.{ts,tsx,js,jsx}',
      '**/coverage/**',
      '**/build/**',
      '**/dist/**',
      '**/.next/**',
      '**/out/**'
    ]
  }
];

export default securityConfig;
