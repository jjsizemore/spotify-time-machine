# MSW localStorage Issue in Node.js Environment

## Problem Summary

Integration tests are failing with the error:

```
TypeError: localStorage.getItem is not a function
❯ CookieStore.getCookieStoreIndex node_modules/.pnpm/msw@2.11.6.../cookieStore.mjs:35:40
```

This occurs when importing MSW in Node.js environment integration tests that use `environment: 'node'`.

## Root Cause

1. **MSW v2.11.6 CookieStore** requires `localStorage` to be available
2. **Node.js doesn't provide** browser APIs like `localStorage` or `sessionStorage`
3. **ESM import hoisting**: All `import` statements are hoisted to the top of the module and executed **before** any other code in the file
4. **Vitest setupFiles** run after modules are already loaded, so polyfills added there don't take effect before MSW imports

## Attempted Solutions (All Failed)

### 1. ❌ Polyfill in test files

```typescript
// Doesn't work - imports are hoisted above this code
if (typeof localStorage === 'undefined') {
  globalThis.localStorage = { getItem: () => null, ... };
}
import { setupServer } from 'msw/node'; // Already tries to use localStorage
```

### 2. ❌ Polyfill in setupFiles

```typescript
// tests/setup/integration-setup.ts
globalThis.localStorage = ...;
```

**Problem**: setupFiles run after module imports are resolved

### 3. ❌ Polyfill in globalSetup

```typescript
// tests/setup/global-setup.ts
export default function globalSetup(project: TestProject) {
  globalThis.localStorage = ...;
}
```

**Problem**: globalSetup runs in main thread, tests run in worker threads - polyfill doesn't transfer

### 4. ❌ node-localstorage package

```bash
pnpm add -D node-localstorage
```

**Problem**: Same issue - can't be installed before ESM imports execute

## Working Solutions

### Option A: Use `happy-dom` environment (RECOMMENDED)

Change integration tests to use `happy-dom` instead of `node`:

```typescript
// vitest.config.ts
{
  test: {
    name: 'integration',
    include: ['tests/integration/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    environment: 'happy-dom', // ← Changed from 'node'
    setupFiles: ['./tests/setup/setup-files.ts'],
  },
}
```

**Pros**:

- ✅ Provides all browser APIs including localStorage
- ✅ No code changes needed in test files
- ✅ Still runs in Node.js (via happy-dom's JSDOM-like implementation)

**Cons**:

- ⚠️ Slightly heavier than pure Node environment
- ⚠️ May have subtle behavior differences from real Node.js

### Option B: Downgrade MSW to version without CookieStore

```bash
pnpm add -D msw@1.3.2
```

MSW v1.x doesn't use CookieStore and works fine in Node.js.

**Pros**:

- ✅ No environment changes needed
- ✅ Pure Node.js environment preserved

**Cons**:

- ❌ Older API (different from MSW v2)
- ❌ Missing newer features
- ❌ Not recommended for new projects

### Option C: Dynamic import of MSW

Refactor tests to use dynamic imports:

```typescript
// tests/integration/auth-flow.test.ts
describe('Auth Flow', () => {
  let setupServer: any;
  let http: any;

  beforeAll(async () => {
    // Polyfill BEFORE dynamic import
    if (globalThis.localStorage === undefined) {
      globalThis.localStorage = { getItem: () => null, ... };
    }

    // Now import MSW dynamically
    const msw = await import('msw/node');
    const mswHttp = await import('msw');
    setupServer = msw.setupServer;
    http = mswHttp.http;
  });

  // Rest of tests...
});
```

**Pros**:

- ✅ Pure Node.js environment
- ✅ Latest MSW version
- ✅ Full control over polyfill timing

**Cons**:

- ❌ Requires refactoring all integration tests
- ❌ More complex test setup
- ❌ Loss of top-level MSW server definition

## Recommendation

**Use Option A: Switch to `happy-dom`** for integration tests.

### Implementation:

1. Update `vitest.config.ts`:

```typescript
{
  test: {
    name: 'integration',
    environment: 'happy-dom', // Changed from 'node'
  },
}
```

2. Remove all localStorage polyfill attempts:

- Remove `tests/setup/integration-setup.ts`
- Remove polyfill from `global-setup.ts`
- Uninstall `node-localstorage`: `pnpm remove node-localstorage`

3. Update documentation to note that integration tests use happy-dom

### Why happy-dom?

- It's already installed and used for unit tests
- Provides a complete browser-like environment in Node.js
- Fast and lightweight (similar performance to pure Node)
- Actively maintained and compatible with Vitest
- Commonly used for integration tests that need browser APIs

## Technical Details

### ESM Import Hoisting

In ESM modules, this code:

```typescript
console.log('Setting up...');
import { setupServer } from 'msw/node';
console.log('Server imported');
```

Actually executes as:

```typescript
import { setupServer } from 'msw/node'; // Hoisted to top!
console.log('Setting up...');
console.log('Server imported');
```

This is why polyfills can't be added before imports - imports always execute first.

### Vitest Test Execution Flow

1. **globalSetup** runs (main thread, once)
2. **Worker threads** spawn
3. **Test files** load (imports execute!)
4. **setupFiles** run
5. **Tests** execute

The polyfill needs to happen before step 3, but we can only inject code at steps 1, 4, or 5.

## Related Issues

- MSW Issue: https://github.com/mswjs/msw/issues/1644
- Vitest Docs: https://vitest.dev/config/#environment
- Node.js ESM: https://nodejs.org/api/esm.html#resolution-algorithm

## Status

**UNRESOLVED** - Awaiting decision on which solution to implement.

Last updated: 2024
