import { useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';

import { cn } from '@/ui/lib/cn';

export function CodeBlock({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      });
    }
  };

  return (
    <View className={cn('overflow-hidden rounded-xl border border-border bg-muted', className)}>
      {Platform.OS === 'web' ? (
        <Pressable
          onPress={copy}
          className="absolute right-2 top-2 z-10 rounded-md border border-border bg-background px-2 py-1">
          <Text className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {copied ? 'Copied' : 'Copy'}
          </Text>
        </Pressable>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Text className="p-4 font-mono text-xs leading-5 text-foreground" selectable>
          {code}
        </Text>
      </ScrollView>
    </View>
  );
}

/** A single example: a live preview with a Preview / Code toggle. */
export function Demo({
  title,
  description,
  children,
  code,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  code: string;
}) {
  const [tab, setTab] = useState<'preview' | 'code'>('preview');

  return (
    <View className="gap-3">
      {title || description ? (
        <View className="gap-1">
          {title ? <Text className="text-base font-semibold text-foreground">{title}</Text> : null}
          {description ? (
            <Text className="text-sm text-muted-foreground">{description}</Text>
          ) : null}
        </View>
      ) : null}

      <View className="flex-row gap-4 border-b border-border">
        <TogglePill label="Preview" active={tab === 'preview'} onPress={() => setTab('preview')} />
        <TogglePill label="Code" active={tab === 'code'} onPress={() => setTab('code')} />
      </View>

      {tab === 'preview' ? (
        <View className="items-center justify-center rounded-xl border border-border bg-background p-8">
          <View className="w-full max-w-[420px] items-center gap-4">{children}</View>
        </View>
      ) : (
        <CodeBlock code={code} />
      )}
    </View>
  );
}

function TogglePill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="pb-2">
      <View className={cn('border-b-2', active ? 'border-foreground' : 'border-transparent')}>
        <Text
          className={cn(
            'pb-1 text-xs font-semibold uppercase tracking-wider',
            active ? 'text-foreground' : 'text-muted-foreground',
          )}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
