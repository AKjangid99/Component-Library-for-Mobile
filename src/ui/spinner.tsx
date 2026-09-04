import { ActivityIndicator, Text, View, type ViewProps } from 'react-native';

import { cn } from '@/ui/lib/cn';
import { useThemeColors } from '@/ui/lib/theme';

export type SpinnerProps = ViewProps & {
  size?: 'small' | 'large' | number;
  /** Token name from the palette; defaults to the primary color. */
  color?: string;
  label?: string;
  className?: string;
};

export function Spinner({ size = 'small', color, label, className, ...rest }: SpinnerProps) {
  const colors = useThemeColors();
  const numeric = typeof size === 'number';
  return (
    <View className={cn('items-center justify-center gap-2', className)} {...rest}>
      {numeric ? (
        <ActivityIndicator size="large" color={color ?? colors.primary} style={{ transform: [{ scale: (size as number) / 36 }] }} />
      ) : (
        <ActivityIndicator size={size} color={color ?? colors.primary} />
      )}
      {label ? <Text className="text-sm text-muted-foreground">{label}</Text> : null}
    </View>
  );
}
