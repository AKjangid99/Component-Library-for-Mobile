/*
 * Reanimated shared-value mutation (`sv.value = ...`) is the library's intended
 * idiom, but the React-Compiler `react-hooks/immutability` rule flags it as a
 * false positive (same as avatar/alert/accordion in this repo). Scoped off here.
 */
/* eslint-disable react-hooks/immutability */
import { cva, type VariantProps } from 'class-variance-authority';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { forwardRef, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  type GestureResponderEvent,
  Pressable,
  type PressableProps,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/ui/lib/cn';
import { gradients, type GradientName, useThemeColors } from '@/ui/lib/theme';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ---------------------------------------------------------------------------
// Styles — approachable, rounded, generous touch targets
// ---------------------------------------------------------------------------

const button = cva(
  'relative flex-row items-center justify-center gap-2 overflow-hidden rounded-xl border border-transparent',
  {
    variants: {
      variant: {
        filled: 'bg-primary shadow-sm active:shadow-none',
        tonal: 'bg-secondary',
        outline: 'border-border bg-transparent',
        ghost: 'border-transparent bg-transparent',
        destructive: 'bg-destructive shadow-sm',
        subtle: 'bg-muted',
        link: 'border-transparent bg-transparent',
        // new approachable variants
        success: 'bg-success shadow-sm',
        warning: 'bg-warning shadow-sm',
        glass: 'border-border bg-card/70 backdrop-blur-xl shadow-sm',
        gradient: 'bg-primary shadow-md',
      },
      size: {
        xs: 'h-7 px-2.5',
        sm: 'h-9 px-3',
        md: 'h-11 px-4',
        lg: 'h-14 px-6',
        icon: 'h-11 w-11 p-0',
        'icon-sm': 'h-9 w-9 p-0',
        'icon-lg': 'h-14 w-14 p-0',
      },
      fullWidth: {
        true: 'w-full self-stretch',
        false: '',
      },
      rounded: {
        true: 'rounded-full',
        false: '',
      },
      disabled: {
        true: 'opacity-50',
      },
    },
    defaultVariants: { variant: 'filled', size: 'md' },
  },
);

const buttonText = cva('text-center font-semibold tracking-tight', {
  variants: {
    variant: {
      filled: 'text-primary-foreground',
      tonal: 'text-secondary-foreground',
      outline: 'text-foreground',
      ghost: 'text-foreground',
      destructive: 'text-destructive-foreground',
      subtle: 'text-foreground',
      link: 'text-primary underline',
      success: 'text-success-foreground',
      warning: 'text-warning-foreground',
      glass: 'text-foreground',
      gradient: 'text-primary-foreground',
    },
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-[15px]',
      lg: 'text-lg',
      icon: 'text-base',
      'icon-sm': 'text-sm',
      'icon-lg': 'text-lg',
    },
  },
  defaultVariants: { variant: 'filled', size: 'md' },
});

type ButtonVariant = NonNullable<VariantProps<typeof button>['variant']>;
export type ButtonAnimation = 'scale' | 'bounce' | 'lift' | 'pulse' | 'shimmer' | 'none';

/** After-click "celebration" burst. */
export type ButtonCelebration =
  | 'none'
  | 'sparkles'
  | 'stars'
  | 'popup'
  | 'confetti'
  | 'hearts'
  | 'rings';

