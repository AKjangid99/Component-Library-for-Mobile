import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/ui/lib/cn';
import { CodeBlock, Demo } from './preview';
import { categories, type DocEntry, registry } from './registry';

const SIDEBAR_BREAKPOINT = 880;

export function DocsShell() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWide = width >= SIDEBAR_BREAKPOINT;

  const [slug, setSlug] = useState(registry[0].slug);
  const entry = useMemo(() => registry.find((e) => e.slug === slug) ?? registry[0], [slug]);

  const grouped = useMemo(
    () =>
      categories.map((category) => ({
        category,
        items: registry.filter((e) => e.category === category),
      })),
    [],
  );

  return (
    <View className="flex-1 flex-row bg-background" style={{ paddingTop: isWide ? 0 : insets.top }}>
      {isWide ? (
        <View className="w-64 border-r border-border" style={{ paddingTop: insets.top }}>
          <ScrollView
            contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
            showsVerticalScrollIndicator={false}>
            <SidebarBrand />
            <View className="mt-8 gap-6">
              {grouped.map((group) => (
                <View key={group.category} className="gap-1.5">
                  <Text className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.category}
                  </Text>
                  {group.items.map((item) => (
                    <NavLink
                      key={item.slug}
                      label={item.name}
                      active={item.slug === slug}
                      onPress={() => setSlug(item.slug)}
                    />
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      ) : null}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: isWide ? 48 : 20,
          paddingTop: isWide ? 48 : 20,
          paddingBottom: insets.bottom + 96,
          maxWidth: 760,
          width: '100%',
          alignSelf: 'center',
        }}
        showsVerticalScrollIndicator={false}>
        {!isWide ? <TopNav slug={slug} onSelect={setSlug} /> : null}
        <ComponentPage entry={entry} />
      </ScrollView>
    </View>
  );
}

function SidebarBrand() {
  return (
    <View className="gap-1">
      <Text className="text-lg font-bold tracking-tight text-foreground">Component Lib</Text>
      <Text className="font-mono text-[11px] text-muted-foreground">expo · nativewind · v0.1</Text>
    </View>
  );
}

function NavLink({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="-mx-2 rounded-md px-2 py-1.5">
      <Text
        className={cn(
          'text-[15px]',
          active ? 'font-semibold text-foreground' : 'text-muted-foreground',
        )}>
        {label}
      </Text>
    </Pressable>
  );
}

function TopNav({ slug, onSelect }: { slug: string; onSelect: (slug: string) => void }) {
  return (
    <View className="mb-6 border-b border-border pb-4">
      <Text className="mb-3 text-2xl font-bold tracking-tight text-foreground">Components</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2">
          {registry.map((e) => (
            <Pressable
              key={e.slug}
              onPress={() => onSelect(e.slug)}
              className={cn(
                'rounded-full border px-3 py-1.5',
                e.slug === slug ? 'border-foreground bg-foreground' : 'border-border bg-transparent',
              )}>
              <Text
                className={cn(
                  'text-sm font-medium',
                  e.slug === slug ? 'text-background' : 'text-muted-foreground',
                )}>
                {e.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function ComponentPage({ entry }: { entry: DocEntry }) {
  const importName = entry.name.replace(/\s+/g, '');
  return (
    <View className="gap-8">
      <View className="gap-3">
        <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {entry.category}
        </Text>
        <Text className="text-4xl font-bold tracking-tight text-foreground">{entry.name}</Text>
        <Text className="text-lg leading-7 text-muted-foreground">{entry.description}</Text>
      </View>

      <View className="gap-2">
        <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Import
        </Text>
        <CodeBlock code={`import { ${importName} } from '@/ui';`} />
      </View>

      <View className="h-px bg-border" />

      <View className="gap-10">
        {entry.examples.map((example, i) => (
          <Demo
            key={i}
            title={example.title}
            description={example.description}
            code={example.code}>
            {example.element}
          </Demo>
        ))}
      </View>
    </View>
  );
}
