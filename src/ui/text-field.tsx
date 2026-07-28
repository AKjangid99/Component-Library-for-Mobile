import { forwardRef } from 'react';
import { Text, TextInput, type TextInputProps, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/ui/lib/cn';
import { useThemeColors } from '@/ui/lib/theme';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export type TextFieldProps = TextInputProps & {
  label?: string;
  helperText?: string;
  error?: string;
  className?: string;
  containerClassName?: string;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, helperText, error, className, containerClassName, onFocus, onBlur, ...rest },
  ref,
) {
  const colors = useThemeColors();
  const focus = useSharedValue(0);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? colors.destructive
      : interpolateColor(focus.value, [0, 1], [colors.border, colors.ring]),
  }));

  return (
    <View className={cn('gap-1.5', containerClassName)}>
      {label ? <Text className="text-sm font-medium text-foreground">{label}</Text> : null}
      <AnimatedTextInput
        ref={ref}
        placeholderTextColor={colors.mutedForeground}
        onFocus={(e) => {
          focus.value = withTiming(1, { duration: 150 });
          onFocus?.(e);
        }}
        onBlur={(e) => {
          focus.value = withTiming(0, { duration: 150 });
          onBlur?.(e);
        }}
        style={borderStyle}
        className={cn(
          'h-11 rounded-xl border bg-background px-3.5 text-base text-foreground',
          className,
        )}
        {...rest}
      />
      {error ? (
        <Text className="text-xs text-destructive">{error}</Text>
      ) : helperText ? (
        <Text className="text-xs text-muted-foreground">{helperText}</Text>
      ) : null}
    </View>
  );
});
