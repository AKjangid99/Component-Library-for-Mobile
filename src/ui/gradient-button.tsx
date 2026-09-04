import { cva, type VariantProps } from 'class-variance-authority';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { type LucideIcon } from 'lucide-react-native';
import { forwardRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/ui/lib/cn';
import { gradients, type GradientName, useThemeColors } from '@/ui/lib/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * A pill action button. The `gradient` variant carries the personality — a
 * saturated blue→violet sweep with a colored glow that intensifies on press —
 * while `solid`/`outline`/`ghost`/`glass` stay deliberately flat so the
 * gradient reads as the one bold choice, not the default.
 */
const container = cva('flex-row items-center justify-center gap-2 overflow-hidden rounded-full', {
  variants: {
    variant: {
      solid: 'bg-primary',
      gradient: '',
      outline: 'border border-border bg-transparent',
      ghost: 'bg-transparent',
      glass: 'border border-white/25 bg-white/10',
    },
    size: {
      sm: 'h-9 px-4',
      md: 'h-12 px-6',
      lg: 'h-14 px-8',
    },
    disabled: { true: 'opacity-50' },
  },
  defaultVariants: { variant: 'gradient', size: 'md' },
});

const label = cva('font-semibold', {
  variants: {
    variant: {
      solid: 'text-primary-foreground',
      gradient: 'text-white',
      outline: 'text-foreground',
      ghost: 'text-primary',
      glass: 'text-foreground',
    },
    size: { sm: 'text-sm', md: 'text-base', lg: 'text-lg' },
  },
  defaultVariants: { variant: 'gradient', size: 'md' },
});

type Variant = NonNullable<VariantProps<typeof container>['variant']>;
type Size = NonNullable<VariantProps<typeof container>['size']>;

export interface GradientButtonProps
  extends Omit<PressableProps, 'children' | 'disabled' | 'style'> {
  /** Text label. Ignored when `children` is provided. */
  title?: string;
  children?: React.ReactNode;
  variant?: Variant;
  size?: Size;
  /** Gradient stop-pair used by the `gradient` variant. */
  gradient?: GradientName;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  /** Replaces the label with an inline spinner and blocks presses. */
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
}

const ICON_SIZE: Record<Size, number> = { sm: 16, md: 18, lg: 20 };

function contentColor(variant: Variant, colors: ReturnType<typeof useThemeColors>) {
  switch (variant) {
    case 'solid':
      return colors.primaryForeground;
    case 'gradient':
      return '#ffffff';
    case 'ghost':
      return colors.primary;
    default:
      return colors.foreground;
  }
}

export const GradientButton = forwardRef<View, GradientButtonProps>(function GradientButton(
  {
    title,
    children,
    variant = 'gradient',
    size = 'md',
    gradient = 'primary',
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    loading = false,
    disabled = false,
    className,
    textClassName,
    onPressIn,
    onPressOut,
    ...rest
  },
  ref,
) {
  const colors = useThemeColors();
  const scheme = useColorScheme();
  const reduceMotion = useReducedMotion();
  const pressed = useSharedValue(0);
  const isDisabled = disabled || loading;

  const glows = variant === 'gradient' || variant === 'solid';
  const glowColor = variant === 'solid' ? colors.primary : gradients[gradient][0];

  const animatedStyle = useAnimatedStyle(() => {
    const p = pressed.value;
    return {
      transform: [{ scale: reduceMotion ? 1 : interpolate(p, [0, 1], [1, 0.96]) }],
      // Colored glow (iOS shadow / no-op color on Android, which still scales).
      shadowColor: glowColor,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: interpolate(p, [0, 1], [10, 18]),
      shadowOpacity: glows ? interpolate(p, [0, 1], [0.25, 0.55]) : 0,
    };
  });

  const tint = contentColor(variant, colors);

  return (
    <AnimatedPressable
      ref={ref}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      hitSlop={size === 'sm' ? 8 : 0}
      onPressIn={(e) => {
        pressed.value = reduceMotion ? 1 : withSpring(1, { mass: 0.4, damping: 14 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        pressed.value = reduceMotion ? 0 : withTiming(0, { duration: 180 });
        onPressOut?.(e);
      }}
      style={animatedStyle}
      className={cn(container({ variant, size, disabled: isDisabled }), className)}
      {...rest}>
      {variant === 'gradient' ? (
        <LinearGradient
          colors={gradients[gradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheetAbsoluteFill}
        />
      ) : null}
      {variant === 'glass' ? (
        <BlurView
          intensity={40}
          tint={scheme === 'dark' ? 'dark' : 'light'}
          style={StyleSheetAbsoluteFill}
        />
      ) : null}

      {loading ? (
        <ActivityIndicator size="small" color={tint} />
      ) : (
        <>
          {LeftIcon ? <LeftIcon size={ICON_SIZE[size]} color={tint} strokeWidth={2.25} /> : null}
          {children ??
            (title ? (
              <Text className={cn(label({ variant, size }), textClassName)}>{title}</Text>
            ) : null)}
          {RightIcon ? <RightIcon size={ICON_SIZE[size]} color={tint} strokeWidth={2.25} /> : null}
        </>
      )}
    </AnimatedPressable>
  );
});

const StyleSheetAbsoluteFill = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};
