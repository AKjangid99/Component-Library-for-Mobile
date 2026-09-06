import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Boxes,
  Check,
  ChevronRight,
  Copy,
  Cuboid,
  Calendar,
  ImagePlus,
  LayoutGrid,
  MessageSquare,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/ui/lib/cn';
import { CustomizationProvider } from '@/ui/lib/customization';
import { useThemeColors } from '@/ui/lib/theme';
import { CustomizePanel } from './customize-panel';
import { CodeBlock, Demo } from './preview';
import { categories, registry, type DocEntry } from './registry';

const SIDEBAR_BREAKPOINT = 880;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/* -------------------------------------------------------------------------- */
/* Meta: category + component accents                                          */
/* -------------------------------------------------------------------------- */

const CATEGORY_META: Record<string, { color: string; icon: typeof Boxes }> = {
  Components: { color: '#7c3aed', icon: Sparkles },
  Primitives: { color: '#208aef', icon: Boxes },
  Forms: { color: '#e5484d', icon: SlidersHorizontal },
  Layout: { color: '#30a46c', icon: LayoutGrid },
  Feedback: { color: '#f5a524', icon: Bell },
};

const COMPONENT_ICON: Record<string, typeof Boxes> = {
  'slide-sheet': Cuboid,
  dialog: MessageSquare,
  button: Boxes,
  badge: Boxes,
  text: Boxes,
  avatar: Boxes,
  // separator: Boxes,
  card: LayoutGrid,
  accordion: LayoutGrid,
  tabs: LayoutGrid,
  input: SlidersHorizontal,
  'image-uploader': ImagePlus,
  'date-time-picker': Calendar,  switch: SlidersHorizontal,
  'star-rating': Star,
  toast: Bell,
  checkbox: SlidersHorizontal,
  radio: SlidersHorizontal,
  toggle: SlidersHorizontal,
  alert: Bell,
  progress: Bell,
  skeleton: Bell,
  spinner: Bell,
};

function accentFor(entry: DocEntry) {
  return CATEGORY_META[entry.category]?.color ?? '#208aef';
}

/* -------------------------------------------------------------------------- */
/* Shell                                                                       */
/* -------------------------------------------------------------------------- */

type CategoryFilter = 'All' | (typeof categories)[number];

export function DocsShell() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWide = width >= SIDEBAR_BREAKPOINT;

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('All');

  const entry = useMemo(
    () => registry.find((e) => e.slug === selectedSlug) ?? null,
    [selectedSlug],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return registry.filter((e) => {
      const inCategory = category === 'All' || e.category === category;
      if (!inCategory) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.slug.includes(q)
      );
    });
  }, [query, category]);

  const grouped = useMemo(
    () =>
      categories.map((c) => ({
        category: c,
        items: registry.filter((e) => e.category === c),
      })),
    [],
  );

  return (
    <CustomizationProvider>
      <DocsShellInner
        isWide={isWide}
        insetsTop={insets.top}
        insetsBottom={insets.bottom}
        selectedSlug={selectedSlug}
        setSelectedSlug={setSelectedSlug}
        query={query}
        setQuery={setQuery}
        category={category}
        setCategory={setCategory}
        entry={entry}
        filtered={filtered}
        grouped={grouped}
      />
    </CustomizationProvider>
  );
}

