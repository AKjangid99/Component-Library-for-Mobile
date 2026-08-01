import { cva, type VariantProps } from 'class-variance-authority';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Text, View, type ViewProps } from 'react-native';

import { cn } from '@/ui/lib/cn';
import { useThemeColors } from '@/ui/lib/theme';

const alert = cva('flex-row gap-3 rounded-xl border p-4', {
  variants: {
    variant: {
      default: 'border-border bg-card',
      destructive: 'border-destructive bg-card',
      success: 'border-success bg-card',
      warning: 'border-warning bg-card',
    },
  },
  defaultVariants: { variant: 'default' },
});

type AlertVariant = NonNullable<VariantProps<typeof alert>['variant']>;

const DEFAULT_ICON: Record<AlertVariant, SymbolViewProps['name']> = {
  default: 'info.circle',
  destructive: 'exclamationmark.triangle',
  success: 'checkmark.circle',
  warning: 'exclamationmark.circle',
};

function iconColorFor(variant: AlertVariant, colors: ReturnType<typeof useThemeColors>) {
  switch (variant) {
    case 'destructive':
      return colors.destructive;
    case 'success':
      return colors.success;
    case 'warning':
      return colors.warning;
    default:
      return colors.foreground;
  }
}

export type AlertProps = ViewProps &
  VariantProps<typeof alert> & {
    title?: string;
    description?: string;
    icon?: SymbolViewProps['name'] | null;
    className?: string;
    children?: React.ReactNode;
  };

export function Alert({
  variant = 'default',
  title,
  description,
  icon,
  className,
  children,
  ...rest
}: AlertProps) {
  const colors = useThemeColors();
  const resolvedVariant = variant ?? 'default';
  const iconName = icon === null ? null : (icon ?? DEFAULT_ICON[resolvedVariant]);

  return (
    <View className={cn(alert({ variant }), className)} {...rest}>
      {iconName ? (
        <SymbolView
          name={iconName}
          tintColor={iconColorFor(resolvedVariant, colors)}
          size={20}
          style={{ marginTop: 1 }}
        />
      ) : null}
      <View className="flex-1 gap-0.5">
        {title ? <Text className="text-base font-semibold text-foreground">{title}</Text> : null}
        {description ? (
          <Text className="text-sm text-muted-foreground">{description}</Text>
        ) : null}
        {children}
      </View>
    </View>
  );
}
