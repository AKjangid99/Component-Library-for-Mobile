/*
 * Reanimated shared-value mutation (`sv.value = ...`) is the library's intended
 * idiom, but the React-Compiler `react-hooks/immutability` rule flags it as a
 * false positive (same as button/avatar/alert/accordion in this repo).
 * Scoped off here.
 */
/* eslint-disable react-hooks/immutability */
import { cva, type VariantProps } from 'class-variance-authority';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, type PressableProps, Text } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import { cn } from '@/ui/lib/cn';
import { useThemeColors } from '@/ui/lib/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedText = Animated.createAnimatedComponent(Text);

const toggle = cva('flex-row items-center justify-center gap-2', {
  variants: {
    variant: {
      default: '',
      outline: 'border border-border',
    },
    size: {
      sm: 'h-9 px-2.5',
      md: 'h-11 px-3',
      lg: 'h-[52px] px-4',
    },
    shape: {
      rounded: 'rounded-lg',
      pill: 'rounded-full',
    },
  },
  defaultVariants: { variant: 'default', size: 'md', shape: 'rounded' },
});

export type ToggleProps = Omit<PressableProps, 'onPress'> &
  VariantProps<typeof toggle> & {
    pressed: boolean;
    onPressedChange?: (pressed: boolean) => void;
    label?: string;
    icon?: SymbolViewProps['name'];
    disabled?: boolean;
    className?: string;
    /**
     * Custom fill color for the pressed state (any hex). Unpressed stays
     * transparent; pressed content flips to white unless `textColor` is set.
     * Tip: pass `useAccent()` / `resolvedAccent` for a live-themed toggle.
     */
    color?: string;
    /** Custom pressed-state content color. Defaults adapt to `color`. */
    textColor?: string;
  };

export function Toggle({
  pressed,
  onPressedChange,
  label,
  icon,
  variant = 'default',
  size = 'md',
  shape = 'rounded',
  disabled,
  className,
  color,
  textColor,
  ...rest
}: ToggleProps) {
  const colors = useThemeColors();
  const reduceMotion = useReducedMotion();

  const progress = useSharedValue(pressed ? 1 : 0);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    progress.value = reduceMotion
      ? withTiming(pressed ? 1 : 0, { duration: 0 })
      : withTiming(pressed ? 1 : 0, { duration: 170 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pressed, reduceMotion]);

  const onColor = color ?? colors.secondary;
  const onContent = textColor ?? (color ? '#ffffff' : colors.secondaryForeground);

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], ['transparent', onColor]),
    transform: [{ scale: pressScale.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [colors.foreground, onContent]),
  }));

  const iconSize = size === 'lg' ? 20 : size === 'sm' ? 15 : 18;

  return (
    <AnimatedPressable
      accessibilityRole="switch"
      accessibilityState={{ selected: pressed, disabled }}
      disabled={disabled}
      hitSlop={6}
      onPress={() => onPressedChange?.(!pressed)}
      onPressIn={() => {
        pressScale.value = reduceMotion ? 1 : withSpring(0.92, { mass: 0.4, damping: 12 });
      }}
      onPressOut={() => {
        pressScale.value = reduceMotion ? 1 : withSpring(1, { mass: 0.4, damping: 12 });
      }}
      style={containerStyle}
      className={cn(toggle({ variant, size, shape }), disabled && 'opacity-50', className)}
      {...rest}>
      {icon ? (
        <SymbolView
          name={icon}
          tintColor={pressed ? onContent : colors.foreground}
          size={iconSize}
        />
      ) : null}
      {label ? (
        <AnimatedText
          style={contentStyle}
          className={cn('font-medium', size === 'sm' ? 'text-[13px]' : size === 'lg' ? 'text-base' : 'text-[15px]')}>
          {label}
        </AnimatedText>
      ) : null}
    </AnimatedPressable>
  );
}
