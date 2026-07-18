import { ActivityIndicator, View, type ViewProps } from 'react-native';

import { cn } from '@/ui/lib/cn';
import { useThemeColors } from '@/ui/lib/theme';

export type SpinnerProps = ViewProps & {
  size?: 'small' | 'large';
  /** Token name from the palette; defaults to the primary color. */
  color?: string;
  className?: string;
};

export function Spinner({ size = 'small', color, className, ...rest }: SpinnerProps) {
  const colors = useThemeColors();
  return (
    <View className={cn('items-center justify-center', className)} {...rest}>
      <ActivityIndicator size={size} color={color ?? colors.primary} />
    </View>
  );
}
