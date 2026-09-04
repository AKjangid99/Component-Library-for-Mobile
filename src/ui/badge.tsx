import { cva, type VariantProps } from 'class-variance-authority';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Text, View, type ViewProps } from 'react-native';

import { cn } from '@/ui/lib/cn';
import { useThemeColors } from '@/ui/lib/theme';

const badge = cva('flex-row items-center gap-1 self-start rounded-full border', {
  variants: {
    variant: {
      default: 'border-transparent bg-primary',
      secondary: 'border-transparent bg-secondary',
      outline: 'border-border bg-transparent',
      destructive: 'border-transparent bg-destructive',
      success: 'border-transparent bg-success',
      warning: 'border-transparent bg-warning',
      muted: 'border-transparent bg-muted',
    },
    size: {
      sm: 'px-1.5 py-0',
      md: 'px-2.5 py-0.5',
      lg: 'px-3 py-1',
    },
    shape: {
      pill: 'rounded-full',
      square: 'rounded-md',
    },
  },
  defaultVariants: { variant: 'default', size: 'md', shape: 'pill' },
});

const badgeText = cva('font-semibold', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      secondary: 'text-secondary-foreground',
      outline: 'text-foreground',
      destructive: 'text-destructive-foreground',
      success: 'text-success-foreground',
      warning: 'text-warning-foreground',
      muted: 'text-muted-foreground',
    },
    size: {
      sm: 'text-[10px]',
      md: 'text-xs',
      lg: 'text-sm',
    },
  },
  defaultVariants: { variant: 'default', size: 'md' },
});

export type BadgeProps = ViewProps &
  VariantProps<typeof badge> & {
    label?: string;
    className?: string;
    textClassName?: string;
    children?: React.ReactNode;
    icon?: SymbolViewProps['name'];
    dot?: boolean;
    dotColor?: string;
  };

export function Badge({
  variant,
  size,
  shape,
  label,
  className,
  textClassName,
  children,
  icon,
  dot,
  dotColor,
  ...rest
}: BadgeProps) {
  const colors = useThemeColors();
  const iconTint =
    variant === 'outline' || variant === 'muted'
      ? colors.foreground
      : variant === 'secondary'
        ? colors.secondaryForeground
        : variant === 'destructive'
          ? colors.destructiveForeground
          : variant === 'success'
            ? colors.successForeground
            : variant === 'warning'
              ? colors.warningForeground
              : colors.primaryForeground;

  return (
    <View className={cn(badge({ variant, size, shape }), className)} {...rest}>
      {dot ? (
        <View
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: dotColor ?? iconTint }}
        />
      ) : null}
      {icon ? <SymbolView name={icon} size={size === 'sm' ? 11 : size === 'lg' ? 15 : 13} tintColor={iconTint} /> : null}
      {children ?? <Text className={cn(badgeText({ variant, size }), textClassName)}>{label}</Text>}
    </View>
  );
}
