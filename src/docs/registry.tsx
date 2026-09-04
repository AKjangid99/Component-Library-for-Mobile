import { ArrowRight, Bell, LayoutGrid, List, Lock, Mail, Moon, Sparkles } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  FloatingLabelInput,
  type FloatingLabelInputHandle,
  FormRow,
  GlassCard,
  GradientButton,
  MorphToggle,
  PillBadge,
  Progress,
  ProgressIndicator,
  Radio,
  RadioGroup,
  SegmentedTabs,
  Separator,
  Skeleton,
  SlideSheet,
  Spinner,
  StatusAvatar,
  StatusAvatarGroup,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  TextField,
  Toggle,
} from '@/ui';

export type DocExample = {
  title?: string;
  description?: string;
  element: React.ReactNode;
  code: string;
};

export type DocEntry = {
  slug: string;
  name: string;
  category: string;
  description: string;
  examples: DocExample[];
};

/* -------------------------------------------------------------------------- */
/* Interactive demo wrappers (need their own state)                            */
/* -------------------------------------------------------------------------- */

function SwitchDemo() {
  const [on, setOn] = useState(true);
  const [wifi, setWifi] = useState(false);
  return (
    <View className="w-full gap-3">
      <FormRow label="Push notifications">
        <Switch value={on} onValueChange={setOn} />
      </FormRow>
      <FormRow label="Wi-Fi only">
        <Switch value={wifi} onValueChange={setWifi} />
      </FormRow>
    </View>
  );
}

function CheckboxDemo() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  return (
    <View className="w-full gap-3">
      <Checkbox value={a} onValueChange={setA} label="Email me about updates" />
      <Checkbox value={b} onValueChange={setB} label="Subscribe to the newsletter" />
    </View>
  );
}

function RadioDemo() {
  const [value, setValue] = useState('monthly');
  return (
    <RadioGroup value={value} onValueChange={setValue} className="w-full">
      <Radio value="monthly" label="Monthly — $9/mo" />
      <Radio value="yearly" label="Yearly — $90/yr" />
      <Radio value="lifetime" label="Lifetime — $299" />
    </RadioGroup>
  );
}

function ToggleDemo() {
  const [bold, setBold] = useState(true);
  const [italic, setItalic] = useState(false);
  return (
    <View className="flex-row gap-2">
      <Toggle pressed={bold} onPressedChange={setBold} icon="bold" variant="outline" />
      <Toggle pressed={italic} onPressedChange={setItalic} icon="italic" variant="outline" />
    </View>
  );
}

function TextFieldDemo() {
  const [email, setEmail] = useState('');
  const touched = email.length > 0;
  const isEmail = /.+@.+\..+/.test(email);
  const error = touched && !isEmail ? 'Enter a valid email' : undefined;
  return (
    <View className="w-full gap-4">
      <TextField label="Name" placeholder="Ada Lovelace" />
      <TextField
        label="Email"
        placeholder="you@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        helperText={isEmail ? 'Looks good.' : "We'll never share it."}
        error={error}
      />
    </View>
  );
}

function TextFieldFillDemo() {
  return (
    <View className="w-full gap-4">
      <TextField label="Outline" placeholder="Bordered surface" variant="outline" />
      <TextField label="Filled" placeholder="Muted surface" variant="filled" />
      <TextField label="Ghost" placeholder="No chrome" variant="ghost" />
    </View>
  );
}

function TextFieldSizeDemo() {
  return (
    <View className="w-full gap-4">
      <TextField label="Small" placeholder="sm" size="sm" />
      <TextField label="Medium" placeholder="md" size="md" />
      <TextField label="Large" placeholder="lg" size="lg" />
    </View>
  );
}

function TextFieldClearDemo() {
  return (
    <View className="w-full gap-4">
      <TextField label="Search" placeholder="Type, then clear" clearable defaultValue="Hello" />
      <TextField label="Bio" placeholder="Max 80 chars" maxLength={80} />
    </View>
  );
}

