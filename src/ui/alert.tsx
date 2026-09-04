import { cva, type VariantProps } from 'class-variance-authority';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useEffect } from 'react';
import { Pressable, Text, View, type PressableProps, type ViewProps } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeOut,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/ui/lib/cn';
import { useThemeColors } from '@/ui/lib/theme';

// ---------------------------------------------------------------------------
// Container — approachable, soft, rounded-2xl with subtle shadow
// ---------------------------------------------------------------------------

const alert = cva('flex-row gap-3 rounded-2xl border p-4 shadow-sm', {
  variants: {
    variant: {
      default: 'border-border bg-card',
      destructive: 'border-destructive/20 bg-card',
      success: 'border-success/20 bg-card',
      warning: 'border-warning/20 bg-card',
      info: 'border-primary/20 bg-card',
    },
  },
  defaultVariants: { variant: 'default' },
});

type AlertVariant = NonNullable<VariantProps<typeof alert>['variant']>;

const DEFAULT_ICON: Record<AlertVariant, SymbolViewProps['name']> = {
  default: 'info.circle.fill',
  destructive: 'exclamationmark.triangle.fill',
  success: 'checkmark.circle.fill',
  warning: 'exclamationmark.circle.fill',
  info: 'info.circle.fill',
};

function iconColorFor(variant: AlertVariant, colors: ReturnType<typeof useThemeColors>) {
  switch (variant) {
    case 'destructive':
      return colors.destructive;
    case 'success':
      return colors.success;
    case 'warning':
      return colors.warning;
    case 'info':
      return colors.primary;
    default:
      return colors.foreground;
  }
}

function iconBubbleBg(variant: AlertVariant) {
  switch (variant) {
    case 'destructive':
      return 'bg-destructive/10';
    case 'success':
      return 'bg-success/10';
    case 'warning':
      return 'bg-warning/10';
    case 'info':
      return 'bg-primary/10';
    default:
      return 'bg-muted';
  }
}

// ---------------------------------------------------------------------------
// Action button — multiple approachable variants + animations
// ---------------------------------------------------------------------------

const alertAction = cva(
  'flex-row items-center justify-center gap-1.5 overflow-hidden rounded-full border',
  {
    variants: {
      variant: {
        filled: 'border-transparent bg-primary shadow-sm',
        tonal: 'border-transparent bg-secondary',
        outline: 'border-border bg-transparent',
        ghost: 'border-transparent bg-transparent',
        destructive: 'border-transparent bg-destructive shadow-sm',
        success: 'border-transparent bg-success shadow-sm',
        warning: 'border-transparent bg-warning shadow-sm',
        subtle: 'border-transparent bg-muted',
        link: 'border-transparent bg-transparent px-1',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-9 px-3.5',
        lg: 'h-10 px-5',
      },
    },
    defaultVariants: { variant: 'filled', size: 'md' },
  },
);

const alertActionText = cva('text-center font-semibold tracking-tight', {
  variants: {
    variant: {
      filled: 'text-primary-foreground',
      tonal: 'text-secondary-foreground',
      outline: 'text-foreground',
      ghost: 'text-foreground',
      destructive: 'text-destructive-foreground',
      success: 'text-success-foreground',
      warning: 'text-warning-foreground',
      subtle: 'text-foreground',
      link: 'text-primary underline',
    },
    size: {
      sm: 'text-xs',
      md: 'text-[13px]',
      lg: 'text-sm',
    },
  },
  defaultVariants: { variant: 'filled', size: 'md' },
});

export type AlertActionVariant = NonNullable<VariantProps<typeof alertAction>['variant']>;
export type AlertActionAnimation = 'scale' | 'bounce' | 'lift' | 'pulse' | 'none';
type AlertActionSize = NonNullable<VariantProps<typeof alertAction>['size']>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function actionIconColorFor(variant: AlertActionVariant, colors: ReturnType<typeof useThemeColors>) {
  switch (variant) {
    case 'filled':
      return colors.primaryForeground;
    case 'destructive':
      return colors.destructiveForeground;
    case 'success':
      return colors.successForeground;
    case 'warning':
      return colors.warningForeground;
    case 'tonal':
      return colors.secondaryForeground;
    default:
      return colors.foreground;
  }
}

export type AlertActionProps = Omit<PressableProps, 'children'> &
  VariantProps<typeof alertAction> & {
    label: string;
    icon?: SymbolViewProps['name'];
    iconPosition?: 'left' | 'right';
    animation?: AlertActionAnimation;
    loading?: boolean;
    className?: string;
    textClassName?: string;
  };

