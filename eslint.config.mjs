import eslint from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import importXPlugin from 'eslint-plugin-import-x';
import oxlint from 'eslint-plugin-oxlint';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

import globals from 'globals';

const currentDir = new URL('.', import.meta.url).pathname;

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  {
    ignores: ['dist/', '.next/', 'node_modules/', '**/.*'],
  },
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
  ...oxlint.configs['flat/recommended'],
  {
    files: ['public/sw.js'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
  },
]);

export default eslintConfig;
