// Utility functions and objects for reusable icon and text styles
import { SPOTIFY_BLACK, SPOTIFY_GREEN, SPOTIFY_LIGHT_GRAY } from './branding';

/**
 * Base style for icons (Spotify light gray, with color transition).
 */
export const baseIconStyle = {
  color: SPOTIFY_LIGHT_GRAY,
  transition: 'color 0.3s',
};

/**
 * Hover style for icons (Spotify green).
 */
export const hoverIconStyle = {
  color: SPOTIFY_GREEN,
};

/**
 * Base style for text (Spotify light gray, with color transition).
 */
export const baseTextStyle = {
  color: SPOTIFY_LIGHT_GRAY,
  transition: 'color 0.3s',
};

/**
 * Hover style for text (Spotify green).
 */
export const hoverTextStyle = {
  color: SPOTIFY_GREEN,
};

/**
 * Returns the icon style object based on hover state.
 * @param isHover - Whether the icon is hovered.
 * @returns The style object for the icon.
 */
export function getIconStyle(isHover: boolean) {
  return {
    color: isHover ? SPOTIFY_GREEN : SPOTIFY_LIGHT_GRAY,
    transition: 'color 0.3s',
  };
}

/**
 * Returns the text style object based on hover and selection state.
 * @param isHover - Whether the text is hovered.
 * @param isSelected - Whether the text is selected (optional).
 * @returns The style object for the text.
 */
export function getTextStyle(isHover: boolean, isSelected?: boolean) {
  return {
    color: isHover || isSelected ? SPOTIFY_GREEN : SPOTIFY_LIGHT_GRAY,
    transition: 'color 0.3s',
  };
}

/**
 * Returns the radio button text style object based on hover and selected states.
 * @param isHovered - Whether the radio button is hovered.
 * @param isSelected - Whether the radio button is selected.
 * @returns The style object for the radio button text.
 */
export function getRadioTextStyle(isHovered: boolean, isSelected: boolean) {
  return {
    color: isSelected ? SPOTIFY_BLACK : isHovered ? SPOTIFY_GREEN : SPOTIFY_LIGHT_GRAY,
    transition: 'color 0.3s',
  };
}

/**
 * Returns the time range button text style object based on hover and selected states.
 * @param isHovered - Whether the button is hovered.
 * @param isSelected - Whether the button is selected.
 * @returns The style object for the time range button text.
 */
export function getTimeRangeButtonTextStyle(isHovered: boolean, isSelected: boolean) {
  return {
    color: isSelected ? SPOTIFY_BLACK : isHovered ? SPOTIFY_GREEN : SPOTIFY_LIGHT_GRAY,
    transition: 'color 0.3s',
  };
}
