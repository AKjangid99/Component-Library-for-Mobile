import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { forwardRef } from 'react';
import { Pressable, Text, TextInput, type TextInputProps, View } from 'react-native';
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
  variant?: 'outline' | 'filled' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: SymbolViewProps['name'];
  rightIcon?: SymbolViewProps['name'];
  clearable?: boolean;
  onClear?: () => void;
};

const sizeClasses = {
  sm: 'h-9 px-3 text-sm rounded-lg',
  md: 'h-11 px-3.5 text-base rounded-xl',
  lg: 'h-14 px-4 text-lg rounded-2xl',
} as const;

const variantClasses = {
  outline: 'border bg-background',
  filled: 'border border-transparent bg-muted',
  ghost: 'border border-transparent bg-transparent',
} as const;

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  {
    label,
    helperText,
    error,
    className,
    containerClassName,
    variant = 'outline',
    size = 'md',
    leftIcon,
    rightIcon,
    clearable,
    onClear,
    value,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const colors = useThemeColors();
  const focus = useSharedValue(0);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? colors.destructive
      : variant === 'filled' || variant === 'ghost'
        ? 'transparent'
        : interpolateColor(focus.value, [0, 1], [colors.border, colors.ring]),
    backgroundColor:
      variant === 'filled'
        ? interpolateColor(focus.value, [0, 1], [colors.muted, colors.background])
        : undefined,
  }));

  const showClear = clearable && value && (value as string).length > 0;

  return (
    <View className={cn('gap-1.5', containerClassName)}>
      {label ? <Text className="text-sm font-medium text-foreground">{label}</Text> : null}
      <View className="relative justify-center">
        {leftIcon ? (
          <View className="absolute left-3 z-10">
            <SymbolView name={leftIcon} size={18} tintColor={colors.mutedForeground} />
          </View>
        ) : null}
        <AnimatedTextInput
          ref={ref}
          value={value}
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
            variantClasses[variant],
            sizeClasses[size],
            'w-full text-foreground',
            leftIcon && 'pl-10',
            (rightIcon || showClear) && 'pr-10',
            className,
          )}
          {...rest}
        />
        {showClear ? (
          <Pressable onPress={onClear} className="absolute right-3">
            <SymbolView name="xmark.circle.fill" size={18} tintColor={colors.mutedForeground} />
          </Pressable>
        ) : rightIcon ? (
          <View className="absolute right-3">
            <SymbolView name={rightIcon} size={18} tintColor={colors.mutedForeground} />
          </View>
        ) : null}
      </View>
      {error ? (
        <Text className="text-xs text-destructive">{error}</Text>
      ) : helperText ? (
        <Text className="text-xs text-muted-foreground">{helperText}</Text>
      ) : null}
    </View>
  );
});
