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
    accent: '#7c3aed',
    accentForeground: '#ffffff',
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
    accent: '#8b5cf6',
    accentForeground: '#ffffff',
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

/**
 * Concrete gradient stop-pairs for `expo-linear-gradient`, which needs real
 * color arrays rather than utility classes. Vivid and theme-independent by
 * design — a gradient here communicates energy/state, so it stays saturated in
 * both light and dark. Consumed by `Progress` and themed surfaces, etc.
 */
export const gradients = {
  /** Signature: blue → violet. */
  primary: ['#208aef', '#7c3aed'],
  /** Playful: violet → pink. */
  accent: ['#8b5cf6', '#ec4899'],
  /** Positive: emerald → cyan. */
  success: ['#10b981', '#22d3ee'],
  /** Energetic/alert: rose → amber. */
  danger: ['#f43f5e', '#f59e0b'],
} as const;

export type GradientName = keyof typeof gradients;

/** Concrete colors for the active color scheme. */
export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? palette.dark : palette.light;
}
