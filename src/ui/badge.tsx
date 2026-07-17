import { cva, type VariantProps } from 'class-variance-authority';
import { Text, View, type ViewProps } from 'react-native';

import { cn } from '@/ui/lib/cn';

const badge = cva('flex-row items-center gap-1 self-start rounded-full px-2.5 py-0.5', {
  variants: {
    variant: {
      default: 'bg-primary',
      secondary: 'bg-secondary',
      outline: 'border border-border bg-transparent',
      destructive: 'bg-destructive',
      success: 'bg-success',
      warning: 'bg-warning',
    },
  },
  defaultVariants: { variant: 'default' },
});

const badgeText = cva('text-xs font-semibold', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      secondary: 'text-secondary-foreground',
      outline: 'text-foreground',
      destructive: 'text-destructive-foreground',
      success: 'text-success-foreground',
      warning: 'text-warning-foreground',
    },
  },
  defaultVariants: { variant: 'default' },
});

export type BadgeProps = ViewProps &
  VariantProps<typeof badge> & {
    label?: string;
    className?: string;
    textClassName?: string;
    children?: React.ReactNode;
  };

export function Badge({ variant, label, className, textClassName, children, ...rest }: BadgeProps) {
  return (
    <View className={cn(badge({ variant }), className)} {...rest}>
      {children ?? <Text className={cn(badgeText({ variant }), textClassName)}>{label}</Text>}
    </View>
  );
}
