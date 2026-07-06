import { Text, type TextProps, View, type ViewProps } from 'react-native';

import { cn } from '@/ui/lib/cn';

export function Card({ className, ...rest }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn('rounded-2xl border border-border bg-card p-4', className)}
      {...rest}
    />
  );
}

export function CardHeader({ className, ...rest }: ViewProps & { className?: string }) {
  return <View className={cn('gap-1 pb-3', className)} {...rest} />;
}

export function CardTitle({ className, ...rest }: TextProps & { className?: string }) {
  return (
    <Text className={cn('text-lg font-semibold text-card-foreground', className)} {...rest} />
  );
}

export function CardDescription({ className, ...rest }: TextProps & { className?: string }) {
  return <Text className={cn('text-sm text-muted-foreground', className)} {...rest} />;
}

export function CardContent({ className, ...rest }: ViewProps & { className?: string }) {
  return <View className={cn('gap-2', className)} {...rest} />;
}

export function CardFooter({ className, ...rest }: ViewProps & { className?: string }) {
  return <View className={cn('flex-row items-center gap-2 pt-3', className)} {...rest} />;
}
