/**
 * Browser Tests using Vitest v4 Browser Mode
 * These tests run in a real browser environment
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

// Create a mock handler to test click behavior
const mockNavigate = vi.fn();

const handleClick = () => {
  // Call the mock function instead of navigating
  mockNavigate('/api/auth/signin/spotify');
};

// Mock a simple component for browser testing
function MockSpotifySignInButton() {
  return (
    <button
      onClick={handleClick}
      className="bg-spotify-green hover:bg-green-500 text-black font-bold py-2 px-4 rounded"
    >
      Sign in with Spotify
    </button>
  );
}

function MockPlaylistCard({ name, trackCount }: { name: string; trackCount: number }) {
  return (
    <div className="bg-spotify-dark-gray rounded-lg p-4">
      <h3 className="text-spotify-white font-semibold">{name}</h3>
      <p className="text-spotify-light-gray text-sm">{trackCount} tracks</p>
      <button className="mt-2 bg-spotify-green text-black px-3 py-1 rounded text-sm">Play</button>
    </div>
  );
}

describe('Browser Environment Tests', () => {
  beforeEach(() => {
    // Reset DOM between tests
    document.body.innerHTML = '';
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should have browser globals available', () => {
    expect(globalThis).toBeDefined();
    expect(document).toBeDefined();
    expect(navigator).toBeDefined();
    expect(location).toBeDefined();
  });

  it('should support localStorage', () => {
    localStorage.setItem('test-key', 'test-value');
    expect(localStorage.getItem('test-key')).toBe('test-value');

    localStorage.removeItem('test-key');
    expect(localStorage.getItem('test-key')).toBeNull();
  });

  it('should support sessionStorage', () => {
    sessionStorage.setItem('session-key', 'session-value');
    expect(sessionStorage.getItem('session-key')).toBe('session-value');

    sessionStorage.clear();
    expect(sessionStorage.getItem('session-key')).toBeNull();
  });

  it('should handle window resize events', async () => {
    let resizeEventFired = false;

    const handleResize = () => {
      resizeEventFired = true;
    };

    globalThis.addEventListener('resize', handleResize);

    // Trigger resize event
    globalThis.dispatchEvent(new Event('resize'));

    expect(resizeEventFired).toBe(true);

    globalThis.removeEventListener('resize', handleResize);
  });
});

describe('Component Browser Tests', () => {
  beforeEach(() => {
    // Clear mock calls before each test
    mockNavigate.mockClear();
    // Clear DOM to prevent element duplication
    document.body.innerHTML = '';
  });

  it('should render Spotify sign-in button', () => {
    render(<MockSpotifySignInButton />);

    const button = screen.getByRole('button', { name: /sign in with spotify/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-spotify-green');
  });

  it('should handle button click interaction', async () => {
    const user = userEvent.setup();

    render(<MockSpotifySignInButton />);

    const button = screen.getByRole('button', { name: /sign in with spotify/i });

    // Verify button exists and has correct styling
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-spotify-green');

    // Click the button
    await user.click(button);

    // Verify the navigation function was called with correct path
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/api/auth/signin/spotify');
  });

  it('should render playlist card with correct information', () => {
    render(<MockPlaylistCard name="My Playlist" trackCount={25} />);

    expect(screen.getByText('My Playlist')).toBeInTheDocument();
    expect(screen.getByText('25 tracks')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
  });
});

describe('CSS and Styling Tests', () => {
  it('should apply Tailwind classes correctly', () => {
    render(<MockPlaylistCard name="Test Playlist" trackCount={10} />);

    const card = screen.getByText('Test Playlist').closest('div');
    expect(card).toHaveClass('bg-spotify-dark-gray', 'rounded-lg', 'p-4');
  });

  it('should support CSS custom properties', () => {
    // Set a CSS custom property
    document.documentElement.style.setProperty('--test-color', '#1db954');

    const computedValue = getComputedStyle(document.documentElement).getPropertyValue(
      '--test-color'
    );

    expect(computedValue).toBe('#1db954');
  });
});

describe('Media Queries and Responsive Design', () => {
  it('should detect mobile viewport', () => {
    // Test matchMedia functionality
    const mobileQuery = '(max-width: 768px)';
    const mediaQuery = globalThis.matchMedia(mobileQuery);

    expect(mediaQuery).toBeDefined();
    expect(typeof mediaQuery.matches).toBe('boolean');
  });

  it('should handle orientation changes', () => {
    let orientationChanged = false;

    const handleOrientationChange = () => {
      orientationChanged = true;
    };

    globalThis.addEventListener('orientationchange', handleOrientationChange);
    globalThis.dispatchEvent(new Event('orientationchange'));

    expect(orientationChanged).toBe(true);

    globalThis.removeEventListener('orientationchange', handleOrientationChange);
  });
});

describe('Web APIs', () => {
  it('should support Intersection Observer', () => {
    const mockElement = document.createElement('div');
    document.body.appendChild(mockElement);

    const observer = new IntersectionObserver((_entries) => {
      // Mock callback
    });

    expect(observer).toBeInstanceOf(IntersectionObserver);
    observer.observe(mockElement);
    observer.disconnect();
  });

  it('should support Resize Observer', () => {
    const mockElement = document.createElement('div');
    document.body.appendChild(mockElement);

    const observer = new ResizeObserver((_entries) => {
      // Mock callback
    });

    expect(observer).toBeInstanceOf(ResizeObserver);
    observer.observe(mockElement);
    observer.disconnect();
  });

  it('should support Web Audio API basics', () => {
    if ('AudioContext' in globalThis || 'webkitAudioContext' in globalThis) {
      const AudioContextClass = globalThis.AudioContext || (globalThis as any).webkitAudioContext;
      const audioContext = new AudioContextClass();

      expect(audioContext).toBeDefined();
      expect(typeof audioContext.createOscillator).toBe('function');

      audioContext.close();
    } else {
      // Fallback for environments without Web Audio API
      expect(true).toBe(true);
    }
  });
});
