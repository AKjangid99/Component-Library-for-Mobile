/*
 * Reanimated shared-value mutation (`sv.value = ...`) is the library's intended
 * idiom, but the React-Compiler `react-hooks/immutability` rule flags it as a
 * false positive (same as button/avatar/alert in this repo). Scoped off here.
 */
/* eslint-disable react-hooks/immutability */
import { cva, type VariantProps } from 'class-variance-authority';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { ChevronDown } from 'lucide-react-native';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View, type ViewProps } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { cn } from '@/ui/lib/cn';
import { useThemeColors } from '@/ui/lib/theme';

/** Apply an alpha channel to a 6-digit hex color (`#rrggbb` → `rgba(...)`). */
function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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
      // Transparent when closed, fills with primary when open (animated).
      solid: 'rounded-lg active:opacity-95',
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
  /**
   * Chevron appearance:
   * - `plain` — bare icon, no container (rotates on open)
   * - `circle` — soft bubble that tints on open (default)
   * - `contrast` — solid high-contrast disc (e.g. black disc, white icon)
   */
  chevronVariant?: 'plain' | 'circle' | 'contrast';
  /** Which side the chevron sits on. */
  chevronPosition?: 'leading' | 'trailing';
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
  chevronVariant = 'circle',
  chevronPosition = 'trailing',
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
    // Springy open/close so the whole header feels alive, not just linear.
    progress.value = withSpring(open ? 1 : 0, { mass: 0.5, damping: 15, stiffness: 200 });
  }, [open, progress]);

  const isFilled = variant === 'filled';
  const isSolid = variant === 'solid';
  // When solid, the whole header fills with primary on open; text/icons flip white.
  const solidActive = isSolid && open;
  // Precomputed off the UI thread — worklets can't run the hex parser.
  const openTint = isFilled
    ? 'rgba(0,0,0,0)'
    : isSolid
      ? colors.primary
      : withAlpha(colors.primary, 0.08);

  // A soft primary wash across the header while open — invites the tap and
  // makes the active row unmistakable. Skipped for the filled variant, which
  // already carries a strong background.
  const openTintStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], ['rgba(0,0,0,0)', openTint] as never),
  }));

  // Growing accent bar on the leading edge — a quiet "you are here" marker.
  const accentBarStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scaleY: 0.2 + progress.value * 0.8 }],
    backgroundColor: isFilled ? '#fff' : colors.primary,
  }));

  const chevronContainerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [
        isFilled ? 'rgba(255,255,255,0.18)' : colors.muted,
        isFilled ? 'rgba(255,255,255,0.95)' : colors.primary,
      ] as never,
    ),
    transform: [{ scale: 0.94 + progress.value * 0.06 }],
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
    transform: [
      { scale: 1 + progress.value * 0.08 },
      { rotate: `${progress.value * -4}deg` },
    ],
  }));

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }, { translateY: pressY.value }],
  }));

  // Chevron: rotates 180° on open (down → up). Three appearances.
  const chevronPlainColor = isFilled || solidActive ? '#fff' : open ? colors.primary : colors.mutedForeground;
  const chevronNode = !chevron ? null : chevronVariant === 'plain' ? (
    <Animated.View style={chevronIconStyle}>
      <ChevronDown size={16} color={chevronPlainColor} strokeWidth={2.5} />
    </Animated.View>
  ) : chevronVariant === 'contrast' ? (
    <View
      className="h-7 w-7 items-center justify-center rounded-full"
      style={{ backgroundColor: solidActive ? '#fff' : colors.foreground }}>
      <Animated.View style={chevronIconStyle}>
        <ChevronDown size={15} color={solidActive ? colors.primary : colors.background} strokeWidth={2.5} />
      </Animated.View>
    </View>
  ) : (
    <Animated.View
      style={chevronContainerStyle}
      className="h-7 w-7 items-center justify-center rounded-full">
      <Animated.View style={chevronIconStyle}>
        <ChevronDown
          size={15}
          color={open ? (isFilled ? colors.primary : colors.primaryForeground) : isFilled ? '#fff' : colors.mutedForeground}
          strokeWidth={2.5}
        />
      </Animated.View>
    </Animated.View>
  );

  const titleColor = isFilled || solidActive ? colors.primaryForeground : colors.cardForeground;
  const descColor =
    isFilled || solidActive ? 'rgba(255,255,255,0.78)' : colors.mutedForeground;

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
      className={cn(triggerVariants({ variant, size }), 'overflow-hidden', disabled && 'opacity-50', className)}>
      {/* Open-state wash behind the content */}
      <Animated.View pointerEvents="none" style={openTintStyle} className="absolute inset-0" />
      {/* Leading accent bar — skipped for solid (the whole header fills instead) */}
      {isSolid ? null : (
        <Animated.View
          pointerEvents="none"
          style={accentBarStyle}
          className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full"
        />
      )}
      <Animated.View style={pressStyle} className="flex-1 flex-row items-center gap-3">
        {/* Leading chevron */}
        {chevronPosition === 'leading' ? chevronNode : null}

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

        {/* Trailing chevron */}
        {chevronPosition === 'trailing' ? chevronNode : null}
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
