import { Check, Eye, EyeOff, type LucideIcon } from 'lucide-react-native';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/ui/lib/cn';
import { useThemeColors } from '@/ui/lib/theme';

/** Imperative handle so a parent can drive the field, e.g. `ref.current.focus()`. */
export interface FloatingLabelInputHandle {
  focus: () => void;
  blur: () => void;
  clear: () => void;
}

export interface FloatingLabelInputProps extends Omit<TextInputProps, 'placeholder' | 'style'> {
  label: string;
  leftIcon?: LucideIcon;
  /** Show a password visibility toggle and start masked. */
  secureTextEntry?: boolean;
  /** Error message — turns the ring/border red and shows helper text in red. */
  error?: string;
  /** Marks the field valid — green ring plus a check icon. */
  valid?: boolean;
  /** Neutral helper text shown when there is no error. */
  helperText?: string;
  className?: string;
}

const AnimatedText = Animated.createAnimatedComponent(Text);

export const FloatingLabelInput = forwardRef<FloatingLabelInputHandle, FloatingLabelInputProps>(
  function FloatingLabelInput(
    {
      label,
      leftIcon: LeftIcon,
      secureTextEntry = false,
      error,
      valid = false,
      helperText,
      value,
      defaultValue,
      onFocus,
      onBlur,
      onChangeText,
      className,
      ...rest
    },
    ref,
  ) {
    const colors = useThemeColors();
    const reduceMotion = useReducedMotion();
    const inputRef = useRef<TextInput>(null);

    const [focused, setFocused] = useState(false);
    const [masked, setMasked] = useState(secureTextEntry);
    // Track filled state for uncontrolled usage; mirror `value` when controlled.
    const [innerValue, setInnerValue] = useState(defaultValue ?? '');
    const text = value ?? innerValue;
    const hasValue = text.length > 0;

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: () => {
        inputRef.current?.clear();
        setInnerValue('');
        onChangeText?.('');
      },
    }));

    const duration = reduceMotion ? 0 : 160;
    const floated = useDerivedValue(() => withTiming(focused || hasValue ? 1 : 0, { duration }));
    const focus = useDerivedValue(() => withTiming(focused ? 1 : 0, { duration }));

    const stateColor = error ? colors.destructive : valid ? colors.success : colors.ring;

    const borderStyle = useAnimatedStyle(() => ({
      borderColor:
        error || valid
          ? stateColor
          : interpolateColor(focus.value, [0, 1], [colors.border, colors.ring]),
      // Focus ring: a soft colored glow that grows in on focus.
      shadowColor: stateColor,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: interpolate(focus.value, [0, 1], [0, 8]),
      shadowOpacity: error || valid ? 0.35 : interpolate(focus.value, [0, 1], [0, 0.35]),
    }));

    const labelTransform = useAnimatedStyle(() => ({
      transform: [
        { translateY: interpolate(floated.value, [0, 1], [0, -13]) },
        { scale: interpolate(floated.value, [0, 1], [1, 0.8]) },
      ],
    }));
    const labelColor = useAnimatedStyle(() => ({
      color: interpolateColor(
        floated.value,
        [0, 1],
        [colors.mutedForeground, error ? colors.destructive : valid ? colors.success : colors.ring],
      ),
    }));

    const helper = error ?? helperText;

    return (
      <View className={cn('w-full gap-1.5', className)}>
        <Animated.View
          style={borderStyle}
          className="h-14 flex-row items-center rounded-2xl border bg-card px-4">
          {LeftIcon ? (
            <View className="mr-3">
              <LeftIcon size={18} color={colors.mutedForeground} strokeWidth={2} />
            </View>
          ) : null}

          <View className="flex-1 justify-center">
            <Animated.View
              // Non-interactive: taps fall through to the input below it.
              pointerEvents="none"
              style={[labelTransform, styles.labelAnchor]}
              className="absolute">
              <AnimatedText numberOfLines={1} style={labelColor} className="text-base font-medium">
                {label}
              </AnimatedText>
            </Animated.View>
            <TextInput
              ref={inputRef}
              value={value}
              defaultValue={defaultValue}
              secureTextEntry={masked}
              onFocus={(e) => {
                setFocused(true);
                onFocus?.(e);
              }}
              onBlur={(e) => {
                setFocused(false);
                onBlur?.(e);
              }}
              onChangeText={(t) => {
                if (value == null) setInnerValue(t);
                onChangeText?.(t);
              }}
              placeholder=""
              placeholderTextColor={colors.mutedForeground}
              selectionColor={colors.primary}
              className="pt-4 text-base text-foreground"
              {...rest}
            />
          </View>

          {secureTextEntry ? (
            <Pressable
              onPress={() => setMasked((m) => !m)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={masked ? 'Show password' : 'Hide password'}
              className="ml-2 p-1">
              {masked ? (
                <EyeOff size={18} color={colors.mutedForeground} strokeWidth={2} />
              ) : (
                <Eye size={18} color={colors.mutedForeground} strokeWidth={2} />
              )}
            </Pressable>
          ) : valid ? (
            <View className="ml-2">
              <Check size={18} color={colors.success} strokeWidth={2.5} />
            </View>
          ) : null}
        </Animated.View>

        {helper ? (
          <Text
            className={cn(
              'px-1 text-xs',
              error ? 'text-destructive' : valid ? 'text-success' : 'text-muted-foreground',
            )}>
            {helper}
          </Text>
        ) : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  // Scale from the left edge so the label shrinks toward its start, not its center.
  labelAnchor: { transformOrigin: 'left center' },
});
