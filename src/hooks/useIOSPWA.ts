'use client';

import { useEffect, useState } from 'react';

interface IOSPWAState {
  isIOS: boolean;
  isStandalone: boolean;
  canInstall: boolean;
  installMethod: 'native' | 'instructions' | 'none';
}

export function useIOSPWA(): IOSPWAState {
  const [state, setState] = useState<IOSPWAState>({
    isIOS: false,
    isStandalone: false,
    canInstall: false,
    installMethod: 'none',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect iOS devices
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    // Check if running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    // iOS can install but through manual instructions
    const canInstall = isIOS && !isStandalone;

    // iOS uses instruction-based install
    const installMethod: 'native' | 'instructions' | 'none' =
      isIOS && !isStandalone ? 'instructions' : 'none';

    setState({
      isIOS,
      isStandalone,
      canInstall,
      installMethod,
    });

    // Listen for display mode changes (when app gets installed)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setState((prev) => ({
        ...prev,
        isStandalone: e.matches,
        canInstall: isIOS && !e.matches,
        installMethod: isIOS && !e.matches ? 'instructions' : 'none',
      }));
    };

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return state;
}

// Utility functions for iOS PWA behavior
export const iOSPWAUtils = {
  // Check if user is on iOS Safari (not Chrome or other browsers)
  isSafariOnIOS(): boolean {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua);
    const safari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua);
    return iOS && safari;
  },

  // Check if PWA features are fully supported
  supportsPWAFeatures(): boolean {
    return 'serviceWorker' in navigator && 'caches' in window;
  },

  // Get iOS version for feature detection
  getIOSVersion(): number | null {
    if (typeof window === 'undefined') return null;
    const match = navigator.userAgent.match(/OS (\d+)_/);
    return match ? parseInt(match[1]) : null;
  },

  // Check if iOS supports specific PWA features
  supportsStandaloneMode(): boolean {
    const version = this.getIOSVersion();
    return version ? version >= 11 : false; // iOS 11.3+ has better PWA support
  },

  // Provide install instructions based on iOS version
  getInstallInstructions(): string[] {
    const version = this.getIOSVersion();
    if (!version) return [];

    if (version >= 13) {
      return [
        'Tap the Share button in Safari',
        'Scroll down and tap "Add to Home Screen"',
        'Tap "Add" to install the app',
      ];
    } else {
      return [
        'Tap the Share button at the bottom',
        'Find "Add to Home Screen" in the menu',
        'Tap "Add" to install',
      ];
    }
  },
};
