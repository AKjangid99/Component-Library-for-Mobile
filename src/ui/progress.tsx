import { cva } from 'class-variance-authority';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Text, View, type ViewProps } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { cn } from '@/ui/lib/cn';
import { gradients, type GradientName, useThemeColors } from '@/ui/lib/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const progressTrack = cva('w-full overflow-hidden rounded-full bg-muted', {
  variants: {
    size: {
      xs: 'h-1',
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4',
    },
  },
  defaultVariants: { size: 'sm' },
});

const progressIndicator = cva('h-full rounded-full', {
  variants: {
    variant: {
      default: 'bg-primary',
      success: 'bg-success',
      warning: 'bg-warning',
      destructive: 'bg-destructive',
      // Gradient fill is style-driven (LinearGradient), so no class needed.
      gradient: '',
    },
    striped: {
      true: 'opacity-90',
      false: '',
    },
  },
  defaultVariants: { variant: 'default' },
});

export type ProgressVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'destructive'
  /** Saturated gradient bar (see `gradient`). */
  | 'gradient'
  /** SVG ring with optional centered value. */
  | 'circular'
  /** Shimmering placeholder block. */
  | 'skeleton';

export type ProgressSize = 'xs' | 'sm' | 'md' | 'lg';

export type ProgressProps = ViewProps & {
  /** 0–100. Animated on change (bar + ring). */
  value?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  striped?: boolean;
  /** Gradient fill for `gradient` + `circular`. @default 'primary' */
  gradient?: GradientName;
  /** Ring diameter for `circular`. @default 64 */
  diameter?: number;
  /**
   * Stroke width for `circular`, bar height for linear variants
   * (overrides `size`).
   */
  thickness?: number;
  /** Bar: % label below. Ring: % centered inside. */
  showValue?: boolean;
  className?: string;
  indicatorClassName?: string;
  /**
   * Custom bar color (any hex). Overrides the variant fill (bar variants).
   * Tip: pass `useAccent()` / `resolvedAccent` for a live-themed bar.
   */
  color?: string;
  /** Custom track color. Defaults to the theme muted surface. */
  trackColor?: string;
  style?: ViewProps['style'];
  indicatorStyle?: ViewProps['style'];
};

const clamp = (n: number) => Math.max(0, Math.min(100, n));

const BAR_HEIGHT: Record<ProgressSize, number> = { xs: 4, sm: 8, md: 12, lg: 16 };

export function Progress({
  value = 0,
  size = 'sm',
  variant = 'default',
  striped,
  gradient = 'primary',
  diameter = 64,
  thickness,
  className,
  indicatorClassName,
  showValue,
  color,
  trackColor,
  style,
  indicatorStyle,
  ...rest
}: ProgressProps) {
  const colors = useThemeColors();
  const reduceMotion = useReducedMotion();
  const clamped = clamp(value);

  if (variant === 'skeleton') {
    return (
      <SkeletonBlock
        height={thickness ?? 16}
        reduceMotion={reduceMotion}
        className={className}
        style={style}
        {...rest}
      />
    );
  }

  if (variant === 'circular') {
    return (
      <CircularRing
        pct={clamped}
        gradient={gradient}
        diameter={diameter}
        thickness={thickness ?? 6}
        showValue={showValue}
        reduceMotion={reduceMotion}
        trackColor={trackColor ?? colors.secondary}
        textColor={colors.foreground}
        className={className}
        style={style}
        {...rest}
      />
    );
  }

  return (
    <LinearBar
      pct={clamped}
      size={size}
      variant={variant}
      striped={striped}
      gradient={gradient}
      height={thickness ?? BAR_HEIGHT[size]}
      showValue={showValue}
      reduceMotion={reduceMotion}
      color={color}
      trackColor={trackColor}
      className={className}
      indicatorClassName={indicatorClassName}
      style={style}
      indicatorStyle={indicatorStyle}
      {...rest}
    />
  );
}

/* ------------------------------- Linear bar ------------------------------- */

