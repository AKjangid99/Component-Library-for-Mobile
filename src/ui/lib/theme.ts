import { useColorScheme } from 'react-native';

/**
 * Concrete color values, mirroring the CSS variables in `src/global.css`.
 *
 * NativeWind drives styling through `className`, but some APIs need a real
 * color value rather than a class — e.g. `expo-symbols` tint, Reanimated color
 * interpolations, and native component props. Read those from here so they stay
 * in sync with the token palette. Keep this table and `global.css` aligned.
 */
export const palette = {
  light: {
    background: '#ffffff',
    foreground: '#000000',
    card: '#f0f0f3',
    cardForeground: '#000000',
    muted: '#f0f0f3',
    mutedForeground: '#60646c',
    secondary: '#e0e1e6',
    secondaryForeground: '#000000',
    border: '#e0e1e6',
    input: '#e0e1e6',
    ring: '#208aef',
    primary: '#208aef',
    primaryForeground: '#ffffff',
    destructive: '#e5484d',
    destructiveForeground: '#ffffff',
    success: '#30a46c',
    successForeground: '#ffffff',
    warning: '#f5a524',
    warningForeground: '#1a1400',
  },
  dark: {
    background: '#000000',
    foreground: '#ffffff',
    card: '#212225',
    cardForeground: '#ffffff',
    muted: '#212225',
    mutedForeground: '#b0b4ba',
    secondary: '#2e3135',
    secondaryForeground: '#ffffff',
    border: '#2e3135',
    input: '#2e3135',
    ring: '#3c87f7',
    primary: '#3c87f7',
    primaryForeground: '#ffffff',
    destructive: '#ff6369',
    destructiveForeground: '#ffffff',
    success: '#3dd68c',
    successForeground: '#052e16',
    warning: '#ffc53d',
    warningForeground: '#1a1400',
  },
} as const;

export type ThemeColors = { [K in keyof (typeof palette)['light']]: string };

/** Concrete colors for the active color scheme. */
export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? palette.dark : palette.light;
}
