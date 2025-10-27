import eslint from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier';
import importXPlugin from 'eslint-plugin-import-x';
// @ts-expect-error - no types available for eslint-plugin-oxlint
import oxlint from 'eslint-plugin-oxlint';
import reactRefresh from 'eslint-plugin-react-refresh';
// @ts-expect-error - no types available for eslint-config-next
import nextVitals from 'eslint-config-next/core-web-vitals';
import globals from 'globals';
import { defineConfig, globalIgnores } from 'eslint/config';

const currentDir = new URL('.', import.meta.url).pathname;

export default defineConfig([
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'test-results/**']),
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
        tsconfigRootDir: currentDir,
      },
      globals: {
        ...globals.node,
        ...globals.browser,
        React: 'readonly',
        JSX: 'readonly',
        NodeJS: 'readonly',
      },
    },
  },
  eslint.configs.recommended,
  nextVitals,
  {
    ...reactRefresh.configs.recommended,
    rules: {
      ...reactRefresh.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
          allowExportNames: [
            'metadata',
            'generateMetadata',
            'generateStaticParams',
            'size',
            'contentType',
          ],
        },
      ],
    },
  },
  {
    plugins: { 'import-x': importXPlugin },
    rules: { 'import-x/order': ['error', { groups: ['builtin', 'external', 'internal'] }] },
  },
  {
    files: ['public/sw.js'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
  },
  {
    files: ['tests/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
      'import-x/no-unassigned-import': 'off',
    },
  },
  eslintConfigPrettier,
  ...oxlint.configs['flat/recommended'],
]);
