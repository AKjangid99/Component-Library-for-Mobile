import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { useThemeColors } from './theme';

/**
 * Global accent customization.
 *
 * Wrap any subtree (e.g. the component gallery) in `CustomizationProvider`,
 * then let the user pick an accent. Components opt in explicitly via the
 * `color` prop — pass `useAccent()` / `resolvedAccent` into it — so themed
 * previews update live without disturbing fixed-variant showcases.
 *
 * Outside a provider the hooks gracefully fall back to the theme primary,
 * so library components are safe to render anywhere.
 */

export const ACCENT_SWATCHES = [
  '#208aef', // brand blue
  '#7c3aed', // violet
  '#30a46c', // emerald
  '#e5484d', // red
  '#f5a524', // amber
  '#ec4899', // pink
  '#0ea5e9', // sky
  '#111827', // ink
] as const;

export type AccentSwatch = (typeof ACCENT_SWATCHES)[number];

type CustomizationValue = {
  /** User-picked accent, or `null` for "Auto" (follow the theme primary). */
  accent: string | null;
  setAccent: (color: string | null) => void;
  reset: () => void;
  /** Concrete color to render: the pick, or the theme primary when Auto. */
  resolvedAccent: string;
  isAuto: boolean;
};

const CustomizationContext = createContext<CustomizationValue | null>(null);

export function CustomizationProvider({
  children,
  initialAccent = null,
}: {
  children: ReactNode;
  initialAccent?: string | null;
}) {
  const colors = useThemeColors();
  const [accent, setAccent] = useState<string | null>(initialAccent);

  const value = useMemo<CustomizationValue>(
    () => ({
      accent,
      setAccent,
      reset: () => setAccent(null),
      resolvedAccent: accent ?? colors.primary,
      isAuto: accent === null,
    }),
    [accent, colors.primary],
  );

  return <CustomizationContext.Provider value={value}>{children}</CustomizationContext.Provider>;
}

/** Read/write the accent customization; falls back to theme primary outside a provider. */
export function useCustomization(): CustomizationValue {
  const ctx = useContext(CustomizationContext);
  const colors = useThemeColors();
  const fallback = useMemo<CustomizationValue>(
    () => ({
      accent: null,
      setAccent: () => {},
      reset: () => {},
      resolvedAccent: colors.primary,
      isAuto: true,
    }),
    [colors.primary],
  );
  if (ctx) return ctx;
  return fallback;
}

/**
 * Resolve a component `color` prop against the customization.
 * Explicit prop wins; otherwise the user's accent; otherwise theme primary.
 */
export function useAccent(override?: string): string {
  const { resolvedAccent } = useCustomization();
  return override ?? resolvedAccent;
}