function ProgressDemo() {
  const [value, setValue] = useState(60);
  return (
    <View className="w-full gap-4">
      <Progress value={value} />
      <View className="flex-row gap-2">
        <Button label="-10" size="sm" variant="tonal" onPress={() => setValue((v) => Math.max(0, v - 10))} />
        <Button label="+10" size="sm" variant="tonal" onPress={() => setValue((v) => Math.min(100, v + 10))} />
      </View>
    </View>
  );
}

/* --- Premium set demos ---------------------------------------------------- */

function MorphToggleDemo() {
  const [wifi, setWifi] = useState(true);
  const [dark, setDark] = useState(false);
  return (
    <View className="w-full gap-4">
      <MorphToggle value={wifi} onValueChange={setWifi} label="Wi-Fi" />
      <MorphToggle value={dark} onValueChange={setDark} icon={Moon} label="Dark mode" />
      <MorphToggle value={false} onValueChange={() => {}} label="Disabled" disabled />
    </View>
  );
}

function FloatingLabelInputDemo() {
  const passwordRef = useRef<FloatingLabelInputHandle>(null);
  const [email, setEmail] = useState('');
  const isEmail = /.+@.+\..+/.test(email);
  return (
    <View className="w-full gap-4">
      <FloatingLabelInput
        label="Email"
        leftIcon={Mail}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        valid={isEmail}
        error={email.length > 0 && !isEmail ? 'Enter a valid email' : undefined}
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <FloatingLabelInput
        ref={passwordRef}
        label="Password"
        leftIcon={Lock}
        secureTextEntry
        helperText="At least 8 characters"
      />
    </View>
  );
}

function ProgressIndicatorDemo() {
  const [value, setValue] = useState(64);
  return (
    <View className="w-full gap-5">
      <ProgressIndicator variant="linear" value={value} />
      <View className="flex-row items-center justify-center gap-8">
        <ProgressIndicator variant="circular" value={value} showValue />
        <ProgressIndicator variant="circular" value={value} gradient="accent" size={64} />
      </View>
      <View className="gap-2">
        <ProgressIndicator variant="skeleton" className="h-4 w-2/3" />
        <ProgressIndicator variant="skeleton" className="h-4 w-1/2" />
      </View>
      <View className="flex-row justify-center gap-2">
        <Button label="-15" size="sm" variant="tonal" onPress={() => setValue((v) => Math.max(0, v - 15))} />
        <Button label="+15" size="sm" variant="tonal" onPress={() => setValue((v) => Math.min(100, v + 15))} />
      </View>
    </View>
  );
}

function SegmentedTabsDemo() {
  const [view, setView] = useState('grid');
  return (
    <View className="w-full gap-4">
      <SegmentedTabs
        value={view}
        onValueChange={setView}
        items={[
          { value: 'grid', label: 'Grid', icon: LayoutGrid },
          { value: 'list', label: 'List', icon: List },
          { value: 'feed', label: 'Feed', icon: Bell },
        ]}
      />
      <SegmentedTabs
        defaultValue="week"
        items={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
          { value: 'year', label: 'Year' },
        ]}
      />
    </View>
  );
}

function SlideSheetDemo() {
  const [open, setOpen] = useState(false);
  return (
    <View className="w-full items-center">
      <GradientButton title="Open sheet" leftIcon={Sparkles} onPress={() => setOpen(true)} />
      <SlideSheet visible={open} onClose={() => setOpen(false)} title="Share this component">
        <View className="gap-4 pt-1">
          <Text className="text-sm text-muted-foreground">
            Drag down or tap the backdrop to dismiss. The sheet springs up and snaps to its content
            height.
          </Text>
          <View className="flex-row gap-2">
            <GradientButton title="Copy link" className="flex-1" onPress={() => setOpen(false)} />
            <GradientButton
              title="Cancel"
              variant="outline"
              className="flex-1"
              onPress={() => setOpen(false)}
            />
          </View>
        </View>
      </SlideSheet>
    </View>
  );
}

