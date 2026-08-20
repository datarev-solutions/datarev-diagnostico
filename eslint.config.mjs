import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // public/labs/** is vendored static output (three standalone lab apps,
    // one of them a full Next.js static export) served as-is, not source this
    // project owns — linting it flags things like minified React internals
    // aliasing `this`, which nobody here can or should fix.
    "public/labs/**",
  ]),
]);

export default eslintConfig;
