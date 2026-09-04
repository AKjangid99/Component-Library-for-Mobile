import { cva, type VariantProps } from 'class-variance-authority';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { forwardRef, useEffect } from 'react';
import { ActivityIndicator, Pressable, type PressableProps, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/ui/lib/cn';
import { useThemeColors } from '@/ui/lib/theme';

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
     * Press animation preset. Each preset feels different so you can match
     * intent: `scale` is calm, `bounce` is playful/CTA, `lift` has a shadow,
     * `pulse` breathes while idle, `shimmer` sweeps a highlight.
     * @default 'scale' (or 'shimmer' for gradient, 'bounce' for filled)
     */
    animation?: ButtonAnimation;
    /** Show looping shimmer sweep (auto on `gradient`, opt-in elsewhere). */
    shimmer?: boolean;
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
    animation: animationProp,
    shimmer: shimmerProp,
    style: styleProp,
    ...rest
  },
  ref,
) {
  const colors = useThemeColors();
  const isDisabled = disabled || loading;

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
  const iconColor = iconColorFor(resolvedVariant, colors);
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
    rippleOpacity.value = withTiming(variant === 'ghost' || variant === 'link' ? 0.08 : 0.18, { duration: 120 });
    rippleScale.value = withTiming(3.2, { duration: 420, easing: Easing.out(Easing.ease) });

    // Press feedback per animation preset
    switch (animation) {
      case 'bounce':
        scale.value = withSpring(0.94, { mass: 0.4, damping: 10, stiffness: 260 });
        break;
      case 'lift':
        scale.value = withSpring(0.98, { mass: 0.5, damping: 14 });
        translateY.value = withSpring(1.5, { mass: 0.5, damping: 14 });
        overlayOpacity.value = withTiming(0.06, { duration: 120 });
        break;
      case 'pulse':
      case 'shimmer':
      case 'scale':
        scale.value = withSpring(0.96, { mass: 0.4, damping: 12 });
        overlayOpacity.value = withTiming(0.08, { duration: 110 });
        break;
      case 'none':
        break;
    }

    rest.onPressIn?.(e);
  };

  const handlePressOut: PressableProps['onPressOut'] = (e) => {
    switch (animation) {
      case 'bounce':
        scale.value = withSequence(
          withSpring(1.03, { mass: 0.35, damping: 9, stiffness: 300 }),
          withSpring(1, { mass: 0.4, damping: 12 }),
        );
        break;
      case 'lift':
        scale.value = withSpring(1, { mass: 0.4, damping: 12 });
        translateY.value = withSpring(0, { mass: 0.4, damping: 12 });
        overlayOpacity.value = withTiming(0, { duration: 180 });
        break;
      case 'scale':
      case 'pulse':
      case 'shimmer':
        scale.value = withSpring(1, { mass: 0.4, damping: 12 });
        overlayOpacity.value = withTiming(0, { duration: 180 });
        break;
      case 'none':
        break;
    }

    rippleOpacity.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.ease) });

    rest.onPressOut?.(e);
  };

  return (
    <AnimatedPressable
      ref={ref}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={label}
      disabled={isDisabled}
      hitSlop={hitSlop}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedContainerStyle, styleProp as object]}
      className={cn(
        button({ variant: resolvedVariant, size, fullWidth, rounded, disabled: isDisabled }),
        // focus ring for web/keyboard
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        className,
      )}
      {...rest}>
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
            <Text className={cn(buttonText({ variant: resolvedVariant, size }), 'opacity-80', textClassName)}>
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
              <Text className={cn(buttonText({ variant: resolvedVariant, size }), textClassName)}>{label}</Text>
            ) : null)}
          {rightIcon ? <SymbolView name={rightIcon} tintColor={iconColor} size={iconSize} /> : null}
        </>
      )}
    </AnimatedPressable>
  );
});