function iconColorFor(variant: ButtonVariant, colors: ReturnType<typeof useThemeColors>) {
  switch (variant) {
    case 'filled':
    case 'gradient':
      return colors.primaryForeground;
    case 'destructive':
      return colors.destructiveForeground;
    case 'success':
      return colors.successForeground;
    case 'warning':
      return colors.warningForeground;
    case 'tonal':
      return colors.secondaryForeground;
    default:
      return colors.foreground;
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type ButtonProps = Omit<PressableProps, 'children' | 'disabled'> &
  VariantProps<typeof button> & {
    /** Text label. Pass `children` instead for custom content. */
    label?: string;
    children?: React.ReactNode;
    loading?: boolean;
    disabled?: boolean;
    /** SF Symbol / Material icon name shown before the label. */
    leftIcon?: SymbolViewProps['name'];
    /** SF Symbol / Material icon name shown after the label. */
    rightIcon?: SymbolViewProps['name'];
    /** Standalone icon when no label (use size="icon" variants). */
    icon?: SymbolViewProps['name'];
    className?: string;
    textClassName?: string;
    /**
     * Custom background color (any hex). Overrides the variant fill while
     * keeping press animation, shimmer, and ripple. Pair with `textColor`
     * for full control, or leave it — filled-style variants fall back to
     * white text, outline/ghost/link tint their text to match.
     * Tip: pass `useAccent()` / `resolvedAccent` for a live-themed button.
     */
    color?: string;
    /** Custom label/icon color. Defaults adapt to `color` + `variant`. */
    textColor?: string;
    /**
     * Press animation preset. Each preset feels different so you can match
     * intent: `scale` is calm, `bounce` is playful/CTA, `lift` has a shadow,
     * `pulse` breathes while idle, `shimmer` sweeps a highlight.
     * @default 'scale' (or 'shimmer' for gradient, 'bounce' for filled)
     */
    animation?: ButtonAnimation;
    /** Show looping shimmer sweep (auto on `gradient`, opt-in elsewhere). */
    shimmer?: boolean;
    /**
     * After-click celebration burst that plays on release. Fires independently
     * of `onPress` (never delays the callback) and collapses to a simple fade
     * when the OS reduce-motion setting is on. `none` (default) keeps the
     * button rendering exactly as before.
     */
    celebration?: ButtonCelebration;
    /**
     * Gradient fill for the `gradient` variant — a real LinearGradient with a
     * matching colored glow. @default 'primary'
     */
    gradient?: GradientName;
  };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Button = forwardRef<View, ButtonProps>(function Button(
  {
    label,
    children,
    variant = 'filled',
    size = 'md',
    fullWidth,
    rounded,
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    icon,
    className,
    textClassName,
    color,
    textColor,
    animation: animationProp,
    shimmer: shimmerProp,
    celebration = 'none',
    gradient = 'primary',
    onPress,
    style: styleProp,
    ...rest
  },
  ref,
) {
  const colors = useThemeColors();
  const isDisabled = disabled || loading;
  const reducedMotion = useReducedMotion();

  // Celebration replay counter — bumping it re-triggers the overlay burst.
  const [burst, setBurst] = useState(0);
  const handlePress = (e: GestureResponderEvent) => {
    // Fire the caller's handler immediately; animate independently.
    onPress?.(e);
    if (celebration !== 'none' && !isDisabled) setBurst((b) => b + 1);
  };

  // Resolve animation — smart defaults per variant keep usage approachable:
  // primary CTA bounces, gradient shimmers, destructive/outline lift, rest scale.
  const animation: ButtonAnimation =
    animationProp ??
    (variant === 'gradient'
      ? 'shimmer'
      : variant === 'filled'
        ? 'bounce'
        : variant === 'destructive' || variant === 'outline'
          ? 'lift'
          : 'scale');

  const shouldShimmer = shimmerProp ?? (animation === 'shimmer' || variant === 'gradient');

  // Reanimated shared values
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);
  const shimmerX = useSharedValue(-120);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const rippleX = useSharedValue(0);
  const rippleY = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  const resolvedVariant = (variant as ButtonVariant) ?? 'filled';
  // Custom color support: tinted text for chrome-less variants, white text
  // for filled-style variants, explicit textColor always wins.
  const tintedTextVariant =
    resolvedVariant === 'outline' ||
    resolvedVariant === 'ghost' ||
    resolvedVariant === 'link';
  const resolvedTextColor =
    textColor ?? (color ? (tintedTextVariant ? color : '#ffffff') : undefined);
  const iconColor = resolvedTextColor ?? iconColorFor(resolvedVariant, colors);
  const iconSize =
    size === 'lg' || size === 'icon-lg' ? 20 : size === 'sm' || size === 'icon-sm' || size === 'xs' ? 15 : 18;

  // Hit slop makes tiny sizes still approachable on touch (44pt min target).
  const hitSlop =
    size === 'xs' || size === 'icon-sm' ? 10 : size === 'sm' || size === 'icon' ? 6 : 4;

  // Shimmer sweep — runs only when visible & enabled.
  useEffect(() => {
    if (!shouldShimmer || isDisabled) {
      cancelAnimation(shimmerX);
      shimmerX.value = -120;
      return;
    }
    shimmerX.value = withRepeat(
      withSequence(
        withTiming(220, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(-120, { duration: 0 }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(shimmerX);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldShimmer, isDisabled]);

  // Pulse — gentle breathing for attention-drawing CTAs.
  useEffect(() => {
    if (animation !== 'pulse' || isDisabled) {
      cancelAnimation(pulseScale);
      pulseScale.value = 1;
      return;
    }
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    return () => cancelAnimation(pulseScale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animation, isDisabled]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * pulseScale.value },
      { translateY: translateY.value },
    ],
  }));

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const animatedShimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }));

  const animatedRippleStyle = useAnimatedStyle(() => ({
    opacity: rippleOpacity.value,
    transform: [{ scale: rippleScale.value }],
    left: rippleX.value,
    top: rippleY.value,
  }));

  const handlePressIn: PressableProps['onPressIn'] = (e) => {
    // Ripple origin from touch point
    const { locationX, locationY } = e.nativeEvent as unknown as { locationX: number; locationY: number };
    if (typeof locationX === 'number' && typeof locationY === 'number') {
      rippleX.value = locationX - 28;
      rippleY.value = locationY - 28;
    }
    rippleScale.value = 0;
    rippleOpacity.value = withTiming(variant === 'ghost' || variant === 'link' ? 0.08 : 0.15, { duration: 100 });
    rippleScale.value = withTiming(2.4, { duration: 320, easing: Easing.out(Easing.ease) });

    // Press feedback per animation preset. Stiff, well-damped springs so the
    // button dips the instant the finger lands — no floaty lag.
    switch (animation) {
      case 'bounce':
        scale.value = withSpring(0.95, { mass: 0.3, damping: 20, stiffness: 500 });
        overlayOpacity.value = withTiming(0.08, { duration: 90 });
        break;
      case 'lift':
        scale.value = withSpring(0.97, { mass: 0.3, damping: 20, stiffness: 500 });
        translateY.value = withSpring(2, { mass: 0.3, damping: 20, stiffness: 500 });
        overlayOpacity.value = withTiming(0.06, { duration: 90 });
        break;
      case 'pulse':
      case 'shimmer':
      case 'scale':
        scale.value = withSpring(0.97, { mass: 0.3, damping: 20, stiffness: 500 });
        overlayOpacity.value = withTiming(0.08, { duration: 90 });
        break;
      case 'none':
        break;
    }

    rest.onPressIn?.(e);
  };

  const handlePressOut: PressableProps['onPressOut'] = (e) => {
    // Single clean release — one spring back to rest with just a whisper of
    // overshoot. (The old staged 1.03 hop is what felt wobbly/unnatural.)
    switch (animation) {
      case 'bounce':
        scale.value = withSpring(1, { mass: 0.3, damping: 12, stiffness: 380 });
        overlayOpacity.value = withTiming(0, { duration: 140 });
        break;
      case 'lift':
        scale.value = withSpring(1, { mass: 0.3, damping: 16, stiffness: 400 });
        translateY.value = withSpring(0, { mass: 0.3, damping: 16, stiffness: 400 });
        overlayOpacity.value = withTiming(0, { duration: 140 });
        break;
      case 'scale':
      case 'pulse':
      case 'shimmer':
        scale.value = withSpring(1, { mass: 0.3, damping: 16, stiffness: 400 });
        overlayOpacity.value = withTiming(0, { duration: 140 });
        break;
      case 'none':
        break;
    }

    rippleOpacity.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.ease) });

    rest.onPressOut?.(e);
  };

  const isGradient = resolvedVariant === 'gradient';
  const glowColor = gradients[gradient][0];

  const pressable = (
    <AnimatedPressable
      ref={ref}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={label}
      disabled={isDisabled}
      hitSlop={hitSlop}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        animatedContainerStyle,
        color ? { backgroundColor: color, borderColor: color } : null,
        // Colored glow for the gradient variant (shadow on iOS, elevation tint on Android).
        isGradient && !isDisabled
          ? {
              shadowColor: glowColor,
              shadowOffset: { width: 0, height: 6 },
              shadowRadius: 12,
              shadowOpacity: 0.35,
              elevation: 4,
            }
          : null,
        styleProp as object,
      ]}
      className={cn(
        button({ variant: resolvedVariant, size, fullWidth, rounded, disabled: isDisabled }),
        // focus ring for web/keyboard
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        className,
      )}
      {...rest}>
      {/* Real gradient fill — clipped by the root's overflow-hidden. */}
      {isGradient ? (
        <LinearGradient
          colors={gradients[gradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
        />
      ) : null}
      {/* Press darken overlay — subtle tactile feedback */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: resolvedVariant === 'filled' || resolvedVariant === 'gradient' ? '#000' : colors.foreground,
            borderRadius: rounded ? 999 : 12,
          },
          animatedOverlayStyle,
        ]}
      />

      {/* Shimmer sweep — only for gradient / shimmer preset */}
      {shouldShimmer && !isDisabled ? (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: 56,
              backgroundColor: 'rgba(255,255,255,0.22)',
              opacity: 0.9,
            },
            animatedShimmerStyle,
          ]}
        />
      ) : null}

      {/* Ripple dot */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: variant === 'ghost' || variant === 'link' ? colors.foreground : '#fff',
          },
          animatedRippleStyle,
        ]}
      />

      {/* Content */}
      {loading ? (
        <View className="flex-row items-center gap-2">
          <ActivityIndicator size="small" color={iconColor} />
          {label ? (
            <Text
              className={cn(buttonText({ variant: resolvedVariant, size }), 'opacity-80', textClassName)}
              style={resolvedTextColor ? { color: resolvedTextColor } : undefined}>
              {label}
            </Text>
          ) : null}
        </View>
      ) : (
        <>
          {leftIcon ? <SymbolView name={leftIcon} tintColor={iconColor} size={iconSize} /> : null}
          {icon && !label && !children ? (
            <SymbolView name={icon} tintColor={iconColor} size={iconSize} />
          ) : null}
          {children ??
            (label ? (
              <Text
                className={cn(buttonText({ variant: resolvedVariant, size }), textClassName)}
                style={resolvedTextColor ? { color: resolvedTextColor } : undefined}>
                {label}
              </Text>
            ) : null)}
          {rightIcon ? <SymbolView name={rightIcon} tintColor={iconColor} size={iconSize} /> : null}
        </>
      )}
    </AnimatedPressable>
  );

  // Default path: no wrapper, identical to before.
  if (celebration === 'none') return pressable;

  // Celebration path: relative wrapper so the burst overlay can escape the
  // button's `overflow-hidden` clip without affecting layout.
  return (
    <View style={{ position: 'relative', alignSelf: fullWidth ? 'stretch' : 'flex-start' }}>
      {pressable}
      <Celebration type={celebration} trigger={burst} reduced={reducedMotion} />
    </View>
  );
});

