import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react-native';
import { Pressable, Text, View, type ViewProps } from 'react-native';

import { cn } from '@/ui/lib/cn';
import { useThemeColors } from '@/ui/lib/theme';

const pill = cva('flex-row items-center self-start rounded-full', {
  variants: {
    variant: {
      neutral: 'bg-secondary',
      success: 'bg-success',
      warning: 'bg-warning',
      danger: 'bg-destructive',
      info: 'bg-primary',
    },
    size: {
      sm: 'h-6 gap-1 px-2.5',
      md: 'h-7 gap-1.5 px-3',
    },
  },
  defaultVariants: { variant: 'neutral', size: 'md' },
});

const pillText = cva('font-semibold', {
  variants: {
    variant: {
      neutral: 'text-secondary-foreground',
      success: 'text-success-foreground',
      warning: 'text-warning-foreground',
      danger: 'text-destructive-foreground',
      info: 'text-primary-foreground',
    },
    size: { sm: 'text-xs', md: 'text-sm' },
  },
  defaultVariants: { variant: 'neutral', size: 'md' },
});

type Variant = NonNullable<VariantProps<typeof pill>['variant']>;
type Size = NonNullable<VariantProps<typeof pill>['size']>;

/** Foreground color per variant, for the removable close icon. */
function fgFor(variant: Variant, colors: ReturnType<typeof useThemeColors>) {
  switch (variant) {
    case 'success':
      return colors.successForeground;
    case 'warning':
      return colors.warningForeground;
    case 'danger':
      return colors.destructiveForeground;
    case 'info':
      return colors.primaryForeground;
    default:
      return colors.secondaryForeground;
  }
}

export interface PillBadgeProps extends Omit<ViewProps, 'children'> {
  label?: string;
  variant?: Variant;
  size?: Size;
  /** Chip mode: shows an inline close button and calls `onRemove`. */
  removable?: boolean;
  onRemove?: () => void;
  /**
   * Counter mode: renders a compact numeric badge (for notification counts).
   * Values above `max` render as `{max}+`. Takes precedence over `label`.
   */
  count?: number;
  max?: number;
  className?: string;
}

export function PillBadge({
  label,
  variant = 'neutral',
  size = 'md',
  removable = false,
  onRemove,
  count,
  max = 99,
  className,
  ...rest
}: PillBadgeProps) {
  const colors = useThemeColors();

  // Counter mode — a tight, circular-ish number badge, danger-colored by default.
  if (count != null) {
    const display = count > max ? `${max}+` : String(count);
    const counterVariant = variant === 'neutral' ? 'danger' : variant;
    return (
      <View
        accessibilityRole="text"
        accessibilityLabel={`${count} notifications`}
        className={cn(
          pill({ variant: counterVariant, size }),
          'min-w-[22px] justify-center px-1.5',
          className,
        )}
        {...rest}>
        <Text className={cn(pillText({ variant: counterVariant, size }), 'tabular-nums')}>
          {display}
        </Text>
      </View>
    );
  }

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={label}
      className={cn(pill({ variant, size }), className)}
      {...rest}>
      {label ? <Text className={pillText({ variant, size })}>{label}</Text> : null}
      {removable ? (
        <Pressable
          onPress={onRemove}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={label ? `Remove ${label}` : 'Remove'}
          className="-mr-1 rounded-full p-0.5">
          <X size={size === 'sm' ? 12 : 14} color={fgFor(variant, colors)} strokeWidth={2.5} />
        </Pressable>
      ) : null}
    </View>
  );
}
