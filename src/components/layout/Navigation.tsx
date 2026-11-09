import { Dropdown } from 'flowbite-react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { HiOutlineChartBar, HiOutlineLogout, HiOutlineTrash } from 'react-icons/hi';
import Toast from '@/ui/Toast';
import ActionButton from '@/ui/ActionButton';
import { getTextStyle } from '@/lib/styleUtils';
import { clearAllCachesOnlyComplete } from '@/lib/cacheUtils';

interface NavigationProps {
  user?:
    | {
        name?: string | null;
        image?: string | null;
      }
    | null
    | undefined;
}

export default function Navigation({ user }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  const handleClearCache = async () => {
    try {
      // Clear all caches without page refresh (we want to show toast first)
      await clearAllCachesOnlyComplete();

      setToast({
        message: `Cache cleared successfully!`,
        type: 'warning',
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
      // Show error toast
      setToast({
        message: 'Failed to clear cache. Please try again.',
        type: 'error',
      });
    }
  };

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem('sign_in_process_started');
      localStorage.removeItem('spotify-auth-state');
      sessionStorage.removeItem('spotify-auth-state');

      await fetch('/api/auth/clear-session');

      await signOut({
        redirect: false,
        callbackUrl: '/thank-you',
      });

      router.push('/thank-you');
    } catch (error) {
      console.error('Error during logout:', error);
      window.location.href = '/thank-you';
    }
  };

  const [hovered, setHovered] = useState<string | null>(null);

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'History', href: '/history' },
    { label: 'Playlist Generator', href: '/playlist-generator' },
  ];

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}

      <nav className="bg-spotify-dark-gray px-6 py-4 border-b border-spotify-medium-gray">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 items-center">
          {/* Left navigation section */}
          <div className="flex items-center justify-center md:justify-start gap-6 mb-4 md:mb-0 order-2 md:order-1">
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className={`text-sm font-medium transition-colors`}
                style={getTextStyle(hovered === label, pathname === href)}
                onMouseOver={() => setHovered(label)}
                onMouseOut={() => setHovered(null)}
                onFocus={() => setHovered(label)}
                onBlur={() => setHovered(null)}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Center logo section */}
          <div className="flex items-center justify-center order-1 md:order-2">
            <Link href="/dashboard" className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-spotify-green">Jermaine&apos;s</h1>
              <Image
                src="/spotify-icon.png"
                alt="Spotify Logo"
                width={64}
                height={64}
                className="drop-shadow-lg"
              />
              <h1 className="text-xl font-bold text-spotify-green">Time Machine</h1>
            </Link>
          </div>

          {/* Right user section */}
          <div className="flex items-center justify-center md:justify-end gap-4 mb-4 md:mb-0 order-3">
            <Dropdown
              arrowIcon={false}
              inline
              label={
                <div className="flex items-center gap-2 cursor-pointer">
                  {user?.image && (
                    <Image
                      src={user.image}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <span
                    className="text-spotify-light-gray hidden md:inline"
                    style={getTextStyle(hovered === 'UserDropdown')}
                    onMouseOver={() => setHovered('UserDropdown')}
                    onMouseOut={() => setHovered(null)}
                    onFocus={() => setHovered('UserDropdown')}
                    onBlur={() => setHovered(null)}
                  >
                    {user?.name}
                  </span>
                </div>
              }
              className="!bg-spotify-dark-gray !border !border-spotify-medium-gray/30 !shadow-lg !rounded-md !origin-top-right"
            >
              <div className="flex flex-col gap-3 p-4 min-w-[180px]">
                <Link href="/storage-monitor">
                  <ActionButton variant="secondary" className="w-full justify-start">
                    <span className="flex items-center gap-2">
                      <HiOutlineChartBar className="h-4 w-4" />
                      Storage Monitor
                    </span>
                  </ActionButton>
                </Link>

                <ActionButton
                  onClick={handleClearCache}
                  variant="secondary"
                  className="w-full justify-start"
                >
                  <span className="flex items-center gap-2">
                    <HiOutlineTrash className="h-4 w-4" />
                    Clear Cache
                  </span>
                </ActionButton>

                <ActionButton
                  onClick={handleLogout}
                  variant="primary"
                  className="w-full justify-start"
                >
                  <span className="flex items-center gap-2">
                    <HiOutlineLogout className="h-4 w-4" />
                    Logout
                  </span>
                </ActionButton>
              </div>
            </Dropdown>
          </div>
        </div>
      </nav>
    </>
  );
}
