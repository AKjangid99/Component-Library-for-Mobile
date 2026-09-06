import { useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Check, Copy, FileCode2 } from 'lucide-react-native';

import { cn } from '@/ui/lib/cn';
import { useThemeColors } from '@/ui/lib/theme';

/* -------------------------------------------------------------------------- */
/* CodeBlock — dark terminal-style block with header + copy feedback           */
/* -------------------------------------------------------------------------- */

export function CodeBlock({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const colors = useThemeColors();

  const copy = () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <Animated.View
      entering={FadeIn.duration(280)}
      className={cn('overflow-hidden rounded-2xl border border-border', className)}
      style={{ backgroundColor: '#0B1220' }}>
      {/* Header bar */}
      <View className="flex-row items-center justify-between px-4 pb-2 pt-3">
        <View className="flex-row items-center gap-1.5">
          <View className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]" />
          <View className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
          <View className="h-2.5 w-2.5 rounded-full bg-[#27C93F]" />
          <View className="ml-2 flex-row items-center gap-1.5">
            <FileCode2 size={12} color="#8b93a7" />
            <Text className="font-mono text-[10px] uppercase tracking-widest text-[#8b93a7]">
              Usage
            </Text>
          </View>
        </View>
        <Pressable
          onPress={copy}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Copy code"
          className="flex-row items-center gap-1.5 rounded-full border px-2.5 py-1"
          style={{
            borderColor: copied ? '#3dd68c55' : '#ffffff22',
            backgroundColor: copied ? '#3dd68c22' : '#ffffff10',
          }}>
          {copied ? <Check size={12} color="#3dd68c" /> : <Copy size={12} color="#c6cbd6" />}
          <Text
            className="font-mono text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: copied ? '#3dd68c' : '#c6cbd6' }}>
            {copied ? 'Copied' : 'Copy'}
          </Text>
        </Pressable>
      </View>
      <View style={{ height: 1, backgroundColor: '#ffffff12' }} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Text
          selectable
          className="p-4 font-mono text-[12.5px] leading-5"
          style={{ color: '#E6EAF2' }}>
          {code}
        </Text>
      </ScrollView>
      {/* Hidden color ref to keep hook stable across themes */}
      <View style={{ display: 'none' }}>
        <Text style={{ color: colors.foreground }}>{''}</Text>
      </View>
    </Animated.View>
  );
}

/* -------------------------------------------------------------------------- */
/* Demo — interactive example card with animated Preview/Code switch           */
/* -------------------------------------------------------------------------- */

export function Demo({
  index,
  title,
  description,
  children,
  code,
}: {
  index?: number;
  title?: string;
  description?: string;
  children: React.ReactNode;
  code: string;
}) {
  const [tab, setTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);
  const colors = useThemeColors();

  const copyCode = () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(450).delay(Math.min((index ?? 0) * 60, 300))}
      className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Card header */}
      <View className="flex-row items-center justify-between gap-3 px-5 pt-5">
        <View className="flex-1 flex-row items-center gap-2.5">
          {typeof index === 'number' ? (
            <View
              className="h-6 w-6 items-center justify-center rounded-full"
              style={{ backgroundColor: `${colors.primary}1a` }}>
              <Text className="font-mono text-[11px] font-bold" style={{ color: colors.primary }}>
                {String(index + 1).padStart(2, '0')}
              </Text>
            </View>
          ) : null}
          <View className="flex-1 gap-0.5">
            {title ? (
              <Text className="text-[15px] font-semibold text-foreground">{title}</Text>
            ) : (
              <View className="flex-row items-center gap-1.5">
                <View
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: colors.success }}
                />
                <Text className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Live example
                </Text>
              </View>
            )}
            {description ? (
              <Text className="text-[13px] leading-5 text-muted-foreground">{description}</Text>
            ) : null}
          </View>
        </View>

        {/* Segmented Preview / Code switch */}
        <View className="flex-row rounded-full border border-border bg-muted p-0.5">
          {(['preview', 'code'] as const).map((t) => {
            const active = tab === t;
            return (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                className="rounded-full px-3 py-1.5"
                style={active ? { backgroundColor: colors.foreground } : undefined}>
                <Text
                  className="text-xs font-semibold capitalize"
                  style={{ color: active ? colors.background : colors.mutedForeground }}>
                  {t}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Body */}
      <View className="p-5">
        {tab === 'preview' ? (
          <Animated.View entering={FadeIn.duration(250)} key="preview">
            <View className="items-center justify-center rounded-xl border border-border bg-background px-5 py-10">
              <View className="w-full max-w-[440px] items-center gap-4">{children}</View>
            </View>
            <Pressable onPress={copyCode} hitSlop={6} className="mt-2.5 flex-row justify-end">
              <View className="flex-row items-center gap-1.5">
                {copied ? (
                  <Check size={12} color={colors.success} />
                ) : (
                  <Copy size={12} color={colors.mutedForeground} />
                )}
                <Text
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: copied ? colors.success : colors.mutedForeground }}>
                  {copied ? 'Copied snippet' : 'Copy snippet'}
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(250)} key="code">
            <CodeBlock code={code} />
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}
