import { cva, type VariantProps } from 'class-variance-authority';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View, type ViewProps } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/ui/lib/cn';
import { useThemeColors } from '@/ui/lib/theme';

// ---------------------------------------------------------------------------
// Contexts
// ---------------------------------------------------------------------------

type AccordionContextValue = {
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
  variant: NonNullable<AccordionProps['variant']>;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);
const ItemContext = createContext<{ value: string } | null>(null);

function useAccordionCtx() {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('Accordion.* must be used inside <Accordion>');
  return ctx;
}
function useItemCtx() {
  const ctx = useContext(ItemContext);
  if (!ctx) throw new Error('AccordionTrigger/Content must be inside <AccordionItem>');
  return ctx;
}

// ---------------------------------------------------------------------------
// Accordion — container variants
// ---------------------------------------------------------------------------

const accordionVariants = cva('overflow-hidden', {
  variants: {
    variant: {
      default: 'rounded-2xl border border-border bg-card',
      separated: 'gap-3 bg-transparent',
      ghost: 'bg-transparent',
      card: 'gap-3 bg-transparent',
    },
  },
  defaultVariants: { variant: 'default' },
});

export type AccordionProps = ViewProps & {
  /** `single` closes others; `multiple` allows many open. */
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  value?: string[];
  onValueChange?: (v: string[]) => void;
  variant?: 'default' | 'separated' | 'ghost' | 'card';
  className?: string;
  children?: React.ReactNode;
  collapsible?: boolean;
};