// ---------------------------------------------------------------------------
// Celebration overlay — cross-platform (native + web) via Reanimated only.
// Rendered as an absolutely-positioned, non-interactive sibling of the button
// so bursts escape the button's clip and never shift layout.
// ---------------------------------------------------------------------------

type ParticleConfig = {
  /** Radians. Screen coords: 0 = right, -PI/2 = up. */
  angle: number;
  distance: number;
  delay: number;
  size: number;
  color: string;
  /** Extra downward drift (px) applied over the flight — gives "fall". */
  gravity?: number;
  /** Total spin in degrees over the flight. */
  spin?: number;
  /** Scale at the end of the flight (1 = no shrink). */
  endScale?: number;
};

const CELEBRATION_COLORS = ['#F5A524', '#208AEF', '#30A46C', '#8E5CF5', '#E5484D', '#EC4899'];

const deg = (d: number) => (d * Math.PI) / 180;

// Subtle: fewer, smaller particles with shorter, softer travel.
const SPARKLES: ParticleConfig[] = Array.from({ length: 5 }, (_, i) => ({
  angle: -Math.PI / 2 + (i * Math.PI * 2) / 5,
  distance: 22 + (i % 3) * 3,
  delay: (i % 3) * 24,
  size: 5,
  color: CELEBRATION_COLORS[i],
}));

