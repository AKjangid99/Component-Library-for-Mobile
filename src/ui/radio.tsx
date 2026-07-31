import { createContext, useContext, useEffect } from 'react';
import { Pressable, Text, View, type ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/ui/lib/cn';
import { useThemeColors } from '@/ui/lib/theme';

type RadioGroupContextValue = {
  value: string | undefined;
  onValueChange: (value: string) => void;
};

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export type RadioGroupProps = ViewProps & {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children?: React.ReactNode;
};

export function RadioGroup({
  value,
  onValueChange,
  className,
  children,
  ...rest
}: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange: onValueChange ?? (() => {}) }}>
      <View className={cn('gap-3', className)} {...rest}>
        {children}
      </View>
    </RadioGroupContext.Provider>
  );
}

export type RadioProps = {
  value: string;
  label?: string;
  disabled?: boolean;
  className?: string;
};

export function Radio({ value, label, disabled, className }: RadioProps) {
  const ctx = useContext(RadioGroupContext);
  if (!ctx) throw new Error('Radio must be used inside <RadioGroup>');
  const colors = useThemeColors();
  const selected = ctx.value === value;

  const progress = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, { duration: 150 });
  }, [selected, progress]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: progress.value }],
  }));

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={() => ctx.onValueChange(value)}
      className={cn('flex-row items-center gap-2.5', disabled && 'opacity-50', className)}>
      <View
        className="items-center justify-center rounded-full border-2"
        style={{
          width: 22,
          height: 22,
          borderColor: selected ? colors.primary : colors.border,
        }}>
        <Animated.View
          style={[
            { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
            dotStyle,
          ]}
        />
      </View>
      {label ? <Text className="text-base text-foreground">{label}</Text> : null}
    </Pressable>
  );
}
