# Quick Debug Guide for Sharded Tests

## Immediate Actions to Debug Failures

### 1. Run Locally to Identify the Issue

```bash
# Clean slate
rm -rf .vitest-reports/ coverage/ test-results/

# Test each shard individually
pnpm test:shard --shard=1/4
pnpm test:shard --shard=2/4
pnpm test:shard --shard=3/4  # This one is failing in CI
pnpm test:shard --shard=4/4

# Check what was created
ls -la .vitest-reports/
```

### 2. List Tests Per Shard

```bash
# See which tests are in each shard
pnpm vitest list --project=unit --project=integration --shard=1/4
pnpm vitest list --project=unit --project=integration --shard=2/4
pnpm vitest list --project=unit --project=integration --shard=3/4
pnpm vitest list --project=unit --project=integration --shard=4/4
```

### 3. Run All Tests Without Sharding

```bash
# Run all unit and integration tests normally
pnpm test:unit
pnpm test:integration

# Or combined
pnpm vitest run --project=unit --project=integration
```

### 4. Test the Merge Process

```bash
# Run all shards
pnpm test:shard --shard=1/4 &
pnpm test:shard --shard=2/4 &
pnpm test:shard --shard=3/4 &
pnpm test:shard --shard=4/4 &
wait

# Check reports were created
find .vitest-reports -type f -name "*.json"

# Try merging
pnpm test:merge-reports --coverage.enabled=true --coverage.reporter=text
```

## Common Issues & Solutions

### Issue: "No tests found"

**Cause:** Not enough test files for the number of shards  
**Solution:** Either reduce shards or add more tests

```yaml
# In .github/workflows/test.yml, reduce to 2 shards:
shardIndex: [1, 2]
shardTotal: [2]
```

### Issue: "Merge reports fails"

**Cause:** No blob reports found  
**Debug:**

```bash
# Check if .vitest-reports exists and has content
ls -la .vitest-reports/
cat .vitest-reports/*.json | jq '.' # View blob content
```

### Issue: "Shard 3 always fails"

**Cause:** Specific test in shard 3 is broken  
**Debug:**

```bash
# Run shard 3 with verbose output
pnpm vitest run --project=unit --project=integration --shard=3/4 --reporter=verbose

# Or with debug mode
DEBUG=vitest:* pnpm test:shard --shard=3/4
```

### Issue: "Tests work locally but fail in CI"

**Cause:** Environment differences (node version, dependencies, etc.)  
**Solution:**

```bash
# Match CI environment locally
export NODE_ENV=test
export VITEST_MAX_THREADS=3

# Use the exact CI command
pnpm test:shard --shard=3/4
```

## Verify Current State

### 1. Check Test Files Exist

```bash
find tests -name "*.test.*" -o -name "*.spec.*"

# Expected output:
# tests/unit/example.test.tsx
# tests/integration/api.test.ts
# tests/browser/browser.test.tsx
# tests/setup/global-setup.ts
# tests/setup/setup-files.ts
```

### 2. Check Configuration

```bash
# Verify test:shard command
grep "test:shard" package.json

# Should output:
# "test:shard": "vitest run --project=unit --project=integration --reporter=blob --coverage.enabled=true --coverage.reporter=blob",

# Verify coverage reporter includes blob
grep -A 5 "coverage:" vitest.config.ts | grep "blob"
```

### 3. Simulate CI Environment

```bash
# Set environment like CI
export NODE_ENV=test
export VITEST_MAX_THREADS=3
export CI=true

# Run exactly as CI does
pnpm install --frozen-lockfile
pnpm test:shard --shard=1/4
```

## Next Workflow Run Will Show

With the debug steps added, the next GitHub Actions run will display:

1. **📋 Test files for each shard** - Shows which tests are assigned to each shard
2. **📁 Contents of .vitest-reports/** - Shows if blob reports were created
3. **📁 Downloaded reports** - Shows if all shard reports were downloaded
4. **🔄 Merging reports from X blob files** - Shows how many reports are being merged

## Expected Behavior

### Successful Run Should Show:

```
✓ tests/unit/example.test.tsx (1)
✓ tests/integration/api.test.ts (2)

Test Files  2 passed (2)
     Tests  3 passed (3)
```

### Failed Run Might Show:

```
⨯ tests/unit/example.test.tsx > some test
  Expected: 4
  Received: 5
```

## If All Else Fails

### Option 1: Reduce Shard Count

```yaml
# Change from 4 shards to 2
shardIndex: [1, 2]
shardTotal: [2]
```

### Option 2: Disable Sharding Temporarily

```yaml
# Comment out the sharded test job
# test-sharded:
#   ...

# Add a simple non-sharded test job
test-simple:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v6
    - uses: pnpm/action-setup@v4
    - run: pnpm install --frozen-lockfile
    - run: pnpm test:unit
    - run: pnpm test:integration
```

### Option 3: Run Tests Sequentially

```yaml
# No matrix, just run all tests in one job
- name: Run all tests
  run: pnpm vitest run --project=unit --project=integration --coverage
```

## Contact Points

- **Vitest Discord:** https://chat.vitest.dev/
- **GitHub Issues:** https://github.com/vitest-dev/vitest/issues
- **Stack Overflow:** Tag `vitest`