const STARS: ParticleConfig[] = [
  { angle: deg(-106), distance: 30, delay: 0, size: 12, color: '#F5A524' },
  { angle: deg(-86), distance: 36, delay: 80, size: 13, color: '#F5A524' },
  { angle: deg(-70), distance: 28, delay: 160, size: 11, color: '#F5A524' },
];

// A few shreds drift out, gently spin, and settle.
const CONFETTI: ParticleConfig[] = Array.from({ length: 8 }, (_, i) => ({
  angle: -Math.PI / 2 + (i * Math.PI * 2) / 8,
  distance: 22 + (i % 3) * 5,
  gravity: 16 + (i % 3) * 4,
  spin: (i % 2 ? 1 : -1) * (90 + (i % 3) * 40),
  delay: (i % 4) * 22,
  size: 6,
  color: CELEBRATION_COLORS[i % CELEBRATION_COLORS.length],
  endScale: 0.85,
}));

// Soft hearts drift upward and fade.
const HEARTS: ParticleConfig[] = [
  { angle: deg(-116), distance: 30, delay: 0, size: 13, color: '#E5484D', endScale: 1 },
  { angle: deg(-92), distance: 38, delay: 90, size: 15, color: '#EC4899', endScale: 1 },
  { angle: deg(-70), distance: 30, delay: 180, size: 12, color: '#E5484D', endScale: 1 },
];