function LinearBar({
  pct,
  size,
  variant,
  striped,
  gradient,
  height,
  showValue,
  reduceMotion,
  color,
  trackColor,
  className,
  indicatorClassName,
  style,
  indicatorStyle,
  ...rest
}: {
  pct: number;
  size: ProgressSize;
  variant: 'default' | 'success' | 'warning' | 'destructive' | 'gradient';
  striped?: boolean;
  gradient: GradientName;
  height: number;
  showValue?: boolean;
  reduceMotion: boolean;
  color?: string;
  trackColor?: string;
  className?: string;
  indicatorClassName?: string;
  style?: ViewProps['style'];
  indicatorStyle?: ViewProps['style'];
} & ViewProps) {
  const progress = useSharedValue(pct);

  useEffect(() => {
    progress.value = reduceMotion ? pct : withTiming(pct, { duration: 400 });
  }, [pct, progress, reduceMotion]);

  const animatedWidth = useAnimatedStyle(() => ({ width: `${progress.value}%` }));
  const isGradient = variant === 'gradient';

  return (
    <View className="w-full gap-1.5">
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
        className={cn(progressTrack({ size }), className)}
        style={[{ height, ...(trackColor ? { backgroundColor: trackColor } : null) }, style]}
        {...rest}>
        {isGradient ? (
          <Animated.View style={[animatedWidth, { height }]}>
            <LinearGradient
              colors={gradients[gradient]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1, borderRadius: 999 }}
            />
          </Animated.View>
        ) : (
          <Animated.View
            className={cn(progressIndicator({ variant, striped }), indicatorClassName)}
            style={[animatedWidth, indicatorStyle, color ? { backgroundColor: color } : null]}
          />
        )}
      </View>
      {showValue ? (
        <View className="flex-row justify-between">
          <View />
          <Text className="text-xs font-medium tabular-nums text-muted-foreground">
            {Math.round(pct)}%
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/* ----------------------------- Circular ring ------------------------------ */

function CircularRing({
  pct,
  gradient,
  diameter,
  thickness,
  showValue,
  reduceMotion,
  trackColor,
  textColor,
  className,
  style,
  ...rest
}: {
  pct: number;
  gradient: GradientName;
  diameter: number;
  thickness: number;
  showValue?: boolean;
  reduceMotion: boolean;
  trackColor: string;
  textColor: string;
  className?: string;
  style?: ViewProps['style'];
} & ViewProps) {
  const r = (diameter - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = useSharedValue(pct);

  useEffect(() => {
    progress.value = reduceMotion ? pct : withTiming(pct, { duration: 600 });
  }, [pct, reduceMotion, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value / 100),
  }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
      style={[{ width: diameter, height: diameter }, style]}
      className={cn('items-center justify-center', className)}
      {...rest}>
      <Svg width={diameter} height={diameter} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={r}
          stroke={trackColor}
          strokeWidth={thickness}
          fill="none"
        />
        <AnimatedCircle
          cx={diameter / 2}
          cy={diameter / 2}
          r={r}
          stroke={gradients[gradient][0]}
          strokeWidth={thickness}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
        />
      </Svg>
      {showValue ? (
        <View className="absolute">
          <Text style={{ color: textColor }} className="text-sm font-semibold tabular-nums">
            {Math.round(pct)}%
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/* --------------------------- Skeleton shimmer ----------------------------- */

function SkeletonBlock({
  height,
  reduceMotion,
  className,
  style,
  ...rest
}: {
  height: number;
  reduceMotion: boolean;
  className?: string;
  style?: ViewProps['style'];
} & ViewProps) {
  const x = useSharedValue(-1);

  useEffect(() => {
    if (reduceMotion) return;
    x.value = withRepeat(withTiming(1, { duration: 1200 }), -1, false);
  }, [reduceMotion, x]);

  const sweep = useAnimatedStyle(() => ({
    transform: [{ translateX: `${x.value * 100}%` }],
  }));

  return (
    <View
      accessibilityRole="none"
      accessibilityLabel="Loading"
      className={cn('w-full overflow-hidden rounded-lg bg-secondary', className)}
      style={[{ height }, style]}
      {...rest}>
      {!reduceMotion ? (
        <Animated.View
          style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }, sweep]}>
          <LinearGradient
            colors={['#ffffff00', '#ffffff30', '#ffffff00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}
