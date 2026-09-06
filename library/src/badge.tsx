import { cva, type VariantProps } from 'class-variance-authority';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { X } from 'lucide-react-native';
import { Pressable, Text, View, type ViewProps } from 'react-native';

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
    /**
     * Custom accent color (any hex). Filled variants take it as background;
     * `outline` keeps a transparent fill and uses it for border + text.
     * Pair with `textColor`, or leave it — text falls back to white.
     * Tip: pass `useAccent()` / `resolvedAccent` for a live-themed badge.
     */
    color?: string;
    /** Custom label/icon color. Defaults adapt to `color` + `variant`. */
    textColor?: string;
    style?: ViewProps['style'];
    /** Chip mode: shows an inline close button and calls `onRemove`. */
    removable?: boolean;
    onRemove?: () => void;
    /**
     * Counter mode: renders a compact numeric badge (for notification
     * counts). Values above `max` render as `{max}+`. Takes precedence
     * over `label`.
     */
    count?: number;
    max?: number;
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
  color,
  textColor,
  style,
  removable,
  onRemove,
  count,
  max = 99,
  ...rest
}: BadgeProps) {
  const colors = useThemeColors();
  const isOutline = variant === 'outline';
  const fallbackTint =
    isOutline || variant === 'muted'
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
  // Custom color: tinted text for outline, white text otherwise unless overridden.
  const iconTint =
    textColor ?? (color ? (isOutline ? color : '#ffffff') : fallbackTint);

  // Counter mode wins over `label`.
  const displayLabel = count != null ? (count > max ? `${max}+` : String(count)) : label;

  return (
    <View
      accessibilityLabel={count != null ? `${count} notifications` : undefined}
      className={cn(badge({ variant, size, shape }), count != null && 'justify-center', className)}
      style={[
        color
          ? isOutline
            ? { borderColor: color }
            : { backgroundColor: color, borderColor: color }
          : null,
        style,
      ]}
      {...rest}>
      {dot ? (
        <View
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: dotColor ?? iconTint }}
        />
      ) : null}
      {icon ? <SymbolView name={icon} size={size === 'sm' ? 11 : size === 'lg' ? 15 : 13} tintColor={iconTint} /> : null}
      {children ?? (
        <Text
          className={cn(badgeText({ variant, size }), count != null && 'tabular-nums', textClassName)}
          style={color || textColor ? { color: iconTint } : undefined}>
          {displayLabel}
        </Text>
      )}
      {removable ? (
        <Pressable
          onPress={onRemove}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={displayLabel ? `Remove ${displayLabel}` : 'Remove'}
          className="-mr-1 rounded-full p-0.5">
          <X size={size === 'sm' ? 11 : size === 'lg' ? 15 : 13} color={iconTint} strokeWidth={2.5} />
        </Pressable>
      ) : null}
    </View>
  );
}
