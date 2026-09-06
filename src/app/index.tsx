import { router } from 'expo-router';

import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useColorScheme } from 'nativewind';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  cancelAnimation,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WebBadge } from '@/components/web-badge';
import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  Progress,
  Switch,
  Text,
  useThemeColors,
} from '@/ui';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ---------------------------------------------------------------------------
// Small hooks
// ---------------------------------------------------------------------------

/** Ease-out count-up from 0 → target. Runs once on mount. */
function useCountUp(target: number, duration = 1100) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = Date.now();
    const tick = () => {
      const t = Math.min(1, (Date.now() - t0) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

/**
 * Hover (web) / press (native) lift. Returns handlers + an animated style that
 * raises and subtly scales the element with a springy feel.
 */
function useLift(amount = 6) {
  const t = useSharedValue(0);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -amount * t.value }, { scale: 1 + 0.012 * t.value }],
    shadowOpacity: 0.05 + 0.12 * t.value,
    shadowRadius: 8 + 16 * t.value,
    shadowOffset: { width: 0, height: 4 + 8 * t.value },
    shadowColor: '#101828',
    elevation: t.value * 8,
  }));
  const up = () => {
    t.value = withSpring(1, { mass: 0.5, damping: 16, stiffness: 220 });
  };
  const down = () => {
    t.value = withSpring(0, { mass: 0.5, damping: 16, stiffness: 220 });
  };
  return {
    style,
    handlers: { onHoverIn: up, onHoverOut: down, onPressIn: up, onPressOut: down },
  };
}

// ---------------------------------------------------------------------------
// Small components
// ---------------------------------------------------------------------------

/** Slowly drifting decorative blob, with optional scroll parallax. */
function Blob({
  size,
  color,
  opacity,
  top,
  left,
  right,
  scrollY,
  parallax = 0,
}: {
  size: number;
  color: string;
  opacity: number;
  top: number;
  left?: number;
  right?: number;
  scrollY?: SharedValue<number>;
  parallax?: number;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 9000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    return () => cancelAnimation(p);
  }, [p]);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: -24 * p.value },
      { translateY: 34 * p.value + (scrollY ? scrollY.value * parallax : 0) },
      { scale: 1 + 0.08 * p.value },
    ],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size,
          backgroundColor: color,
          opacity,
          top,
          left,
          right,
        },
        style,
      ]}
    />
  );
}

/** Gentle continuous float — adds life to a hero visual. */
function Floating({ children, amplitude = 6 }: { children: React.ReactNode; amplitude?: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2600, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    return () => cancelAnimation(p);
  }, [p]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -amplitude * p.value }],
  }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

