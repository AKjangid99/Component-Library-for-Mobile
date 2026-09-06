import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Heart,
  Info,
  LayoutGrid,
  List,
  Lock,
  Mail,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  User,
  UserPlus,
  Zap,
} from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  DateTimePickerField,  Dialog,
  DialogFooter,
  DialogHeader,
  FormRow,
  GlassCard,
  ImageUploader,
  Input,
  Progress,
  Radio,
  RadioGroup,
  // Separator,
  Skeleton,
  SlideSheet,
  Spinner,
  StatusAvatar,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsSegmented,
  TabsTrigger,
  Text,
  Toggle,
  StarRating,
  useToast,
} from '@/ui';
import { useCustomization } from '@/ui/lib/customization';

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
  const [underline, setUnderline] = useState(false);
  return (
    <View className="w-full gap-4">
      {/* Toolbar: icons carry labels so it never reads empty, even where
          SF symbols don't render (e.g. web). */}
      <View className="flex-row justify-center gap-2">
        <Toggle pressed={bold} onPressedChange={setBold} icon="bold" label="Bold" variant="outline" />
        <Toggle pressed={italic} onPressedChange={setItalic} icon="italic" label="Italic" variant="outline" />
        <Toggle
          pressed={underline}
          onPressedChange={setUnderline}
          icon="underline"
          label="Under"
          variant="outline"
        />
      </View>
      {/* Live preview driven by the toolbar above. */}
      <View className="rounded-xl border border-border bg-card px-4 py-3">
        <Text
          className="text-center text-[15px] text-foreground"
          style={{
            fontWeight: bold ? '700' : '400',
            fontStyle: italic ? 'italic' : 'normal',
            textDecorationLine: underline ? 'underline' : 'none',
          }}>
          The quick brown fox jumps over the lazy dog
        </Text>
        <Text className="mt-1 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {bold || italic || underline ? 'styled live' : 'toggle a style above'}
        </Text>
      </View>
    </View>
  );
}

function ToggleVariantsDemo() {
  const { resolvedAccent } = useCustomization();
  const [pill, setPill] = useState(true);
  const [large, setLarge] = useState(false);
  return (
    <View className="w-full items-center gap-3">
      <View className="flex-row flex-wrap items-center justify-center gap-2">
        <Toggle pressed={pill} onPressedChange={setPill} label="Pill" shape="pill" variant="outline" />
        <Toggle pressed={large} onPressedChange={setLarge} label="Large" size="lg" variant="outline" />
        <Toggle pressed={false} onPressedChange={() => { }} label="Small" size="sm" />
      </View>
      <View className="flex-row flex-wrap items-center justify-center gap-2">
        <Toggle pressed label="Your accent" shape="pill" color={resolvedAccent} />
        <Toggle pressed={false} onPressedChange={() => { }} label="Ghost" color={resolvedAccent} />
      </View>
      <Text className="text-center text-xs text-muted-foreground">
        Shapes, sizes, and any `color` — this row follows your gallery accent live.
      </Text>
    </View>
  );
}

function InputDemo() {
  const [email, setEmail] = useState('');
  const touched = email.length > 0;
  const isEmail = /.+@.+\..+/.test(email);
  const error = touched && !isEmail ? 'Enter a valid email' : undefined;
  return (
    <View className="w-full gap-4">
      <Input label="Full name" placeholder="Ada Lovelace" leftIcon={User} />
      <Input
        label="Email"
        placeholder="you@example.com"
        leftIcon={Mail}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        valid={isEmail}
        helperText={isEmail ? 'Looks good.' : "We'll never share it."}
        error={error}
      />
      <Input label="Password" placeholder="••••••••" leftIcon={Lock} secureTextEntry />
    </View>
  );
}

function InputLabelStyleDemo() {
  return (
    <View className="w-full gap-4">
      <Input labelStyle="stacked" label="Stacked label" placeholder="Label sits above" leftIcon={User} />
      <Input labelStyle="floating" label="Floating label" leftIcon={Mail} />
      <Input labelStyle="floating" label="Prefilled floats up" defaultValue="hello@lib.dev" leftIcon={Mail} />
    </View>
  );
}

function InputVariantDemo() {
  return (
    <View className="w-full gap-4">
      <Input variant="outline" label="Outline" placeholder="Bordered surface" />
      <Input variant="filled" label="Filled" placeholder="Muted surface" />
      <Input variant="ghost" label="Ghost" placeholder="No chrome" />
      <Input variant="underline" label="Underline" placeholder="Single baseline" />
    </View>
  );
}

function InputSizeDemo() {
  return (
    <View className="w-full gap-4">
      <Input label="Small" placeholder="sm" size="sm" leftIcon={Search} />
      <Input label="Medium" placeholder="md" size="md" leftIcon={Search} />
      <Input label="Large" placeholder="lg" size="lg" leftIcon={Search} />
    </View>
  );
}

