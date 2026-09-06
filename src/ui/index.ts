// Public API for the component library.
export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  type AccordionProps
} from './accordion';
export { Button, type ButtonProps } from './button';
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardMedia,
  CardTitle,
  type CardProps
} from './card';
export { Checkbox, FormRow, type CheckboxProps } from './checkbox';
export {
  Input, type InputHandle, type InputLabelStyle, type InputProps, type InputSize, type InputVariant
} from './input';
export { Row, Stack } from './stack';
export { Switch, type SwitchProps } from './switch';

export {
  Alert,
  AlertAction,
  AlertActions,
  AlertDescription,
  AlertTitle,
  type AlertActionProps,
  type AlertProps
} from './alert';
export { Avatar, AvatarGroup, type AvatarProps } from './avatar';
export { Badge, type BadgeProps } from './badge';
export { Text, type TextProps } from './text';
export {
  ImageUploader,
  type ImageUploaderProps,
  type UploadFile,
  type UploadStatus,
} from './image-uploader';
export {
  DateTimePickerField,
  type DateTimePickerFieldProps,
  type DateTimePickerMode,
} from './date-time-picker';
// export { Separator, type SeparatorProps } from './separator';
export { Progress, type ProgressProps, type ProgressSize, type ProgressVariant } from './progress';
export { Radio, RadioGroup, type RadioGroupProps, type RadioProps } from './radio';
export { Skeleton, type SkeletonProps } from './skeleton';
export { Spinner, type SpinnerProps, type SpinnerVariant } from './spinner';
export { StarRating, type StarRatingProps } from './star-rating';
export {
  Tabs,
  TabsContent,
  TabsList,
  TabsSegmented,
  type TabsProps,
  type TabsSegmentedItem,
  type TabsSegmentedProps,
  TabsTrigger,
  TabsTriggerUnderline,
} from './tabs';
export { Toggle, type ToggleProps } from './toggle';
export {
  ToastProvider,
  useToast,
  type ToastAction,
  type ToastOptions,
  type ToastPosition,
  type ToastVariant,
} from './toast';

// Components showcase set — self-contained, animated components.
export {
  Dialog,
  DialogFooter,
  DialogHeader,
  type DialogFooterProps,
  type DialogHeaderProps,
  type DialogProps,
  type DialogSize,
} from './dialog';
export { GlassCard, type GlassCardProps } from './glass-card';
export { SlideSheet, type SlideSheetProps } from './slide-sheet';
export {
  StatusAvatar,
  StatusAvatarGroup, type StatusAvatarGroupProps, type StatusAvatarProps
} from './avatar';

// Theming + customization helpers.
export { cn } from './lib/cn';
export {
  ACCENT_SWATCHES,
  CustomizationProvider,
  useAccent,
  useCustomization,
  type AccentSwatch
} from './lib/customization';
export {
  gradients, palette,
  useThemeColors, type GradientName, type ThemeColors
} from './lib/theme';