export function AlertAction({
  label,
  variant = 'filled',
  size = 'md',
  animation: animationProp,
  icon,
  iconPosition = 'left',
  className,
  textClassName,
  disabled,
  style: styleProp,
  ...rest
}: AlertActionProps) {
  const colors = useThemeColors();
  const resolvedVariant = (variant as AlertActionVariant) ?? 'filled';
  const resolvedSize = (size as AlertActionSize) ?? 'md';

  // Smart defaults: primary/filled bounces, outline/destructive lifts, rest scale.
  const animation: AlertActionAnimation =
    animationProp ??
    (resolvedVariant === 'filled' || resolvedVariant === 'success' || resolvedVariant === 'destructive'
      ? 'bounce'
      : resolvedVariant === 'outline'
        ? 'lift'
        : resolvedVariant === 'link'
          ? 'scale'
          : 'scale');

  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  const iconColor = actionIconColorFor(resolvedVariant, colors);
  const iconSize = resolvedSize === 'lg' ? 16 : resolvedSize === 'sm' ? 13 : 14;

  // pulse looping for CTA attention — approachable breathing
  useEffect(() => {
    if (animation === 'pulse' && !disabled) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
      return () => cancelAnimation(pulseScale);
    }
    cancelAnimation(pulseScale);
    pulseScale.value = 1;
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animation, disabled]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulseScale.value }, { translateY: translateY.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const handlePressIn: PressableProps['onPressIn'] = (e) => {
    switch (animation) {
      case 'bounce':
        scale.value = withSpring(0.93, { mass: 0.35, damping: 9, stiffness: 280 });
        break;
      case 'lift':
        scale.value = withSpring(0.97, { mass: 0.4, damping: 12 });
        translateY.value = withSpring(1.5, { mass: 0.4, damping: 12 });
        overlayOpacity.value = withTiming(0.07, { duration: 120 });
        break;
      case 'pulse':
      case 'scale':
        scale.value = withSpring(0.95, { mass: 0.35, damping: 11 });
        overlayOpacity.value = withTiming(0.08, { duration: 110 });
        break;
      case 'none':
        break;
    }
    rest.onPressIn?.(e);
  };

  const handlePressOut: PressableProps['onPressOut'] = (e) => {
    switch (animation) {
      case 'bounce':
        scale.value = withSequence(
          withSpring(1.04, { mass: 0.3, damping: 8, stiffness: 320 }),
          withSpring(1, { mass: 0.35, damping: 11 }),
        );
        break;
      case 'lift':
        scale.value = withSpring(1, { mass: 0.35, damping: 11 });
        translateY.value = withSpring(0, { mass: 0.35, damping: 11 });
        overlayOpacity.value = withTiming(0, { duration: 180 });
        break;
      case 'scale':
      case 'pulse':
        scale.value = withSpring(1, { mass: 0.35, damping: 11 });
        overlayOpacity.value = withTiming(0, { duration: 180 });
        break;
      case 'none':
        break;
    }
    rest.onPressOut?.(e);
  };

  const isLink = resolvedVariant === 'link';

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      hitSlop={6}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, styleProp as object]}
      className={cn(
        alertAction({ variant: resolvedVariant, size: resolvedSize }),
        isLink ? 'h-auto border-0 shadow-none' : '',
        disabled ? 'opacity-50' : '',
        className,
      )}
      {...rest}
    >
      {/* tactile darken overlay */}
      {!isLink ? (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor:
                resolvedVariant === 'filled' ||
                resolvedVariant === 'destructive' ||
                resolvedVariant === 'success' ||
                resolvedVariant === 'warning'
                  ? '#000'
                  : colors.foreground,
              borderRadius: 999,
            },
            overlayStyle,
          ]}
        />
      ) : null}

      {icon && iconPosition === 'left' ? (
        <SymbolView name={icon} size={iconSize} tintColor={isLink ? colors.primary : iconColor} />
      ) : null}
      <Text
        className={cn(
          alertActionText({ variant: resolvedVariant, size: resolvedSize }),
          // link variant uses smaller underline text, no center weight adjustment
          textClassName,
        )}
      >
        {label}
      </Text>
      {icon && iconPosition === 'right' ? (
        <SymbolView name={icon} size={iconSize} tintColor={isLink ? colors.primary : iconColor} />
      ) : null}
    </AnimatedPressable>
  );
}

export function AlertActions({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <View className={cn('mt-3 flex-row flex-wrap items-center gap-2', className)}>{children}</View>;
}

// ---------------------------------------------------------------------------
// Title / Description helpers (exposed for composition)
// ---------------------------------------------------------------------------

export function AlertTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <Text className={cn('text-[15px] font-semibold leading-5 text-foreground', className)}>{children}</Text>;
}