function InputStateDemo() {
  const [bio, setBio] = useState('Design engineer.');
  return (
    <View className="w-full gap-4">
      <Input label="Search" placeholder="Type, then clear" leftIcon={Search} clearable defaultValue="Reanimated" />
      <Input
        label="Bio"
        placeholder="A short line about you"
        value={bio}
        onChangeText={setBio}
        maxLength={80}
        showCount
      />
      <Input label="Verified" defaultValue="ada@lib.dev" valid helperText="Address confirmed" />
      <Input label="Locked" defaultValue="Read only" editable={false} />
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

/* --- Components set demos ---------------------------------------------------- */

function ProgressStylesDemo() {
  const [value, setValue] = useState(64);
  return (
    <View className="w-full gap-5">
      <Progress variant="gradient" value={value} />
      <View className="flex-row items-center justify-center gap-8">
        <Progress variant="circular" value={value} showValue />
        <Progress variant="circular" value={value} gradient="accent" diameter={64} />
      </View>
      <View className="gap-2">
        <Progress variant="skeleton" className="w-2/3" />
        <Progress variant="skeleton" className="w-1/2" />
      </View>
      <View className="flex-row justify-center gap-2">
        <Button label="-15" size="sm" variant="tonal" onPress={() => setValue((v) => Math.max(0, v - 15))} />
        <Button label="+15" size="sm" variant="tonal" onPress={() => setValue((v) => Math.min(100, v + 15))} />
      </View>
    </View>
  );
}

function TabsSegmentedDemo() {
  const [view, setView] = useState('grid');
  return (
    <View className="w-full gap-4">
      <TabsSegmented
        value={view}
        onValueChange={setView}
        items={[
          { value: 'grid', label: 'Grid', icon: LayoutGrid },
          { value: 'list', label: 'List', icon: List },
          { value: 'feed', label: 'Feed', icon: Bell },
        ]}
      />
      <TabsSegmented
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
      <Button label="Open sheet" rightIcon="arrow.up" variant="gradient" onPress={() => setOpen(true)} />
      <SlideSheet visible={open} onClose={() => setOpen(false)} title="Share this component">
        <View className="gap-4 pt-1">
          <Text className="text-sm text-muted-foreground">
            Drag down or tap the backdrop to dismiss. The sheet springs up and snaps to its content
            height.
          </Text>
          <View className="flex-row gap-2">
            <Button label="Copy link" className="flex-1" onPress={() => setOpen(false)} />
            <Button label="Cancel" variant="outline" className="flex-1" onPress={() => setOpen(false)} />
          </View>
        </View>
      </SlideSheet>
    </View>
  );
}

function SimpleDialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <View className="w-full items-center">
      <Button label="Show dialog" variant="tonal" onPress={() => setOpen(true)} />
      <Dialog visible={open} onClose={() => setOpen(false)}>
        <DialogHeader
          icon={Info}
          title="Heads up"
          description="This is a simple dialog — a title, a message, and one button. Tap the backdrop or the button to dismiss."
        />
        <DialogFooter>
          <Button label="Got it" className="flex-1" onPress={() => setOpen(false)} />
        </DialogFooter>
      </Dialog>
    </View>
  );
}

