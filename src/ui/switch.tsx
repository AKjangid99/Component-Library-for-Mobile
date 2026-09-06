import { useEffect } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/ui/lib/cn';
import { useThemeColors } from '@/ui/lib/theme';

/** Animation personality of the thumb. Each variant moves differently. */
export type SwitchVariant =
  /** Calm, linear-feeling slide — the classic. */
  | 'slide'
  /** iOS-style overshoot: the thumb springs past its rest point and settles. */
  | 'spring'
  /** Snappy slide with squash-and-stretch: the thumb elongates mid-travel. */
  | 'stretch'
  /** The thumb flips over (rotateY) while it travels across the track. */
  | 'flip';

export type SwitchProps = Omit<PressableProps, 'onPress'> & {
  value: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
  /**
   * Custom track color for the on-state (any hex). Off-state always uses
   * the theme input color. Tip: pass `useAccent()` / `resolvedAccent`
   * for a live-themed switch.
   */
  color?: string;
  /** Track/thumb scale. Both meet the 44pt touch target via hitSlop. */
  size?: 'sm' | 'md';
  /** Animation personality. @default 'slide' */
  variant?: SwitchVariant;
};

const SIZES = {
  sm: { trackWidth: 44, trackHeight: 27, thumb: 21, padding: 3 },
  md: { trackWidth: 52, trackHeight: 32, thumb: 26, padding: 3 },
} as const;

export function Switch({
  value,
  onValueChange,
  disabled,
  className,
  color,
  size = 'md',
  variant = 'slide',
  ...rest
}: SwitchProps) {
  const colors = useThemeColors();
  const reduceMotion = useReducedMotion();
  const dims = SIZES[size];
  const onColor = color ?? colors.primary;
  const travel = dims.trackWidth - dims.thumb - dims.padding * 2;

  const progress = useSharedValue(value ? 1 : 0);
  // Extra kick for the `stretch` variant: spikes on every toggle, then settles.
  const squash = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = withTiming(value ? 1 : 0, { duration: 0 });
      squash.value = 1;
      return;
    }
    switch (variant) {
      case 'spring':
        progress.value = withSpring(value ? 1 : 0, {
          mass: 0.55,
          damping: 11,
          stiffness: 190,
        });
        break;
      case 'stretch':
        progress.value = withTiming(value ? 1 : 0, { duration: 150 });
        squash.value = withSequence(
          withTiming(1.45, { duration: 90 }),
          withSpring(1, { mass: 0.5, damping: 9, stiffness: 280 }),
        );
        break;
      case 'flip':
        progress.value = withTiming(value ? 1 : 0, { duration: 240 });
        break;
      case 'slide':
      default:
        progress.value = withTiming(value ? 1 : 0, { duration: 180 });
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, variant, reduceMotion]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.input, onColor]),
  }));

  const thumbStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const base = { translateX: p * travel };
    switch (variant) {
      case 'spring': {
        // Gentle scale pop peaking mid-travel, on top of the spring overshoot.
        const pop = 1 + 0.1 * Math.sin(p * Math.PI);
        return { transform: [{ translateX: base.translateX }, { scale: pop }] };
      }
      case 'stretch': {
        const sx = squash.value;
        const sy = 1 - (sx - 1) * 0.5;
        return { transform: [{ translateX: base.translateX }, { scaleX: sx }, { scaleY: sy }] };
      }
      case 'flip': {
        // Flip over mid-travel with a slight dip for depth.
        const dip = 1 - 0.12 * Math.sin(p * Math.PI);
        return {
          transform: [
            { translateX: base.translateX },
            { rotateY: `${p * 180}deg` },
            { scale: dip },
          ],
        };
      }
      case 'slide':
      default:
        return { transform: [{ translateX: base.translateX }] };
    }
  });

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={() => onValueChange?.(!value)}
      className={cn(disabled && 'opacity-50', className)}
      {...rest}>
      <Animated.View
        style={[
          {
            width: dims.trackWidth,
            height: dims.trackHeight,
            borderRadius: dims.trackHeight / 2,
            padding: dims.padding,
            justifyContent: 'center',
          },
          trackStyle,
        ]}>
        <Animated.View
          style={[
            {
              width: dims.thumb,
              height: dims.thumb,
              borderRadius: dims.thumb / 2,
              backgroundColor: '#ffffff',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.22,
              shadowRadius: 2,
              elevation: 2,
            },
            thumbStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}
