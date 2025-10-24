# Explanation: Test Environment Isolation

**Category:** Explanation  
**Last Updated:** October 24, 2025

## Overview

This document explains how tests are isolated from production environment configuration, ensuring tests are reproducible, secure, and don't require real credentials.

## The Problem

### Original Issue

Tests were receiving **actual production credentials** from `.env` files instead of mock test values:

```typescript
// global-setup.ts
project.provide('spotifyClientId', getEnvOrDefault('SPOTIFY_CLIENT_ID', 'test-client-id'));

// Result: getEnvOrDefault() reads from actual .env file
// spotifyClientId = "encrypted:BAsE64EnCoDeDsCrEt..."  ❌
```

**Issues:**

- ❌ Tests coupled to .env file
- ❌ Production secrets in test logs
- ❌ Different values per environment
- ❌ Tests require real credentials
- ❌ Security risk

## The Solution

### Test-Specific Configuration

Tests now use explicit test defaults that don't call production environment functions:

```typescript
// global-setup.ts
const testSpotifyClientId = process.env.TEST_SPOTIFY_CLIENT_ID || 'test-spotify-client-id';

project.provide('spotifyClientId', testSpotifyClientId);

// Result: Explicit test value
// spotifyClientId = "test-spotify-client-id"  ✅
```

**Benefits:**

- ✅ Tests isolated from .env
- ✅ No production secrets
- ✅ Consistent across environments
- ✅ No credentials required
- ✅ Secure by default

## Architecture

### Test Environment Flow

```
Test Execution
    ↓
global-setup.ts
    ↓
process.env.TEST_* || fallback
    ↓ (provides)
Test Context (inject)
    ↓ (used by)
Test Files
```

### Production Environment Flow

```
Application Start
    ↓
src/lib/envConfig.ts
    ↓
getValidatedEnv()
    ↓ (reads from)
.env.local
    ↓ (validates with)
Zod Schema
    ↓ (provides)
Application Code
```

**Key separation:** Tests and production use different config paths

## Why This Matters

### Test Isolation Principles

1. **Reproducibility** - Same results everywhere
2. **Independence** - No external dependencies
3. **Speed** - No real API calls
4. **Security** - No credential exposure
5. **Clarity** - Explicit test data

### Bad Example (Before Fix)

```typescript
// ❌ DON'T: Using production config in tests
import { getEnvOrDefault } from '@/lib/envConfig';

project.provide('apiKey', getEnvOrDefault('SPOTIFY_CLIENT_ID', 'test-key'));
```

**Problems:**

- Reads from actual .env file
- May return real credentials
- Fallback rarely used
- Couples tests to production

### Good Example (After Fix)

```typescript
// ✅ DO: Use explicit test config
const testApiKey = process.env.TEST_SPOTIFY_CLIENT_ID || 'test-api-key';

project.provide('apiKey', testApiKey);
```

**Benefits:**

- No production function calls
- Explicit test value
- Fallback always used in CI
- Tests isolated

## Implementation Details

### Global Test Setup

```typescript
// tests/setup/global-setup.ts
import { inject, TestProject } from 'vitest';

export default function globalSetup(project: TestProject) {
  // Define explicit test values
  const testBaseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
  const testSpotifyClientId = process.env.TEST_SPOTIFY_CLIENT_ID || 'test-spotify-client-id';

  // Provide to test context
  project.provide('testStartTime', Date.now());
  project.provide('baseUrl', testBaseUrl);
  project.provide('spotifyClientId', testSpotifyClientId);

  console.log('🧪 Setting up global test environment...');
  console.log(`   Base URL: ${testBaseUrl}`);
  console.log(`   Test mode: Using mock credentials`);
}
```

### Test Environment Variables

```bash
# tests/.env.test
TEST_BASE_URL=http://localhost:3000
TEST_SPOTIFY_CLIENT_ID=test-spotify-client-id-abc123
TEST_SPOTIFY_CLIENT_SECRET=test-spotify-client-secret-xyz789
NODE_ENV=test
```

**Note:** Safe to commit - contains no real credentials

### Using Test Values

```typescript
// tests/unit/example.test.ts
import { describe, it, expect, inject } from 'vitest';

describe('API Tests', () => {
  it('should use test credentials', () => {
    const clientId = inject<string>('spotifyClientId');

    // Verify it's the mock value
    expect(clientId).toBe('test-spotify-client-id');

    // Ensure it's NOT encrypted
    expect(clientId).not.toContain('encrypted:');
  });
});
```

## Root Cause Analysis

### Why Did This Happen?

The original code used production environment functions in test setup:

```typescript
import { getEnvOrDefault } from '@/lib/envConfig';
// getEnvOrDefault is designed for PRODUCTION use
```

**Design intent:**

- `getEnvOrDefault()` reads from actual .env files
- Provides fallbacks for optional production variables
- Validates and decrypts values with dotenvx

**Not designed for:**

- Test environment configuration
- Providing mock values
- Isolating tests from production

### The Fallback Misconception

```typescript
getEnvOrDefault('SPOTIFY_CLIENT_ID', 'test-client-id');
```

**Expected behavior:** "Use test-client-id in tests"

**Actual behavior:** "Use .env value if present, else test-client-id"

**Problem:** In development, .env file ALWAYS has SPOTIFY_CLIENT_ID, so fallback is never used

## Before and After

### Before: Coupled to .env

```
Test Run
    ↓
global-setup.ts calls getEnvOrDefault()
    ↓
getEnvOrDefault() calls getEnvVar()
    ↓
getEnvVar() reads from .env file
    ↓
Returns: encrypted:BASE64CREDENTIAL  ❌
    ↓
Test receives production secret  🚨
```

### After: Isolated Configuration

