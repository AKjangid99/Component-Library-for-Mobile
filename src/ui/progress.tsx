import { useEffect } from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/ui/lib/cn';

export type ProgressProps = ViewProps & {
  /** 0–100. */
  value?: number;
  className?: string;
  indicatorClassName?: string;
};

export function Progress({ value = 0, className, indicatorClassName, ...rest }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const progress = useSharedValue(clamped);

  useEffect(() => {
    progress.value = withTiming(clamped, { duration: 400 });
  }, [clamped, progress]);

  const indicatorStyle = useAnimatedStyle(() => ({ width: `${progress.value}%` }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}
      {...rest}>
      <Animated.View
        className={cn('h-full rounded-full bg-primary', indicatorClassName)}
        style={indicatorStyle}
      />
    </View>
  );
}