const PARTICLE_SETS: Record<'sparkles' | 'stars' | 'confetti' | 'hearts', ParticleConfig[]> = {
  sparkles: SPARKLES,
  stars: STARS,
  confetti: CONFETTI,
  hearts: HEARTS,
};

function Celebration({
  type,
  trigger,
  reduced,
}: {
  type: ButtonCelebration;
  trigger: number;
  reduced: boolean;
}) {
  if (type === 'none') return null;
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {type === 'popup' ? (
        <Popup trigger={trigger} reduced={reduced} />
      ) : type === 'rings' ? (
        <Rings trigger={trigger} reduced={reduced} />
      ) : (
        PARTICLE_SETS[type as keyof typeof PARTICLE_SETS].map((cfg, i) => (
          <Particle key={i} config={cfg} trigger={trigger} reduced={reduced}>
            {type === 'stars' ? (
              <SymbolView name="star.fill" size={cfg.size} tintColor={cfg.color} />
            ) : type === 'hearts' ? (
              <SymbolView name="heart.fill" size={cfg.size} tintColor={cfg.color} />
            ) : type === 'confetti' ? (
              <View
                style={{
                  width: cfg.size * 0.7,
                  height: cfg.size * 1.3,
                  borderRadius: 2,
                  backgroundColor: cfg.color,
                }}
              />
            ) : (
              <View
                style={{
                  width: cfg.size,
                  height: cfg.size,
                  borderRadius: cfg.size / 2,
                  backgroundColor: cfg.color,
                }}
              />
            )}
          </Particle>
        ))
      )}
    </View>
  );
}