function RemovablePillDemo() {
  const [tags, setTags] = useState(['Design', 'Expo', 'Reanimated', 'NativeWind']);
  return (
    <View className="w-full flex-row flex-wrap justify-center gap-2">
      {tags.map((t) => (
        <PillBadge
          key={t}
          label={t}
          variant="info"
          removable
          onRemove={() => setTags((prev) => prev.filter((x) => x !== t))}
        />
      ))}
      {tags.length === 0 ? <Text className="text-sm text-muted-foreground">All cleared.</Text> : null}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Registry                                                                    */
/* -------------------------------------------------------------------------- */

export const registry: DocEntry[] = [
  {
    slug: 'gradient-button',
    name: 'Gradient Button',
    category: 'Premium',
    description:
      'A pill action with a saturated gradient sweep and a colored glow that intensifies on press. Five variants, three sizes, icons, and an inline loading state.',
    examples: [
      {
        title: 'Variants',
        element: (
          <View className="flex-row flex-wrap items-center justify-center gap-2">
            <GradientButton title="Gradient" variant="gradient" />
            <GradientButton title="Solid" variant="solid" />
            <GradientButton title="Outline" variant="outline" />
            <GradientButton title="Ghost" variant="ghost" />
          </View>
        ),
        code: `<GradientButton title="Gradient" variant="gradient" />
<GradientButton title="Solid" variant="solid" />
<GradientButton title="Outline" variant="outline" />
<GradientButton title="Ghost" variant="ghost" />`,
      },
      {
        title: 'Gradients, icons & state',
        element: (
          <View className="flex-row flex-wrap items-center justify-center gap-2">
            <GradientButton title="Create" leftIcon={Sparkles} gradient="accent" />
            <GradientButton title="Next" rightIcon={ArrowRight} />
            <GradientButton title="Saving" loading />
            <GradientButton title="Disabled" disabled />
          </View>
        ),
        code: `<GradientButton title="Create" leftIcon={Sparkles} gradient="accent" />
<GradientButton title="Next" rightIcon={ArrowRight} />
<GradientButton title="Saving" loading />
<GradientButton title="Disabled" disabled />`,
      },
      {
        title: 'Sizes',
        element: (
          <View className="flex-row flex-wrap items-center justify-center gap-2">
            <GradientButton title="Small" size="sm" />
            <GradientButton title="Medium" size="md" />
            <GradientButton title="Large" size="lg" />
          </View>
        ),
        code: `<GradientButton title="Small" size="sm" />
<GradientButton title="Medium" size="md" />
<GradientButton title="Large" size="lg" />`,
      },
    ],
  },
  {
    slug: 'glass-card',
    name: 'Glass Card',
    category: 'Premium',
    description:
      'A frosted surface built on a real blur, plus a soft neumorphic alternate. Optional header and footer slots.',
    examples: [
      {
        title: 'Glass',
        element: (
          <View className="w-full overflow-hidden rounded-3xl">
            <LinearGradient
              colors={['#7c3aed', '#ec4899', '#f59e0b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 20 }}>
              <GlassCard
                title="Frosted glass"
                subtitle="Blurs whatever sits behind it"
                footer={<PillBadge label="expo-blur" variant="info" size="sm" />}>
                <Text className="text-sm text-foreground">
                  A translucent tint keeps text legible over any busy background.
                </Text>
              </GlassCard>
            </LinearGradient>
          </View>
        ),
        code: `<GlassCard
  title="Frosted glass"
  subtitle="Blurs whatever sits behind it"
  footer={<PillBadge label="expo-blur" variant="info" size="sm" />}>
  <Text>Legible over any busy background.</Text>
</GlassCard>`,
      },
      {
        title: 'Neumorphic',
        element: (
          <GlassCard variant="neumorphic" title="Neumorphic" subtitle="Extruded from the surface" className="w-full">
            <Text className="text-sm text-muted-foreground">
              Paired light and dark shadows make it feel pressed out of the background.
            </Text>
          </GlassCard>
        ),
        code: `<GlassCard variant="neumorphic" title="Neumorphic" subtitle="Extruded from the surface">
  <Text>Paired light and dark shadows.</Text>
</GlassCard>`,
      },
    ],
  },
  {
    slug: 'floating-label-input',
    name: 'Floating Label Input',
    category: 'Premium',
    description:
      'A text field whose label rises from the placeholder position on focus, with a left icon, password toggle, focus ring, and validation states. Forwards a ref for imperative focus.',
    examples: [
      {
        element: <FloatingLabelInputDemo />,
        code: `const passwordRef = useRef<FloatingLabelInputHandle>(null);

<FloatingLabelInput
  label="Email"
  leftIcon={Mail}
  value={email}
  onChangeText={setEmail}
  valid={isEmail}
  onSubmitEditing={() => passwordRef.current?.focus()}
/>
<FloatingLabelInput ref={passwordRef} label="Password" leftIcon={Lock} secureTextEntry />`,
      },
    ],
  },
  {
    slug: 'morph-toggle',
    name: 'Morph Toggle',
    category: 'Premium',
    description:
      'A custom switch with a spring-driven thumb that overshoots and settles, an optional thumb icon, and an inline label.',
    examples: [
      {
        element: <MorphToggleDemo />,
        code: `const [dark, setDark] = useState(false);

<MorphToggle value={dark} onValueChange={setDark} icon={Moon} label="Dark mode" />`,
      },
    ],
  },
  {
    slug: 'status-avatar',
    name: 'Status Avatar',
    category: 'Premium',
    description:
      'An avatar with graceful initials fallback, a presence dot, and a stacked group with +N overflow.',
    examples: [
      {
        title: 'Presence',
        element: (
          <View className="flex-row items-center justify-center gap-4">
            <StatusAvatar source="https://i.pravatar.cc/150?img=12" name="Ada Lovelace" status="online" />
            <StatusAvatar name="Grace Hopper" status="away" />
            <StatusAvatar name="Alan Turing" status="offline" size="lg" />
          </View>
        ),
        code: `<StatusAvatar source="https://…/ada.jpg" name="Ada Lovelace" status="online" />
<StatusAvatar name="Grace Hopper" status="away" />
<StatusAvatar name="Alan Turing" status="offline" size="lg" />`,
      },
      {
        title: 'Stacked group',
        element: (
          <StatusAvatarGroup max={4}>
            <StatusAvatar source="https://i.pravatar.cc/150?img=1" name="A" />
            <StatusAvatar source="https://i.pravatar.cc/150?img=2" name="B" />
            <StatusAvatar source="https://i.pravatar.cc/150?img=3" name="C" />
            <StatusAvatar name="Dana Scully" />
            <StatusAvatar name="Fox Mulder" />
            <StatusAvatar name="Walter Skinner" />
          </StatusAvatarGroup>
        ),
        code: `<StatusAvatarGroup max={4}>
  <StatusAvatar source="…" name="A" />
  <StatusAvatar source="…" name="B" />
  {/* …more; the rest collapse into +N */}
</StatusAvatarGroup>`,
      },
    ],
  },
  {
    slug: 'pill-badge',
    name: 'Pill Badge',
    category: 'Premium',
    description:
      'Semantic pills, a removable chip mode with an inline close button, and a compact numeric counter for notifications.',
    examples: [
      {
        title: 'Variants & counters',
        element: (
          <View className="w-full items-center gap-3">
            <View className="flex-row flex-wrap justify-center gap-2">
              <PillBadge label="Neutral" variant="neutral" />
              <PillBadge label="Success" variant="success" />
              <PillBadge label="Warning" variant="warning" />
              <PillBadge label="Danger" variant="danger" />
              <PillBadge label="Info" variant="info" />
            </View>
            <View className="flex-row items-center gap-3">
              <PillBadge count={3} />
              <PillBadge count={128} variant="info" />
              <PillBadge count={5} variant="success" />
            </View>
          </View>
        ),
        code: `<PillBadge label="Success" variant="success" />
<PillBadge count={3} />          // notification counter
<PillBadge count={128} variant="info" />  // renders "99+"`,
      },
      {
        title: 'Removable chips',
        element: <RemovablePillDemo />,
        code: `<PillBadge label="Design" variant="info" removable onRemove={remove} />`,
      },
    ],
  },
  {
    slug: 'progress-indicator',
    name: 'Progress Indicator',
    category: 'Premium',
    description:
      'Three progress styles in one component — an animated linear bar, an SVG circular ring, and a shimmering skeleton. Values animate on change.',
    examples: [
      {
        element: <ProgressIndicatorDemo />,
        code: `<ProgressIndicator variant="linear" value={value} />
<ProgressIndicator variant="circular" value={value} showValue />
<ProgressIndicator variant="skeleton" className="h-4 w-2/3" />`,
      },
    ],
  },
  {
    slug: 'segmented-tabs',
    name: 'Segmented Tabs',
    category: 'Premium',
    description:
      'A segmented control whose single indicator physically slides between 2–5 segments. Accessible as a tab list.',
    examples: [
      {
        element: <SegmentedTabsDemo />,
        code: `const [view, setView] = useState('grid');

<SegmentedTabs
  value={view}
  onValueChange={setView}
  items={[
    { value: 'grid', label: 'Grid', icon: LayoutGrid },
    { value: 'list', label: 'List', icon: List },
    { value: 'feed', label: 'Feed', icon: Bell },
  ]}
/>`,
      },
    ],
  },
  {
    slug: 'slide-sheet',
    name: 'Slide Sheet',
    category: 'Premium',
    description:
      'A bottom-sheet modal that snaps to content height, fades in a backdrop, and dismisses on backdrop tap or a downward drag.',
    examples: [
      {
        element: <SlideSheetDemo />,
        code: `const [open, setOpen] = useState(false);

<GradientButton title="Open sheet" onPress={() => setOpen(true)} />
<SlideSheet visible={open} onClose={() => setOpen(false)} title="Share">
  {/* sheet content */}
</SlideSheet>`,
      },
    ],
  },
  {
    slug: 'button',
    name: 'Button',
    category: 'Primitives',
    description: 'A pressable action with variants, sizes, icons, and a spring press animation.',
    examples: [
      {
        title: 'Variants',
        element: (
          <View className="flex-row flex-wrap justify-center gap-2">
            <Button label="Filled" variant="filled" />
            <Button label="Tonal" variant="tonal" />
            <Button label="Outline" variant="outline" />
            <Button label="Ghost" variant="ghost" />
            <Button label="Destructive" variant="destructive" />
          </View>
        ),
        code: `<Button label="Filled" variant="filled" />
<Button label="Tonal" variant="tonal" />
<Button label="Outline" variant="outline" />
<Button label="Ghost" variant="ghost" />
<Button label="Destructive" variant="destructive" />`,
      },
      {
        title: 'Sizes',
        element: (
          <View className="flex-row flex-wrap items-center justify-center gap-2">
            <Button label="Small" size="sm" />
            <Button label="Medium" size="md" />
            <Button label="Large" size="lg" />
          </View>
        ),
        code: `<Button label="Small" size="sm" />
<Button label="Medium" size="md" />
<Button label="Large" size="lg" />`,
      },
      {
        title: 'Icons & state',
        element: (
          <View className="flex-row flex-wrap justify-center gap-2">
            <Button label="Add" leftIcon="plus" variant="tonal" />
            <Button label="Next" rightIcon="arrow.right" />
            <Button label="Loading" loading />
            <Button label="Disabled" disabled />
          </View>
        ),
        code: `<Button label="Add" leftIcon="plus" variant="tonal" />
<Button label="Next" rightIcon="arrow.right" />
<Button label="Loading" loading />
<Button label="Disabled" disabled />`,
      },
    ],
  },
  {
    slug: 'badge',
    name: 'Badge',
    category: 'Primitives',
    description: 'A compact label for statuses, counts, and categories.',
    examples: [
      {
        title: 'Variants',
        element: (
          <View className="flex-row flex-wrap justify-center gap-2">
            <Badge label="Default" />
            <Badge label="Secondary" variant="secondary" />
            <Badge label="Outline" variant="outline" />
            <Badge label="Destructive" variant="destructive" />
            <Badge label="Success" variant="success" />
            <Badge label="Warning" variant="warning" />
          </View>
        ),
        code: `<Badge label="Default" />
<Badge label="Secondary" variant="secondary" />
<Badge label="Outline" variant="outline" />
<Badge label="Destructive" variant="destructive" />
<Badge label="Success" variant="success" />
<Badge label="Warning" variant="warning" />`,
      },
    ],
  },
  {
    slug: 'text',
    name: 'Text',
    category: 'Primitives',
    description: 'Typographic scale from display headings to captions and inline code.',
    examples: [
      {
        element: (
          <View className="w-full gap-2">
            <Text variant="h1">Heading 1</Text>
            <Text variant="h3">Heading 3</Text>
            <Text variant="lead">A lead paragraph that introduces a section.</Text>
            <Text variant="body">Body text for regular reading.</Text>
            <Text variant="muted">Muted secondary text.</Text>
            <Text variant="caption">Caption label</Text>
          </View>
        ),
        code: `<Text variant="h1">Heading 1</Text>
<Text variant="h3">Heading 3</Text>
<Text variant="lead">A lead paragraph…</Text>
<Text variant="body">Body text for regular reading.</Text>
<Text variant="muted">Muted secondary text.</Text>
<Text variant="caption">Caption label</Text>`,
      },
    ],
  },
  {
    slug: 'avatar',
    name: 'Avatar',
    category: 'Primitives',
    description: 'A user image with graceful initials fallback, in four sizes.',
    examples: [
      {
        element: (
          <View className="flex-row items-center justify-center gap-3">
            <Avatar source="https://i.pravatar.cc/150?img=12" size="sm" />
            <Avatar source="https://i.pravatar.cc/150?img=5" size="md" />
            <Avatar fallback="AL" size="lg" />
            <Avatar fallback="BNA" size="xl" />
          </View>
        ),
        code: `<Avatar source="https://…/avatar.jpg" size="md" />
<Avatar fallback="AL" size="lg" />`,
      },
    ],
  },
  {
    slug: 'separator',
    name: 'Separator',
    category: 'Primitives',
    description: 'A thin rule to divide content, horizontally or vertically.',
    examples: [
      {
        element: (
          <View className="w-full gap-3">
            <Text variant="muted">Above</Text>
            <Separator />
            <Text variant="muted">Below</Text>
          </View>
        ),
        code: `<Text>Above</Text>
<Separator />
<Text>Below</Text>`,
      },
    ],
  },
  {
    slug: 'card',
    name: 'Card',
    category: 'Layout',
    description: 'A themable surface composed of header, content, and footer parts.',
    examples: [
      {
        element: (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Upgrade to Pro</CardTitle>
              <CardDescription>Unlock every component and future updates.</CardDescription>
            </CardHeader>
            <CardContent>
              <Text variant="small">Compose headers, content, and footers as building blocks.</Text>
            </CardContent>
            <CardFooter>
              <Button label="Upgrade" size="sm" className="flex-1" />
              <Button label="Later" size="sm" variant="ghost" />
            </CardFooter>
          </Card>
        ),
        code: `<Card>
  <CardHeader>
    <CardTitle>Upgrade to Pro</CardTitle>
    <CardDescription>Unlock every component.</CardDescription>
  </CardHeader>
  <CardContent>…</CardContent>
  <CardFooter>
    <Button label="Upgrade" size="sm" />
  </CardFooter>
</Card>`,
      },
      {
        element: (
          <View className="w-full gap-3">
            <Card onPress={() => {}} variant="elevated" className="w-full">
              <CardTitle>Elevated</CardTitle>
              <CardDescription>Any onPress makes the whole surface an interactive button.</CardDescription>
            </Card>
            <Card onPress={() => {}} variant="outline" className="w-full">
              <CardTitle>Outline</CardTitle>
              <CardDescription>A bordered pressable surface.</CardDescription>
            </Card>
            <Card onPress={() => {}} variant="filled" className="w-full">
              <CardTitle>Filled</CardTitle>
              <CardDescription>A tonal surface that presses in.</CardDescription>
            </Card>
          </View>
        ),
        code: `// Any onPress makes the whole card an interactive surface.
<Card onPress={handlePress} variant="elevated">
  <CardTitle>Elevated</CardTitle>
  <CardDescription>Floats toward you on press.</CardDescription>
</Card>

<Card onPress={handlePress} variant="outline">…</Card>
<Card onPress={handlePress} variant="filled">…</Card>`,
      },
    ],
  },
  {
    slug: 'accordion',
    name: 'Accordion',
    category: 'Layout',
    description:
      'Ionic-style collapsible sections with compact & inset layouts, a growing accent bar, and springy Reanimated motion.',
    examples: [
      {
        element: (
          <Accordion type="single" defaultValue="a" className="w-full">
            <AccordionItem value="a">
              <AccordionTrigger>Is it animated?</AccordionTrigger>
              <AccordionContent>
                <Text variant="muted">Yes — height, chevron, and content slide animate with Reanimated.</Text>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="b">
              <AccordionTrigger>Single or multiple?</AccordionTrigger>
              <AccordionContent>
                <Text variant="muted">Both — set type=&quot;single&quot; or multiple.</Text>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ),
        code: `<Accordion type="single" defaultValue="a">
  <AccordionItem value="a">
    <AccordionTrigger>Is it animated?</AccordionTrigger>
    <AccordionContent>Yes.</AccordionContent>
  </AccordionItem>
</Accordion>`,
      },
      {
        element: (
          <Accordion type="multiple" defaultValue={['a']} className="w-full">
            <AccordionItem value="a">
              <AccordionTrigger>Multiple open</AccordionTrigger>
              <AccordionContent>
                <Text variant="muted">Pass type=&quot;multiple&quot; to keep several sections expanded at once.</Text>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="b">
              <AccordionTrigger>Springy motion</AccordionTrigger>
              <AccordionContent>
                <Text variant="muted">Height, chevron, and content slide animate with Reanimated.</Text>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="c">
              <AccordionTrigger disabled>Disabled row</AccordionTrigger>
              <AccordionContent>
                <Text variant="muted">This row can&apos;t be toggled.</Text>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ),
        code: `<Accordion type="multiple" defaultValue={['a']}>
  <AccordionItem value="a">
    <AccordionTrigger>Multiple open</AccordionTrigger>
    <AccordionContent>Keep several sections expanded.</AccordionContent>
  </AccordionItem>
  <AccordionItem value="b">
    <AccordionTrigger disabled>Disabled</AccordionTrigger>
    <AccordionContent>Can't be toggled.</AccordionContent>
  </AccordionItem>
</Accordion>`,
      },
    ],
  },
  {
    slug: 'tabs',
    name: 'Tabs',
    category: 'Layout',
    description: 'Segmented navigation with a fade-in transition between panels.',
    examples: [
      {
        element: (
          <Tabs defaultValue="account" className="w-full">
            <TabsList>
              <TabsTrigger value="account" label="Account" />
              <TabsTrigger value="password" label="Password" />
            </TabsList>
            <TabsContent value="account">
              <Text variant="muted">Manage your account details here.</Text>
            </TabsContent>
            <TabsContent value="password">
              <Text variant="muted">Change your password here.</Text>
            </TabsContent>
          </Tabs>
        ),
        code: `<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account" label="Account" />
    <TabsTrigger value="password" label="Password" />
  </TabsList>
  <TabsContent value="account">…</TabsContent>
  <TabsContent value="password">…</TabsContent>
</Tabs>`,
      },
    ],
  },
  {
    slug: 'text-field',
    name: 'Text Field',
    category: 'Forms',
    description:
      'A labeled input with surface variants, three sizes, a clearable mode, and helper/error states.',
    examples: [
      {
        title: 'Validation',
        element: <TextFieldDemo />,
        code: `const isEmail = /.+@.+\\..+/.test(email);

<TextField label="Name" placeholder="Ada Lovelace" />
<TextField
  label="Email"
  value={email}
  onChangeText={setEmail}
  helperText={isEmail ? 'Looks good.' : "We'll never share it."}
  error={touched && !isEmail ? 'Enter a valid email' : undefined}
/>`,
      },
      {
        title: 'Variants',
        element: <TextFieldFillDemo />,
        code: `<TextField label="Outline" variant="outline" />
<TextField label="Filled" variant="filled" />
<TextField label="Ghost" variant="ghost" />`,
      },
      {
        title: 'Sizes',
        element: <TextFieldSizeDemo />,
        code: `<TextField label="Small" size="sm" />
<TextField label="Medium" size="md" />
<TextField label="Large" size="lg" />`,
      },
      {
        title: 'Clearable',
        element: <TextFieldClearDemo />,
        code: `<TextField label="Search" clearable defaultValue="Hello" />
<TextField label="Bio" maxLength={80} />`,
      },
    ],
  },
  {
    slug: 'switch',
    name: 'Switch',
    category: 'Forms',
    description: 'An animated on/off toggle with a spring thumb.',
    examples: [
      {
        element: <SwitchDemo />,
        code: `const [on, setOn] = useState(true);

<Switch value={on} onValueChange={setOn} />`,
      },
    ],
  },
  {
    slug: 'checkbox',
    name: 'Checkbox',
    category: 'Forms',
    description: 'A checkbox with an animated fill and check-in.',
    examples: [
      {
        element: <CheckboxDemo />,
        code: `const [checked, setChecked] = useState(false);

<Checkbox value={checked} onValueChange={setChecked} label="Email me" />`,
      },
    ],
  },
  {
    slug: 'radio',
    name: 'Radio Group',
    category: 'Forms',
    description: 'A single-choice group with an animated selection dot.',
    examples: [
      {
        element: <RadioDemo />,
        code: `const [value, setValue] = useState('monthly');

<RadioGroup value={value} onValueChange={setValue}>
  <Radio value="monthly" label="Monthly" />
  <Radio value="yearly" label="Yearly" />
</RadioGroup>`,
      },
    ],
  },
  {
    slug: 'toggle',
    name: 'Toggle',
    category: 'Forms',
    description: 'A two-state button, on its own or in a toolbar.',
    examples: [
      {
        element: <ToggleDemo />,
        code: `const [bold, setBold] = useState(false);

<Toggle pressed={bold} onPressedChange={setBold} icon="bold" variant="outline" />`,
      },
    ],
  },
  {
    slug: 'alert',
    name: 'Alert',
    category: 'Feedback',
    description: 'A callout for information, success, warnings, and errors.',
    examples: [
      {
        element: (
          <View className="w-full gap-3">
            <Alert title="Heads up" description="This is an informational message." />
            <Alert variant="success" title="Saved" description="Your changes were saved." />
            <Alert variant="warning" title="Careful" description="This action needs review." />
            <Alert variant="destructive" title="Error" description="Something went wrong." />
          </View>
        ),
        code: `<Alert title="Heads up" description="…" />
<Alert variant="success" title="Saved" description="…" />
<Alert variant="warning" title="Careful" description="…" />
<Alert variant="destructive" title="Error" description="…" />`,
      },
    ],
  },
  {
    slug: 'progress',
    name: 'Progress',
    category: 'Feedback',
    description: 'An animated horizontal progress bar.',
    examples: [
      {
        element: <ProgressDemo />,
        code: `const [value, setValue] = useState(60);

<Progress value={value} />`,
      },
    ],
  },
  {
    slug: 'skeleton',
    name: 'Skeleton',
    category: 'Feedback',
    description: 'A pulsing placeholder for content that is still loading.',
    examples: [
      {
        element: (
          <View className="w-full flex-row items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <View className="flex-1 gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </View>
          </View>
        ),
        code: `<Skeleton className="h-12 w-12 rounded-full" />
<Skeleton className="h-4 w-2/3" />
<Skeleton className="h-4 w-1/2" />`,
      },
    ],
  },
  {
    slug: 'spinner',
    name: 'Spinner',
    category: 'Feedback',
    description: 'A themed activity indicator in two sizes.',
    examples: [
      {
        element: (
          <View className="flex-row items-center justify-center gap-6">
            <Spinner size="small" />
            <Spinner size="large" />
          </View>
        ),
        code: `<Spinner size="small" />
<Spinner size="large" />`,
      },
    ],
  },
];

export const categories = ['Premium', 'Primitives', 'Forms', 'Layout', 'Feedback'] as const;
