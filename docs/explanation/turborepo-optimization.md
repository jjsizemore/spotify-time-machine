# Turborepo Single-Package Workspace Optimization

## Overview

This project uses [Turborepo](https://turbo.build/repo) to optimize task execution in a single-package workspace. While Turborepo excels in monorepos, it provides significant benefits for single-package workspaces through intelligent caching, task parallelization, and optimized task orchestration.

## Key Features Enabled

### 1. Task Parallelization

Turborepo automatically runs independent tasks in parallel, significantly reducing execution time:

```bash
# Run lint, format check, and type-check concurrently
pnpm check:parallel
# Equivalent to: turbo lint fmt:check type-check
```

Tasks without dependencies run in parallel automatically. For example:

- `lint`, `fmt:check`, and `type-check` can run simultaneously
- `test:unit`, `test:integration`, and `test:browser` run independently

### 2. Intelligent Caching

Turborepo caches task outputs and only re-runs tasks when inputs change:

- **Local caching**: Results stored in `.turbo/cache/`
- **Input-based invalidation**: Tasks only re-run when relevant files change
- **Deterministic hashing**: Same inputs = same cache hit

### 3. Optimized Input Patterns

Tasks are configured with precise input patterns to minimize cache misses:

```json
{
  "type-check": {
    "inputs": [
      "**/*.{ts,tsx}",
      "tsconfig.json",
      "next-env.d.ts",
      "!**/*.test.{ts,tsx}",
      "!tests/**"
    ]
  }
}
```

This ensures:

- Only TypeScript files trigger type-checking cache invalidation
- Test files don't invalidate production type-checking
- Unrelated file changes don't cause unnecessary re-runs

### 4. Task Dependencies

Tasks are orchestrated with explicit dependencies:

```json
{
  "build": {
    "dependsOn": ["type-check"]
  },
  "check:all": {
    "dependsOn": ["lint", "fmt:check", "type-check", "test"]
  }
}
```

This ensures:

- `type-check` always runs before `build`
- `check:all` waits for all validation tasks to complete
- Dependencies run in optimal order

## Available Commands

### Development

```bash
pnpm dev              # Start dev server (persistent, no cache)
pnpm build            # Build for production (cached, type-checked)
pnpm start            # Start production server
```

### Code Quality (Parallelizable)

```bash
pnpm check:parallel   # Run lint, format, type-check in parallel ⚡
pnpm lint             # Lint codebase (cached)
pnpm fmt:check        # Check formatting (cached)
pnpm type-check       # Type check TypeScript (cached)
```

### Testing (Parallelizable)

```bash
pnpm test             # Run all tests (cached)
pnpm test:unit        # Unit tests only (cached)
pnpm test:integration # Integration tests (cached)
pnpm test:browser     # Browser tests (cached)
```

### Combined Checks

```bash
pnpm check            # Sequential: lint → type-check
pnpm check:all        # All quality checks + tests
pnpm audit            # Security + spellcheck + all checks
```

## Performance Optimizations

### Input Pattern Optimizations

1. **Type Checking** - Only TypeScript files:

   ```json
   "inputs": ["**/*.{ts,tsx}", "tsconfig.json", "next-env.d.ts"]
   ```

2. **Linting** - Exclude test files from main lint cache:

   ```json
   "inputs": ["**/*.{js,jsx,ts,tsx}", "!**/*.test.{ts,tsx}"]
   ```

3. **Testing** - Include only relevant test directories:
   ```json
   "test:unit": {
     "inputs": ["src/**/*.{ts,tsx}", "tests/unit/**", "tests/setup/**"]
   }
   ```

### Cache Behavior by Task Type

| Task Type            | Caching     | Reason                |
| -------------------- | ----------- | --------------------- |
| `dev`, `start`       | ❌ Disabled | Long-running servers  |
| `build`, `test`      | ✅ Enabled  | Deterministic outputs |
| `lint`, `type-check` | ✅ Enabled  | Static analysis       |
| `fmt:fix`, `clean`   | ❌ Disabled | Modify files in place |
| `security:*`         | ❌ Disabled | Time-sensitive checks |

## Best Practices

### 1. Use Parallel Commands for Faster Feedback

Instead of:

```bash
pnpm lint && pnpm fmt:check && pnpm type-check
```

Use:

```bash
pnpm check:parallel  # Runs all three simultaneously
```

### 2. Leverage Turborepo Directly

Run multiple tasks with one command:

```bash
turbo lint test:unit test:integration  # All run in parallel
```

### 3. Check Cache Performance

```bash
# First run (no cache)
turbo lint type-check
# > lint: 5.2s
# > type-check: 3.1s

# Second run (cached)
turbo lint type-check
# > lint: >>> FULL TURBO (0.01s)
# > type-check: >>> FULL TURBO (0.01s)
```

### 4. Clear Cache When Needed

```bash
pnpm clean:cache      # Remove .turbo cache
turbo run build --force  # Bypass cache for one run
```

## Environment Variables in Caching

Tasks that depend on environment variables include them in inputs:

```json
{
  "build": {
    "inputs": ["$TURBO_DEFAULT$", ".env*"]
  }
}
```

This ensures builds re-run when environment configuration changes.

## Integration with CI/CD

Turborepo's caching works seamlessly in CI:

1. **Local development**: Fast feedback with local cache
2. **CI environment**: Fresh builds with deterministic results
3. **Remote caching** (optional): Share cache across team/CI with Vercel

## Monitoring Cache Effectiveness

Check which tasks hit the cache:

```bash
# Run with verbose logging
turbo run build --summarize

# Check the summary
open .turbo/runs/*.json
```

Look for:

- Cache hit rate
- Task execution times
- Task dependencies graph

## Task Configuration Reference

Key properties in `turbo.json`:

- **`inputs`**: File patterns that affect cache invalidation
- **`outputs`**: Directories/files to cache
- **`dependsOn`**: Tasks that must complete first
- **`cache`**: Enable/disable caching (default: true)
- **`persistent`**: Keep task running (for dev servers)

## Further Optimization Ideas

1. **Remote Caching**: Share cache across team with Vercel
2. **Task Sharding**: Split tests across multiple workers
3. **Input Filters**: More granular patterns for larger codebases
4. **Global Dependencies**: Files that affect all tasks

## Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Single-Package Workspaces Guide](https://turbo.build/repo/docs/guides/single-package-workspaces)
- [Configuring Tasks](https://turbo.build/repo/docs/crafting-your-repository/configuring-tasks)
- [Caching Reference](https://turbo.build/repo/docs/core-concepts/caching)
