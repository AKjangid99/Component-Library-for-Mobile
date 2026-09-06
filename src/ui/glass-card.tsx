import { BlurView } from 'expo-blur';
import { StyleSheet, Text, useColorScheme, View, type ViewProps } from 'react-native';

import { cn } from '@/ui/lib/cn';

/**
 * An elevated surface with two personalities:
 *  - `glass` — a real frosted blur (`expo-blur`) under a translucent tint and a
 *    hairline highlight border. This is the bold choice; it looks like frosted
 *    material, not a flat card with a grey shadow.
 *  - `neumorphic` — a soft extruded surface built from paired light/dark drop
 *    shadows so it appears pressed out of the background.
 *
 * Header (title + subtitle) and footer are optional slots; children are free.
 */
export interface GlassCardProps extends ViewProps {
  variant?: 'glass' | 'neumorphic';
  title?: string;
  subtitle?: string;
  /** Content rendered in the footer region, divided from the body. */
  footer?: React.ReactNode;
  /** Blur strength for the `glass` variant (0–100). */
  intensity?: number;
  className?: string;
  children?: React.ReactNode;
}

export function GlassCard({
  variant = 'glass',
  title,
  subtitle,
  footer,
  intensity = 40,
  className,
  children,
  ...rest
}: GlassCardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const header =
    title || subtitle ? (
      <View className="gap-1 pb-3">
        {title ? <Text className="text-lg font-semibold text-foreground">{title}</Text> : null}
        {subtitle ? <Text className="text-sm text-muted-foreground">{subtitle}</Text> : null}
      </View>
    ) : null;

  const body = (
    <>
      {header}
      <View className="gap-2">{children}</View>
      {footer ? (
        <View className="mt-3 flex-row items-center gap-2 border-t border-border/60 pt-3">
          {footer}
        </View>
      ) : null}
    </>
  );

  if (variant === 'neumorphic') {
    // Two offset shadow layers approximate a dual light source: a light highlight
    // top-left and a soft shadow bottom-right, so the surface reads as extruded.
    const surface = isDark ? '#1c1d20' : '#eceef2';
    return (
      <View className={cn('rounded-3xl', className)} {...rest}>
        <View
          style={[
            styles.neuLight,
            { backgroundColor: surface, shadowColor: isDark ? '#3a3d42' : '#ffffff' },
          ]}
        />
        <View
          style={[
            styles.neuDark,
            { backgroundColor: surface, shadowColor: isDark ? '#000000' : '#b9bec7' },
          ]}
        />
        <View className="rounded-3xl p-5" style={{ backgroundColor: surface }}>
          {body}
        </View>
      </View>
    );
  }

  return (
    <View
      className={cn('border border-white/25', className)}
      // Single source of truth for the corner radius, applied inline: the
      // BlurView + tint fills below repeat the same radius so no square
      // corner can bleed past the edge (backdrop-filter layers don't always
      // clip cleanly to a class-only radius on web). Override via `style`.
      style={{ borderRadius: GLASS_RADIUS, overflow: 'hidden' }}
      {...rest}>
      <BlurView
        intensity={intensity}
        tint={isDark ? 'dark' : 'light'}
        style={[StyleSheet.absoluteFill, { borderRadius: GLASS_RADIUS, overflow: 'hidden' }]}
      />
      {/* Translucent tint so content stays legible over busy backgrounds. */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: GLASS_RADIUS, backgroundColor: isDark ? '#ffffff14' : '#ffffff40' },
        ]}
      />
      <View className="p-5">{body}</View>
    </View>
  );
}

const GLASS_RADIUS = 24;

const styles = StyleSheet.create({
  neuLight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    shadowOffset: { width: -6, height: -6 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
  },
  neuDark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
  },
});
