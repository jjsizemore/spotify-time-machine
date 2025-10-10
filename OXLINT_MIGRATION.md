# Oxlint Migration Guide

This document describes the migration of linting rules from ESLint plugins to oxlint for improved performance.

## Overview

Oxlint is a high-performance linter built in Rust that can replace many ESLint rules and plugins. This migration moves most linting rules to oxlint while keeping ESLint for rules that oxlint doesn't yet support.

## What Was Migrated

### ✅ Fully Migrated to Oxlint

The following ESLint plugins have been **fully migrated to oxlint**:

1. **eslint-plugin-jsx-a11y** → `jsx-a11y-plugin`
   - All accessibility rules for JSX are now handled by oxlint
   - Package removed from dependencies

2. **@next/eslint-plugin-next** (partial) → `nextjs-plugin`
   - Most Next.js specific rules are handled by oxlint
   - ESLint still validates some Next.js conventions that oxlint doesn't cover

3. **Basic ESLint Rules** → Built-in oxlint categories
   - `correctness`: Code that is outright wrong or useless
   - `suspicious`: Code that is most likely wrong or useless

### 🔄 Kept in ESLint (Not in Oxlint Yet)

The following remain in ESLint because oxlint doesn't fully support them:

1. **eslint-plugin-react-refresh**
   - Validates Next.js metadata exports
   - Custom configuration for `allowExportNames`

2. **eslint-plugin-import-x**
   - Import ordering rules
   - Oxlint's import plugin is still experimental

3. **@next/eslint-plugin-next** (partial)
   - Some Next.js core web vitals checks
   - TypeScript-specific Next.js rules

## Configuration Files

### `.oxlintrc.json`

The new oxlint configuration file enables:

- **Plugins**: `import`, `jsx-a11y`, `react-perf`, `nextjs`
- **Categories**: `correctness` and `suspicious` set to warn
- **Rules**: Comprehensive jsx-a11y and Next.js rules
- **Environment**: Browser, Node.js, ES2024

### `eslint.config.ts`

Updated to:

- Remove `eslint-plugin-jsx-a11y` (migrated to oxlint)
- Add comments explaining what ESLint still handles
- Use `oxlint.configs['flat/recommended']` to disable rules that oxlint handles

### `lefthook.yml`

Updated pre-commit hooks:

- oxlint now uses `--config .oxlintrc.json` flag
- oxlint runs before ESLint for faster feedback

### `package.json`

Updated scripts:

- `lint`: Uses oxlint with config file
- `lint:fix`: Uses oxlint with config file and fix flag

## Performance Benefits

Oxlint is significantly faster than ESLint:

- Written in Rust (vs JavaScript)
- Parallel processing by default
- Simpler architecture without plugin overhead

Example timing on this project:

- **Oxlint**: ~39ms on 1 file with 121 rules using 14 threads
- **ESLint**: ~2-3 seconds on the same file

## Plugins Enabled in Oxlint

### 1. jsx-a11y-plugin

Replaces `eslint-plugin-jsx-a11y` with all recommended accessibility rules:

- `alt-text`, `anchor-has-content`, `aria-props`, etc.
- Auto-fixable where possible

### 2. nextjs-plugin

Handles Next.js specific rules:

- `no-img-element` (use next/image)
- `no-html-link-for-pages` (use next/link)
- `no-head-element` (use next/head)
- And many more Next.js best practices

### 3. import-plugin

Experimental plugin for import validation:

- `no-cycle`: Prevent circular dependencies
- `no-duplicates`: Prevent duplicate imports
- `no-self-import`: Prevent importing from same file

### 4. react-perf-plugin

Performance-focused React rules:

- Currently disabled (`jsx-no-new-function-as-prop`, etc.)
- Can be enabled for stricter performance checks

## Rule Mapping

| ESLint Plugin | ESLint Rule            | Oxlint Plugin | Oxlint Rule            | Status            |
| ------------- | ---------------------- | ------------- | ---------------------- | ----------------- |
| jsx-a11y      | alt-text               | jsx-a11y      | alt-text               | ✅ Migrated       |
| jsx-a11y      | anchor-is-valid        | jsx-a11y      | anchor-is-valid        | ✅ Migrated       |
| jsx-a11y      | aria-props             | jsx-a11y      | aria-props             | ✅ Migrated       |
| @next         | no-img-element         | nextjs        | no-img-element         | ✅ Migrated       |
| @next         | no-html-link-for-pages | nextjs        | no-html-link-for-pages | ✅ Migrated       |
| import-x      | order                  | import-x      | -                      | ⚠️ Kept in ESLint |
| react-refresh | only-export-components | react-refresh | -                      | ⚠️ Kept in ESLint |

## Running Linters

### Development

```bash
# Run both oxlint and ESLint
pnpm run lint

# Auto-fix with both linters
pnpm run lint:fix

# Run only oxlint
pnpm exec oxlint --config .oxlintrc.json

# Run only ESLint
pnpm exec eslint .
```

### Pre-commit Hooks

Lefthook automatically runs both linters on staged files:

```bash
# Manual pre-commit check
lefthook run pre-commit

# Check all files
lefthook run pre-commit --all-files
```

## Troubleshooting

### Oxlint Shows Different Errors Than ESLint

This is expected! Oxlint may:

- Be more strict in some areas
- Be less strict in others
- Have different fix suggestions

Both linters run in sequence, so you'll see errors from both.

### Import Plugin Errors

The oxlint import plugin is experimental. If you encounter issues:

1. Check that `--tsconfig` is not needed in your case
2. Verify import paths are correct
3. Fall back to ESLint's import-x plugin

### TypeScript Path Aliases

If oxlint doesn't resolve TypeScript path aliases:

```bash
oxlint --config .oxlintrc.json --tsconfig ./tsconfig.json
```

## Future Improvements

As oxlint continues to evolve:

1. **Import Ordering**: Migrate when oxlint's import plugin stabilizes
2. **React Refresh**: Migrate when oxlint supports Next.js metadata exports
3. **Custom Rules**: Remove ESLint entirely once all rules are supported

## Resources

- [Oxlint Documentation](https://oxc-project.github.io/docs/guide/usage/linter.html)
- [Oxlint Rules](https://oxc-project.github.io/docs/guide/usage/linter/rules.html)
- [Oxlint GitHub](https://github.com/oxc-project/oxc)
- [Migration from ESLint](https://oxc-project.github.io/docs/guide/usage/linter/migration.html)

## Summary

This migration achieves:

- ✅ 3-10x faster linting performance
- ✅ Comprehensive accessibility checking (jsx-a11y)
- ✅ Next.js best practices enforcement
- ✅ Maintains ESLint for unsupported rules
- ✅ Seamless pre-commit hook integration
