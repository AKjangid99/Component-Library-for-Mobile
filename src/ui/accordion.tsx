import { SymbolView } from 'expo-symbols';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View, type ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/ui/lib/cn';
import { useThemeColors } from '@/ui/lib/theme';

type AccordionContextValue = {
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);
const ItemContext = createContext<{ value: string } | null>(null);

function useAccordion() {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('Accordion.* must be used inside <Accordion>');
  return ctx;
}

function useItem() {
  const ctx = useContext(ItemContext);
  if (!ctx) throw new Error('AccordionTrigger/Content must be used inside <AccordionItem>');
  return ctx;
}

export type AccordionProps = ViewProps & {
  /** `single` closes other items when one opens; `multiple` allows many open. */
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  className?: string;
  children?: React.ReactNode;
};

export function Accordion({
  type = 'single',
  defaultValue,
  className,
  children,
  ...rest
}: AccordionProps) {
  const [open, setOpen] = useState<string[]>(() =>
    defaultValue == null ? [] : Array.isArray(defaultValue) ? defaultValue : [defaultValue],
  );

  const toggle = useCallback(
    (value: string) => {
      setOpen((prev) => {
        const isOpen = prev.includes(value);
        if (type === 'single') return isOpen ? [] : [value];
        return isOpen ? prev.filter((v) => v !== value) : [...prev, value];
      });
    },
    [type],
  );

  const ctx = useMemo<AccordionContextValue>(
    () => ({ isOpen: (value) => open.includes(value), toggle }),
    [open, toggle],
  );

  return (
    <AccordionContext.Provider value={ctx}>
      <View
        className={cn('overflow-hidden rounded-2xl border border-border bg-card', className)}
        {...rest}>
        {children}
      </View>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  value,
  className,
  children,
  ...rest
}: ViewProps & { value: string; className?: string }) {
  const item = useMemo(() => ({ value }), [value]);
  return (
    <ItemContext.Provider value={item}>
      <View className={cn('border-b border-border last:border-b-0', className)} {...rest}>
        {children}
      </View>
    </ItemContext.Provider>
  );
}

export function AccordionTrigger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { isOpen, toggle } = useAccordion();
  const { value } = useItem();
  const colors = useThemeColors();
  const open = isOpen(value);

  const rotation = useSharedValue(open ? 1 : 0);
  useEffect(() => {
    rotation.value = withTiming(open ? 1 : 0, { duration: 200 });
  }, [open, rotation]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 180}deg` }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      onPress={() => toggle(value)}
      className={cn('flex-row items-center justify-between p-4', className)}>
      <Text className="flex-1 pr-3 text-base font-medium text-card-foreground">{children}</Text>
      <Animated.View style={chevronStyle}>
        <SymbolView name="chevron.down" tintColor={colors.mutedForeground} size={16} />
      </Animated.View>
    </Pressable>
  );
}

export function AccordionContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { isOpen } = useAccordion();
  const { value } = useItem();
  const open = isOpen(value);

  const contentHeight = useSharedValue(0);
  const progress = useSharedValue(open ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(open ? 1 : 0, { duration: 220 });
  }, [open, progress]);

  const containerStyle = useAnimatedStyle(() => ({
    height: progress.value * contentHeight.value,
    opacity: progress.value,
  }));

  return (
    <Animated.View style={[{ overflow: 'hidden' }, containerStyle]}>
      {/* Absolutely positioned so it measures its natural height regardless of
          the animated (possibly zero) container height. */}
      <View
        style={{ position: 'absolute', left: 0, right: 0 }}
        onLayout={(e) => {
          contentHeight.value = e.nativeEvent.layout.height;
        }}>
        <View className={cn('px-4 pb-4', className)}>{children}</View>
      </View>
    </Animated.View>
  );
}
