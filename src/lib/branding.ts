// Centralized Spotify brand tokens and usage notes for the project.
// Keep hex values in sync with the official Spotify Design Guidelines:
// https://developer.spotify.com/documentation/design

export const SPOTIFY_GREEN = '#1DB954';
export const SPOTIFY_BLACK = '#191414';
export const SPOTIFY_DARK_GRAY = '#121212';
export const SPOTIFY_MEDIUM_GRAY = '#535353';
export const SPOTIFY_LIGHT_GRAY = '#b3b3b3';

// Text color to use on top of the accent (green) per design guidance.
export const TEXT_ON_ACCENT = SPOTIFY_BLACK;

// A small mapping that's convenient for imports elsewhere.
export const BRAND = {
	SPOTIFY_GREEN,
	SPOTIFY_BLACK,
	SPOTIFY_DARK_GRAY,
	SPOTIFY_MEDIUM_GRAY,
	SPOTIFY_LIGHT_GRAY,
	TEXT_ON_ACCENT,
};

// Notes:
// - Use these tokens for any programmatic color needs (JS/TS). Prefer CSS variables
//   (defined in `src/app/globals.css`) for CSS rules and components where possible.
// - If you add new brand assets (logos, marks), review Spotify's logo and trademark
//   usage rules in the linked guidelines and add platform-appropriate files under
//   `public/` with clear naming and licensing notes.
