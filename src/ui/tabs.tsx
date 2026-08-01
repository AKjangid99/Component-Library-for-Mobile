import { createContext, useContext, useState } from 'react';
import { Pressable, Text, View, type ViewProps } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { cn } from '@/ui/lib/cn';

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

export function TabsList({ className, ...rest }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn('flex-row rounded-xl bg-muted p-1', className)}
      {...rest}
    />
  );
}

export function TabsTrigger({
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
      className={cn(
        'flex-1 items-center justify-center rounded-lg px-3 py-2',
        isActive && 'bg-background shadow-sm',
        className,
      )}>
      <Text
        className={cn(
          'text-sm font-medium',
          isActive ? 'text-foreground' : 'text-muted-foreground',
        )}>
        {label}
      </Text>
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
