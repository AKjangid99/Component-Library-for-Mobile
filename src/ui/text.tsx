import { cva, type VariantProps } from 'class-variance-authority';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { cn } from '@/ui/lib/cn';

const text = cva('text-foreground', {
  variants: {
    variant: {
      display: 'text-5xl font-black tracking-tighter',
      h1: 'text-4xl font-bold tracking-tight',
      h2: 'text-3xl font-bold tracking-tight',
      h3: 'text-2xl font-semibold',
      h4: 'text-xl font-semibold',
      h5: 'text-lg font-semibold',
      lead: 'text-lg text-muted-foreground',
      body: 'text-base leading-6',
      muted: 'text-sm text-muted-foreground',
      small: 'text-sm',
      caption: 'text-xs uppercase tracking-wider text-muted-foreground',
      code: 'font-mono text-sm bg-muted px-1.5 py-0.5 rounded',
      link: 'text-sm font-medium text-primary underline',
      overline: 'text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground',
    },
    weight: {
      regular: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
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
