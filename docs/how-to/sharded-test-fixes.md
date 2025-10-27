# Sharded Test Fixes for GitHub Actions

## Summary

Fixed multiple issues with the Vitest v4 sharded test configuration in the GitHub Actions workflow that were causing test failures and "unknown" status for test shards.

## Issues Identified

### 1. **Incorrect `test:merge-reports` Command**

**Problem**: The package.json script was missing the `run` command:

```json
"test:merge-reports": "vitest --merge-reports"  ❌
```

**Solution**: Added `run` command as per Vitest v4 documentation:

```json
"test:merge-reports": "vitest run --merge-reports"  ✅
```

### 2. **VITEST_MAX_THREADS Set Too High for GitHub Actions**

**Problem**: The workflow was setting `VITEST_MAX_THREADS=7` which is inappropriate for GitHub Actions 4-core machines. This can cause resource contention and test failures.

**Solution**: Adjusted to `VITEST_MAX_THREADS=3` (1 main thread + 3 worker threads = 4 total cores).

### 3. **Missing Coverage Collection in Sharded Runs**

**Problem**: The sharded test runs weren't collecting coverage data, so the merge-reports step had no coverage to merge.

**Solution**:

- Added coverage flags to `test:shard` script:
  ```json
  "test:shard": "vitest run --project=unit --project=integration --reporter=blob --coverage.enabled=true --coverage.reporter=blob"
  ```
- Updated merge step to regenerate coverage from blob reports:
  ```bash
  pnpm test:merge-reports --coverage.enabled=true --coverage.reporter=text --coverage.reporter=json --coverage.reporter=html --coverage.reporter=lcov --coverage.reporter=json-summary
  ```

### 4. **Browser Tests Included in Sharded Runs**

**Problem**: The `--shard` flag was attempting to run ALL projects including browser tests, which should run separately in their own job.

**Solution**: Added project filtering to only run unit and integration tests in shards:

```json
"test:shard": "vitest run --project=unit --project=integration --reporter=blob ..."
```

### 5. **Coverage Reporter Missing Blob Support**

**Problem**: The coverage configuration wasn't including the 'blob' reporter needed for merging coverage from sharded runs.

**Solution**: Added 'blob' to coverage reporters:

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov', 'json-summary', 'blob'],  // Added blob
  // ...
}
```

**Note**: Vitest v4 automatically uses `.vitest-reports` as the default directory for blob reports. The merge functionality is controlled via the `--merge-reports` CLI flag - no additional configuration needed in `vitest.config.ts`.

## How Vitest v4 Sharding Works

### Workflow:

1. **Shard Step**: Each shard runs a subset of tests and outputs:
   - Blob report in `.vitest-reports/` (test results)
   - Blob coverage in `.vitest-reports/` (coverage data)

2. **Upload Step**: Each shard uploads its `.vitest-reports/` directory as an artifact

3. **Download Step**: Merge job downloads all shard artifacts into a single `.vitest-reports/` directory

4. **Merge Step**: Vitest reads all blob reports and:
   - Merges test results into a unified report
   - Merges coverage data into complete coverage report
   - Generates final reports (text, JSON, HTML, LCOV, etc.)

### Key Points:

- The `--reporter=blob` flag tells Vitest to output machine-readable blob format
- The `--shard=N/M` flag tells Vitest to run shard N out of M total shards
- The `--merge-reports` flag tells Vitest to read blob reports from `.vitest-reports/` and merge them
- Coverage must be collected during sharding AND re-generated during merge

## Files Changed

1. **package.json**
   - Fixed `test:merge-reports` command
   - Updated `test:shard` to include coverage and project filtering

2. **.github/workflows/test.yml**
   - Reduced `VITEST_MAX_THREADS` from 7 to 3
   - Combined merge-reports and coverage generation into single step
   - Added coverage flags to merge command

3. **vitest.config.ts**
   - Added 'blob' to coverage reporters (for sharding support)

## Testing the Fix

To test locally:

```bash
# Run a single shard
pnpm test:shard --shard=1/4

# Run all shards (simulating CI)
pnpm test:shard --shard=1/4 &
pnpm test:shard --shard=2/4 &
pnpm test:shard --shard=3/4 &
pnpm test:shard --shard=4/4 &
wait

# Merge the reports
pnpm test:merge-reports --coverage.enabled=true --coverage.reporter=text
```

## Expected Results

After these fixes:

- ✅ All 4 shards should show "success" status
- ✅ Merge Reports & Coverage job should succeed
- ✅ Test Status job should pass
- ✅ Coverage reports should be generated correctly
- ✅ Browser tests remain separate and unaffected

## References

- [Vitest Sharding Documentation](https://vitest.dev/guide/improving-performance.html#sharding)
- [Vitest Blob Reporter](https://vitest.dev/guide/reporters.html#blob-reporter)
- [Vitest Merge Reports](https://vitest.dev/guide/cli.html#merge-reports)
- [GitHub Actions Matrix Strategy](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs)
