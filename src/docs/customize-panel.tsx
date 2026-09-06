import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Check, Palette, RotateCcw } from 'lucide-react-native';

import { Badge, Button, Progress, Switch } from '@/ui';
import { ACCENT_SWATCHES, useCustomization } from '@/ui/lib/customization';
import { useThemeColors } from '@/ui/lib/theme';

/**
 * Interactive theme playground: pick an accent swatch (or Auto) and watch
 * every customizable preview re-tint live. Drives the `color` props of
 * Button / Badge / Switch / Progress through `useCustomization`.
 */
export function CustomizePanel() {
  const colors = useThemeColors();
  const { accent, setAccent, reset, resolvedAccent, isAuto } = useCustomization();
  const [open, setOpen] = useState(true);
  const [previewOn, setPreviewOn] = useState(true);

  return (
    <Animated.View
      entering={FadeInDown.duration(500).delay(160)}
      className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Header — toggle and reset are siblings, never nested pressables
          (nested <button> inside <button> breaks web hydration). */}
      <View className="flex-row items-center gap-3 p-4">
        <Pressable
          onPress={() => setOpen((o) => !o)}
          accessibilityRole="button"
          accessibilityLabel={open ? 'Collapse customize panel' : 'Expand customize panel'}
          className="flex-1">
          <View className="flex-row items-center gap-3">
            <View
              className="h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${resolvedAccent}1a` }}>
              <Palette size={17} color={resolvedAccent} />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-bold tracking-tight text-foreground">
                Customize
              </Text>
              <Text className="text-xs text-muted-foreground">
                {isAuto ? 'Following theme primary' : 'Previewing your accent'} · tap to{' '}
                {open ? 'collapse' : 'expand'}
              </Text>
            </View>
            <View
              className="h-6 w-6 rounded-full border border-border"
              style={{ backgroundColor: resolvedAccent }}
            />
          </View>
        </Pressable>
        {!isAuto ? (
          <Pressable
            onPress={reset}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Reset accent"
            className="flex-row items-center gap-1 rounded-full border border-border px-2.5 py-1.5">
            <RotateCcw size={12} color={colors.mutedForeground} />
            <Text className="text-xs font-semibold text-muted-foreground">Reset</Text>
          </Pressable>
        ) : null}
      </View>

      {open ? (
        <View className="gap-4 px-4 pb-4">
          {/* Swatches */}
          <View className="flex-row flex-wrap items-center gap-2.5">
            <Pressable
              onPress={() => setAccent(null)}
              accessibilityRole="button"
              accessibilityLabel="Auto accent"
              className="h-9 items-center justify-center rounded-full border border-border px-3.5"
              style={isAuto ? { borderColor: colors.primary, backgroundColor: `${colors.primary}14` } : undefined}>
              <Text
                className="text-xs font-bold"
                style={{ color: isAuto ? colors.primary : colors.mutedForeground }}>
                Auto
              </Text>
            </Pressable>
            {ACCENT_SWATCHES.map((swatch) => {
              const selected = accent === swatch;
              return (
                <Pressable
                  key={swatch}
                  onPress={() => setAccent(selected ? null : swatch)}
                  hitSlop={4}
                  accessibilityRole="button"
                  accessibilityLabel={`Accent ${swatch}`}
                  accessibilityState={{ selected }}
                  className="h-9 w-9 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: swatch,
                    borderWidth: selected ? 2 : 0,
                    borderColor: '#ffffff',
                    shadowOpacity: selected ? 0.35 : 0,
                    shadowRadius: selected ? 8 : 0,
                    shadowColor: swatch,
                  }}>
                  {selected ? <Check size={15} color="#ffffff" /> : null}
                </Pressable>
              );
            })}
          </View>

          {/* Live preview strip */}
          <View className="gap-3 rounded-xl border border-border bg-background p-4">
            <View className="flex-row items-center justify-between">
              <Text className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Live preview
              </Text>
              <View className="flex-row items-center gap-1.5">
                <View
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: resolvedAccent }}
                />
                <Text className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {isAuto ? 'auto' : resolvedAccent}
                </Text>
              </View>
            </View>
            <View className="flex-row flex-wrap items-center gap-2">
              <Button label="Accent" size="sm" color={resolvedAccent} />
              <Button label="Outline" size="sm" variant="outline" color={resolvedAccent} />
              <Badge label="New" color={resolvedAccent} />
            </View>
            <View className="flex-row items-center gap-3">
              <Switch value={previewOn} onValueChange={setPreviewOn} color={resolvedAccent} size="sm" />
              <View className="flex-1">
                <Progress value={previewOn ? 78 : 22} color={resolvedAccent} size="sm" />
              </View>
            </View>
            <Text className="text-xs leading-4 text-muted-foreground">
              Toggle the switch or pick a swatch — every “Your accent” example on detail pages
              follows along. Copy the snippet and pass the same hex to any `color` prop.
            </Text>
          </View>
        </View>
      ) : null}
    </Animated.View>
  );
}
