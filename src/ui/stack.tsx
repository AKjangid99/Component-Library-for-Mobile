import { View, type ViewProps } from 'react-native';

import { cn } from '@/ui/lib/cn';

/** Vertical flex container. Use `gap-*` / alignment utilities via className. */
export function Stack({ className, ...rest }: ViewProps & { className?: string }) {
  return <View className={cn('flex-col', className)} {...rest} />;
}

/** Horizontal flex container, vertically centered by default. */
export function Row({ className, ...rest }: ViewProps & { className?: string }) {
  return <View className={cn('flex-row items-center', className)} {...rest} />;
}