function ActionDialogDemo() {
  const [open, setOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  return (
    <View className="w-full items-center gap-3">
      {deleted ? (
        <Badge label="Project deleted" variant="destructive" icon="trash" />
      ) : (
        <Badge label="Project active" variant="success" dot />
      )}
      <Button
        label={deleted ? 'Restore project' : 'Delete project'}
        variant={deleted ? 'tonal' : 'destructive'}
        onPress={() => (deleted ? setDeleted(false) : setOpen(true))}
      />
      <Dialog visible={open} onClose={() => setOpen(false)}>
        <DialogHeader
          icon={Trash2}
          iconColor="#e5484d"
          title="Delete project?"
          description="This permanently removes the project and its files. This action can't be undone."
        />
        <DialogFooter>
          <Button label="Cancel" variant="outline" className="flex-1" onPress={() => setOpen(false)} />
          <Button
            label="Delete"
            variant="destructive"
            className="flex-1"
            onPress={() => {
              setDeleted(true);
              setOpen(false);
            }}
          />
        </DialogFooter>
      </Dialog>
    </View>
  );
}

function FormDialogDemo() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [saved, setSaved] = useState<string | null>(null);
  const touched = name.length > 0;
  const canSave = name.trim().length >= 2;
  return (
    <View className="w-full items-center gap-3">
      {saved ? <Badge label={`Invited ${saved}`} variant="success" icon="checkmark" /> : null}
      <Button label="Invite member" rightIcon="plus" onPress={() => setOpen(true)} />
      <Dialog visible={open} onClose={() => setOpen(false)}>
        <DialogHeader
          icon={UserPlus}
          title="Invite member"
          description="They'll get an email with a link to join your workspace."
        />
        <View className="gap-3">
          <Input
            label="Full name"
            placeholder="Ada Lovelace"
            leftIcon={User}
            value={name}
            onChangeText={setName}
            error={touched && !canSave ? 'Enter at least 2 characters' : undefined}
          />
          <Input
            label="Email"
            placeholder="you@example.com"
            leftIcon={Mail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <DialogFooter>
          <Button label="Cancel" variant="ghost" className="flex-1" onPress={() => setOpen(false)} />
          <Button
            label="Send invite"
            className="flex-1"
            disabled={!canSave}
            onPress={() => {
              setSaved(name.trim());
              setName('');
              setOpen(false);
            }}
          />
        </DialogFooter>
      </Dialog>
    </View>
  );
}

function RemovableBadgeDemo() {
  const [tags, setTags] = useState(['Design', 'Expo', 'Reanimated', 'NativeWind']);
  return (
    <View className="w-full flex-row flex-wrap justify-center gap-2">
      {tags.map((t) => (
        <Badge
          key={t}
          label={t}
          removable
          onRemove={() => setTags((prev) => prev.filter((x) => x !== t))}
        />
      ))}
      {tags.length === 0 ? <Text className="text-sm text-muted-foreground">All cleared.</Text> : null}
    </View>
  );
}

/* --- Accent-customization demos (follow the gallery Customize panel) -------- */

function AccentButtonDemo() {
  const { resolvedAccent } = useCustomization();
  return (
    <View className="flex-row flex-wrap items-center justify-center gap-2">
      <Button label="Accent filled" color={resolvedAccent} />
      <Button label="Accent outline" variant="outline" color={resolvedAccent} />
      <Button label="Custom text" color={resolvedAccent} textColor="#fff" />
    </View>
  );
}

function AccentBadgeDemo() {
  const { resolvedAccent } = useCustomization();
  return (
    <View className="flex-row flex-wrap items-center justify-center gap-2">
      <Badge label="Your accent" color={resolvedAccent} />
      <Badge label="Outlined" variant="outline" color={resolvedAccent} />
      <Badge label="99+" color={resolvedAccent} />
    </View>
  );
}

function AccentSwitchDemo() {
  const { resolvedAccent } = useCustomization();
  const [on, setOn] = useState(true);
  return (
    <View className="w-full gap-1">
      <FormRow label="Themed notifications">
        <Switch value={on} onValueChange={setOn} color={resolvedAccent} />
      </FormRow>
      <FormRow label="Small — size=`sm`">
        <Switch value={on} onValueChange={setOn} color={resolvedAccent} size="sm" />
      </FormRow>
      <FormRow label="Medium — size=`md`">
        <Switch value={on} onValueChange={setOn} color={resolvedAccent} />
      </FormRow>
    </View>
  );
}

function ThemedImageUploaderDemo() {
  const { resolvedAccent } = useCustomization();
  return (
    <ImageUploader
      maxFiles={1}
      allowCamera={false}
      color={resolvedAccent}
      label="Avatar photo"
    />
  );
}

const SWITCH_VARIANTS = [
  { key: 'slide', label: 'Classic slide', hint: 'Calm timing ease' },
  { key: 'spring', label: 'Springy bounce', hint: 'Overshoots & settles' },
  { key: 'stretch', label: 'Squash & stretch', hint: 'Elongates mid-travel' },
  { key: 'flip', label: 'Flip', hint: 'Turns over as it slides' },
] as const;

function SwitchVariantsDemo() {
  const [states, setStates] = useState<Record<string, boolean>>({
    slide: true,
    spring: true,
    stretch: false,
    flip: false,
  });
  return (
    <View className="w-full gap-1">
      {SWITCH_VARIANTS.map((v) => (
        <FormRow key={v.key} label={`${v.label} — ${v.hint}`}>
          <Switch
            value={!!states[v.key]}
            onValueChange={(next) => setStates((s) => ({ ...s, [v.key]: next }))}
            variant={v.key}
          />
        </FormRow>
      ))}
    </View>
  );
}

function AccentProgressDemo() {
  const { resolvedAccent } = useCustomization();
  const [value, setValue] = useState(64);
  return (
    <View className="w-full gap-4">
      <Progress value={value} color={resolvedAccent} showValue />
      <View className="flex-row justify-center gap-2">
        <Button label="-10" size="sm" variant="tonal" onPress={() => setValue((v) => Math.max(0, v - 10))} />
        <Button label="+10" size="sm" variant="tonal" onPress={() => setValue((v) => Math.min(100, v + 10))} />
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Registry                                                                    */
/* -------------------------------------------------------------------------- */

function ToastDemo() {
  const { toast } = useToast();
  return (
    <View className="w-full flex-row flex-wrap items-center justify-center gap-2">
      <Button label="Saved" size="sm" variant="tonal" onPress={() => toast('Changes saved', { variant: 'success' })} />
      <Button label="Info" size="sm" variant="tonal" onPress={() => toast('Syncing in the background…', { variant: 'info' })} />
      <Button
        label="Delete"
        size="sm"
        variant="tonal"
        onPress={() =>
          toast('Photo deleted', {
            variant: 'error',
            action: { label: 'Undo', onPress: () => toast('Photo restored', { variant: 'success' }) },
          })
        }
      />
    </View>
  );
}

function DateTimePickerDemo() {
  const [date, setDate] = useState(new Date(2026, 5, 15));
  const [time, setTime] = useState(() => {
    const d = new Date();
    d.setHours(9, 30, 0, 0);
    return d;
  });
  const { resolvedAccent } = useCustomization();
  return (
    <View className="w-full gap-4">
      <DateTimePickerField label="Event date" value={date} onChange={setDate} />
      <DateTimePickerField
        label="Start time"
        mode="time"
        value={time}
        onChange={setTime}
        color={resolvedAccent}
        helperText="Follows your gallery accent."
      />
    </View>
  );
}

function StarRatingDemo() {
  const [rating, setRating] = useState(4);
  const [accentRating, setAccentRating] = useState(4);
  const { resolvedAccent } = useCustomization();
  return (
    <View className="w-full items-center gap-4">
      <StarRating value={rating} onChange={setRating} showValue />
      <Text className="text-sm text-muted-foreground">
        {rating === 0
          ? 'Tap a star to rate'
          : rating >= 4
            ? 'Excellent — thanks for rating!'
            : rating >= 3
              ? 'Good — thanks for rating!'
              : 'Thanks — we\u2019ll do better.'}
      </Text>
      <StarRating value={accentRating} onChange={setAccentRating} color={resolvedAccent} size={22} />
    </View>
  );
}

function StarListingDemo() {  return (
    <View className="w-full items-center gap-3">
      <StarRating value={5} readonly reviews={128} size={15} />
      <StarRating value={4} readonly showValue size={20} color="#30a46c" />
      <StarRating value={3} readonly size={32} />
    </View>
  );
}

export const registry: DocEntry[] = [
  {
    slug: 'dialog',
    name: 'Dialog',
    category: 'Components',
    description:
      'A centered modal with a fading backdrop and a springing card. Compose it from parts — header plus actions, inputs, or just text.',
    examples: [
      {
        title: 'Simple',
        description: 'Title, message, one button. Backdrop tap dismisses.',
        element: <SimpleDialogDemo />,
        code: `const [open, setOpen] = useState(false);

<Button label="Show dialog" onPress={() => setOpen(true)} />
<Dialog visible={open} onClose={() => setOpen(false)}>
  <DialogHeader icon={Info} title="Heads up" description="…" />
  <DialogFooter>
    <Button label="Got it" className="flex-1" onPress={() => setOpen(false)} />
  </DialogFooter>
</Dialog>`,
      },
      {
        title: 'Actions that do things',
        description: 'Confirm buttons run real callbacks — here Delete flips the status above.',
        element: <ActionDialogDemo />,
        code: `<Dialog visible={open} onClose={() => setOpen(false)}>
  <DialogHeader icon={Trash2} iconColor="#e5484d" title="Delete project?" />
  <DialogFooter>
    <Button label="Cancel" variant="outline" className="flex-1" onPress={close} />
    <Button label="Delete" variant="destructive" className="flex-1" onPress={remove} />
  </DialogFooter>
</Dialog>`,
      },
      {
        title: 'Form with inputs',
        description: 'Inputs with validation live inside — Save stays disabled until valid.',
        element: <FormDialogDemo />,
        code: `<Dialog visible={open} onClose={() => setOpen(false)}>
  <DialogHeader icon={UserPlus} title="Invite member" />
  <Input
    label="Full name"
    value={name}
    onChangeText={setName}
    error={touched && !canSave ? 'Enter at least 2 characters' : undefined}
  />
  <Input label="Email" keyboardType="email-address" />
  <DialogFooter>
    <Button label="Cancel" variant="ghost" className="flex-1" onPress={close} />
    <Button label="Send invite" className="flex-1" disabled={!canSave} onPress={save} />
  </DialogFooter>
</Dialog>`,
      },
    ],
  },
  {
    slug: 'slide-sheet',
    name: 'Slide Sheet',
    category: 'Components',
    description:
      'A bottom-sheet modal that snaps to content height, fades in a backdrop, and dismisses on backdrop tap or a downward drag.',
    examples: [
      {
        element: <SlideSheetDemo />,
        code: `const [open, setOpen] = useState(false);

<Button label="Open sheet" onPress={() => setOpen(true)} />
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
    description:
      'A pressable action with variants, sizes, icons, a spring press animation, optional after-click celebrations, and a `color`/`textColor` override for full customization.',
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
      {
        title: 'Celebration (tap to play)',
        description:
          'An after-click burst that fires on release — independent of onPress, and collapses to a fade under reduce-motion.',
        element: (
          <View className="flex-row flex-wrap items-center justify-center gap-3">
            <Button label="Confetti" variant="gradient" celebration="confetti" />
            <Button label="Sparkles" variant="filled" celebration="sparkles" />
            <Button label="Stars" variant="tonal" celebration="stars" />
            <Button label="Hearts" variant="outline" celebration="hearts" />
            <Button label="Rings" variant="tonal" celebration="rings" />
            <Button label="Upvote" variant="filled" celebration="popup" rightIcon="arrow.up" />
          </View>
        ),
        code: `<Button label="Confetti" variant="gradient" celebration="confetti" />
<Button label="Sparkles" variant="filled" celebration="sparkles" />
<Button label="Stars" variant="tonal" celebration="stars" />
<Button label="Hearts" variant="outline" celebration="hearts" />
<Button label="Rings" variant="tonal" celebration="rings" />
<Button label="Upvote" variant="filled" celebration="popup" rightIcon="arrow.up" />`,
      },
      {
        title: 'Custom color (try the Customize panel)',
        description:
          'Pass any hex to `color` — filled styles get white text, outline/ghost tint to match, or control text with `textColor`. This demo follows your gallery accent live.',
        element: <AccentButtonDemo />,
        code: `const { resolvedAccent } = useCustomization();

<Button label="Accent filled" color={resolvedAccent} />
<Button label="Accent outline" variant="outline" color={resolvedAccent} />
<Button label="Custom text" color={resolvedAccent} textColor="#fff" />`,
      },
    ],
  },
  {
    slug: 'badge',
    name: 'Badge',
    category: 'Primitives',
    description:
      'A compact label for statuses, counts, and categories — with a removable chip mode and a numeric counter.',
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
      {
        title: 'Counters',
        description: 'Pass `count` for a notification bubble — values over `max` (99) cap out.',
        element: (
          <View className="flex-row items-center justify-center gap-3">
            <Badge count={3} />
            <Badge count={128} />
            <Badge count={5} variant="success" />
          </View>
        ),
        code: `<Badge count={3} />          // notification counter
<Badge count={128} />        // renders "99+"
<Badge count={5} variant="success" />`,
      },
      {
        title: 'Removable chips',
        element: <RemovableBadgeDemo />,
        code: `<Badge label="Design" removable onRemove={remove} />`,
      },
      {
        title: 'Custom color (follows your accent)',
        description: 'Any hex via `color`, with `textColor` for full control.',
        element: <AccentBadgeDemo />,
        code: `const { resolvedAccent } = useCustomization();

<Badge label="Your accent" color={resolvedAccent} />
<Badge label="Outlined" variant="outline" color={resolvedAccent} />`,
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
    description:
      'A user image with graceful initials fallback, in four sizes — plus presence dots and a stacked group with +N overflow. `StatusAvatar` is a shorthand alias for the common `Avatar` + `status` combo.',
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
      {
        title: 'Presence',
        element: (
          <View className="flex-row items-center justify-center gap-4">
            <Avatar source="https://i.pravatar.cc/150?img=12" fallback="Ada Lovelace" status="online" />
            <Avatar fallback="Grace Hopper" status="away" />
            <Avatar fallback="Alan Turing" status="offline" size="lg" />
          </View>
        ),
        code: `<Avatar source="https://…/ada.jpg" fallback="Ada Lovelace" status="online" />
<Avatar fallback="Grace Hopper" status="away" />
<Avatar fallback="Alan Turing" status="offline" size="lg" />`,
      },
      {
        title: 'Stacked group',
        element: (
          <AvatarGroup max={4}>
            <Avatar source="https://i.pravatar.cc/150?img=1" fallback="A" />
            <Avatar source="https://i.pravatar.cc/150?img=2" fallback="B" />
            <Avatar source="https://i.pravatar.cc/150?img=3" fallback="C" />
            <Avatar fallback="Dana Scully" />
            <Avatar fallback="Fox Mulder" />
            <Avatar fallback="Walter Skinner" />
          </AvatarGroup>
        ),
        code: `<AvatarGroup max={4}>
  <Avatar source="…" fallback="A" />
  <Avatar source="…" fallback="B" />
  {/* …more; the rest collapse into +N */}
</AvatarGroup>`,
      },
    ],
  },
  //   {
  //     slug: 'separator',
  //     name: 'Separator',
  //     category: 'Primitives',
  //     description: 'A thin rule to divide content, horizontally or vertically.',
  //     examples: [
  //       {
  //         element: (
  //           <View className="w-full gap-3">
  //             <Text variant="muted">Above</Text>
  //             {/* <Separator /> */}
  //             <Text variant="muted">Below</Text>
  //           </View>
  //         ),
  //         code: `<Text>Above</Text>
  // <Separator />
  // <Text>Below</Text>`,
  //       },
  //     ],
  //   },
  {
    slug: 'card',
    name: 'Card',
    category: 'Layout',
    description:
      'One surface, every personality — composable header/content/footer parts, pressable variants, springy hover-lift cards, plus frosted glass and soft neumorphic finishes.',
    examples: [
      {
        title: 'Composable',
        description: 'Header, content, and footer parts you snap together.',
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
        title: 'Animated · hover to lift',
        description: 'Springs up, blooms an accent border, and casts a glow on press (and hover, on web).',
        element: (
          <View className="w-full gap-3">
            <Card animated variant="elevated" onPress={() => { }} className="w-full p-5">
              <View className="flex-row items-center gap-4">
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <Sparkles size={22} color="#208aef" strokeWidth={2.25} />
                </View>
                <View className="flex-1">
                  <CardTitle>Hover me</CardTitle>
                  <CardDescription>Lifts with a spring, glows, and blooms an accent edge.</CardDescription>
                </View>
                <View className="h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <ArrowRight size={16} color="#60646c" strokeWidth={2.5} />
                </View>
              </View>
            </Card>
            <View className="flex-row gap-3">
              <Card animated variant="filled" onPress={() => { }} className="flex-1 p-4">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <Bell size={18} color="#208aef" strokeWidth={2.25} />
                </View>
                <CardTitle className="mt-3 text-2xl font-bold">12</CardTitle>
                <CardDescription>Alerts</CardDescription>
              </Card>
              <Card animated variant="filled" onPress={() => { }} className="flex-1 p-4">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                  <LayoutGrid size={18} color="#7c3aed" strokeWidth={2.25} />
                </View>
                <CardTitle className="mt-3 text-2xl font-bold">8</CardTitle>
                <CardDescription>Widgets</CardDescription>
              </Card>
            </View>
          </View>
        ),
        code: `// \`animated\` adds a springy lift, an accent-blooming border, and a glow.
<Card animated variant="elevated" onPress={open}>
  <CardTitle>Hover me</CardTitle>
  <CardDescription>Lifts with a spring and a glow.</CardDescription>
</Card>`,
      },
      {
        title: 'Gradient spotlight',
        description: 'A bold, animated call-to-action that lifts and glows without a framing border.',
        element: (
          <Card
            animated
            borderBloom={false}
            onPress={() => { }}
            className="w-full overflow-hidden p-0">
            <LinearGradient
              colors={['#208aef', '#7c3aed', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 22 }}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2 rounded-full bg-white/20 px-3 py-1">
                  <Zap size={13} color="#ffffff" strokeWidth={2.5} />
                  <Text className="text-xs font-semibold text-white">Pro</Text>
                </View>
                <Sparkles size={20} color="#ffffff" />
              </View>
              <Text className="mt-5 text-2xl font-bold text-white">Design system, unlocked</Text>
              <Text className="mt-1.5 text-sm leading-5 text-white/85">
                Every component, motion preset, and theme — tap to explore.
              </Text>
              <View className="mt-5 flex-row items-center gap-1.5 self-start rounded-full bg-white px-4 py-2">
                <Text className="text-sm font-bold text-[#7c3aed]">Get started</Text>
                <ArrowUpRight size={16} color="#7c3aed" strokeWidth={2.5} />
              </View>
            </LinearGradient>
          </Card>
        ),
        code: `<Card animated borderBloom={false} onPress={open} className="overflow-hidden p-0">
  <LinearGradient colors={['#208aef', '#7c3aed', '#ec4899']} style={{ padding: 22 }}>
    <Text className="text-2xl font-bold text-white">Design system, unlocked</Text>
    <Text className="text-sm text-white/85">Tap to explore every component.</Text>
  </LinearGradient>
</Card>`,
      },
      {
        title: 'Profile · interactive',
        description: 'A tactile people card — the whole surface is one lifting, glowing control.',
        element: (
          <Card animated variant="elevated" onPress={() => { }} className="w-full p-5">
            <View className="flex-row items-center gap-4">
              <StatusAvatar name="Ava Reyes" status="online" size="lg" />
              <View className="flex-1">
                <CardTitle>Ava Reyes</CardTitle>
                <CardDescription>Product Designer · online</CardDescription>
              </View>
              <Badge label="Follow" size="sm" />
            </View>
            <View className="mt-4 flex-row gap-2">
              <View className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-muted py-2.5">
                <Heart size={15} color="#ec4899" strokeWidth={2.5} />
                <Text className="text-sm font-semibold text-foreground">2.4k</Text>
              </View>
              <View className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-muted py-2.5">
                <TrendingUp size={15} color="#30a46c" strokeWidth={2.5} />
                <Text className="text-sm font-semibold text-foreground">+18%</Text>
              </View>
            </View>
          </Card>
        ),
        code: `<Card animated variant="elevated" onPress={openProfile}>
  <View className="flex-row items-center gap-4">
    <StatusAvatar name="Ava Reyes" status="online" size="lg" />
    <View className="flex-1">
      <CardTitle>Ava Reyes</CardTitle>
      <CardDescription>Product Designer · online</CardDescription>
    </View>
    <Badge label="Follow" size="sm" />
  </View>
</Card>`,
      },
      {
        title: 'Pressable variants',
        description: 'Any onPress makes the whole surface an interactive button.',
        element: (
          <View className="w-full gap-3">
            <Card onPress={() => { }} variant="elevated" className="w-full">
              <CardTitle>Elevated</CardTitle>
              <CardDescription>Any onPress makes the whole surface an interactive button.</CardDescription>
            </Card>
            <Card onPress={() => { }} variant="outline" className="w-full">
              <CardTitle>Outline</CardTitle>
              <CardDescription>A bordered pressable surface.</CardDescription>
            </Card>
            <Card onPress={() => { }} variant="filled" className="w-full">
              <CardTitle>Filled</CardTitle>
              <CardDescription>A tonal surface that presses in.</CardDescription>
            </Card>
          </View>
        ),
        code: `<Card onPress={handlePress} variant="elevated">
  <CardTitle>Elevated</CardTitle>
  <CardDescription>Floats toward you on press.</CardDescription>
</Card>

<Card onPress={handlePress} variant="outline">…</Card>
<Card onPress={handlePress} variant="filled">…</Card>`,
      },
      {
        title: 'Glass',
        description: 'A frosted blur that stays legible over any busy background.',
        element: (
          <View className="w-full overflow-hidden" style={{ borderRadius: 44 }}>
            <LinearGradient
              colors={['#7c3aed', '#ec4899', '#f59e0b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 20, borderRadius: 44 }}>
              <GlassCard
                title="Frosted glass"
                subtitle="Blurs whatever sits behind it"
                footer={<Badge label="expo-blur" size="sm" />}>
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
  footer={<Badge label="expo-blur" size="sm" />}>
  <Text>Legible over any busy background.</Text>
</GlassCard>`,
      },
      {
        title: 'Neumorphic',
        description: 'A soft surface extruded from the background.',
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
    description:
      'Segmented navigation with a fade-in transition between panels — plus a sliding-indicator segmented control.',
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
      {
        title: 'Segmented control',
        description:
          'One indicator physically slides between 2–5 segments. Accessible as a tab list.',
        element: <TabsSegmentedDemo />,
        code: `const [view, setView] = useState('grid');

<TabsSegmented
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
    slug: 'input',
    name: 'Input',
    category: 'Forms',
    description:
      'A refined text input with stacked or floating labels, four surface variants, three sizes, icons, password/clear controls, a live counter, and full validation states.',
    examples: [
      {
        title: 'Overview',
        description: 'Leading icons, inline validation, and a masked password toggle.',
        element: <InputDemo />,
        code: `const isEmail = /.+@.+\\..+/.test(email);

<Input label="Full name" placeholder="Ada Lovelace" leftIcon={User} />
<Input
  label="Email"
  leftIcon={Mail}
  value={email}
  onChangeText={setEmail}
  valid={isEmail}
  error={touched && !isEmail ? 'Enter a valid email' : undefined}
/>
<Input label="Password" leftIcon={Lock} secureTextEntry />`,
      },
      {
        title: 'Label styles',
        description: 'Stacked sits above; floating animates into the border and shrinks on focus.',
        element: <InputLabelStyleDemo />,
        code: `<Input labelStyle="stacked" label="Stacked label" leftIcon={User} />
<Input labelStyle="floating" label="Floating label" leftIcon={Mail} />`,
      },
      {
        title: 'Variants',
        element: <InputVariantDemo />,
        code: `<Input variant="outline" label="Outline" />
<Input variant="filled" label="Filled" />
<Input variant="ghost" label="Ghost" />
<Input variant="underline" label="Underline" />`,
      },
      {
        title: 'Sizes',
        element: <InputSizeDemo />,
        code: `<Input label="Small" size="sm" leftIcon={Search} />
<Input label="Medium" size="md" leftIcon={Search} />
<Input label="Large" size="lg" leftIcon={Search} />`,
      },
      {
        title: 'States',
        description: 'Clearable, live counter, valid, and read-only.',
        element: <InputStateDemo />,
        code: `<Input label="Search" leftIcon={Search} clearable defaultValue="Reanimated" />
<Input label="Bio" value={bio} onChangeText={setBio} maxLength={80} showCount />
<Input label="Verified" valid helperText="Address confirmed" />
<Input label="Locked" editable={false} />`,
      },
    ],
  },
  {
    slug: 'switch',
    name: 'Switch',
    category: 'Forms',
    description:
      'An animated on/off toggle with four motion personalities, a custom on-color, and two sizes.',
    examples: [
      {
        element: <SwitchDemo />,
        code: `const [on, setOn] = useState(true);

<Switch value={on} onValueChange={setOn} />`,
      },
      {
        title: 'Variants — tap each one',
        description:
          'Slide is calm, spring overshoots and settles, stretch squashes mid-travel, and flip turns the thumb over as it slides.',
        element: <SwitchVariantsDemo />,
        code: `<Switch value={on} onValueChange={setOn} variant="slide" />
<Switch value={on} onValueChange={setOn} variant="spring" />
<Switch value={on} onValueChange={setOn} variant="stretch" />
<Switch value={on} onValueChange={setOn} variant="flip" />`,
      },
      {
        title: 'Custom color & sizes',
        description: 'Tint the on-state with any hex and pick `sm` or `md`. Follows your gallery accent live.',
        element: <AccentSwitchDemo />,
        code: `const { resolvedAccent } = useCustomization();

<Switch value={on} onValueChange={setOn} color={resolvedAccent} />
<Switch value={on} onValueChange={setOn} color={resolvedAccent} size="sm" />`,
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
    description:
      'A two-state button with a springy press and an animated fill — on its own or in a toolbar. Shapes, sizes, and a custom `color` included.',
    examples: [
      {
        title: 'Toolbar with live preview',
        description: 'Toggle styles and watch the sentence below react instantly.',
        element: <ToggleDemo />,
        code: `const [bold, setBold] = useState(true);

<Toggle pressed={bold} onPressedChange={setBold} icon="bold" label="Bold" variant="outline" />
<Text style={{ fontWeight: bold ? '700' : '400' }}>The quick brown fox…</Text>`,
      },
      {
        title: 'Shapes, sizes & custom color',
        element: <ToggleVariantsDemo />,
        code: `const { resolvedAccent } = useCustomization();

<Toggle pressed label="Pill" shape="pill" variant="outline" />
<Toggle pressed label="Large" size="lg" variant="outline" />
<Toggle pressed label="Your accent" shape="pill" color={resolvedAccent} />`,
      },
    ],
  },
  {
    slug: 'image-uploader',
    name: 'Image Uploader',
    category: 'Components',
    description:
      'Pick photos from the library or camera, preview them as thumbnails, and watch each file upload with its own progress bar — plus overall progress, size limits, and retry/remove. Built on `expo-image-picker`.',
    examples: [
      {
        title: 'Queue with progress',
        description: 'Add up to 5 photos — each tile animates its own bar to done.',
        element: <ImageUploader helperText="JPG or PNG · auto-uploads on pick." />,
        code: `<ImageUploader
  maxFiles={5}
  maxSizeMB={10}
  helperText="JPG or PNG · auto-uploads on pick."
  onFilesChange={(files) => console.log(files)}
/>`,
      },
      {
        title: 'Themed single upload',
        description: 'One slot, no camera button, following your gallery accent.',
        element: <ThemedImageUploaderDemo />,
        code: `const { resolvedAccent } = useCustomization();

<ImageUploader
  maxFiles={1}
  allowCamera={false}
  color={resolvedAccent}
  label="Avatar photo"
/>`,
      },
    ],
  },
  {
    slug: 'date-time-picker',
    name: 'Date Time Picker',
    category: 'Forms',
    description:
      'Themed date/time field around the native picker — spinner in a dialog on iOS, system dialogs on Android, custom calendar on web. Min/max dates and accent included.',
    examples: [
      {
        title: 'Date & time fields',
        description: 'Tap a field to open the picker for its platform.',
        element: <DateTimePickerDemo />,
        code: `const [date, setDate] = useState(new Date());

<DateTimePickerField label="Event date" value={date} onChange={setDate} />
<DateTimePickerField label="Start time" mode="time" value={time} onChange={setTime} />`,
      },
    ],
  },
  {
    slug: 'star-rating',
    name: 'Star Rating',
    category: 'Components',
    description:
      'Airbnb-style rating — tap a star for a full-star rating with a springy pop, and readonly mode renders the familiar listing row.',
    examples: [
      {
        title: 'Interactive',
        description: 'Tap a star to rate it. Second row follows your accent.',
        element: <StarRatingDemo />,
        code: `const [rating, setRating] = useState(4);

<StarRating value={rating} onChange={setRating} showValue />`,
      },
      {
        title: 'Listing display',
        description: 'Readonly with review counts, custom colors, and sizes.',
        element: <StarListingDemo />,
        code: `<StarRating value={5} readonly reviews={128} size={15} />
<StarRating value={4} readonly showValue color="#30a46c" />`,
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
    slug: 'toast',
    name: 'Toast',
    category: 'Components',
    description:
      'Snackbar notifications fired from anywhere via `useToast` — spring entrance, auto-dismiss, action buttons, and swipe-to-dismiss.',
    examples: [
      {
        title: 'Fire toasts',
        description: 'Tap to fire — drag a toast sideways to dismiss it early.',
        element: <ToastDemo />,
        code: `const { toast } = useToast();

toast('Saved', { variant: 'success' });
toast('Photo deleted', {
  variant: 'error',
  action: { label: 'Undo', onPress: restore },
});`,
      },
    ],
  },
  {
    slug: 'progress',
    name: 'Progress',
    category: 'Feedback',
    description:
      'One component for every progress style — animated bars, a gradient fill, an SVG circular ring, and a shimmering skeleton — with custom bar and track colors.',
    examples: [
      {
        element: <ProgressDemo />,
        code: `const [value, setValue] = useState(60);

<Progress value={value} />`,
      },
      {
        title: 'Styles — ring, gradient & skeleton',
        description: 'Circular values animate on change; skeleton shimmers while loading.',
        element: <ProgressStylesDemo />,
        code: `<Progress variant="gradient" value={value} />
<Progress variant="circular" value={value} showValue />
<Progress variant="circular" value={value} gradient="accent" diameter={64} />
<Progress variant="skeleton" className="w-2/3" />`,
      },
      {
        title: 'Custom color (follows your accent)',
        element: <AccentProgressDemo />,
        code: `const { resolvedAccent } = useCustomization();

<Progress value={value} color={resolvedAccent} showValue />`,
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
    description: 'A themed loader with native, dots, matrix, bars, pulse, and ring variants.',
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
      {
        element: (
          <View className="flex-row flex-wrap items-center justify-center gap-8">
            <Spinner variant="dots" size={36} label="dots" />
            <Spinner variant="matrix" size={36} label="matrix" />
            <Spinner variant="bars" size={36} label="bars" />
            <Spinner variant="pulse" size={36} label="pulse" />
            <Spinner variant="ring" size={36} label="ring" />
          </View>
        ),
        code: `<Spinner variant="dots" size={36} />
<Spinner variant="matrix" size={36} />
<Spinner variant="bars" size={36} />
<Spinner variant="pulse" size={36} />
<Spinner variant="ring" size={36} />`,
      },
      {
        element: (
          <View className="flex-row flex-wrap items-center justify-center gap-8">
            <Spinner variant="ring" size={36} color="#e5484d" />
            <Spinner variant="dots" size={36} color="#30a46c" />
            <Spinner variant="bars" size={36} color="#f5a524" />
            <Spinner variant="matrix" size={36} color="#7c3aed" />
          </View>
        ),
        code: `// Any hex or palette color works with every variant.
<Spinner variant="ring" color="#e5484d" />
<Spinner variant="dots" color="#30a46c" />
<Spinner variant="bars" color="#f5a524" />

// Or drive it from the theme:
const colors = useThemeColors();
<Spinner variant="matrix" color={colors.accent} />`,
      },
    ],
  },
];

export const categories = ['Components', 'Primitives', 'Forms', 'Layout', 'Feedback'] as const;