function Particle({
  config,
  trigger,
  reduced,
  children,
}: {
  config: ParticleConfig;
  trigger: number;
  reduced: boolean;
  children: React.ReactNode;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    if (trigger === 0) return; // no burst on first mount
    p.value = 0;
    p.value = withDelay(
      reduced ? 0 : config.delay,
      withTiming(1, { duration: reduced ? 280 : 620, easing: Easing.out(Easing.cubic) }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const style = useAnimatedStyle(() => {
    const t = p.value;
    const dist = reduced ? 0 : config.distance;
    const gravity = reduced ? 0 : config.gravity ?? 0;
    const spin = reduced ? 0 : config.spin ?? 0;
    const endScale = config.endScale ?? 0.5;
    return {
      // Gentle rise, longer soft fade — peaks below full opacity so it reads as a flourish.
      opacity: interpolate(t, [0, 0.2, 0.6, 1], [0, 0.85, 0.7, 0]),
      transform: [
        { translateX: Math.cos(config.angle) * dist * t },
        { translateY: Math.sin(config.angle) * dist * t + gravity * t * t },
        { rotate: `${spin * t}deg` },
        { scale: reduced ? 1 : interpolate(t, [0, 0.35, 1], [0.4, 1, endScale]) },
      ],
    };
  });

  return <Animated.View pointerEvents="none" style={[{ position: 'absolute' }, style]}>{children}</Animated.View>;
}

/** Concentric ripple rings that expand and fade — a crisp, minimal confirm. */
function Rings({ trigger, reduced }: { trigger: number; reduced: boolean }) {
  return (
    <>
      {[0, 1].map((i) => (
        <Ring key={i} trigger={trigger} reduced={reduced} delay={i * 150} />
      ))}
    </>
  );
}

function Ring({ trigger, reduced, delay }: { trigger: number; reduced: boolean; delay: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    if (trigger === 0) return;
    p.value = 0;
    p.value = withDelay(
      reduced ? 0 : delay,
      withTiming(1, { duration: reduced ? 300 : 640, easing: Easing.out(Easing.cubic) }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0, 0.12, 1], [0, 0.4, 0]),
    transform: [{ scale: reduced ? 1 : interpolate(p.value, [0, 1], [0.35, 2.4]) }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: 40,
          height: 40,
          borderRadius: 999,
          borderWidth: 1.5,
          borderColor: '#208AEF',
        },
        style,
      ]}
    />
  );
}

function Popup({ trigger, reduced }: { trigger: number; reduced: boolean }) {
  // 0→1 = spring/scale in, hold, 1→2 = fade + float up.
  const p = useSharedValue(0);
  useEffect(() => {
    if (trigger === 0) return;
    p.value = 0;
    p.value = withSequence(
      withTiming(1, { duration: reduced ? 220 : 300, easing: Easing.out(Easing.back(1.2)) }),
      withDelay(reduced ? 220 : 620, withTiming(2, { duration: reduced ? 220 : 380, easing: Easing.in(Easing.ease) })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const style = useAnimatedStyle(() => {
    const inPhase = Math.min(1, p.value);
    const outPhase = Math.max(0, p.value - 1);
    return {
      opacity: p.value <= 1 ? interpolate(p.value, [0, 0.4, 1], [0, 1, 1]) : 1 - outPhase,
      transform: [
        { translateY: -28 - (reduced ? 0 : outPhase * 14) },
        { scale: reduced ? 1 : interpolate(inPhase, [0, 1], [0.5, 1]) },
      ],
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute' }, style]}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          backgroundColor: '#30A46C',
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 4,
        }}>
        <SymbolView name="checkmark" size={12} tintColor="#ffffff" />
        <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>+1</Text>
      </View>
    </Animated.View>
  );
}
