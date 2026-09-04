import { type LucideIcon } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/ui/lib/cn';
import { useThemeColors } from '@/ui/lib/theme';

const SIZES = {
  sm: { w: 44, h: 26, thumb: 20, pad: 3, icon: 12 },
  md: { w: 54, h: 32, thumb: 26, pad: 3, icon: 15 },
} as const;

export interface MorphToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  /** Icon rendered inside the thumb — its color follows the track state. */
  icon?: LucideIcon;
  /** Inline label shown beside the track and wired to the switch for a11y. */
  label?: string;
  size?: keyof typeof SIZES;
  disabled?: boolean;
  className?: string;
}

const AnimatedView = Animated.createAnimatedComponent(View);

/**
 * A custom switch. The bold choice is the thumb: it's spring-driven, so it
 * overshoots slightly and settles — a tactile "morph" the OS switch never does —
 * and can carry an icon that recolors as the track fills.
 */
export function MorphToggle({
  value,
  onValueChange,
  icon: Icon,
  label,
  size = 'md',
  disabled = false,
  className,
}: MorphToggleProps) {
  const colors = useThemeColors();
  const reduceMotion = useReducedMotion();
  const s = SIZES[size];

  const progress = useDerivedValue(() =>
    reduceMotion
      ? withTiming(value ? 1 : 0, { duration: 0 })
      : withSpring(value ? 1 : 0, { mass: 0.5, damping: 14, stiffness: 160 }),
  );

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.secondary, colors.primary]),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [0, s.w - s.thumb - s.pad * 2]) }],
  }));

  const toggle = () => !disabled && onValueChange(!value);
  const iconColor = value ? colors.primary : colors.mutedForeground;

  const control = (
    <AnimatedView
      style={[trackStyle, { width: s.w, height: s.h, padding: s.pad }]}
      className="justify-center rounded-full">
      <AnimatedView
        style={[thumbStyle, { width: s.thumb, height: s.thumb, shadowColor: '#000' }]}
        className="items-center justify-center rounded-full bg-white shadow-sm">
        {Icon ? <Icon size={s.icon} color={iconColor} strokeWidth={2.5} /> : null}
      </AnimatedView>
    </AnimatedView>
  );

  return (
    <Pressable
      onPress={toggle}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={label}
      hitSlop={8}
      className={cn('flex-row items-center gap-3', disabled && 'opacity-50', className)}>
      {control}
      {label ? <Text className="text-base text-foreground">{label}</Text> : null}
    </Pressable>
  );
}
