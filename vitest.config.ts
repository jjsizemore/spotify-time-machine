import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  plugins: [
    react({
      // React Compiler support for test files
      babel: {
        plugins: [['babel-plugin-react-compiler', { target: '19' }]],
      },
    }),
  ],
  test: {
    // Use threads pool for better performance (v4 optimization)
    pool: 'threads',

    // Projects configuration (v4 pattern - replaces workspace)
    projects: [
      // Unit tests configuration
      {
        test: {
          name: 'unit',
          include: [
            'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
            'tests/unit/**/*.{test,spec}.{js,jsx,ts,tsx}',
          ],
          environment: 'happy-dom',
          setupFiles: ['./tests/setup/setup-files.ts'],
        },
      },

      // Integration tests configuration
      {
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.{test,spec}.{js,jsx,ts,tsx}'],
          environment: 'node',
          setupFiles: ['./tests/setup/setup-files.ts'],
          testTimeout: 15000, // Longer timeout for integration tests
          hookTimeout: 15000,
        },
      },

      // Browser tests configuration
      {
        test: {
          name: 'browser',
          include: ['tests/browser/**/*.{test,spec}.{js,jsx,ts,tsx}'],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [
              {
                browser: 'chromium',
                name: 'chromium-ci',
              },
            ],
            // Optimize for CI environment
            fileParallelism: false, // Disable for more stable CI runs
            connectTimeout: 120000, // Longer timeout for CI
          },
        },
      },

      // End-to-end tests (if added later)
      {
        test: {
          name: 'e2e',
          include: ['tests/e2e/**/*.{test,spec}.{js,jsx,ts,tsx}'],
          environment: 'node',
          testTimeout: 60000,
          hookTimeout: 60000,
        },
      },
    ],

    // Global configuration (applies to all projects)
    globalSetup: ['./tests/setup/global-setup.ts'],
    setupFiles: ['./tests/setup/setup-files.ts', '@testing-library/jest-dom/vitest'],

    // Default test patterns (fallback for non-project tests)
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: [
      'node_modules',
      'dist',
      '.next',
      'coverage',
      '**/*.d.ts',
      'src/app/**/*.{config,stories}.{js,ts,jsx,tsx}',
    ],

    // Default test environment
    environment: 'happy-dom',

    // Browser testing configuration (v4 feature)
    browser: {
      enabled: false, // Enable when running browser tests
      provider: playwright(),
      headless: true,

      // Multiple browser instances (v4 enhancement)
      instances: [
        {
          browser: 'chromium',
          name: 'chromium-desktop',
          setupFiles: ['./tests/setup/browser-setup.ts'],
        },
        {
          browser: 'firefox',
          name: 'firefox-desktop',
        },
        {
          browser: 'webkit',
          name: 'webkit-desktop',
        },
      ],

      // Performance settings
      fileParallelism: true,
      connectTimeout: 60000,
    },

    // Alternative browser preview for visual testing
    // Uncomment to use @vitest/browser-preview
    /*
    browser: {
      enabled: false,
      provider: preview(),
      instances: [{ browser: 'chromium' }]
    },
    */

    // Performance and timing
    testTimeout: 10000,
    hookTimeout: 10000,

    // Parallel execution
    fileParallelism: true,
    maxConcurrency: 5,

    // Coverage configuration (v4 optimizations)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'json-summary'],

      // Enhanced include/exclude patterns for v4
      include: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/*.{config,stories}.{js,ts,jsx,tsx}',
      ],
      exclude: [
        'node_modules',
        'tests',
        '__tests__',
        'coverage',
        'dist',
        '.next',
        'src/app/**/page.{js,jsx,ts,tsx}', // Exclude Next.js pages
        'src/app/**/layout.{js,jsx,ts,tsx}', // Exclude Next.js layouts
        'src/app/**/loading.{js,jsx,ts,tsx}',
        'src/app/**/error.{js,jsx,ts,tsx}',
        'src/app/**/not-found.{js,jsx,ts,tsx}',
        'src/proxy.{js,ts}',
        'next.config.*',
        'postcss.config.*',
        'tailwind.config.*',
        '**/*.config.*',
      ],

      // Coverage thresholds
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },

      // Performance optimizations for large projects
      clean: true,
      cleanOnRerun: true,
    },

    // Reporters configuration
    reporters: ['default', 'json', 'html', ['junit', { outputFile: 'test-results/junit.xml' }]],

    // Output directories
    outputFile: {
      json: './test-results/results.json',
      html: './test-results/index.html',
    },

    // Advanced v4 features
    isolate: true,

    // Retry configuration
    retry: 2,

    // Mock configuration
    clearMocks: true,
    restoreMocks: true,

    // Snapshot configuration
    resolveSnapshotPath: (testPath, snapExtension) => {
      return testPath.replace('/tests/', '/tests/__snapshots__/') + snapExtension;
    },

    // Watch mode configuration
    watch: false,
  },

  // Vite configuration for tests
  resolve: {
    alias: {
      '@': '/src',
      '@/components': '/src/components',
      '@/lib': '/src/lib',
      '@/types': '/src/types',
      '@/hooks': '/src/hooks',
      '@/app': '/src/app',
    },
  },

  // Define globals for testing
  define: {
    'import.meta.vitest': 'undefined',
  },
});
