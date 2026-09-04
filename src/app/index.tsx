import { router } from 'expo-router';

import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WebBadge } from '@/components/web-badge';
import { Avatar, AvatarGroup, Badge, Button, Card, Progress, Switch, Text } from '@/ui';

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function FeatureCard({
  icon,
  title,
  body,
  accent,
}: {
  icon: React.ComponentProps<typeof SymbolView>['name'];
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <View className="flex-1 gap-4 rounded-[20px] border border-border bg-card p-5">
      <View
        className="h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: accent }}>
        <SymbolView name={icon} size={20} tintColor="white" />
      </View>
      <View className="gap-1.5">
        <Text className="text-[16px] font-semibold text-foreground">{title}</Text>
        <Text className="text-sm leading-5 text-muted-foreground">{body}</Text>
      </View>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1 items-center gap-1 border-r border-border px-2 last:border-r-0">
      <Text className="text-xl font-bold tracking-tight text-foreground">{value}</Text>
      <Text className="text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Text>
    </View>
  );
}

function MiniTile({
  icon,
  label,
  hint,
  bg,
}: {
  icon: React.ComponentProps<typeof SymbolView>['name'];
  label: string;
  hint: string;
  bg: string;
}) {
  return (
    <View className="flex-1 gap-3 rounded-2xl border border-border bg-card p-4">
      <View className="h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: bg }}>
        <SymbolView name={icon} size={16} tintColor="white" />
      </View>
      <View>
        <Text className="text-sm font-semibold text-foreground">{label}</Text>
        <Text className="text-xs text-muted-foreground">{hint}</Text>
      </View>
    </View>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <View className="flex-1 gap-3">
      <View className="h-8 w-8 items-center justify-center rounded-full bg-foreground">
        <Text className="text-sm font-bold text-background">{n}</Text>
      </View>
      <Text className="text-sm font-semibold text-foreground">{title}</Text>
      <Text className="text-sm leading-5 text-muted-foreground">{body}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 720;
  const [demoOn, setDemoOn] = useState(true);

  return (
    <View className="flex-1 bg-background">
      {/* Decorative blobs - subtle */}
      <View
        pointerEvents="none"
        className="absolute rounded-full opacity-[0.08]"
        style={{
          width: 520,
          height: 520,
          backgroundColor: '#208AEF',
          top: -160,
          right: -140,
        }}
      />
      <View
        pointerEvents="none"
        className="absolute rounded-full opacity-[0.06]"
        style={{
          width: 420,
          height: 420,
          backgroundColor: '#F5A524',
          top: 120,
          left: -120,
        }}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + (isWide ? 24 : 16),
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: isWide ? 40 : 20,
          maxWidth: 1040,
          width: '100%',
          alignSelf: 'center',
        }}
        showsVerticalScrollIndicator={false}>
        {/* ── Top bar ────────────────────────────────────────────── */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2.5">
            <View className="h-8 w-8 items-center justify-center rounded-lg bg-foreground">
              <SymbolView name="sparkles" size={16} tintColor="white" />
            </View>
            <View>
              <Text className="text-sm font-bold tracking-tight text-foreground">Component Lib</Text>
              <Text className="font-mono text-[10px] leading-none text-muted-foreground">
                expo · nativewind · reanimated
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            {isWide ? (
              <Badge label="v0.1 • Open Source" variant="outline" size="sm" icon="star.fill" />
            ) : null}
            <Pressable
              onPress={() => router.navigate('/explore')}
              className="hidden h-8 items-center justify-center rounded-full border border-border px-3 md:flex"
              style={isWide ? {} : { display: 'none' }}>
              <Text className="text-xs font-medium text-foreground">Browse →</Text>
            </Pressable>
          </View>
        </View>

        {/* ── Hero ───────────────────────────────────────────────── */}
        <View className={isWide ? 'mt-10 flex-row items-center gap-10' : 'mt-8 gap-8'}>
          {/* Left copy */}
          <View className="flex-1 gap-5">
            {/* Announcement pill */}
            <View className="flex-row">
              <Pressable
                onPress={() => router.navigate('/explore')}
                className="flex-row items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
                <View className="h-5 items-center justify-center rounded-full bg-primary px-2">
                  <Text className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                    New
                  </Text>
                </View>
                <Text className="text-xs font-medium text-foreground">30+ components — copy, paste, ship</Text>
                <SymbolView name="chevron.right" size={12} tintColor="#60646C" />
              </Pressable>
            </View>

            <View>
              <Text className="font-bold tracking-tight text-foreground" style={{ fontSize: isWide ? 54 : 38, lineHeight: isWide ? 56 : 40 }}>
                Build apps
              </Text>
              <Text className="font-bold tracking-tight" style={{ fontSize: isWide ? 54 : 38, lineHeight: isWide ? 56 : 40, color: '#208AEF' }}>
                people love.
              </Text>
              <Text className="mt-4 max-w-[520px] text-[16px] leading-6 text-muted-foreground">
                A warm, accessible component library for Expo. Theme-aware, animated with Reanimated, and
                styled with NativeWind — ready to paste into your app.
              </Text>
            </View>

            {/* CTAs */}
            <View className="flex-row flex-wrap gap-3">
              <Button label="Explore components" size={isWide ? 'lg' : 'md'} rightIcon="arrow.right" onPress={() => router.navigate('/explore')} />
              <Button
                label="How it works"
                size={isWide ? 'lg' : 'md'}
                variant="outline"
                leftIcon="play.fill"
                onPress={() => router.navigate('/explore')}
              />
            </View>

            {/* Social proof */}
            <View className="mt-1 flex-row items-center gap-3">
              <AvatarGroup max={4}>
                <Avatar source="https://i.pravatar.cc/150?img=11" size="sm" />
                <Avatar source="https://i.pravatar.cc/150?img=14" size="sm" />
                <Avatar source="https://i.pravatar.cc/150?img=32" size="sm" />
                <Avatar source="https://i.pravatar.cc/150?img=8" size="sm" />
                <Avatar fallback="+2k" size="sm" />
              </AvatarGroup>
              <View className="gap-0.5">
                <View className="flex-row items-center gap-1">
                  <SymbolView name="star.fill" size={12} tintColor="#F5A524" />
                  <SymbolView name="star.fill" size={12} tintColor="#F5A524" />
                  <SymbolView name="star.fill" size={12} tintColor="#F5A524" />
                  <SymbolView name="star.fill" size={12} tintColor="#F5A524" />
                  <SymbolView name="star.fill" size={12} tintColor="#F5A524" />
                  <Text className="ml-1 text-xs font-semibold text-foreground">5.0</Text>
                </View>
                <Text className="text-xs text-muted-foreground">Loved by 2,000+ builders • MIT licensed</Text>
              </View>
            </View>
          </View>

          {/* Right visual — phone / preview stack */}
          <View className={isWide ? 'w-[380px] gap-3' : 'gap-3'}>
            {/* Main preview card — looks like a phone sheet */}
            <Card variant="elevated" className="gap-4 rounded-[24px] p-5 shadow-sm">
              {/* Fake window dots */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row gap-1.5">
                  <View className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]" />
                  <View className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
                  <View className="h-2.5 w-2.5 rounded-full bg-[#27C93F]" />
                </View>
                <Badge label="Live preview" variant="muted" size="sm" dot />
              </View>

              <View className="gap-3 rounded-2xl bg-muted p-4">
                <View className="flex-row items-center gap-3">
                  <Avatar source="https://i.pravatar.cc/150?img=12" size="md" status="online" />
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">Ada Lovelace</Text>
                    <Text className="text-xs text-muted-foreground">Design Engineer • Online</Text>
                  </View>
                  <Badge label="Pro" variant="success" size="sm" />
                </View>
                <View className="h-px bg-border" />
                <View className="flex-row flex-wrap items-center gap-2">
                  <Button label="Invite" size="sm" leftIcon="plus" />
                  <Button label="Message" size="sm" variant="tonal" />
                  <Button label="More" size="sm" variant="outline" />
                </View>
                <View className="flex-row items-center gap-2">
                  <Badge label="Expo" icon="star.fill" variant="secondary" size="sm" />
                  <Badge label="NativeWind" variant="outline" size="sm" />
                  <Badge label="Reanimated" variant="outline" size="sm" />
                </View>
              </View>

              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text variant="small" className="font-medium">
                    Project progress
                  </Text>
                  <Text className="text-xs font-medium text-muted-foreground">{demoOn ? '72%' : '24%'}</Text>
                </View>
                <Progress value={demoOn ? 72 : 24} variant={demoOn ? 'default' : 'warning'} />
                <View className="flex-row items-center justify-between pt-1">
                  <Text variant="small" className="text-muted-foreground">
                    Toggle to animate
                  </Text>
                  <Switch value={demoOn} onValueChange={setDemoOn} />
                </View>
              </View>
            </Card>

            {/* Tiny feature row under phone */}
            <View className="flex-row gap-2">
              <View className="flex-1 flex-row items-center gap-2 rounded-full border border-border bg-card px-3 py-2">
                <View className="h-6 w-6 items-center justify-center rounded-full bg-success">
                  <SymbolView name="checkmark" size={12} tintColor="white" />
                </View>
                <Text className="text-xs font-medium text-foreground">Accessible</Text>
              </View>
              <View className="flex-1 flex-row items-center gap-2 rounded-full border border-border bg-card px-3 py-2">
                <View className="h-6 w-6 items-center justify-center rounded-full bg-primary">
                  <SymbolView name="moon.fill" size={12} tintColor="white" />
                </View>
                <Text className="text-xs font-medium text-foreground">Dark mode</Text>
              </View>
              <View className="flex-1 flex-row items-center gap-2 rounded-full border border-border bg-card px-3 py-2">
                <View className="h-6 w-6 items-center justify-center rounded-full bg-warning">
                  <SymbolView name="bolt.fill" size={12} tintColor="white" />
                </View>
                <Text className="text-xs font-medium text-foreground">Animated</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Stats strip ────────────────────────────────────────── */}
        <View className="mt-10 flex-row rounded-2xl border border-border bg-card py-4">
          <Stat value="30+" label="Components" />
          <Stat value="5" label="Categories" />
          <Stat value="100%" label="Type-safe" />
          <Stat value="A11y" label="Built-in" />
        </View>

        {/* ── Features — inviting cards with color ───────────────── */}
        <View className="mt-12 gap-4">
          <View className="gap-1">
            <Text className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Why you’ll love it</Text>
            <Text className="text-2xl font-bold tracking-tight text-foreground">Designed to feel effortless</Text>
            <Text className="max-w-[560px] text-sm leading-6 text-muted-foreground">
              Every component is crafted to be approachable, consistent, and delightful — so you can focus on your
              product, not the plumbing.
            </Text>
          </View>

          <View className={isWide ? 'flex-row gap-4' : 'gap-3'}>
            <FeatureCard
              icon="paintbrush.fill"
              title="Token theming"
              body="Semantic colors that follow the system theme. Light & dark just work — no extra config."
              accent="#208AEF"
            />
            <FeatureCard
              icon="bolt.fill"
              title="Reanimated motion"
              body="Springy presses, smooth accordions, and focus states that feel truly native."
              accent="#30a46c"
            />
            <FeatureCard
              icon="wand.and.stars"
              title="Copy, paste, ship"
              body="Clean src/ui you can own. No heavy deps — extract to your own package when ready."
              accent="#8E5CF5"
            />
          </View>
        </View>

        {/* ── Bento showcase ─────────────────────────────────────── */}
        <View className="mt-12 gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-foreground">Everything you need</Text>
            <Pressable onPress={() => router.navigate('/explore')} className="flex-row items-center gap-1">
              <Text className="text-sm font-medium text-primary">Browse all</Text>
              <SymbolView name="chevron.right" size={12} tintColor="#208AEF" />
            </Pressable>
          </View>

          <View className={isWide ? 'flex-row gap-3' : 'gap-3'}>
            <MiniTile icon="rectangle.on.rectangle" label="Primitives" hint="Button, Badge, Avatar…" bg="#208AEF" />
            <MiniTile icon="slider.horizontal.3" label="Forms" hint="Input, Switch, Slider…" bg="#E5484D" />
            <MiniTile icon="square.grid.2x2" label="Layout" hint="Card, Tabs, List…" bg="#30A46C" />
            <MiniTile icon="bell.badge.fill" label="Feedback" hint="Alert, Progress…" bg="#F5A524" />
          </View>

          {/* Quick code hint */}
          <View className="rounded-2xl border border-border bg-foreground px-4 py-3">
            <View className="flex-row items-center justify-between">
              <Text className="font-mono text-xs text-muted">import {`{ Button }`} from &apos;@/ui&apos;;</Text>
              <Badge label="Copy & paste" variant="secondary" size="sm" />
            </View>
            <Text className="mt-2 font-mono text-sm text-background">{'<Button label="Hello" leftIcon="sparkles" />'}</Text>
          </View>
        </View>

        {/* ── How it works ───────────────────────────────────────── */}
        <View className="mt-12 gap-6 rounded-[24px] border border-border bg-card p-6">
          <View className="gap-1">
            <Text className="font-mono text-xs uppercase tracking-widest text-muted-foreground">How it works</Text>
            <Text className="text-xl font-bold text-foreground">From zero to shipped in minutes</Text>
          </View>
          <View className={isWide ? 'flex-row gap-8' : 'gap-6'}>
            <Step n="1" title="Install" body="npx expo install — compatible versions, zero conflicts. NativeWind setup included." />
            <Step n="2" title="Copy" body="Pick a component from the gallery. Paste the src/ui file — it’s yours to theme." />
            <Step n="3" title="Ship" body="Build with EAS or run locally. Light, dark, iOS, Android, and Web — all covered." />
          </View>
          <View className="flex-row flex-wrap gap-3 pt-2">
            <Button label="Start building" rightIcon="arrow.right" onPress={() => router.navigate('/explore')} />
            <Text className="self-center text-xs text-muted-foreground">No config hell. Just components that work.</Text>
          </View>
        </View>

        {/* ── Final CTA — warm gradient card ─────────────────────── */}
        <View
          className="mt-12 items-center gap-4 rounded-[24px] p-8"
          style={{ backgroundColor: '#0A0A0A' }}>
          <View className="h-10 w-10 items-center justify-center rounded-full bg-white/10">
            <SymbolView name="heart.fill" size={18} tintColor="white" />
          </View>
          <Text className="text-center text-2xl font-bold tracking-tight text-white">Ready to make something lovely?</Text>
          <Text className="max-w-[520px] text-center text-sm leading-6 text-white/70">
            Jump into the interactive gallery, play with every variant, and copy the code straight into your app.
            Friendly, fast, and free — forever.
          </Text>
          <View className="mt-2 flex-row flex-wrap justify-center gap-3">
            <Button
              label="Browse components"
              variant="filled"
              size="lg"
              rightIcon="arrow.right"
              onPress={() => router.navigate('/explore')}
              className="bg-white"
              textClassName="text-black"
            />
            <Button
              label="Read the guide"
              variant="outline"
              size="lg"
              onPress={() => router.navigate('/explore')}
              className="border-white/20 bg-transparent"
              textClassName="text-white"
            />
          </View>
          <Text className="font-mono text-[10px] uppercase tracking-widest text-white/40">MIT • TypeScript • Expo SDK 57</Text>
        </View>

        {Platform.OS === 'web' ? (
          <View className="mt-10 items-center">
            <WebBadge />
          </View>
        ) : null}

        <Text className="mt-8 text-center font-mono text-[11px] text-muted-foreground">
          Crafted with care for mobile builders — iOS · Android · Web
        </Text>
      </ScrollView>
    </View>
  );
}