```
Test Run
    ↓
global-setup.ts checks process.env.TEST_*
    ↓
No .env file access
    ↓
Returns: test-spotify-client-id  ✅
    ↓
Test receives mock value  ✓
```

## Verification

### Test Isolation Checks

```typescript
describe('Test Environment Isolation', () => {
  it('should use mock values, not production .env', () => {
    const spotifyClientId = inject<string>('spotifyClientId');

    // Must be test mock
    expect(spotifyClientId).toBe('test-spotify-client-id');

    // Must NOT be encrypted
    expect(spotifyClientId).not.toContain('encrypted:');
    expect(spotifyClientId).not.toMatch(/^[A-Za-z0-9+/=]{50,}$/);
  });

  it('should use test base URL', () => {
    const baseUrl = inject<string>('baseUrl');
    expect(baseUrl).toBe('http://localhost:3000');
  });

  it('should have consistent values across runs', () => {
    const clientId1 = inject<string>('spotifyClientId');
    const clientId2 = inject<string>('spotifyClientId');

    expect(clientId1).toBe(clientId2);
  });
});
```

## Configuration Options

### Option 1: Environment Variables (Recommended)

```bash
# Set before running tests
export TEST_BASE_URL=http://localhost:3000
export TEST_SPOTIFY_CLIENT_ID=test-client-id

# Run tests
pnpm test
```

### Option 2: Vitest Config

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    env: {
      TEST_BASE_URL: 'http://localhost:3000',
      TEST_SPOTIFY_CLIENT_ID: 'test-client-id',
      NODE_ENV: 'test',
    },
  },
});
```

### Option 3: .env.test File

```bash
# .env.test
TEST_BASE_URL=http://localhost:3000
TEST_SPOTIFY_CLIENT_ID=test-client-id
```

Load in Vitest config:

```typescript
import dotenv from 'dotenv';
const testEnv = dotenv.config({ path: '.env.test' });

export default defineConfig({
  test: {
    env: testEnv.parsed || {},
  },
});
```

## Best Practices

### DO ✅

```typescript
// Use explicit test defaults
const testValue = process.env.TEST_VAR || 'test-default';

// Document test requirements
// Tests require TEST_BASE_URL (optional, default: localhost:3000)

// Verify test isolation
expect(value).not.toContain('encrypted:');

// Use descriptive mock values
('test-spotify-client-id-for-unit-tests');
```

### DON'T ❌

```typescript
// Don't use production config functions
import { getEnvOrDefault } from '@/lib/envConfig';

// Don't assume fallbacks work
// (They don't if .env has the value)

// Don't use real credentials in tests
SPOTIFY_CLIENT_ID=actual_production_id

// Don't couple tests to .env file
if (process.env.SPOTIFY_CLIENT_ID) { ... }
```

## Security Implications

### Before: Security Risks

1. **Credential Exposure** - Production secrets in test logs
2. **Version Control** - Test output may be committed
3. **CI/CD Leaks** - Secrets visible in build logs
4. **Team Access** - Developers see production credentials

### After: Security Benefits

1. **No Real Secrets** - Only mock values in tests
2. **Safe Logging** - Can log test values freely
3. **CI/CD Safe** - No credential requirements
4. **Team Friendly** - No special access needed

## Impact on Different Test Types

### Unit Tests

```typescript
// Perfect isolation - no environment dependencies
describe('Pure Function Tests', () => {
  it('should work without environment', () => {
    expect(add(2, 3)).toBe(5);
  });
});
```

### Integration Tests

```typescript
// Uses mock API credentials
describe('API Integration Tests', () => {
  beforeAll(() => {
    const testClientId = inject<string>('spotifyClientId');
    spotifyApi.setCredentials({ clientId: testClientId });
  });

  it('should call mocked API', async () => {
    // MSW intercepts with mock responses
  });
});
```

### E2E Tests

```typescript
// May need real credentials (separate config)
describe('E2E Tests', () => {
  beforeAll(() => {
    // Use dedicated E2E credentials (not production!)
    const e2eClientId = process.env.E2E_SPOTIFY_CLIENT_ID;
    expect(e2eClientId).toBeDefined();
  });
});
```

## Troubleshooting

### Tests Still Receiving Real Credentials

**Check:**

1. Is `getEnvOrDefault()` still being called in test setup?
2. Is `.env` file being loaded in tests?
3. Are test env vars actually set?

**Solution:**

```bash
# Verify test environment
pnpm test -- --reporter=verbose

# Check what values are injected
console.log(inject('spotifyClientId'));
```

### Tests Failing After Fix

**Possible causes:**

1. Tests expect real API responses
2. Tests depend on specific credential format
3. Mock values don't match expected format

**Solution:**

- Update tests to work with mock values
- Adjust mock values to match expected format
- Use MSW to mock external API calls

### CI/CD Not Using Test Values

**Check:**

1. Are TEST\_\* env vars set in CI config?
2. Is vitest.config.ts setting test env?
3. Is .env.test file being loaded?

**Solution:**

```yaml
# .github/workflows/test.yml
env:
  TEST_BASE_URL: http://localhost:3000
  TEST_SPOTIFY_CLIENT_ID: test-client-id
  NODE_ENV: test
```

## Related Documentation

- [How-To: Set Up Environment Variables](../how-to/environment-setup.md) - Environment configuration
- [Explanation: Environment Migration](./environment-migration.md) - Production environment system
- [Reference: Testing Guide](../reference/testing-guide.md) - Complete testing reference

## External Resources

- [Vitest Configuration](https://vitest.dev/config/)
- [Test Isolation Best Practices](https://testingjavascript.com)
- [12-Factor App: Dev/Prod Parity](https://12factor.net/dev-prod-parity)
- [OWASP: Secure Testing](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
