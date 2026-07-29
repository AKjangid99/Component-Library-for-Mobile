import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { Pressable, type PressableProps, Text, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/ui/lib/cn';
import { useThemeColors } from '@/ui/lib/theme';

const AnimatedSymbol = Animated.createAnimatedComponent(SymbolView);

export type CheckboxProps = Omit<PressableProps, 'onPress'> & {
  value: boolean;
  onValueChange?: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
};

export function Checkbox({
  value,
  onValueChange,
  label,
  disabled,
  className,
  ...rest
}: CheckboxProps) {
  const colors = useThemeColors();
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 160 });
  }, [value, progress]);

  const boxStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], ['#00000000', colors.primary]),
    borderColor: interpolateColor(progress.value, [0, 1], [colors.border, colors.primary]),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: progress.value }],
  }));

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onValueChange?.(!value)}
      className={cn('flex-row items-center gap-2.5', disabled && 'opacity-50', className)}
      {...rest}>
      <Animated.View
        style={[
          {
            width: 24,
            height: 24,
            borderRadius: 7,
            borderWidth: 2,
            alignItems: 'center',
            justifyContent: 'center',
          },
          boxStyle,
        ]}>
        <AnimatedSymbol
          name="checkmark"
          tintColor={colors.primaryForeground}
          size={15}
          weight="bold"
          style={checkStyle}
        />
      </Animated.View>
      {label ? <Text className="text-base text-foreground">{label}</Text> : null}
    </Pressable>
  );
}

/** Row wrapper: a labeled control on the left, `children` control on the right. */
export function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <Text className="text-base text-foreground">{label}</Text>
      {children}
    </View>
  );
}
