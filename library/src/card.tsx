import { cva, type VariantProps } from 'class-variance-authority';
import { Pressable, Text, type TextProps, View, type ViewProps } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { cn } from '@/ui/lib/cn';
import { useThemeColors } from '@/ui/lib/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const card = cva('rounded-2xl p-4', {
  variants: {
    variant: {
      default: 'border border-border bg-card',
      elevated: 'border border-border bg-card shadow-sm',
      outline: 'border border-border bg-transparent',
      ghost: 'bg-transparent',
      filled: 'bg-muted',
      // Borderless card surface — used by the animated variant, which draws its
      // own accent-blooming border in a Reanimated style.
      plain: 'bg-card',
    },
    interactive: {
      true: 'active:opacity-90',
      false: '',
    },
  },
  defaultVariants: { variant: 'default' },
});

export type CardProps = ViewProps &
  VariantProps<typeof card> & {
    className?: string;
    pressable?: boolean;
    onPress?: () => void;
    /**
     * Adds a springy lift on press (and hover, on web): the surface scales up
     * slightly and casts a growing glow, so the whole card reads as a tactile,
     * elevated control. Implies interactivity — no `active:opacity` needed.
     */
    animated?: boolean;
    /**
     * When `animated`, draws a hairline border that blooms into the accent color
     * on engagement. Default `true`; set `false` for cards with their own fill
     * (e.g. a gradient) that should lift and glow without a framing border.
     */
    borderBloom?: boolean;
  };

export function Card({
  variant,
  interactive,
  pressable,
  onPress,
  animated,
  borderBloom = true,
  className,
  children,
  ...rest
}: CardProps) {
  const isInteractive = interactive ?? (!!onPress || !!pressable);

  // Animated interactive surface: springs up and glows on press/hover.
  if (animated) {
    // The animated surface manages its own border so it can bloom into the
    // accent color, so drop the static border classes for the bordered variants.
    const base = variant === 'ghost' || variant === 'filled' ? variant : 'plain';
    return (
      <AnimatedCardSurface
        onPress={onPress}
        borderBloom={borderBloom}
        className={cn(card({ variant: base, interactive: false }), className)}
        {...rest}>
        {children}
      </AnimatedCardSurface>
    );
  }

  const content = (
    <View className={cn(card({ variant, interactive: isInteractive }), className)} {...rest}>
      {children}
    </View>
  );
  if (pressable || onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button">
        {content}
      </Pressable>
    );
  }
  return content;
}

type AnimatedCardSurfaceProps = ViewProps & {
  className?: string;
  onPress?: () => void;
  borderBloom?: boolean;
  children?: React.ReactNode;
};

function AnimatedCardSurface({
  className,
  onPress,
  borderBloom = true,
  children,
  ...rest
}: AnimatedCardSurfaceProps) {
  const colors = useThemeColors();
  const reduceMotion = useReducedMotion();
  // 0 = resting, 1 = engaged (pressed or hovered).
  const active = useSharedValue(0);

  const engage = () => {
    active.value = reduceMotion ? 1 : withSpring(1, { mass: 0.5, damping: 13, stiffness: 180 });
  };
  const release = () => {
    active.value = reduceMotion ? 0 : withSpring(0, { mass: 0.6, damping: 16, stiffness: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    const a = active.value;
    return {
      transform: [
        { scale: reduceMotion ? 1 : interpolate(a, [0, 1], [1, 1.03]) },
        { translateY: reduceMotion ? 0 : interpolate(a, [0, 1], [0, -5]) },
      ],
      // A hairline border that blooms from the neutral border into the accent.
      borderWidth: borderBloom ? 1.5 : 0,
      borderColor: interpolateColor(a, [0, 1], [colors.border, colors.primary]),
      // Colored glow that grows with engagement (iOS shadow / Android elevation).
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: interpolate(a, [0, 1], [3, 14]) },
      shadowRadius: interpolate(a, [0, 1], [8, 26]),
      shadowOpacity: interpolate(a, [0, 1], [0.1, 0.45]),
      elevation: interpolate(a, [0, 1], [2, 12]),
    };
  });

  return (
    <AnimatedPressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      onPressIn={engage}
      onPressOut={release}
      // Web-only hover handlers — no-ops on native.
      onHoverIn={engage}
      onHoverOut={release}
      style={animatedStyle}
      className={className}
      {...rest}>
      {children}
    </AnimatedPressable>
  );
}

export function CardHeader({ className, ...rest }: ViewProps & { className?: string }) {
  return <View className={cn('gap-1 pb-3', className)} {...rest} />;
}

export function CardTitle({ className, ...rest }: TextProps & { className?: string }) {
  return (
    <Text className={cn('text-lg font-semibold text-card-foreground', className)} {...rest} />
  );
}

export function CardDescription({ className, ...rest }: TextProps & { className?: string }) {
  return <Text className={cn('text-sm text-muted-foreground', className)} {...rest} />;
}

export function CardContent({ className, ...rest }: ViewProps & { className?: string }) {
  return <View className={cn('gap-2', className)} {...rest} />;
}

export function CardFooter({ className, ...rest }: ViewProps & { className?: string }) {
  return <View className={cn('flex-row items-center gap-2 pt-3', className)} {...rest} />;
}

// Subtle media header for image cards
export function CardMedia({ className, ...rest }: ViewProps & { className?: string }) {
  return <View className={cn('-m-4 mb-0 overflow-hidden rounded-t-2xl', className)} {...rest} />;
}
