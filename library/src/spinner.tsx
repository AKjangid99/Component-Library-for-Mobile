import { useEffect } from 'react';
import { ActivityIndicator, Text, View, type ViewProps } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { cn } from '@/ui/lib/cn';
import { useThemeColors } from '@/ui/lib/theme';

/** Animated loader styles beyond the platform activity indicator. */
export type SpinnerVariant = 'native' | 'dots' | 'matrix' | 'bars' | 'pulse' | 'ring';

export type SpinnerProps = ViewProps & {
  /** Visual style of the loader. Defaults to the native activity indicator. */
  variant?: SpinnerVariant;
  size?: 'small' | 'large' | number;
  /** Token name from the palette; defaults to the primary color. */
  color?: string;
  label?: string;
  className?: string;
};

/** Resolve the `size` prop to a pixel diameter for the drawn variants. */
function resolvePx(size: SpinnerProps['size']): number {
  if (typeof size === 'number') return size;
  return size === 'large' ? 36 : 20;
}

export function Spinner({
  variant = 'native',
  size = 'small',
  color,
  label,
  className,
  ...rest
}: SpinnerProps) {
  const colors = useThemeColors();
  const tint = color ?? colors.primary;

  return (
    <View className={cn('items-center justify-center gap-2', className)} {...rest}>
      <SpinnerGraphic variant={variant} size={size} tint={tint} />
      {label ? <Text className="text-sm text-muted-foreground">{label}</Text> : null}
    </View>
  );
}

function SpinnerGraphic({
  variant,
  size,
  tint,
}: {
  variant: SpinnerVariant;
  size: SpinnerProps['size'];
  tint: string;
}) {
  switch (variant) {
    case 'dots':
      return <DotsSpinner px={resolvePx(size)} tint={tint} />;
    case 'matrix':
      return <MatrixSpinner px={resolvePx(size)} tint={tint} />;
    case 'bars':
      return <BarsSpinner px={resolvePx(size)} tint={tint} />;
    case 'pulse':
      return <PulseSpinner px={resolvePx(size)} tint={tint} />;
    case 'ring':
      return <RingSpinner px={resolvePx(size)} tint={tint} />;
    case 'native':
    default:
      return typeof size === 'number' ? (
        <ActivityIndicator size="large" color={tint} style={{ transform: [{ scale: size / 36 }] }} />
      ) : (
        <ActivityIndicator size={size} color={tint} />
      );
  }
}

/** Three dots that bounce in sequence — the classic "typing" loader. */
function DotsSpinner({ px, tint }: { px: number; tint: string }) {
  const dot = Math.max(6, px * 0.28);
  const rise = dot * 0.9;
  return (
    <View className="flex-row items-end" style={{ gap: dot * 0.6, height: dot + rise }}>
      {[0, 1, 2].map((i) => (
        <BouncingDot key={i} size={dot} rise={rise} delay={i * 140} tint={tint} />
      ))}
    </View>
  );
}

function BouncingDot({
  size,
  rise,
  delay,
  tint,
}: {
  size: number;
  rise: number;
  delay: number;
  tint: string;
}) {
  const reduceMotion = useReducedMotion();
  const t = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    t.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 300, easing: Easing.in(Easing.quad) }),
        ),
        -1,
      ),
    );
  }, [delay, reduceMotion, t]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -t.value * rise }],
    opacity: 0.5 + t.value * 0.5,
  }));

  return (
    <Animated.View
      style={[style, { width: size, height: size, borderRadius: size / 2, backgroundColor: tint }]}
    />
  );
}

/** A 3×3 grid whose cells pulse in a diagonal wave. */
function MatrixSpinner({ px, tint }: { px: number; tint: string }) {
  const cell = Math.max(5, px * 0.24);
  const gap = cell * 0.5;
  return (
    <View style={{ width: cell * 3 + gap * 2, gap }}>
      {[0, 1, 2].map((row) => (
        <View key={row} className="flex-row" style={{ gap }}>
          {[0, 1, 2].map((col) => (
            <MatrixCell key={col} size={cell} delay={(row + col) * 120} tint={tint} />
          ))}
        </View>
      ))}
    </View>
  );
}

