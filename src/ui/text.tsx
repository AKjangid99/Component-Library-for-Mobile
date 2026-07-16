import { cva, type VariantProps } from 'class-variance-authority';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { cn } from '@/ui/lib/cn';

const text = cva('text-foreground', {
  variants: {
    variant: {
      h1: 'text-4xl font-bold tracking-tight',
      h2: 'text-3xl font-bold tracking-tight',
      h3: 'text-2xl font-semibold',
      h4: 'text-xl font-semibold',
      lead: 'text-lg text-muted-foreground',
      body: 'text-base',
      muted: 'text-sm text-muted-foreground',
      small: 'text-sm',
      caption: 'text-xs uppercase tracking-wider text-muted-foreground',
      code: 'font-mono text-sm',
    },
  },
  defaultVariants: { variant: 'body' },
});

export type TextProps = RNTextProps &
  VariantProps<typeof text> & {
    className?: string;
  };

export function Text({ variant, className, ...rest }: TextProps) {
  return <RNText className={cn(text({ variant }), className)} {...rest} />;
}