export function Accordion({
  type = 'single',
  defaultValue,
  value: controlled,
  onValueChange,
  variant = 'default',
  className,
  children,
  collapsible = true,
  ...rest
}: AccordionProps) {
  const [uncontrolled, setUncontrolled] = useState<string[]>(() =>
    controlled
      ? controlled
      : defaultValue == null
        ? []
        : Array.isArray(defaultValue)
          ? defaultValue
          : [defaultValue],
  );

  const open = controlled ?? uncontrolled;

  const toggle = useCallback(
    (v: string) => {
      const isOpen = open.includes(v);
      let next: string[];
      if (type === 'single') {
        if (isOpen) next = collapsible ? [] : open;
        else next = [v];
      } else {
        next = isOpen ? open.filter((x) => x !== v) : [...open, v];
      }
      if (!controlled) setUncontrolled(next);
      onValueChange?.(next);
    },
    [open, type, collapsible, controlled, onValueChange],
  );

  const ctx = useMemo<AccordionContextValue>(
    () => ({ isOpen: (v) => open.includes(v), toggle, variant }),
    [open, toggle, variant],
  );

  return (
    <AccordionContext.Provider value={ctx}>
      <View className={cn(accordionVariants({ variant }), className)} {...rest}>
        {children}
      </View>
    </AccordionContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// AccordionItem
// ---------------------------------------------------------------------------

const itemVariants = cva('overflow-hidden', {
  variants: {
    container: {
      default: 'border-b border-border last:border-b-0',
      separated: 'rounded-2xl border border-border bg-card shadow-sm',
      ghost: 'rounded-xl',
      card: 'rounded-2xl border border-border bg-card shadow-sm',
    },
  },
  defaultVariants: { container: 'default' },
});

export function AccordionItem({
  value,
  className,
  children,
  ...rest
}: ViewProps & { value: string; className?: string }) {
  const { variant } = useAccordionCtx();
  // map ghost -> ghost, default -> default, separated/card -> separated
  const mapped = variant === 'card' || variant === 'separated' ? 'separated' : (variant as 'default' | 'ghost');

  return (
    <ItemContext.Provider value={useMemo(() => ({ value }), [value])}>
      <View className={cn(itemVariants({ container: mapped as never }), className)} {...rest}>
        {children}
      </View>
    </ItemContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// AccordionTrigger — multiple approachable button-like variants
// ---------------------------------------------------------------------------

const triggerVariants = cva('flex-row items-center gap-3', {
  variants: {
    variant: {
      default: 'bg-transparent active:bg-muted/60',
      soft: 'm-1.5 rounded-xl bg-muted/70 active:bg-muted',
      outline: 'm-1.5 rounded-xl border border-border bg-card active:bg-muted/50',
      ghost: 'rounded-xl active:bg-muted/60',
      filled: 'm-1.5 rounded-xl bg-primary active:opacity-90',
      subtle: 'm-1.5 rounded-xl bg-secondary active:opacity-90',
    },
    size: {
      sm: 'min-h-11 px-3 py-2.5',
      md: 'min-h-14 px-4 py-3.5',
      lg: 'min-h-[64px] px-5 py-4',
    },
  },
  defaultVariants: { variant: 'default', size: 'md' },
});

export type AccordionTriggerProps = VariantProps<typeof triggerVariants> & {
  children: React.ReactNode;
  /** Leading SF Symbol — shown in a soft bubble that animates on open. */
  icon?: SymbolViewProps['name'];
  /** Custom bubble background when closed (auto tints on open). */
  iconBg?: string;
  /** Secondary line under the title — makes it feel friendly. */
  description?: string;
  /** Right-side count / badge pill. */
  badge?: string | number;
  /** Press animation personality */
  animation?: 'scale' | 'bounce' | 'lift' | 'none';
  className?: string;
  disabled?: boolean;
  chevron?: boolean;
};

export function AccordionTrigger({
  children,
  className,
  icon,
  iconBg,
  description,
  badge,
  variant = 'default',
  size = 'md',
  animation = 'scale',
  disabled,
  chevron = true,
}: AccordionTriggerProps) {
  const { isOpen, toggle } = useAccordionCtx();
  const { value } = useItemCtx();
  const colors = useThemeColors();
  const open = isOpen(value);

  // shared values
  const progress = useSharedValue(open ? 1 : 0);
  const pressScale = useSharedValue(1);
  const pressY = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(open ? 1 : 0, { duration: 260, easing: Easing.out(Easing.cubic) });
  }, [open, progress]);

  const isFilled = variant === 'filled';

  const chevronContainerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [
        isFilled ? 'rgba(255,255,255,0.18)' : colors.muted,
        isFilled ? 'rgba(255,255,255,0.95)' : colors.foreground,
      ] as never,
    ),
    transform: [{ scale: 0.96 + progress.value * 0.04 }],
  }));

  const chevronIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 180}deg` }],
  }));

  const iconBubbleStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [iconBg ?? (isFilled ? 'rgba(255,255,255,0.22)' : colors.secondary), colors.primary] as never,
    ),
    transform: [{ scale: 1 + progress.value * 0.06 }],
  }));

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }, { translateY: pressY.value }],
  }));

  const titleColor = isFilled ? colors.primaryForeground : colors.cardForeground;
  const descColor = isFilled ? 'rgba(255,255,255,0.78)' : colors.mutedForeground;

  const handlePressIn = () => {
    if (disabled) return;
    switch (animation) {
      case 'bounce':
        pressScale.value = withSpring(0.97, { mass: 0.4, damping: 11 });
        break;
      case 'lift':
        pressScale.value = withSpring(0.99, { mass: 0.5, damping: 14 });
        pressY.value = withSpring(1, { mass: 0.5, damping: 14 });
        break;
      case 'scale':
        pressScale.value = withSpring(0.98, { mass: 0.4, damping: 12 });
        break;
      case 'none':
        break;
    }
  };
  const handlePressOut = () => {
    if (animation === 'bounce') {
      pressScale.value = withSpring(1, { mass: 0.4, damping: 10 });
    } else {
      pressScale.value = withSpring(1, { mass: 0.4, damping: 12 });
      pressY.value = withSpring(0, { mass: 0.4, damping: 12 });
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: open, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => toggle(value)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className={cn(triggerVariants({ variant, size }), disabled && 'opacity-50', className)}>
      <Animated.View style={pressStyle} className="flex-1 flex-row items-center gap-3">
        {/* Leading icon bubble */}
        {icon ? (
          <Animated.View
            style={iconBubbleStyle}
            className="h-9 w-9 items-center justify-center rounded-xl">
            <SymbolView
              name={icon}
              size={18}
              tintColor={open ? '#fff' : isFilled ? '#fff' : colors.foreground}
            />
          </Animated.View>
        ) : null}

        {/* Title + description */}
        <View className="flex-1 gap-0.5 pr-2">
          <Text
            numberOfLines={1}
            style={{ color: titleColor }}
            className={cn('text-[15px] font-semibold leading-5', size === 'sm' && 'text-sm', size === 'lg' && 'text-base')}>
            {children}
          </Text>
          {description ? (
            <Text numberOfLines={1} style={{ color: descColor }} className="text-xs leading-4">
              {description}
            </Text>
          ) : null}
        </View>

        {/* Badge */}
        {badge != null ? (
          <View
            className={cn(
              'rounded-full px-2 py-0.5',
              isFilled ? 'bg-white/20' : 'bg-secondary',
            )}>
            <Text
              style={{ color: isFilled ? '#fff' : colors.secondaryForeground }}
              className="text-xs font-semibold">
              {badge}
            </Text>
          </View>
        ) : null}

        {/* Chevron */}
        {chevron ? (
          <Animated.View
            style={chevronContainerStyle}
            className="h-7 w-7 items-center justify-center rounded-full">
            <Animated.View style={chevronIconStyle}>
              <SymbolView
                name="chevron.down"
                size={13}
                tintColor={open ? (isFilled ? colors.primary : colors.background) : isFilled ? '#fff' : colors.mutedForeground}
              />
            </Animated.View>
          </Animated.View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// AccordionContent — spring height + fade + subtle slide
// ---------------------------------------------------------------------------

export function AccordionContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { isOpen } = useAccordionCtx();
  const { value } = useItemCtx();
  const open = isOpen(value);

  const contentHeight = useSharedValue(0);
  const progress = useSharedValue(open ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(open ? 1 : 0, { mass: 0.6, damping: 18, stiffness: 220 });
  }, [open, progress]);

  const containerStyle = useAnimatedStyle(() => ({
    height: progress.value * contentHeight.value,
    opacity: progress.value,
  }));

  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * -6 }],
  }));

  return (
    <Animated.View style={[{ overflow: 'hidden' }, containerStyle]}>
      {/* Absolute measure container so height is known even when collapsed */}
      <View
        style={{ position: 'absolute', left: 0, right: 0 }}
        onLayout={(e) => {
          contentHeight.value = e.nativeEvent.layout.height;
        }}>
        <Animated.View style={innerStyle}>
          <View className={cn('px-4 pb-4 pt-1', className)}>{children}</View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}