function DocsShellInner({
  isWide,
  insetsTop,
  insetsBottom,
  selectedSlug,
  setSelectedSlug,
  query,
  setQuery,
  category,
  setCategory,
  entry,
  filtered,
  grouped,
}: {
  isWide: boolean;
  insetsTop: number;
  insetsBottom: number;
  selectedSlug: string | null;
  setSelectedSlug: (slug: string | null) => void;
  query: string;
  setQuery: (q: string) => void;
  category: CategoryFilter;
  setCategory: (c: CategoryFilter) => void;
  entry: DocEntry | null;
  filtered: DocEntry[];
  grouped: { category: (typeof categories)[number]; items: DocEntry[] }[];
}) {
  const openEntry = (slug: string) => setSelectedSlug(slug);
  const backToGallery = () => setSelectedSlug(null);

  return (
    <View className="flex-1 flex-row bg-background" style={{ paddingTop: isWide ? 0 : insetsTop }}>
      {isWide ? (
        <View
          className="w-[280px] shrink-0 border-r border-border"
          style={{ paddingTop: insetsTop + 8 }}>
          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
            showsVerticalScrollIndicator={false}>
            <SidebarBrand onHome={backToGallery} />
            <SidebarSearch value={query} onChange={setQuery} />
            <View className="mt-6 gap-6">
              <View className="gap-1">
                <AllLink
                  active={selectedSlug === null}
                  count={registry.length}
                  onPress={() => {
                    backToGallery();
                    setCategory('All');
                    setQuery('');
                  }}
                />
              </View>
              {grouped.map((group) => (
                <View key={group.category} className="gap-1">
                  <CategoryLabel
                    category={group.category}
                    count={group.items.length}
                    active={group.items.some((i) => i.slug === selectedSlug)}
                  />
                  {group.items.map((item) => (
                    <NavLink
                      key={item.slug}
                      label={item.name}
                      active={item.slug === selectedSlug}
                      accent={accentFor(item)}
                      onPress={() => openEntry(item.slug)}
                    />
                  ))}
                </View>
              ))}
            </View>
            <View className="mt-8 rounded-xl border border-border bg-card p-3">
              <Text className="text-xs font-semibold text-foreground">Tip</Text>
              <Text className="mt-1 text-xs leading-4 text-muted-foreground">
                Every preview is live — toggle, type, and tap before you copy the code.
              </Text>
            </View>
          </ScrollView>
        </View>
      ) : null}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: isWide ? 48 : 22,
          paddingTop: isWide ? 48 : 20,
          paddingBottom: insetsBottom + 112,
          maxWidth: 800,
          width: '100%',
          alignSelf: 'center',
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {entry ? (
          <ComponentDetail
            key={entry.slug}
            entry={entry}
            onBack={backToGallery}
            onOpen={openEntry}
            showBack={!isWide}
          />
        ) : (
          <Gallery
            query={query}
            onQuery={setQuery}
            category={category}
            onCategory={setCategory}
            results={filtered}
            onOpen={openEntry}
          />
        )}
      </ScrollView>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Gallery (overview)                                                          */
/* -------------------------------------------------------------------------- */

function Gallery({
  query,
  onQuery,
  category,
  onCategory,
  results,
  onOpen,
}: {
  query: string;
  onQuery: (q: string) => void;
  category: CategoryFilter;
  onCategory: (c: CategoryFilter) => void;
  results: DocEntry[];
  onOpen: (slug: string) => void;
}) {
  const colors = useThemeColors();
  const filters: CategoryFilter[] = ['All', ...categories];

  return (
    <View className="gap-7">
      {/* Hero header */}
      <Animated.View entering={FadeInDown.duration(500)}>
        <View className="flex-row items-center gap-2">
          <View
            className="h-9 w-9 items-center justify-center rounded-xl"
            style={{ backgroundColor: colors.foreground }}>
            <LayoutGrid size={17} color={colors.background} />
          </View>
          <View className="flex-1">
            <Text className="text-[22px] font-bold tracking-tight text-foreground">
              Components
            </Text>
            <Text className="text-[13px] text-muted-foreground">
              {registry.length} pieces · tap any card to play with it live
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Search */}
      <Animated.View entering={FadeInDown.duration(500).delay(60)}>
        <View className="flex-row items-center gap-2 rounded-2xl border border-border bg-card px-3.5 py-1">
          <Search size={16} color={colors.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={onQuery}
            placeholder="Search button, input, sheet…"
            placeholderTextColor={colors.mutedForeground}
            className="flex-1 py-2.5 text-[15px]"
            style={{ color: colors.foreground }}
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <Pressable onPress={() => onQuery('')} hitSlop={8}>
              <X size={16} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>
      </Animated.View>

      {/* Category filter chips */}
      <Animated.View entering={FadeInDown.duration(500).delay(110)}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2 pr-2">
            {filters.map((f) => {
              const active = category === f;
              const count =
                f === 'All' ? registry.length : registry.filter((e) => e.category === f).length;
              const tint = f === 'All' ? colors.primary : (CATEGORY_META[f]?.color ?? colors.primary);
              return (
                <Pressable
                  key={f}
                  onPress={() => onCategory(f)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  className="flex-row items-center gap-1.5 rounded-full border px-3.5 py-2"
                  style={{
                    borderColor: active ? tint : colors.border,
                    backgroundColor: active ? `${tint}18` : 'transparent',
                  }}>
                  <Text
                    className="text-[13px] font-semibold"
                    style={{ color: active ? tint : colors.mutedForeground }}>
                    {f}
                  </Text>
                  <View
                    className="min-w-[20px] items-center rounded-full px-1 py-px"
                    style={{ backgroundColor: active ? tint : colors.border }}>
                    <Text
                      className="font-mono text-[10px] font-bold"
                      style={{ color: active ? '#fff' : colors.mutedForeground }}>
                      {count}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Result meta */}
      <View className="flex-row items-center justify-between">
        <Text className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          {results.length} result{results.length === 1 ? '' : 's'}
          {query ? ` for “${query}”` : ''}
        </Text>
      </View>

      {/* Customize playground */}
      <CustomizePanel />

      {/* Cards */}
      {results.length === 0 ? (
        <Animated.View
          entering={FadeIn.duration(300)}
          className="items-center gap-2 rounded-2xl border border-dashed border-border bg-card p-10">
          <Search size={22} color={colors.mutedForeground} />
          <Text className="text-[15px] font-semibold text-foreground">No matches</Text>
          <Text className="text-center text-[13px] text-muted-foreground">
            Try “button”, “card”, or “sheet” — or clear the search.
          </Text>
          <Pressable
            onPress={() => {
              onQuery('');
              onCategory('All');
            }}
            className="mt-1 rounded-full bg-foreground px-4 py-2">
            <Text className="text-[13px] font-semibold text-background">Reset filters</Text>
          </Pressable>
        </Animated.View>
      ) : (
        <View className="gap-4">
          {results.map((item, i) => (
            <ComponentCard key={item.slug} entry={item} index={i} onPress={() => onOpen(item.slug)} />
          ))}
        </View>
      )}

      {/* Getting started — a little documentation, tucked below the catalog */}
      <GettingStarted />

      {/* Footnote */}
      <Text className="mt-2 text-center font-mono text-[11px] text-muted-foreground">
        {Platform.OS === 'web' ? 'Hover a card — it lifts · ' : ''}Built with Reanimated + NativeWind
      </Text>
    </View>
  );
}

/** Compact getting-started docs: install, use, theme. */
function GettingStarted() {
  const colors = useThemeColors();
  const [open, setOpen] = useState(true);
  return (
    <Animated.View
      entering={FadeInDown.duration(500).delay(200)}
      className="overflow-hidden rounded-2xl border border-border bg-card">
      <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button">
        <View className="flex-row items-center gap-3 p-5">
          <View
            className="h-9 w-9 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${colors.primary}1a` }}>
            <Sparkles size={17} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-[15px] font-bold tracking-tight text-foreground">
              Getting started
            </Text>
            <Text className="text-xs text-muted-foreground">
              Install · use · theme — tap to {open ? 'collapse' : 'expand'}
            </Text>
          </View>
          <ChevronRight
            size={16}
            color={colors.mutedForeground}
            style={{ transform: [{ rotate: open ? '90deg' : '0deg' }] }}
          />
        </View>
      </Pressable>
      {open ? (
        <View className="gap-5 px-5 pb-6">
          <GuideStep
            n="1"
            title="Install the bits you need"
            body="Components are copy-paste. Only native extras need installing — the gallery tells you which."
            code="npx expo install expo-image-picker @react-native-community/datetimepicker"
          />
          <GuideStep
            n="2"
            title="Use any component"
            body="Import from the library and drop it in. Every playground snippet copies straight into your screen."
            code={`import { Button } from '@/ui';\n\n<Button label="Hello" onPress={sayHi} />`}
          />
          <GuideStep
            n="3"
            title="Theme it your way"
            body="Pass any hex to a component's color prop — or pick an accent in the Customize panel and every live example follows."
            code={`const { resolvedAccent } = useCustomization();\n\n<Button label="Themed" color={resolvedAccent} />`}
          />
        </View>
      ) : null}
    </Animated.View>
  );
}

function GuideStep({
  n,
  title,
  body,
  code,
}: {
  n: string;
  title: string;
  body: string;
  code: string;
}) {
  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-2.5">
        <View className="h-6 w-6 items-center justify-center rounded-full bg-foreground">
          <Text className="text-[11px] font-bold text-background">{n}</Text>
        </View>
        <Text className="text-sm font-bold text-foreground">{title}</Text>
      </View>
      <Text className="text-[13px] leading-5 text-muted-foreground">{body}</Text>
      <CodeBlock code={code} />
    </View>
  );
}

/** Interactive lift-on-press card that opens a component's detail page. */
function ComponentCard({
  entry,
  index,
  onPress,
}: {
  entry: DocEntry;
  index: number;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  const accent = accentFor(entry);
  const Icon = COMPONENT_ICON[entry.slug] ?? COMPONENT_ICON[entry.category] ?? Boxes;
  const lift = useSharedValue(0);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -4 * lift.value }, { scale: 1 + 0.008 * lift.value }],
    borderColor: lift.value > 0.5 ? `${accent}66` : colors.border,
    shadowOpacity: 0.04 + 0.1 * lift.value,
    shadowRadius: 6 + 14 * lift.value,
    shadowOffset: { width: 0, height: 3 + 6 * lift.value },
    shadowColor: '#101828',
  }));

  const pressIn = () => {
    lift.value = withSpring(1, { mass: 0.5, damping: 15, stiffness: 260 });
  };
  const pressOut = () => {
    lift.value = withSpring(0, { mass: 0.5, damping: 15, stiffness: 260 });
  };

  return (
    <Animated.View entering={FadeInDown.duration(450).delay(Math.min(index * 45, 360))}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onHoverIn={pressIn}
        onHoverOut={pressOut}
        accessibilityRole="button"
        accessibilityLabel={`Open ${entry.name}`}
        style={cardStyle}
        className="gap-4 rounded-2xl border bg-card p-5">
        <View className="flex-row items-center gap-3">
          <View
            className="h-11 w-11 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${accent}1a` }}>
            <Icon size={20} color={accent} />
          </View>
          <View className="flex-1 gap-0.5">
            <View className="flex-row items-center gap-2">
              <Text className="text-[16px] font-bold tracking-tight text-foreground">
                {entry.name}
              </Text>
              <View
                className="rounded-full px-2 py-0.5"
                style={{ backgroundColor: `${accent}16` }}>
                <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: accent }}>
                  {entry.category}
                </Text>
              </View>
            </View>
            <Text className="text-[13px] leading-5 text-muted-foreground" numberOfLines={2}>
              {entry.description}
            </Text>
          </View>
          <View
            className="h-8 w-8 items-center justify-center rounded-full border border-border"
            style={{ backgroundColor: colors.background }}>
            <ArrowUpRight size={15} color={colors.foreground} />
          </View>
        </View>
        <View className="flex-row items-center justify-between border-t border-border pt-3">
          <Text className="font-mono text-[11px] text-muted-foreground">
            {entry.examples.length} example{entry.examples.length === 1 ? '' : 's'} · fully interactive
          </Text>
          <View className="flex-row items-center gap-1">
            <Text className="text-[13px] font-semibold" style={{ color: accent }}>
              Open
            </Text>
            <ChevronRight size={14} color={accent} />
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

/* -------------------------------------------------------------------------- */
/* Detail page                                                                 */
/* -------------------------------------------------------------------------- */

function ComponentDetail({
  entry,
  onBack,
  onOpen,
  showBack,
}: {
  entry: DocEntry;
  onBack: () => void;
  onOpen: (slug: string) => void;
  showBack: boolean;
}) {
  const colors = useThemeColors();
  const accent = accentFor(entry);
  const Icon = COMPONENT_ICON[entry.slug] ?? Boxes;
  const [copiedImport, setCopiedImport] = useState(false);
  const importName = entry.name.replace(/\s+/g, '');
  const importLine = `import { ${importName} } from '@/ui';`;

  const idx = registry.findIndex((e) => e.slug === entry.slug);
  const prev = idx > 0 ? registry[idx - 1] : null;
  const next = idx < registry.length - 1 ? registry[idx + 1] : null;

  const copyImport = () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(importLine).catch(() => { });
    }
    setCopiedImport(true);
    setTimeout(() => setCopiedImport(false), 1400);
  };

  const siblings = registry.filter((e) => e.category === entry.category && e.slug !== entry.slug).slice(0, 3);

  return (
    <View className="gap-8">
      {showBack ? (
        <Pressable onPress={onBack} hitSlop={8} className="flex-row items-center gap-1.5 self-start">
          <ArrowLeft size={16} color={colors.mutedForeground} />
          <Text className="text-sm font-semibold text-muted-foreground">All components</Text>
        </Pressable>
      ) : (
        <Pressable onPress={onBack} hitSlop={8} className="flex-row items-center gap-1.5 self-start">
          <ArrowLeft size={16} color={colors.mutedForeground} />
          <Text className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Gallery
          </Text>
        </Pressable>
      )}

      {/* Header hero */}
      <Animated.View entering={FadeInDown.duration(450)} className="gap-4">
        <View
          className="gap-5 overflow-hidden rounded-[24px] border border-border p-6"
          style={{ backgroundColor: `${accent}0d` }}>
          <View className="flex-row items-center gap-3.5">
            <View
              className="h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: accent }}>
              <Icon size={26} color="#fff" />
            </View>
            <View className="flex-1 gap-1">
              <View className="flex-row items-center gap-2">
                <Text className="font-mono text-[10px] font-bold uppercase tracking-widest" style={{ color: accent }}>
                  {entry.category}
                </Text>
                <Text className="font-mono text-[10px] text-muted-foreground">
                  {entry.examples.length} live demo{entry.examples.length === 1 ? '' : 's'}
                </Text>
              </View>
              <Text className="text-[28px] font-bold leading-8 tracking-tight text-foreground">
                {entry.name}
              </Text>
            </View>
          </View>
          <Text className="text-[15px] leading-6 text-muted-foreground">{entry.description}</Text>
          {/* Quick actions */}
          <View className="flex-row flex-wrap gap-2">
            <Pressable
              onPress={copyImport}
              className="flex-row items-center gap-1.5 rounded-full px-3.5 py-2"
              style={{ backgroundColor: copiedImport ? colors.success : accent }}>
              {copiedImport ? <Check size={14} color="#fff" /> : <Copy size={14} color="#fff" />}
              <Text className="text-[13px] font-semibold text-white">
                {copiedImport ? 'Import copied' : 'Copy import'}
              </Text>
            </Pressable>
            <View className="flex-row items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-2">
              <View className="h-1.5 w-1.5 rounded-full bg-success" />
              <Text className="text-[13px] font-medium text-foreground">Interactive below</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Import block */}
      <Animated.View entering={FadeInDown.duration(450).delay(80)} className="gap-2">
        <Text className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Import
        </Text>
        <CodeBlock code={importLine} />
      </Animated.View>

      <View className="h-px bg-border" />

      {/* Examples */}
      <View className="gap-6">
        <View className="flex-row items-center justify-between">
          <Text className="text-[17px] font-bold tracking-tight text-foreground">
            Playground
          </Text>
          <Text className="font-mono text-[11px] text-muted-foreground">
            {String(entry.examples.length).padStart(2, '0')} sections
          </Text>
        </View>
        {entry.examples.map((example, i) => (
          <Demo
            key={i}
            index={i}
            title={example.title}
            description={example.description}
            code={example.code}>
            {example.element}
          </Demo>
        ))}
      </View>

      {/* Siblings */}
      {siblings.length > 0 ? (
        <View className="gap-3">
          <Text className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            More in {entry.category}
          </Text>
          <View className="gap-2">
            {siblings.map((s) => {
              const SIcon = COMPONENT_ICON[s.slug] ?? Boxes;
              const sAccent = accentFor(s);
              return (
                <Pressable
                  key={s.slug}
                  onPress={() => onOpen(s.slug)}
                  className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-3.5">
                  <View
                    className="h-9 w-9 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${sAccent}1a` }}>
                    <SIcon size={17} color={sAccent} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">{s.name}</Text>
                    <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                      {s.description}
                    </Text>
                  </View>
                  <ChevronRight size={15} color={colors.mutedForeground} />
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* Prev / Next */}
      <View className="flex-row gap-3">
        {prev ? (
          <Pressable
            onPress={() => onOpen(prev.slug)}
            className="flex-1 gap-1 rounded-2xl border border-border bg-card p-4">
            <View className="flex-row items-center gap-1">
              <ArrowLeft size={13} color={colors.mutedForeground} />
              <Text className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Previous
              </Text>
            </View>
            <Text className="text-sm font-semibold text-foreground">{prev.name}</Text>
          </Pressable>
        ) : (
          <View className="flex-1" />
        )}
        {next ? (
          <Pressable
            onPress={() => onOpen(next.slug)}
            className="flex-1 items-end gap-1 rounded-2xl border border-border bg-card p-4">
            <View className="flex-row items-center gap-1">
              <Text className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Next
              </Text>
              <ArrowRight size={13} color={colors.mutedForeground} />
            </View>
            <Text className="text-sm font-semibold text-foreground">{next.name}</Text>
          </Pressable>
        ) : (
          <View className="flex-1" />
        )}
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Sidebar pieces                                                              */
/* -------------------------------------------------------------------------- */

function SidebarBrand({ onHome }: { onHome: () => void }) {
  const colors = useThemeColors();
  return (
    <Pressable onPress={onHome}>
      <View className="flex-row items-center gap-2.5">
        <View
          className="h-9 w-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: colors.foreground }}>
          <Sparkles size={16} color={colors.background} />
        </View>
        <View className="gap-0.5">
          <Text className="text-[16px] font-bold tracking-tight text-foreground">
            Component Lib
          </Text>
          <Text className="font-mono text-[10px] text-muted-foreground">
            expo · nativewind · v0.1
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function SidebarSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const colors = useThemeColors();
  return (
    <View className="mt-5 flex-row items-center gap-2 rounded-xl border border-border bg-card px-3 py-1">
      <Search size={14} color={colors.mutedForeground} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Filter…"
        placeholderTextColor={colors.mutedForeground}
        className="flex-1 py-2 text-sm"
        style={{ color: colors.foreground }}
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChange('')} hitSlop={8}>
          <X size={14} color={colors.mutedForeground} />
        </Pressable>
      ) : null}
    </View>
  );
}

function AllLink({ active, count, onPress }: { active: boolean; count: number; onPress: () => void }) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-2.5 rounded-xl px-2.5 py-2.5"
      style={active ? { backgroundColor: `${colors.primary}14` } : undefined}>
      <View
        className="h-7 w-7 items-center justify-center rounded-lg"
        style={{ backgroundColor: active ? colors.primary : colors.muted }}>
        <LayoutGrid size={14} color={active ? '#fff' : colors.mutedForeground} />
      </View>
      <Text
        className={cn('flex-1 text-[14px]', active ? 'font-bold text-foreground' : 'text-muted-foreground')}>
        All components
      </Text>
      <View className="rounded-full bg-muted px-2 py-0.5">
        <Text className="font-mono text-[10px] font-bold text-muted-foreground">{count}</Text>
      </View>
    </Pressable>
  );
}

function CategoryLabel({
  category,
  count,
  active,
}: {
  category: string;
  count: number;
  active: boolean;
}) {
  const meta = CATEGORY_META[category];
  const Icon = meta?.icon ?? Boxes;
  return (
    <View className="mb-1 flex-row items-center gap-2 px-2.5">
      <Icon size={12} color={active ? (meta?.color ?? '#888') : '#90949e'} />
      <Text
        className={cn(
          'flex-1 text-[11px] font-bold uppercase tracking-widest',
          active ? 'text-foreground' : 'text-muted-foreground',
        )}>
        {category}
      </Text>
      <Text className="font-mono text-[10px] text-muted-foreground">{count}</Text>
    </View>
  );
}

function NavLink({
  label,
  active,
  accent,
  onPress,
}: {
  label: string;
  active: boolean;
  accent: string;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-2 rounded-lg px-2.5 py-[7px]"
      style={active ? { backgroundColor: `${accent}14` } : undefined}>
      <View
        className="h-[18px] w-[3px] rounded-full"
        style={{ backgroundColor: active ? accent : 'transparent' }}
      />
      <Text
        className={cn(
          'flex-1 text-[14px]',
          active ? 'font-bold text-foreground' : 'font-normal text-muted-foreground',
        )}>
        {label}
      </Text>
      {active ? <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} /> : null}
      <View style={{ display: 'none' }}>
        <Text style={{ color: colors.foreground }}>{''}</Text>
      </View>
    </Pressable>
  );
}
