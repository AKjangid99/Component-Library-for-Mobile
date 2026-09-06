import { Check, Eye, EyeOff, type LucideIcon, X } from 'lucide-react-native';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  Platform,
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

const AnimatedText = Animated.createAnimatedComponent(Text);

/** Imperative handle so a parent can drive the field, e.g. `ref.current.focus()`. */
export interface InputHandle {
  focus: () => void;
  blur: () => void;
  clear: () => void;
}

export type InputVariant = 'outline' | 'filled' | 'ghost' | 'underline';
export type InputSize = 'sm' | 'md' | 'lg';
/** `stacked` places the label above the field; `floating` animates it into the border. */
export type InputLabelStyle = 'stacked' | 'floating';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  /** How the label is presented. Defaults to `stacked` (label above the field). */
  labelStyle?: InputLabelStyle;
  /** Neutral helper text shown below the field when there is no error. */
  helperText?: string;
  /** Error message — paints the border/ring red and shows the text in red. */
  error?: string;
  /** Marks the field valid — green border/ring plus a trailing check icon. */
  valid?: boolean;
  variant?: InputVariant;
  size?: InputSize;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  /** Show a clear (×) button while the field has content. */
  clearable?: boolean;
  onClear?: () => void;
  /** Show a live `count / maxLength` counter. Requires `maxLength`. */
  showCount?: boolean;
  className?: string;
  containerClassName?: string;
}

const sizeConfig = {
  sm: { height: 40, radius: 10, padX: 12, gap: 8, font: 14, icon: 16 },
  md: { height: 48, radius: 14, padX: 14, gap: 10, font: 16, icon: 18 },
  lg: { height: 56, radius: 16, padX: 16, gap: 12, font: 17, icon: 20 },
} as const;

