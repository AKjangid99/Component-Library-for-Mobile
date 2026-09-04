import { type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { LayoutChangeEvent, Pressable, Text, View, type ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/ui/lib/cn';
import { useThemeColors } from '@/ui/lib/theme';

export interface SegmentedTabItem {
  value: string;
  label: string;
  icon?: LucideIcon;
}

export interface SegmentedTabsProps extends Omit<ViewProps, 'children'> {
  items: SegmentedTabItem[];
  /** Controlled selection. */
  value?: string;
  /** Uncontrolled initial selection. Defaults to the first item. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

const GUTTER = 4;

/**
 * A segmented control whose selection is one indicator that physically slides
 * between segments (spring-driven), rather than a re-rendered highlight. Equal-
 * width segments keep the math simple and reliable for 2–5 options.
 */
export function SegmentedTabs({
  items,
  value,
  defaultValue,
  onValueChange,
  className,
  ...rest
}: SegmentedTabsProps) {
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
    transform: [{ translateX: index.value * segWidth + GUTTER }],
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
          style={[indicatorStyle, { width: segWidth - GUTTER * 2 }]}
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
