import eslint from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import type { Linter } from 'eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import importXPlugin from 'eslint-plugin-import-x';
import oxlint from 'eslint-plugin-oxlint';
import reactRefresh from 'eslint-plugin-react-refresh';
import { flatConfig as nextEslintConfig } from '@next/eslint-plugin-next';
import globals from 'globals';

const currentDir = new URL('.', import.meta.url).pathname;

export default [
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
  eslintConfigPrettier,
  nextEslintConfig.recommended,
  nextEslintConfig.coreWebVitals,
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
] as Linter.Config[];