export const Input = forwardRef<InputHandle, InputProps>(function Input(
  {
    label,
    labelStyle = 'stacked',
    helperText,
    error,
    valid = false,
    variant = 'outline',
    size = 'md',
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    clearable = false,
    onClear,
    showCount = false,
    secureTextEntry = false,
    value,
    defaultValue,
    maxLength,
    editable = true,
    onFocus,
    onBlur,
    onChangeText,
    className,
    containerClassName,
    ...rest
  },
  ref,
) {
  const colors = useThemeColors();
  const reduceMotion = useReducedMotion();
  const inputRef = useRef<TextInput>(null);

  const [focused, setFocused] = useState(false);
  const [masked, setMasked] = useState(secureTextEntry);
  // Mirror `value` when controlled; track our own for uncontrolled usage.
  const [innerValue, setInnerValue] = useState(defaultValue ?? '');
  const text = value ?? innerValue;
  const hasValue = text.length > 0;

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => {
      inputRef.current?.clear();
      if (value == null) setInnerValue('');
      onChangeText?.('');
      onClear?.();
    },
  }));

  const cfg = sizeConfig[size];
  const isFloating = labelStyle === 'floating' && !!label;
  const isUnderline = variant === 'underline';
  const duration = reduceMotion ? 0 : 160;

  const focus = useDerivedValue(() => withTiming(focused ? 1 : 0, { duration }));
  const floated = useDerivedValue(() =>
    withTiming(focused || hasValue ? 1 : 0, { duration }),
  );

  // A single accent drives every active state: valid → success, error → destructive, else ring.
  const stateColor = error ? colors.destructive : valid ? colors.success : colors.ring;
  const restBorder = variant === 'outline' || isUnderline ? colors.border : 'transparent';

  const containerAnim = useAnimatedStyle(() => {
    const active = error || valid ? 1 : focus.value;
    return {
      borderColor:
        error || valid ? stateColor : interpolateColor(focus.value, [0, 1], [restBorder, colors.ring]),
      backgroundColor:
        variant === 'filled'
          ? interpolateColor(focus.value, [0, 1], [colors.muted, colors.card])
          : variant === 'ghost' || isUnderline
            ? 'transparent'
            : colors.background,
      // Soft focus glow — grows in on focus, held for error/valid.
      shadowColor: stateColor,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: interpolate(active, [0, 1], [0, 10]),
      shadowOpacity: interpolate(active, [0, 1], [0, 0.28]),
      elevation: interpolate(active, [0, 1], [0, 3]),
    };
  });

  const floatLabelStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(floated.value, [0, 1], [0, -(cfg.height / 2 - 10)]) },
      { scale: interpolate(floated.value, [0, 1], [1, 0.82]) },
    ],
  }));
  const floatLabelColor = useAnimatedStyle(() => ({
    color: interpolateColor(
      floated.value,
      [0, 1],
      [colors.mutedForeground, error ? colors.destructive : valid ? colors.success : colors.ring],
    ),
  }));

  const showClear = clearable && hasValue && editable;
  const showCheck = valid && !secureTextEntry;
  const helper = error ?? helperText;

  const handleChange = (t: string) => {
    if (value == null) setInnerValue(t);
    onChangeText?.(t);
  };

  return (
    <View className={cn('w-full gap-1.5', containerClassName)} style={{ opacity: editable ? 1 : 0.55 }}>
      {/* Stacked label sits above the field (taste: label above input). */}
      {label && !isFloating ? (
        <Text className="px-0.5 text-sm font-medium text-foreground">{label}</Text>
      ) : null}

      <Animated.View
        style={[
          containerAnim,
          {
            minHeight: cfg.height,
            paddingHorizontal: isUnderline ? 2 : cfg.padX,
            borderRadius: isUnderline ? 0 : cfg.radius,
            borderWidth: isUnderline ? 0 : 1,
            borderBottomWidth: isUnderline ? 2 : 1,
            columnGap: cfg.gap,
          },
        ]}
        className="flex-row items-center">
        {LeftIcon ? (
          <LeftIcon
            size={cfg.icon}
            color={focused ? stateColor : colors.mutedForeground}
            strokeWidth={2}
          />
        ) : null}

        <View className="flex-1 justify-center">
          {isFloating ? (
            <Animated.View
              pointerEvents="none"
              style={[floatLabelStyle, styles.labelAnchor]}
              className="absolute">
              {/* Font size matches the input; the scale transform handles the float shrink. */}
              <AnimatedText
                numberOfLines={1}
                style={[floatLabelColor, { fontSize: cfg.font }]}
                className="font-medium">
                {label}
              </AnimatedText>
            </Animated.View>
          ) : null}

          <TextInput
            ref={inputRef}
            value={value}
            defaultValue={defaultValue}
            editable={editable}
            maxLength={maxLength}
            secureTextEntry={masked}
            placeholder={isFloating ? '' : rest.placeholder}
            placeholderTextColor={colors.mutedForeground}
            selectionColor={colors.primary}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            onChangeText={handleChange}
            style={[
              styles.input,
              { fontSize: cfg.font, color: colors.foreground },
              isFloating ? { paddingTop: 14 } : null,
            ]}
            // outline-none compiles to real `outline-style: none` CSS on web,
            // killing the browser's native focus box. (An `outlineWidth`
            // inline style does NOT work — react-native-web's DOM compiler
            // drops it.) The component's own animated ring stays the single
            // focus indicator. Native platforms ignore the class.
            className={cn('outline-none', className)}
            {...rest}
          />
        </View>

        {/* Trailing controls: password toggle, clear, or a valid check. */}
        {secureTextEntry ? (
          <Pressable
            onPress={() => setMasked((m) => !m)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={masked ? 'Show password' : 'Hide password'}
            className="p-0.5 active:opacity-60">
            {masked ? (
              <EyeOff size={cfg.icon} color={colors.mutedForeground} strokeWidth={2} />
            ) : (
              <Eye size={cfg.icon} color={colors.mutedForeground} strokeWidth={2} />
            )}
          </Pressable>
        ) : showClear ? (
          <Pressable
            onPress={() => {
              if (value == null) setInnerValue('');
              inputRef.current?.clear();
              onChangeText?.('');
              onClear?.();
            }}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Clear text"
            className="rounded-full active:opacity-60">
            <X size={cfg.icon} color={colors.mutedForeground} strokeWidth={2.25} />
          </Pressable>
        ) : showCheck ? (
          <Check size={cfg.icon} color={colors.success} strokeWidth={2.5} />
        ) : RightIcon ? (
          <RightIcon size={cfg.icon} color={colors.mutedForeground} strokeWidth={2} />
        ) : null}
      </Animated.View>

      {/* Helper / error line, plus optional live counter. Error text sits below the field. */}
      {helper || (showCount && maxLength) ? (
        <View className="flex-row items-start justify-between px-0.5">
          {helper ? (
            <Text
              className={cn(
                'flex-1 text-xs',
                error ? 'text-destructive' : valid ? 'text-success' : 'text-muted-foreground',
              )}>
              {helper}
            </Text>
          ) : (
            <View className="flex-1" />
          )}
          {showCount && maxLength ? (
            <Text
              className={cn(
                'ml-2 text-xs tabular-nums',
                text.length >= maxLength ? 'text-warning' : 'text-muted-foreground',
              )}>
              {text.length}/{maxLength}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  input: {
    flex: 1,
    paddingVertical: 0,
    // Keep the caret/text vertically centered across platforms.
    ...(Platform.OS === 'android' ? { textAlignVertical: 'center' as const } : null),
  },
  // Scale from the left edge so the floating label shrinks toward its start.
  labelAnchor: { transformOrigin: 'left center' },
});
