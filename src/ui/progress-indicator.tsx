import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';
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

type Variant = 'linear' | 'circular' | 'skeleton';

export interface ProgressIndicatorProps extends ViewProps {
  variant?: Variant;
  /** 0–100. Animated on change for `linear`/`circular`. */
  value?: number;
  /** Gradient used for the fill (linear + circular). */
  gradient?: GradientName;
  /** Diameter for `circular`. */
  size?: number;
  /** Stroke width for `circular` / bar height for `linear`. */
  thickness?: number;
  /** Show the numeric percentage inside the `circular` ring. */
  showValue?: boolean;
  className?: string;
}

const clamp = (n: number) => Math.max(0, Math.min(100, n));

export function ProgressIndicator({
  variant = 'linear',
  value = 0,
  gradient = 'primary',
  size = 64,
  thickness,
  showValue = false,
  className,
  ...rest
}: ProgressIndicatorProps) {
  const colors = useThemeColors();
  const reduceMotion = useReducedMotion();
  const pct = clamp(value);

  if (variant === 'skeleton') {
    return <Skeleton reduceMotion={reduceMotion} className={className} {...rest} />;
  }

  if (variant === 'circular') {
    return (
      <CircularProgress
        pct={pct}
        gradient={gradient}
        size={size}
        thickness={thickness ?? 6}
        showValue={showValue}
        reduceMotion={reduceMotion}
        trackColor={colors.secondary}
        textColor={colors.foreground}
        className={className}
        {...rest}
      />
    );
  }

  return (
    <LinearBar
      pct={pct}
      gradient={gradient}
      height={thickness ?? 8}
      reduceMotion={reduceMotion}
      className={className}
      {...rest}
    />
  );
}

/* ------------------------------- Linear bar ------------------------------- */

function LinearBar({
  pct,
  gradient,
  height,
  reduceMotion,
  className,
  ...rest
}: {
  pct: number;
  gradient: GradientName;
  height: number;
  reduceMotion: boolean;
  className?: string;
} & ViewProps) {
  const width = useSharedValue(pct);

  useEffect(() => {
    width.value = reduceMotion ? pct : withTiming(pct, { duration: 500 });
  }, [pct, reduceMotion, width]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${width.value}%` }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
      style={{ height }}
      className={cn('w-full overflow-hidden rounded-full bg-secondary', className)}
      {...rest}>
      <Animated.View style={[fillStyle, StyleSheet.absoluteFill]}>
        <LinearGradient
          colors={gradients[gradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 999 }]}
        />
      </Animated.View>
    </View>
  );
}

/* ----------------------------- Circular ring ------------------------------ */

function CircularProgress({
  pct,
  gradient,
  size,
  thickness,
  showValue,
  reduceMotion,
  trackColor,
  textColor,
  className,
  ...rest
}: {
  pct: number;
  gradient: GradientName;
  size: number;
  thickness: number;
  showValue: boolean;
  reduceMotion: boolean;
  trackColor: string;
  textColor: string;
  className?: string;
} & ViewProps) {
  const r = (size - thickness) / 2;
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
      style={{ width: size, height: size }}
      className={cn('items-center justify-center', className)}
      {...rest}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={thickness} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
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

/* ------------------------------- Skeleton --------------------------------- */

function Skeleton({
  reduceMotion,
  className,
  ...rest
}: { reduceMotion: boolean; className?: string } & ViewProps) {
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
      className={cn('h-4 w-full overflow-hidden rounded-lg bg-secondary', className)}
      {...rest}>
      {!reduceMotion ? (
        <Animated.View style={[StyleSheet.absoluteFill, sweep]}>
          <LinearGradient
            colors={['#ffffff00', '#ffffff30', '#ffffff00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}
