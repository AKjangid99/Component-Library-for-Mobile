import { cva, type VariantProps } from 'class-variance-authority';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, type PressableProps, Text } from 'react-native';

import { cn } from '@/ui/lib/cn';
import { useThemeColors } from '@/ui/lib/theme';

const toggle = cva('flex-row items-center justify-center gap-2 rounded-lg', {
  variants: {
    variant: {
      default: '',
      outline: 'border border-border',
    },
    size: {
      sm: 'h-9 px-2.5',
      md: 'h-11 px-3',
    },
    pressed: {
      true: 'bg-secondary',
      false: 'bg-transparent',
    },
  },
  defaultVariants: { variant: 'default', size: 'md', pressed: false },
});

export type ToggleProps = Omit<PressableProps, 'onPress'> &
  VariantProps<typeof toggle> & {
    pressed: boolean;
    onPressedChange?: (pressed: boolean) => void;
    label?: string;
    icon?: SymbolViewProps['name'];
    disabled?: boolean;
    className?: string;
  };

export function Toggle({
  pressed,
  onPressedChange,
  label,
  icon,
  variant = 'default',
  size = 'md',
  disabled,
  className,
  ...rest
}: ToggleProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ selected: pressed, disabled }}
      disabled={disabled}
      onPress={() => onPressedChange?.(!pressed)}
      className={cn(toggle({ variant, size, pressed }), disabled && 'opacity-50', className)}
      {...rest}>
      {icon ? (
        <SymbolView
          name={icon}
          tintColor={pressed ? colors.secondaryForeground : colors.foreground}
          size={size === 'sm' ? 16 : 18}
        />
      ) : null}
      {label ? (
        <Text className={cn('font-medium', pressed ? 'text-secondary-foreground' : 'text-foreground')}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}
