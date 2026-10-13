import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

// ESLint "flat config": one array of config objects, no .eslintrc. The
// typescript-eslint recommended set already turns off the core rules that
// misfire on TypeScript (such as no-undef), so nothing else is needed.
export default defineConfig([
  globalIgnores(['dist/**', 'dev-dist/**']),
  js.configs.recommended,
  tseslint.configs.recommended,
]);
