import { createContext, useContext, useState } from 'react';
import {
  Pressable,
  Text,
  View,
  type LayoutChangeEvent,
  type ViewProps,
} from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { type LucideIcon } from 'lucide-react-native';

import { cn } from '@/ui/lib/cn';
import { useThemeColors } from '@/ui/lib/theme';

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs.* must be used inside <Tabs>');
  return ctx;
}

export type TabsProps = ViewProps & {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children?: React.ReactNode;
};

export function Tabs({
  defaultValue,
  value: controlled,
  onValueChange,
  className,
  children,
  ...rest
}: TabsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const value = controlled ?? internal;

  const setValue = (next: string) => {
    if (controlled == null) setInternal(next);
    onValueChange?.(next);
  };

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <View className={cn('gap-3', className)} {...rest}>
        {children}
      </View>
    </TabsContext.Provider>
  );
}

export function TabsList({
  variant = 'pill',
  className,
  ...rest
}: ViewProps & { variant?: 'pill' | 'underline'; className?: string }) {
  if (variant === 'underline') {
    return <View className={cn('flex-row border-b border-border', className)} {...rest} />;
  }
  return <View className={cn('flex-row rounded-xl bg-muted p-1', className)} {...rest} />;
}

export function TabsTrigger({
  value,
  label,
  icon,
  badge,
  className,
}: {
  value: string;
  label: string;
  icon?: string;
  badge?: string | number;
  className?: string;
}) {
  const { value: active, setValue } = useTabs();
  const isActive = active === value;
  // we need to detect variant via parent - simplified: use pill detection by checking if parent has pill bg
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      onPress={() => setValue(value)}
      className={cn(
        'flex-1 flex-row items-center justify-center gap-1.5 rounded-lg px-3 py-2',
        isActive ? 'bg-background shadow-sm' : '',
        className,
      )}>
      <Text
        className={cn(
          'text-sm font-medium',
          isActive ? 'text-foreground' : 'text-muted-foreground',
        )}>
        {label}
      </Text>
      {badge != null ? (
        <View className={cn('rounded-full px-1.5 py-0', isActive ? 'bg-primary' : 'bg-muted')}>
          <Text className={cn('text-[10px] font-bold', isActive ? 'text-primary-foreground' : 'text-muted-foreground')}>
            {badge}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function TabsTriggerUnderline({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
}) {
  const { value: active, setValue } = useTabs();
  const isActive = active === value;
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      onPress={() => setValue(value)}
      className={cn('border-b-2 px-4 py-2.5', isActive ? 'border-foreground' : 'border-transparent', className)}>
      <Text className={cn('text-sm font-medium', isActive ? 'text-foreground' : 'text-muted-foreground')}>{label}</Text>
    </Pressable>
  );
}

export function TabsContent({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { value: active } = useTabs();
  if (active !== value) return null;
  return (
    <Animated.View entering={FadeIn.duration(200)} className={cn(className)}>
      {children}
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// TabsSegmented — a segmented control in the Tabs family. One indicator
// physically slides between segments (spring-driven) instead of a
// re-rendered highlight. Equal-width segments, 2–5 options.
// ---------------------------------------------------------------------------

export interface TabsSegmentedItem {
  value: string;
  label: string;
  icon?: LucideIcon;
}

export interface TabsSegmentedProps extends Omit<ViewProps, 'children'> {
  items: TabsSegmentedItem[];
  /** Controlled selection. */
  value?: string;
  /** Uncontrolled initial selection. Defaults to the first item. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

const SEGMENT_GUTTER = 4;

export function TabsSegmented({
  items,
  value,
  defaultValue,
  onValueChange,
  className,
  ...rest
}: TabsSegmentedProps) {
  const reduceMotion = useReducedMotion();
  const colors = useThemeColors();
  const [innerValue, setInnerValue] = useState(defaultValue ?? items[0]?.value);
  const [width, setWidth] = useState(0);

  const active = value ?? innerValue;
  const count = Math.max(items.length, 1);
  const activeIndex = Math.max(
    0,
    items.findIndex((i) => i.value === active),
  );
  const segWidth = width > 0 ? width / count : 0;

  const index = useDerivedValue(() =>
    reduceMotion
      ? withTiming(activeIndex, { duration: 0 })
      : withSpring(activeIndex, { damping: 18, stiffness: 200, mass: 0.6 }),
  );

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: index.value * segWidth + SEGMENT_GUTTER }],
  }));

  const select = (v: string) => {
    if (value == null) setInnerValue(v);
    onValueChange?.(v);
  };

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View
      accessibilityRole="tablist"
      onLayout={onLayout}
      className={cn('h-11 flex-row rounded-2xl bg-muted', className)}
      {...rest}>
      {segWidth > 0 ? (
        <Animated.View
          style={[indicatorStyle, { width: segWidth - SEGMENT_GUTTER * 2 }]}
          className="absolute bottom-1 left-0 top-1 rounded-xl bg-background shadow-sm"
          pointerEvents="none"
        />
      ) : null}

      {items.map((item) => {
        const selected = item.value === active;
        const Icon = item.icon;
        return (
          <Pressable
            key={item.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={item.label}
            onPress={() => select(item.value)}
            className="flex-1 flex-row items-center justify-center gap-1.5">
            {Icon ? (
              <Icon
                size={15}
                strokeWidth={2.25}
                color={selected ? colors.foreground : colors.mutedForeground}
              />
            ) : null}
            <Text
              className={cn(
                'text-sm font-semibold',
                selected ? 'text-foreground' : 'text-muted-foreground',
              )}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
