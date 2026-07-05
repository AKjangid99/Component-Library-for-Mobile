import { cva, type VariantProps } from 'class-variance-authority';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { forwardRef } from 'react';
import { ActivityIndicator, Pressable, type PressableProps, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { cn } from '@/ui/lib/cn';
import { useThemeColors } from '@/ui/lib/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const button = cva('flex-row items-center justify-center gap-2 rounded-xl', {
  variants: {
    variant: {
      filled: 'bg-primary',
      tonal: 'bg-secondary',
      outline: 'border border-border bg-transparent',
      ghost: 'bg-transparent',
      destructive: 'bg-destructive',
    },
    size: {
      sm: 'h-9 px-3',
      md: 'h-11 px-4',
      lg: 'h-14 px-6',
    },
    disabled: {
      true: 'opacity-50',
    },
  },
  defaultVariants: { variant: 'filled', size: 'md' },
});

const buttonText = cva('font-medium', {
  variants: {
    variant: {
      filled: 'text-primary-foreground',
      tonal: 'text-secondary-foreground',
      outline: 'text-foreground',
      ghost: 'text-foreground',
      destructive: 'text-destructive-foreground',
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: { variant: 'filled', size: 'md' },
});

type ButtonVariant = NonNullable<VariantProps<typeof button>['variant']>;

/** Icon tint that matches each variant's text color. */
function iconColorFor(variant: ButtonVariant, colors: ReturnType<typeof useThemeColors>) {
  switch (variant) {
    case 'filled':
      return colors.primaryForeground;
    case 'destructive':
      return colors.destructiveForeground;
    case 'tonal':
      return colors.secondaryForeground;
    default:
      return colors.foreground;
  }
}

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
    className?: string;
    textClassName?: string;
  };

export const Button = forwardRef<View, ButtonProps>(function Button(
  {
    label,
    children,
    variant = 'filled',
    size = 'md',
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    className,
    textClassName,
    ...rest
  },
  ref,
) {
  const colors = useThemeColors();
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const iconColor = iconColorFor(variant ?? 'filled', colors);
  const iconSize = size === 'lg' ? 20 : size === 'sm' ? 15 : 18;

  return (
    <AnimatedPressable
      ref={ref}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPressIn={(e) => {
        scale.value = withSpring(0.96, { mass: 0.4, damping: 12 });
        rest.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { mass: 0.4, damping: 12 });
        rest.onPressOut?.(e);
      }}
      style={animatedStyle}
      className={cn(button({ variant, size, disabled: isDisabled }), className)}
      {...rest}>
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <>
          {leftIcon ? <SymbolView name={leftIcon} tintColor={iconColor} size={iconSize} /> : null}
          {children ??
            (label ? (
              <Text className={cn(buttonText({ variant, size }), textClassName)}>{label}</Text>
            ) : null)}
          {rightIcon ? <SymbolView name={rightIcon} tintColor={iconColor} size={iconSize} /> : null}
        </>
      )}
    </AnimatedPressable>
  );
});