function MatrixCell({ size, delay, tint }: { size: number; delay: number; tint: string }) {
  const reduceMotion = useReducedMotion();
  const t = useSharedValue(0.3);

  useEffect(() => {
    if (reduceMotion) return;
    t.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) }),
          withTiming(0.3, { duration: 400, easing: Easing.in(Easing.quad) }),
        ),
        -1,
      ),
    );
  }, [delay, reduceMotion, t]);

  const style = useAnimatedStyle(() => ({ opacity: t.value, transform: [{ scale: 0.7 + t.value * 0.3 }] }));

  return (
    <Animated.View
      style={[style, { width: size, height: size, borderRadius: size * 0.25, backgroundColor: tint }]}
    />
  );
}

/** Five bars scaling vertically — an equalizer-style loader. */
function BarsSpinner({ px, tint }: { px: number; tint: string }) {
  const bar = Math.max(3, px * 0.16);
  const height = px * 1.1;
  return (
    <View className="flex-row items-center" style={{ gap: bar * 0.7, height }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <EqualizerBar key={i} width={bar} height={height} delay={i * 110} tint={tint} />
      ))}
    </View>
  );
}

function EqualizerBar({
  width,
  height,
  delay,
  tint,
}: {
  width: number;
  height: number;
  delay: number;
  tint: string;
}) {
  const reduceMotion = useReducedMotion();
  const t = useSharedValue(0.4);

  useEffect(() => {
    if (reduceMotion) return;
    t.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 350, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.4, { duration: 350, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
      ),
    );
  }, [delay, reduceMotion, t]);

  const style = useAnimatedStyle(() => ({ height: height * t.value }));

  return <Animated.View style={[style, { width, borderRadius: width / 2, backgroundColor: tint }]} />;
}

/** A single circle expanding and fading — a soft radar pulse. */
function PulseSpinner({ px, tint }: { px: number; tint: string }) {
  const reduceMotion = useReducedMotion();
  const t = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    t.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.out(Easing.quad) }), -1);
  }, [reduceMotion, t]);

  const ring = useAnimatedStyle(() => ({
    transform: [{ scale: 0.3 + t.value * 0.7 }],
    opacity: 1 - t.value,
  }));

  return (
    <View style={{ width: px, height: px }} className="items-center justify-center">
      <Animated.View
        style={[ring, { width: px, height: px, borderRadius: px / 2, backgroundColor: tint }]}
        className="absolute"
      />
      <View
        style={{ width: px * 0.3, height: px * 0.3, borderRadius: px * 0.15, backgroundColor: tint }}
      />
    </View>
  );
}

/** A rotating arc drawn with SVG — a smooth, gradient-free ring loader. */
function RingSpinner({ px, tint }: { px: number; tint: string }) {
  const reduceMotion = useReducedMotion();
  const t = useSharedValue(0);
  const stroke = Math.max(2, px * 0.11);
  const r = (px - stroke) / 2;
  const c = 2 * Math.PI * r;

  useEffect(() => {
    if (reduceMotion) return;
    t.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.linear }), -1);
  }, [reduceMotion, t]);

  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${t.value * 360}deg` }] }));

  return (
    <Animated.View style={[style, { width: px, height: px }]}>
      <Svg width={px} height={px}>
        <Circle cx={px / 2} cy={px / 2} r={r} stroke={tint} strokeWidth={stroke} opacity={0.2} fill="none" />
        <Circle
          cx={px / 2}
          cy={px / 2}
          r={r}
          stroke={tint}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * 0.28} ${c}`}
          fill="none"
        />
      </Svg>
    </Animated.View>
  );
}
