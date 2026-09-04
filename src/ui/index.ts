// Public API for the component library.
export { Button, type ButtonProps } from './button';
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardMedia,
  CardTitle,
  type CardProps,
} from './card';
export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  type AccordionProps,
} from './accordion';
export { TextField, type TextFieldProps } from './text-field';
export { Switch, type SwitchProps } from './switch';
export { Checkbox, FormRow, type CheckboxProps } from './checkbox';
export { Row, Stack } from './stack';

export { Text, type TextProps } from './text';
export { Badge, type BadgeProps } from './badge';
export { Avatar, AvatarGroup, type AvatarProps } from './avatar';
export {
  Alert,
  AlertAction,
  AlertActions,
  AlertDescription,
  AlertTitle,
  type AlertActionProps,
  type AlertProps,
} from './alert';
export { Separator, type SeparatorProps } from './separator';
export { Skeleton, type SkeletonProps } from './skeleton';
export { Spinner, type SpinnerProps } from './spinner';
export { Progress, type ProgressProps } from './progress';
export { Radio, RadioGroup, type RadioGroupProps, type RadioProps } from './radio';
export { Toggle, type ToggleProps } from './toggle';
export {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TabsTriggerUnderline,
  type TabsProps,
} from './tabs';

// Premium showcase set — self-contained, animated components.
export { GradientButton, type GradientButtonProps } from './gradient-button';
export { GlassCard, type GlassCardProps } from './glass-card';
export {
  FloatingLabelInput,
  type FloatingLabelInputProps,
  type FloatingLabelInputHandle,
} from './floating-label-input';
export { MorphToggle, type MorphToggleProps } from './morph-toggle';
export {
  StatusAvatar,
  StatusAvatarGroup,
  type StatusAvatarProps,
  type StatusAvatarGroupProps,
} from './status-avatar';
export { PillBadge, type PillBadgeProps } from './pill-badge';
export { ProgressIndicator, type ProgressIndicatorProps } from './progress-indicator';
export { SlideSheet, type SlideSheetProps } from './slide-sheet';
export { SegmentedTabs, type SegmentedTabsProps, type SegmentedTabItem } from './segmented-tabs';

// Theming helpers.
export {
  palette,
  useThemeColors,
  gradients,
  type ThemeColors,
  type GradientName,
} from './lib/theme';
export { cn } from './lib/cn';
