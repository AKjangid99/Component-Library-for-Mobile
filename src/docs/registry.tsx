import { useState } from 'react';
import { View } from 'react-native';

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
  FormRow,
  Progress,
  Radio,
  RadioGroup,
  Separator,
  Skeleton,
  Spinner,
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
  const error = email.length > 0 && !email.includes('@') ? 'Enter a valid email' : undefined;
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
        helperText="We'll never share it."
        error={error}
      />
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

/* -------------------------------------------------------------------------- */
/* Registry                                                                    */
/* -------------------------------------------------------------------------- */

export const registry: DocEntry[] = [
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
    ],
  },
  {
    slug: 'accordion',
    name: 'Accordion',
    category: 'Layout',
    description: 'Collapsible sections with animated height and a rotating chevron.',
    examples: [
      {
        element: (
          <Accordion type="single" defaultValue="a" className="w-full">
            <AccordionItem value="a">
              <AccordionTrigger>Is it animated?</AccordionTrigger>
              <AccordionContent>
                <Text variant="muted">Yes — height and chevron animate with Reanimated.</Text>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="b">
              <AccordionTrigger>Single or multiple?</AccordionTrigger>
              <AccordionContent>
                <Text variant="muted">Both — set type=&quot;single&quot; or &quot;multiple&quot;.</Text>
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
    description: 'A labeled input with helper text, error state, and an animated focus border.',
    examples: [
      {
        element: <TextFieldDemo />,
        code: `<TextField label="Name" placeholder="Ada Lovelace" />
<TextField
  label="Email"
  value={email}
  onChangeText={setEmail}
  helperText="We'll never share it."
  error={error}
/>`,
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

export const categories = ['Primitives', 'Forms', 'Layout', 'Feedback'] as const;
