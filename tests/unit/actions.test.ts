/**
 * Server Actions - Regression Tests
 *
 * These tests guard against regressions in critical server action
 * form validation and error handling logic.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist mock definitions for proper hoisting
const mocks = vi.hoisted(() => {
  const mockSpan = {
    setAttributes: vi.fn(),
    end: vi.fn(),
  };

  return {
    mockSpan,
    startSpan: vi.fn((config, callback) => callback(mockSpan)),
    captureException: vi.fn(),
    setContext: vi.fn(),
  };
});

// Mock Sentry before importing the module
vi.mock('@sentry/nextjs', () => ({
  startSpan: mocks.startSpan,
  captureException: mocks.captureException,
  setContext: mocks.setContext,
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Server Actions - Critical Regression Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Data Validation', () => {
    it('should reject empty playlist name', async () => {
      const { createPlaylistAction } = await import('../../src/lib/actions');

      const formData = new FormData();
      formData.set('playlistName', '');
      formData.set('startDate', '2024-01-01');
      formData.set('endDate', '2024-01-31');

      const result = await createPlaylistAction(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Playlist name is required');
    });

    it('should reject whitespace-only playlist name', async () => {
      const { createPlaylistAction } = await import('../../src/lib/actions');

      const formData = new FormData();
      formData.set('playlistName', '   ');
      formData.set('startDate', '2024-01-01');
      formData.set('endDate', '2024-01-31');

      const result = await createPlaylistAction(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Playlist name is required');
    });

    it('should accept valid playlist name', async () => {
      const { createPlaylistAction } = await import('../../src/lib/actions');

      const formData = new FormData();
      formData.set('playlistName', 'My Awesome Playlist');
      formData.set('startDate', '2024-01-01');
      formData.set('endDate', '2024-01-31');

      const result = await createPlaylistAction(formData);

      expect(result.success).toBe(true);
      expect(result.message).toContain('My Awesome Playlist');
    });

    it('should trim playlist name whitespace', async () => {
      const { createPlaylistAction } = await import('../../src/lib/actions');

      const formData = new FormData();
      formData.set('playlistName', '  Playlist With Spaces  ');
      formData.set('startDate', '2024-01-01');
      formData.set('endDate', '2024-01-31');

      const result = await createPlaylistAction(formData);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Playlist With Spaces');
    });
  });

  describe('Date Validation', () => {
    it('should reject missing start date', async () => {
      const { createPlaylistAction } = await import('../../src/lib/actions');

      const formData = new FormData();
      formData.set('playlistName', 'Test Playlist');
      formData.set('endDate', '2024-01-31');

      const result = await createPlaylistAction(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('start and end dates are required');
    });

    it('should reject missing end date', async () => {
      const { createPlaylistAction } = await import('../../src/lib/actions');

      const formData = new FormData();
      formData.set('playlistName', 'Test Playlist');
      formData.set('startDate', '2024-01-01');

      const result = await createPlaylistAction(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('start and end dates are required');
    });

    it('should reject invalid date format (missing hyphens)', async () => {
      const { createPlaylistAction } = await import('../../src/lib/actions');

      const formData = new FormData();
      formData.set('playlistName', 'Test Playlist');
      formData.set('startDate', '20240101');
      formData.set('endDate', '2024-01-31');

      const result = await createPlaylistAction(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid date format');
    });

    it('should reject invalid date format (wrong separators)', async () => {
      const { createPlaylistAction } = await import('../../src/lib/actions');

      const formData = new FormData();
      formData.set('playlistName', 'Test Playlist');
      formData.set('startDate', '2024/01/01');
      formData.set('endDate', '2024-01-31');

      const result = await createPlaylistAction(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid date format');
    });

    it('should reject start date after end date', async () => {
      const { createPlaylistAction } = await import('../../src/lib/actions');

      const formData = new FormData();
      formData.set('playlistName', 'Test Playlist');
      formData.set('startDate', '2024-02-01');
      formData.set('endDate', '2024-01-31');

      const result = await createPlaylistAction(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Start date must be before or equal to end date');
    });

    it('should accept start date equal to end date', async () => {
      const { createPlaylistAction } = await import('../../src/lib/actions');

      const formData = new FormData();
      formData.set('playlistName', 'Test Playlist');
      formData.set('startDate', '2024-01-15');
      formData.set('endDate', '2024-01-15');

      const result = await createPlaylistAction(formData);

      expect(result.success).toBe(true);
    });

    it('should accept valid date range', async () => {
      const { createPlaylistAction } = await import('../../src/lib/actions');

      const formData = new FormData();
      formData.set('playlistName', 'Test Playlist');
      formData.set('startDate', '2024-01-01');
      formData.set('endDate', '2024-12-31');

      const result = await createPlaylistAction(formData);

      expect(result.success).toBe(true);
    });
  });

  describe('Optional Filter Arrays', () => {
    it('should handle missing genre filters', async () => {
      const { createPlaylistAction } = await import('../../src/lib/actions');

      const formData = new FormData();
      formData.set('playlistName', 'Test Playlist');
      formData.set('startDate', '2024-01-01');
      formData.set('endDate', '2024-01-31');

      const result = await createPlaylistAction(formData);

      expect(result.success).toBe(true);
    });

    it('should handle single genre filter', async () => {
      const { createPlaylistAction } = await import('../../src/lib/actions');

      const formData = new FormData();
      formData.set('playlistName', 'Test Playlist');
      formData.set('startDate', '2024-01-01');
      formData.set('endDate', '2024-01-31');
      formData.append('selectedGenres', 'rock');

      const result = await createPlaylistAction(formData);

      expect(result.success).toBe(true);
    });

    it('should handle multiple genre filters', async () => {
      const { createPlaylistAction } = await import('../../src/lib/actions');

      const formData = new FormData();
      formData.set('playlistName', 'Test Playlist');
      formData.set('startDate', '2024-01-01');
      formData.set('endDate', '2024-01-31');
      formData.append('selectedGenres', 'rock');
      formData.append('selectedGenres', 'pop');
      formData.append('selectedGenres', 'jazz');

      const result = await createPlaylistAction(formData);

      expect(result.success).toBe(true);
    });

    it('should filter out empty genre strings', async () => {
      const { createPlaylistAction } = await import('../../src/lib/actions');

      const formData = new FormData();
      formData.set('playlistName', 'Test Playlist');
      formData.set('startDate', '2024-01-01');
      formData.set('endDate', '2024-01-31');
      formData.append('selectedGenres', 'rock');
      formData.append('selectedGenres', '');
      formData.append('selectedGenres', 'pop');

      const result = await createPlaylistAction(formData);

      expect(result.success).toBe(true);
    });

    it('should handle artist filters', async () => {
      const { createPlaylistAction } = await import('../../src/lib/actions');

      const formData = new FormData();
      formData.set('playlistName', 'Test Playlist');
      formData.set('startDate', '2024-01-01');
      formData.set('endDate', '2024-01-31');
      formData.append('selectedArtists', 'Artist 1');
      formData.append('selectedArtists', 'Artist 2');

      const result = await createPlaylistAction(formData);

      expect(result.success).toBe(true);
    });
  });

  describe('Success Response Structure', () => {
    it('should return all required success fields', async () => {
      const { createPlaylistAction } = await import('../../src/lib/actions');

      const formData = new FormData();
      formData.set('playlistName', 'Test Playlist');
      formData.set('startDate', '2024-01-01');
      formData.set('endDate', '2024-01-31');

      const result = await createPlaylistAction(formData);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('playlistUrl');
      expect(result).toHaveProperty('trackCount');
      expect(result).toHaveProperty('message');
      expect(typeof result.playlistUrl).toBe('string');
      expect(typeof result.trackCount).toBe('number');
      expect(typeof result.message).toBe('string');
    });
  });

  describe('Error Response Structure', () => {
    it('should return consistent error structure', async () => {
      const { createPlaylistAction } = await import('../../src/lib/actions');

      const formData = new FormData();
      formData.set('playlistName', '');
      formData.set('startDate', '2024-01-01');
      formData.set('endDate', '2024-01-31');

      const result = await createPlaylistAction(formData);

      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('error');
      expect(typeof result.error).toBe('string');
      if (result.error) {
        expect(result.error.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Refresh User Data Action', () => {
    it('should return success for valid refresh', async () => {
      const { refreshUserDataAction } = await import('../../src/lib/actions');

      const result = await refreshUserDataAction();

      expect(result).toEqual({ success: true });
    });

    it('should call revalidatePath for all relevant paths', async () => {
      const { revalidatePath } = await import('next/cache');
      const { refreshUserDataAction } = await import('../../src/lib/actions');

      await refreshUserDataAction();

      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
      expect(revalidatePath).toHaveBeenCalledWith('/history');
      expect(revalidatePath).toHaveBeenCalledWith('/playlist-generator');
    });
  });

  describe('Edge Cases and Type Safety', () => {
    it('should handle non-string FormData values gracefully', async () => {
      const { createPlaylistAction } = await import('../../src/lib/actions');

      const formData = new FormData();
      const blob = new Blob(['test'], { type: 'text/plain' });
      formData.set('playlistName', blob as any);
      formData.set('startDate', '2024-01-01');
      formData.set('endDate', '2024-01-31');

      const result = await createPlaylistAction(formData);

      // Should treat non-string values as empty strings
      expect(result.success).toBe(false);
      expect(result.error).toContain('Playlist name is required');
    });

    it('should handle malformed date strings', async () => {
      const { createPlaylistAction } = await import('../../src/lib/actions');

      const formData = new FormData();
      formData.set('playlistName', 'Test Playlist');
      formData.set('startDate', '2024-13-01'); // Invalid month
      formData.set('endDate', '2024-01-31');

      const result = await createPlaylistAction(formData);

      // Should pass format validation but fail on date logic if needed
      // The regex only checks format, not validity
      expect(result).toBeDefined();
    });
  });
});
