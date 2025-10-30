'use client';

import { useEffect, useState } from 'react';
import Toast from '../ui/Toast';

const OLD_DOMAIN = 'stm.jermainesizemore.com';
const NEW_DOMAIN = 'tm.jermainesizemore.com';

// Extend Navigator type for iOS standalone mode
interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}

export function DomainMigrationHandler() {
  const [showMigrationNotice, setShowMigrationNotice] = useState(false);
  const [migrationMessage, setMigrationMessage] = useState('');

  useEffect(() => {
    // Check if user is on old domain
    if (globalThis.window !== undefined && globalThis.location.hostname === OLD_DOMAIN) {
      setMigrationMessage(
        `This app has moved to ${NEW_DOMAIN}. Redirecting you to the new domain...`
      );
      setShowMigrationNotice(true);

      // Redirect after 3 seconds
      setTimeout(() => {
        globalThis.location.href = `https://${NEW_DOMAIN}${globalThis.location.pathname}${globalThis.location.search}`;
      }, 3000);
    }

    // Listen for service worker migration messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'DOMAIN_MIGRATION') {
          setMigrationMessage(event.data.message);
          setShowMigrationNotice(true);

          // Redirect to new domain after 3 seconds
          setTimeout(() => {
            globalThis.location.href = `https://${NEW_DOMAIN}${globalThis.location.pathname}${globalThis.location.search}`;
          }, 3000);
        }
      });
    }

    // Check if this is a PWA installed from old domain
    const isStandalone = globalThis.window.matchMedia('(display-mode: standalone)').matches;
    const isPWA = (navigator as NavigatorStandalone).standalone === true || isStandalone;

    if (isPWA) {
      // Check localStorage for migration flag
      const lastDomain = localStorage.getItem('app_domain');

      if (lastDomain === OLD_DOMAIN && globalThis.location.hostname === OLD_DOMAIN) {
        setMigrationMessage(
          `Please reinstall this app from ${NEW_DOMAIN} for the best experience.`
        );
        setShowMigrationNotice(true);
      }

      // Update stored domain
      localStorage.setItem('app_domain', globalThis.location.hostname);
    }
  }, []);

  if (!showMigrationNotice) return null;

  return (
    <Toast
      message={migrationMessage}
      type="warning"
      onDismiss={() => setShowMigrationNotice(false)}
    />
  );
}
