import { signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useRef, useEffect } from 'react';
import ActionButton from './ActionButton';

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
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setDropdownOpen(false);
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleLogout = async () => {
		try {
			sessionStorage.removeItem('sign_in_process_started'); // Clear sign-in attempt flag
			// Clear any additional auth-related localStorage/sessionStorage
			localStorage.removeItem('spotify-auth-state');
			sessionStorage.removeItem('spotify-auth-state');

			// Call our API to clear cookies
			await fetch('/api/auth/clear-session');

			// Sign out and redirect to thank you page
			await signOut({
				redirect: false,
				callbackUrl: '/thank-you',
			});

			router.push('/thank-you');
		} catch (error) {
			console.error('Error during logout:', error);
			// Fallback to direct redirect in case of error
			window.location.href = '/thank-you';
		}
	};

	return (
		<nav className="bg-spotify-dark-gray px-6 py-4 border-b border-spotify-medium-gray">
			<div className="container mx-auto grid grid-cols-1 md:grid-cols-3 items-center">
				{/* Left navigation section */}
				<div className="flex items-center justify-center md:justify-start gap-6 mb-4 md:mb-0 order-2 md:order-1">
					<Link
						href="/dashboard"
						className={`text-sm font-medium ${
							pathname === '/dashboard'
								? 'text-spotify-green'
								: 'text-spotify-light-gray hover:text-spotify-white'
						}`}
					>
						Dashboard
					</Link>
					<Link
						href="/history"
						className={`text-sm font-medium ${
							pathname === '/history'
								? 'text-spotify-green'
								: 'text-spotify-light-gray hover:text-spotify-white'
						}`}
					>
						History
					</Link>
					<Link
						href="/playlist-generator"
						className={`text-sm font-medium ${
							pathname === '/playlist-generator'
								? 'text-spotify-green'
								: 'text-spotify-light-gray hover:text-spotify-white'
						}`}
					>
						Playlist Generator
					</Link>
				</div>

				{/* Center logo section */}
				<div className="flex items-center justify-center order-1 md:order-2">
					<Link href="/dashboard" className="flex items-center gap-3">
						<Image
							src="/spotify-icon.png"
							alt="Spotify Logo"
							width={64}
							height={64}
							className="drop-shadow-lg"
						/>
						<h1 className="text-xl font-bold text-spotify-green">
							Time Machine
						</h1>
					</Link>
				</div>

				{/* Right user section */}
				<div className="flex items-center justify-center md:justify-end gap-4 mb-4 md:mb-0 order-3 relative">
					<div
						className="flex items-center gap-2 cursor-pointer relative"
						onClick={() => setDropdownOpen(!dropdownOpen)}
						ref={dropdownRef}
					>
						{user?.image && (
							<Image
								src={user.image}
								alt="Profile"
								width={32}
								height={32}
								className="rounded-full"
							/>
						)}
						<span className="text-spotify-light-gray hidden md:inline">
							{user?.name}
						</span>

						{/* Dropdown Menu */}
						{dropdownOpen && (
							<div className="absolute top-full right-0 mt-2 bg-spotify-dark-gray border border-spotify-medium-gray shadow-lg rounded-md px-2 py-1 z-50 text-center">
								<ActionButton onClick={handleLogout} variant="primary">
									Logout
								</ActionButton>
							</div>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}
