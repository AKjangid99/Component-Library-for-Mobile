import { cva, type VariantProps } from 'class-variance-authority';
import { useEffect } from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/ui/lib/cn';

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
    },
    striped: {
      true: 'opacity-90',
      false: '',
    },
  },
  defaultVariants: { variant: 'default' },
});

export type ProgressProps = ViewProps &
  VariantProps<typeof progressTrack> &
  VariantProps<typeof progressIndicator> & {
    /** 0–100. */
    value?: number;
    className?: string;
    indicatorClassName?: string;
    showValue?: boolean;
  };

export function Progress({
  value = 0,
  size,
  variant,
  striped,
  className,
  indicatorClassName,
  showValue,
  ...rest
}: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const progress = useSharedValue(clamped);

  useEffect(() => {
    progress.value = withTiming(clamped, { duration: 400 });
  }, [clamped, progress]);

  const indicatorStyle = useAnimatedStyle(() => ({ width: `${progress.value}%` }));

  return (
    <View className="w-full gap-1.5">
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: clamped }}
        className={cn(progressTrack({ size }), className)}
        {...rest}>
        <Animated.View
          className={cn(progressIndicator({ variant, striped }), indicatorClassName)}
          style={indicatorStyle}
        />
      </View>
      {showValue ? (
        <View className="flex-row justify-between">
          <View />
          <Animated.Text className="text-xs font-medium text-muted-foreground">{Math.round(clamped)}%</Animated.Text>
        </View>
      ) : null}
    </View>
  );
}
