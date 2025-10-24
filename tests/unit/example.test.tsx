/**
 * Example Unit Tests showcasing Vitest v4 features
 *
 * Environment Variables:
 * ✅ Test values are injected via global-setup.ts
 * ✅ Tests use MOCK credentials, not real .env values
 * ✅ This ensures tests are isolated from production environment
 *
 * Injected Test Values:
 * - baseUrl: 'http://localhost:3000' (mock - NOT from .env)
 * - spotifyClientId: 'test-spotify-client-id' (mock - NOT from .env)
 * - testStartTime: Current timestamp
 *
 * Best Practices:
 * ✅ Use inject() to retrieve test values
 * ✅ Tests are reproducible across all environments
 * ✅ No production credentials in tests
 * ✅ Tests can run without .env file
 *
 * @see tests/setup/global-setup.ts - Test environment setup (provides mock values)
 * @see .env.test - Test environment configuration
 * @see TEST_ENVIRONMENT_ISOLATION_BUG.md - Why tests need isolation from .env
 */

import { describe, it, expect, vi, inject, beforeAll, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

// Mock utility functions for testing
const formatDuration = (ms: number) => {
  if (!ms || ms < 0) return '0:00';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const getTopTimeRange = (range: string) => {
  const ranges = {
    short_term: { id: 'short_term', label: 'Last 4 Weeks', period: '4 weeks' },
    medium_term: { id: 'medium_term', label: 'Last 6 Months', period: '6 months' },
    long_term: { id: 'long_term', label: 'All Time', period: 'all time' },
  };
  return ranges[range as keyof typeof ranges] || ranges.medium_term;
};

// Simple functional component for testing
const TestComponent = ({ text = 'Hello World' }: { text?: string }) => (
  <div data-testid="test-component">{text}</div>
);

describe('Spotify Track Utils', () => {
  it('should format duration correctly', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(1000)).toBe('0:01');
    expect(formatDuration(61000)).toBe('1:01');
    expect(formatDuration(3661000)).toBe('61:01'); // Over an hour shows minutes
  });

  it('should handle edge cases', () => {
    expect(formatDuration(-1000)).toBe('0:00'); // Negative duration
    expect(formatDuration(null as any)).toBe('0:00'); // Null value
    expect(formatDuration(undefined as any)).toBe('0:00'); // Undefined value
  });
});

describe('Time Ranges Utils', () => {
  it('should return correct time range', () => {
    const timeRange = getTopTimeRange('short_term');
    expect(timeRange).toEqual({
      id: 'short_term',
      label: 'Last 4 Weeks',
      period: '4 weeks',
    });
  });

  it('should handle invalid time range', () => {
    const timeRange = getTopTimeRange('invalid' as any);
    expect(timeRange).toEqual({
      id: 'medium_term',
      label: 'Last 6 Months',
      period: '6 months',
    });
  });
});

describe('TestComponent', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render with default text', () => {
    render(<TestComponent />);

    const component = screen.getByTestId('test-component');
    expect(component).toBeInTheDocument();
    expect(component).toHaveTextContent('Hello World');
  });

  it('should render with custom text', () => {
    render(<TestComponent text="Custom Text" />);

    const component = screen.getByTestId('test-component');
    expect(component).toBeInTheDocument();
    expect(component).toHaveTextContent('Custom Text');
  });

  it('should have correct test id', () => {
    render(<TestComponent />);

    const component = screen.getByTestId('test-component');
    expect(component).toBeInTheDocument();
  });
});

// Test with mocked dependencies
describe('Mocked API Tests', () => {
  const mockFetch = vi.fn();

  beforeAll(() => {
    // Mock global fetch
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should handle successful API response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          items: [{ id: '4uLU6hMCjMI75M1A2tKUQC', name: 'Test Track' }],
        }),
    });

    const response = await fetch('/api/tracks');
    const data = await response.json();

    expect(mockFetch).toHaveBeenCalledWith('/api/tracks');
    expect(data.items[0]).toEqual({
      id: '4uLU6hMCjMI75M1A2tKUQC',
      name: 'Test Track',
    });
    expect(data.items[0].id).toBeValidSpotifyId();
  });

  it('should handle API error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API Error'));

    await expect(fetch('/api/tracks')).rejects.toThrow('API Error');
  });
});

// Test with injected context (v4 feature)
describe('Context Injection Tests', () => {
  it('should access injected test values', () => {
    const baseUrl = inject('baseUrl');
    const spotifyClientId = inject('spotifyClientId');
    const testStartTime = inject('testStartTime');

    expect(baseUrl).toBe('http://localhost:3000');
    expect(spotifyClientId).toBe('test-spotify-client-id');
    expect(testStartTime).toBeTypeOf('number');
  });
});

// Test environment isolation verification
describe('Test Environment Isolation', () => {
  it('should use test mock values, not production .env values', () => {
    const spotifyClientId = inject('spotifyClientId');

    // Verify it's the test mock value
    expect(spotifyClientId).toBe('test-spotify-client-id');

    // Ensure it's NOT an actual encrypted credential from .env
    expect(spotifyClientId).not.toContain('encrypted:');

    // Ensure it's NOT a base64-encoded encrypted string
    expect(String(spotifyClientId)).not.toMatch(/^[A-Za-z0-9+/=]{50,}$/);
  });

  it('should use test base URL', () => {
    const baseUrl = inject('baseUrl');

    // Verify it's the test mock value
    expect(baseUrl).toBe('http://localhost:3000');

    // Should be a valid URL
    expect(String(baseUrl)).toMatch(/^https?:\/\//);
  });

  it('should have consistent test values across test runs', () => {
    const spotifyClientId = inject('spotifyClientId');
    const baseUrl = inject('baseUrl');

    // These should always be the same predictable test values
    // (not dependent on .env file or environment)
    expect(spotifyClientId).toEqual('test-spotify-client-id');
    expect(baseUrl).toEqual('http://localhost:3000');
  });
});

// Performance testing (v4 enhancement)
describe('Performance Tests', () => {
  it('should complete within performance budget', async () => {
    const start = performance.now();

    // Simulate some work
    await new Promise((resolve) => setTimeout(resolve, 100));

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(200); // Should complete within 200ms
  });
});

// Note: Use 'vitest bench' command to run benchmark tests