/** Soft pulsing color glow — used behind the final CTA. */
function PulseGlow({ color }: { color: string }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    return () => cancelAnimation(p);
  }, [p]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.25 + 0.35 * p.value,
    transform: [{ scale: 0.9 + 0.2 * p.value }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: -120,
          alignSelf: 'center',
          width: 320,
          height: 320,
          borderRadius: 320,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

function FeatureCard({
  icon,
  title,
  body,
  accent,
  delay,
}: {
  icon: SymbolViewProps['name'];
  title: string;
  body: string;
  accent: string;
  delay: number;
}) {
  const { style, handlers } = useLift();
  return (
    <AnimatedPressable
      entering={FadeInDown.duration(600).delay(delay)}
      {...handlers}
      style={style}
      className="flex-1 gap-4 rounded-[20px] border border-border bg-card p-5">
      <View
        className="h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: accent }}>
        <SymbolView name={icon} size={20} tintColor="white" />
      </View>
      <View className="gap-1.5">
        <Text className="text-[16px] font-semibold text-foreground">{title}</Text>
        <Text className="text-sm leading-5 text-muted-foreground">{body}</Text>
      </View>
    </AnimatedPressable>
  );
}

function StatCounter({
  target,
  suffix = '',
  label,
  last,
}: {
  target: number;
  suffix?: string;
  label: string;
  last?: boolean;
}) {
  const value = useCountUp(target);
  return (
    <View
      className="flex-1 items-center gap-1 px-2"
      style={last ? undefined : { borderRightWidth: 1, borderRightColor: 'transparent' }}>
      <Text className="text-xl font-bold tracking-tight text-foreground">
        {value}
        {suffix}
      </Text>
      <Text className="text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Text>
    </View>
  );
}

/** Static stat (non-numeric). */
function StatText({ value, label, last }: { value: string; label: string; last?: boolean }) {
  return (
    <View className="flex-1 items-center gap-1 px-2">
      <Text className="text-xl font-bold tracking-tight text-foreground">{value}</Text>
      <Text className="text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Text>
    </View>
  );
}

type Category = {
  key: string;
  icon: SymbolViewProps['name'];
  label: string;
  hint: string;
  detail: string;
  bg: string;
};

function MiniTile({
  category,
  selected,
  onPress,
}: {
  category: Category;
  selected: boolean;
  onPress: () => void;
}) {
  const { style, handlers } = useLift(4);
  const colors = useThemeColors();
  return (
    <AnimatedPressable
      {...handlers}
      onPress={onPress}
      style={[style, { borderColor: selected ? category.bg : colors.border }]}
      className="flex-1 gap-3 rounded-2xl border bg-card p-4">
      <View
        className="h-8 w-8 items-center justify-center rounded-lg"
        style={{ backgroundColor: category.bg }}>
        <SymbolView name={category.icon} size={16} tintColor="white" />
      </View>
      <View>
        <Text className="text-sm font-semibold text-foreground">{category.label}</Text>
        <Text className="text-xs text-muted-foreground">{category.hint}</Text>
      </View>
    </AnimatedPressable>
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

// The web navbar (app-tabs.web.tsx) is absolutely positioned at the top, so it
// takes no layout space and content would otherwise render behind it.
const WEB_NAVBAR_CLEARANCE = 88;

type PreviewVariant = 'filled' | 'tonal' | 'outline' | 'success';
const VARIANTS: { key: PreviewVariant; label: string }[] = [
  { key: 'filled', label: 'Filled' },
  { key: 'tonal', label: 'Tonal' },
  { key: 'outline', label: 'Outline' },
  { key: 'success', label: 'Success' },
];

const CATEGORIES: Category[] = [
  {
    key: 'primitives',
    icon: 'rectangle.on.rectangle',
    label: 'Primitives',
    hint: 'Button, Badge, Avatar…',
    detail: 'Buttons, badges, avatars and text — the building blocks, fully themed.',
    bg: '#208AEF',
  },
  {
    key: 'forms',
    icon: 'slider.horizontal.3',
    label: 'Forms',
    hint: 'Input, Switch, Slider…',
    detail: 'Inputs, switches, checkboxes and sliders with accessible focus states.',
    bg: '#E5484D',
  },
  {
    key: 'layout',
    icon: 'square.grid.2x2',
    label: 'Layout',
    hint: 'Card, Tabs, List…',
    detail: 'Cards, tabs, stacks and separators to compose any screen.',
    bg: '#30A46C',
  },
  {
    key: 'feedback',
    icon: 'bell.badge.fill',
    label: 'Feedback',
    hint: 'Alert, Progress…',
    detail: 'Alerts, progress and skeletons that keep users informed.',
    bg: '#F5A524',
  },
];

/** Interactive segmented control used in the live-preview card. */
function VariantPicker({
  value,
  onChange,
}: {
  value: PreviewVariant;
  onChange: (v: PreviewVariant) => void;
}) {
  const colors = useThemeColors();
  return (
    <View className="flex-row flex-wrap gap-1.5">
      {VARIANTS.map((v) => {
        const selected = v.key === value;
        return (
          <Pressable
            key={v.key}
            onPress={() => onChange(v.key)}
            className="rounded-full border px-3 py-1.5"
            style={{
              borderColor: selected ? colors.primary : colors.border,
              backgroundColor: selected ? `${colors.primary}22` : 'transparent',
            }}>
            <Text
              className="text-xs font-semibold"
              style={{ color: selected ? colors.primary : colors.mutedForeground }}>
              {v.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 720;
  const colors = useThemeColors();
  const { toggleColorScheme, colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [demoOn, setDemoOn] = useState(true);
  const [variant, setVariant] = useState<PreviewVariant>('filled');
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll tracking → drives the top progress bar and blob parallax.
  const scrollY = useSharedValue(0);
  const scrollMax = useSharedValue(1);
  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
    scrollMax.value = Math.max(1, e.contentSize.height - e.layoutMeasurement.height);
  });
  const progressStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, Math.max(0, (scrollY.value / scrollMax.value) * 100))}%`,
  }));

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  const onCopy = () => {
    const snippet = '<Button label="Hello" leftIcon="sparkles" />';
    if (
      Platform.OS === 'web' &&
      typeof navigator !== 'undefined' &&
      navigator.clipboard?.writeText
    ) {
      navigator.clipboard.writeText(snippet).catch(() => {});
    }
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1400);
  };

  return (
    <View className="flex-1 bg-background">
      {/* Decorative drifting blobs — parallax with scroll */}
      <Blob size={520} color="#208AEF" opacity={0.09} top={-160} right={-140} scrollY={scrollY} parallax={0.12} />
      <Blob size={420} color="#F5A524" opacity={0.07} top={120} left={-120} scrollY={scrollY} parallax={-0.08} />
      <Blob size={380} color="#7c3aed" opacity={0.06} top={640} right={-120} scrollY={scrollY} parallax={0.05} />

      {/* Scroll progress bar */}
      <View
        pointerEvents="none"
        className="absolute left-0 right-0 top-0 z-50 h-[3px] bg-transparent">
        <Animated.View
          style={progressStyle}
          className="h-full rounded-r-full bg-primary"
        />
      </View>

      <Animated.ScrollView
        className="flex-1"
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop:
            insets.top +
            (isWide ? 24 : 16) +
            (Platform.OS === 'web' ? WEB_NAVBAR_CLEARANCE : 0),
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: isWide ? 40 : 20,
          maxWidth: 1040,
          width: '100%',
          alignSelf: 'center',
        }}
        showsVerticalScrollIndicator={false}>
        {/* ── Top bar ────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.duration(500)}
          className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2.5">
            <View className="h-8 w-8 items-center justify-center rounded-lg bg-foreground">
              <SymbolView name="sparkles" size={16} tintColor={colors.background} />
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
            {/* Theme toggle */}
            <Pressable
              onPress={toggleColorScheme}
              accessibilityRole="button"
              accessibilityLabel="Toggle light or dark theme"
              className="h-9 w-9 items-center justify-center rounded-full border border-border bg-card">
              <SymbolView
                name={isDark ? 'sun.max.fill' : 'moon.fill'}
                size={16}
                tintColor={colors.foreground}
              />
            </Pressable>
            {isWide ? (
              <Pressable
                onPress={() => router.navigate('/explore')}
                className="h-9 items-center justify-center rounded-full border border-border px-3">
                <Text className="text-xs font-medium text-foreground">Browse →</Text>
              </Pressable>
            ) : null}
          </View>
        </Animated.View>

        {/* ── Hero ───────────────────────────────────────────────── */}
        <View className={isWide ? 'mt-10 flex-row items-center gap-10' : 'mt-8 gap-8'}>
          {/* Left copy */}
          <View className="flex-1 gap-5">
            {/* Announcement pill */}
            <Animated.View entering={FadeInDown.duration(600).delay(80)} className="flex-row">
              <Pressable
                onPress={() => router.navigate('/explore')}
                className="flex-row items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
                <View className="h-5 items-center justify-center rounded-full bg-primary px-2">
                  <Text className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                    New
                  </Text>
                </View>
                <Text className="text-xs font-medium text-foreground">
                  30+ components — copy, paste, ship
                </Text>
                <SymbolView name="chevron.right" size={12} tintColor={colors.mutedForeground} />
              </Pressable>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(600).delay(140)}>
              <Text
                className="font-bold tracking-tight text-foreground"
                style={{ fontSize: isWide ? 54 : 38, lineHeight: isWide ? 56 : 40 }}>
                Build apps
              </Text>
              <Text
                className="font-bold tracking-tight"
                style={{
                  fontSize: isWide ? 54 : 38,
                  lineHeight: isWide ? 56 : 40,
                  color: colors.primary,
                }}>
                people love.
              </Text>
              <Text className="mt-4 max-w-[520px] text-[16px] leading-6 text-muted-foreground">
                A warm, accessible component library for Expo. Theme-aware, animated with Reanimated,
                and styled with NativeWind — ready to paste into your app.
              </Text>
            </Animated.View>

            {/* CTAs */}
            <Animated.View
              entering={FadeInDown.duration(600).delay(200)}
              className="flex-row flex-wrap gap-3">
              <Button
                label="Explore components"
                size={isWide ? 'lg' : 'md'}
                rightIcon="arrow.right"
                onPress={() => router.navigate('/explore')}
              />
              <Button
                label="How it works"
                size={isWide ? 'lg' : 'md'}
                variant="outline"
                leftIcon="play.fill"
                onPress={() => router.navigate('/explore')}
              />
            </Animated.View>

            {/* Social proof */}
            <Animated.View
              entering={FadeInDown.duration(600).delay(260)}
              className="mt-1 flex-row items-center gap-3">
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
                <Text className="text-xs text-muted-foreground">
                  Loved by 2,000+ builders • MIT licensed
                </Text>
              </View>
            </Animated.View>
          </View>

          {/* Right visual — interactive preview stack */}
          <Animated.View
            entering={FadeInDown.duration(700).delay(180)}
            className={isWide ? 'w-[380px] gap-3' : 'gap-3'}>
            {/* Main preview card — looks like a phone sheet, gently floating */}
            <Floating amplitude={isWide ? 7 : 0}>
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

                {/* Interactive variant playground */}
                <View className="gap-3">
                  <Text className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Try a button variant
                  </Text>
                  <VariantPicker value={variant} onChange={setVariant} />
                  <View className="items-center pt-1">
                    <Button label="Star" leftIcon="star.fill" variant={variant} size="md" />
                  </View>
                </View>
              </View>

              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text variant="small" className="font-medium">
                    Project progress
                  </Text>
                  <Text className="text-xs font-medium text-muted-foreground">
                    {demoOn ? '72%' : '24%'}
                  </Text>
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
            </Floating>

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
          </Animated.View>
        </View>

        {/* ── Stats strip (count-up) ─────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(120)}
          className="mt-10 flex-row rounded-2xl border border-border bg-card py-4">
          <StatCounter target={30} suffix="+" label="Components" />
          <StatCounter target={5} label="Categories" />
          <StatCounter target={100} suffix="%" label="Type-safe" />
          <StatText value="A11y" label="Built-in" last />
        </Animated.View>

        {/* ── Features — inviting cards with color ───────────────── */}
        <View className="mt-12 gap-4">
          <View className="gap-1">
            <Text className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Why you’ll love it
            </Text>
            <Text className="text-2xl font-bold tracking-tight text-foreground">
              Designed to feel effortless
            </Text>
            <Text className="max-w-[560px] text-sm leading-6 text-muted-foreground">
              Every component is crafted to be approachable, consistent, and delightful — so you can
              focus on your product, not the plumbing.
            </Text>
          </View>

          <View className={isWide ? 'flex-row gap-4' : 'gap-3'}>
            <FeatureCard
              icon="paintbrush.fill"
              title="Token theming"
              body="Semantic colors that follow the system theme. Light & dark just work — no extra config."
              accent="#208AEF"
              delay={0}
            />
            <FeatureCard
              icon="bolt.fill"
              title="Reanimated motion"
              body="Springy presses, smooth accordions, and focus states that feel truly native."
              accent="#30a46c"
              delay={80}
            />
            <FeatureCard
              icon="wand.and.stars"
              title="Copy, paste, ship"
              body="Clean src/ui you can own. No heavy deps — extract to your own package when ready."
              accent="#8E5CF5"
              delay={160}
            />
          </View>
        </View>

        {/* ── Bento showcase (interactive categories) ────────────── */}
        <View className="mt-12 gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-foreground">Everything you need</Text>
            <Pressable
              onPress={() => router.navigate('/explore')}
              className="flex-row items-center gap-1">
              <Text className="text-sm font-medium text-primary">Browse all</Text>
              <SymbolView name="chevron.right" size={12} tintColor={colors.primary} />
            </Pressable>
          </View>

          <View className={isWide ? 'flex-row gap-3' : 'flex-row flex-wrap gap-3'}>
            {CATEGORIES.map((c) => (
              <MiniTile
                key={c.key}
                category={c}
                selected={c.key === category.key}
                onPress={() => setCategory(c)}
              />
            ))}
          </View>

          {/* Selected category detail */}
          <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4">
            <View
              className="h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: category.bg }}>
              <SymbolView name={category.icon} size={16} tintColor="white" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground">{category.label}</Text>
              <Text className="text-xs text-muted-foreground">{category.detail}</Text>
            </View>
          </View>

          {/* Quick code hint — with copy */}
          <View className="rounded-2xl border border-border bg-foreground px-4 py-3">
            <View className="flex-row items-center justify-between">
              <Text className="font-mono text-xs text-muted">
                import {`{ Button }`} from &apos;@/ui&apos;;
              </Text>
              <Pressable onPress={onCopy} hitSlop={8}>
                <Badge
                  label={copied ? 'Copied!' : 'Copy & paste'}
                  variant={copied ? 'success' : 'secondary'}
                  size="sm"
                  icon={copied ? 'checkmark' : 'doc.on.doc'}
                />
              </Pressable>
            </View>
            <Text className="mt-2 font-mono text-sm text-background">
              {'<Button label="Hello" leftIcon="sparkles" />'}
            </Text>
          </View>
        </View>

        {/* ── How it works ───────────────────────────────────────── */}
        <View className="mt-12 gap-6 rounded-[24px] border border-border bg-card p-6">
          <View className="gap-1">
            <Text className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              How it works
            </Text>
            <Text className="text-xl font-bold text-foreground">
              From zero to shipped in minutes
            </Text>
          </View>
          <View className={isWide ? 'flex-row gap-8' : 'gap-6'}>
            <Step
              n="1"
              title="Install"
              body="npx expo install — compatible versions, zero conflicts. NativeWind setup included."
            />
            <Step
              n="2"
              title="Copy"
              body="Pick a component from the gallery. Paste the src/ui file — it’s yours to theme."
            />
            <Step
              n="3"
              title="Ship"
              body="Build with EAS or run locally. Light, dark, iOS, Android, and Web — all covered."
            />
          </View>
          <View className="flex-row flex-wrap gap-3 pt-2">
            <Button
              label="Start building"
              rightIcon="arrow.right"
              onPress={() => router.navigate('/explore')}
            />
            <Text className="self-center text-xs text-muted-foreground">
              No config hell. Just components that work.
            </Text>
          </View>
        </View>

        {/* ── Final CTA — gradient card with animated glow ───────── */}
        <View className="mt-12 overflow-hidden rounded-[24px]">
          <LinearGradient
            colors={['#0B1220', '#0A0A0A', '#120A1F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 32, alignItems: 'center', gap: 16 }}>
            <PulseGlow color={colors.primary} />
            <View className="h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <SymbolView name="heart.fill" size={18} tintColor="white" />
            </View>
            <Text className="text-center text-2xl font-bold tracking-tight text-white">
              Ready to make something lovely?
            </Text>
            <Text className="max-w-[520px] text-center text-sm leading-6 text-white/70">
              Jump into the interactive gallery, play with every variant, and copy the code straight
              into your app. Friendly, fast, and free — forever.
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
            <Text className="font-mono text-[10px] uppercase tracking-widest text-white/40">
              MIT • TypeScript • Expo SDK 57
            </Text>
          </LinearGradient>
        </View>

        {Platform.OS === 'web' ? (
          <View className="mt-10 items-center">
            <WebBadge />
          </View>
        ) : null}

        <Text className="mt-8 text-center font-mono text-[11px] text-muted-foreground">
          Crafted with care for mobile builders — iOS · Android · Web
        </Text>
      </Animated.ScrollView>
    </View>
  );
}
