import { cva, type VariantProps } from 'class-variance-authority';
import { Pressable, Text, type TextProps, View, type ViewProps } from 'react-native';

import { cn } from '@/ui/lib/cn';

const card = cva('rounded-2xl p-4', {
  variants: {
    variant: {
      default: 'border border-border bg-card',
      elevated: 'border border-border bg-card shadow-sm',
      outline: 'border border-border bg-transparent',
      ghost: 'bg-transparent',
      filled: 'bg-muted',
    },
    interactive: {
      true: 'active:opacity-90',
      false: '',
    },
  },
  defaultVariants: { variant: 'default' },
});

export type CardProps = ViewProps &
  VariantProps<typeof card> & {
    className?: string;
    pressable?: boolean;
    onPress?: () => void;
  };

export function Card({ variant, interactive, pressable, onPress, className, children, ...rest }: CardProps) {
  const content = (
    <View className={cn(card({ variant, interactive: interactive ?? !!onPress }), className)} {...rest}>
      {children}
    </View>
  );
  if (pressable || onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button">
        {content}
      </Pressable>
    );
  }
  return content;
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

// Subtle media header for image cards
export function CardMedia({ className, ...rest }: ViewProps & { className?: string }) {
  return <View className={cn('-m-4 mb-0 overflow-hidden rounded-t-2xl', className)} {...rest} />;
}