export function AlertDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <Text className={cn('text-sm leading-5 text-muted-foreground', className)}>{children}</Text>;
}

// ---------------------------------------------------------------------------
// Main Alert
// ---------------------------------------------------------------------------

export type AlertProps = ViewProps &
  VariantProps<typeof alert> & {
    title?: string;
    description?: string;
    icon?: SymbolViewProps['name'] | null;
    /** Hide default icon bubble background */
    hideIconBubble?: boolean;
    className?: string;
    children?: React.ReactNode;
    dismissible?: boolean;
    onDismiss?: () => void;
    /** Back-compat single action — rendered as a `link` button with scale animation */
    actionLabel?: string;
    onAction?: () => void;
    /** Preferred: pass <AlertActions><AlertAction .../></AlertActions> as children or use `actions` prop */
    actions?: AlertActionProps[];
    /** Entrance animation delay (ms) for staggered lists */
    enterDelay?: number;
  };

export function Alert({
  variant = 'default',
  title,
  description,
  icon,
  hideIconBubble = false,
  className,
  children,
  dismissible,
  onDismiss,
  actionLabel,
  onAction,
  actions,
  enterDelay = 0,
  ...rest
}: AlertProps) {
  const colors = useThemeColors();
  const resolvedVariant = (variant as AlertVariant) ?? 'default';
  const iconName = icon === null ? null : (icon ?? DEFAULT_ICON[resolvedVariant]);

  // Micro-interaction for dismiss button
  const dismissScale = useSharedValue(1);
  const dismissRotate = useSharedValue(0);

  const dismissAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dismissScale.value }, { rotate: `${dismissRotate.value}deg` }],
  }));

  const handleDismissPressIn = () => {
    dismissScale.value = withSpring(0.8, { mass: 0.3, damping: 10 });
    dismissRotate.value = withTiming(90, { duration: 180, easing: Easing.out(Easing.ease) });
  };
  const handleDismissPressOut = () => {
    dismissScale.value = withSpring(1, { mass: 0.3, damping: 10 });
    dismissRotate.value = withTiming(0, { duration: 180, easing: Easing.out(Easing.ease) });
  };

  // Detect if children already contains AlertActions — if so don't duplicate single action
  const hasCustomActions = Array.isArray(actions) && actions.length > 0;

  return (
    <Animated.View
      entering={FadeInDown.delay(enterDelay).duration(420).springify().damping(16).stiffness(160)}
      exiting={FadeOut.duration(220)}
      className={cn(alert({ variant: resolvedVariant }), 'overflow-hidden', className)}
      {...rest}
    >
      {/* Icon bubble — approachable & friendly */}
      {iconName ? (
        <View
          className={cn(
            'h-9 w-9 items-center justify-center rounded-full',
            hideIconBubble ? 'bg-transparent h-6 w-6' : iconBubbleBg(resolvedVariant),
          )}
          style={hideIconBubble ? { marginTop: 1 } : undefined}
        >
          <SymbolView
            name={iconName}
            tintColor={iconColorFor(resolvedVariant, colors)}
            size={hideIconBubble ? 20 : 18}
            style={hideIconBubble ? { marginTop: 1 } : undefined}
          />
        </View>
      ) : null}

      <View className="flex-1 gap-0.5">
        {title ? <AlertTitle>{title}</AlertTitle> : null}
        {description ? <AlertDescription>{description}</AlertDescription> : null}
        {children}

        {/* Actions row — supports new API + back-compat single link */}
        {hasCustomActions ? (
          <AlertActions>
            {actions!.map((a, idx) => (
              <AlertAction key={`${a.label}-${idx}`} {...a} />
            ))}
          </AlertActions>
        ) : actionLabel ? (
          <View className="mt-2 flex-row">
            {/* Back-compat renders as animated link variant — approachable but not bulky */}
            <AlertAction
              label={actionLabel}
              onPress={onAction}
              variant="link"
              size="sm"
              animation="scale"
            />
          </View>
        ) : null}
      </View>

      {dismissible ? (
        <AnimatedPressable
          onPress={onDismiss}
          onPressIn={handleDismissPressIn}
          onPressOut={handleDismissPressOut}
          hitSlop={10}
          style={dismissAnimatedStyle}
          className="ml-1 h-8 w-8 items-center justify-center rounded-full bg-muted active:bg-secondary"
          accessibilityRole="button"
          accessibilityLabel="Dismiss alert"
        >
          <SymbolView name="xmark" size={14} tintColor={colors.mutedForeground} weight="medium" />
        </AnimatedPressable>
      ) : null}
    </Animated.View>
  );
}
