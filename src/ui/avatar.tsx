import { cva, type VariantProps } from 'class-variance-authority';
import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View, type PressableProps, type ViewProps } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/ui/lib/cn';
import { palette, useThemeColors } from '@/ui/lib/theme';


const SIZES = { xs: 24, sm: 32, md: 40, lg: 56, xl: 72, '2xl': 96 } as const;

const STATUS_COLOR: Record<string, string> = {
  online: '#30a46c',
  offline: '#b0b4ba',
  busy: '#e5484d',
  away: '#f5a524',
};

const FALLBACK_COLORS_LIGHT = ['#208aef', '#30a46c', '#f5a524', '#e5484d', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];
const FALLBACK_COLORS_DARK = ['#3c87f7', '#3dd68c', '#ffc53d', '#ff6369', '#a78bfa', '#22d3ee', '#f472b6', '#fb923c'];

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initialsFromFallback(fallback?: string): string {
  if (!fallback) return '?';
  const parts = fallback.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);


const avatarVariants = cva('items-center justify-center overflow-hidden', {
  variants: {
    variant: {
      default: 'bg-muted border border-transparent',
      soft: 'border border-transparent',
      outline: 'bg-transparent border-2 border-border',
      muted: 'bg-muted border border-border/60',
      ring: 'bg-muted border-2 border-background shadow-sm',
      gradient: 'border-2 border-transparent shadow-md',
      story: 'bg-muted border-[3px] border-background shadow-sm',
      glass: 'bg-card/70 border border-border/50 backdrop-blur-xl shadow-sm',
    },
    shape: {
      circle: 'rounded-full',
      square: 'rounded-xl',
      squircle: 'rounded-2xl',
    },
  },
  defaultVariants: { variant: 'default', shape: 'circle' },
});

export type AvatarAnimation = 'none' | 'scale' | 'bounce' | 'lift' | 'pulse' | 'breathe' | 'shimmer' | 'story';
export type AvatarVariant = NonNullable<VariantProps<typeof avatarVariants>['variant']>;


export type AvatarProps = Omit<PressableProps, 'children'> &
  ViewProps & {
    source?: string;
    fallback?: string;
    size?: keyof typeof SIZES;
    shape?: 'circle' | 'square' | 'squircle';
    bordered?: boolean;
    status?: 'online' | 'offline' | 'busy' | 'away';
    variant?: AvatarVariant;
    animation?: AvatarAnimation;
    interactive?: boolean;
    shimmer?: boolean;
    pulseStatus?: boolean;
    fallbackColor?: string;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    ringColor?: string;
  };

export function Avatar({
  source,
  fallback,
  size = 'md',
  shape = 'circle',
  bordered,
  status,
  variant: variantProp,
  animation: animationProp,
  interactive,
  shimmer: shimmerProp,
  pulseStatus,
  fallbackColor,
  disabled,
  loading,
  className,
  style: styleProp,
  onPress,
  onPressIn,
  onPressOut,
  ...rest
}: AvatarProps) {
  const colors = useThemeColors();
  const scheme: 'light' | 'dark' = colors.background === palette.dark.background ? 'dark' : 'light';
  const [errored, setErrored] = useState(false);
  const dimension = SIZES[size];
  const radius = shape === 'circle' ? dimension / 2 : shape === 'squircle' ? dimension * 0.32 : dimension * 0.2;
  const showImage = source && !errored && !loading;
  const isInteractive = !!onPress || !!interactive;
  const isDisabled = !!disabled || !!loading;

  const variant: AvatarVariant =
    variantProp ?? (bordered ? 'ring' : loading ? 'soft' : 'default');

  const animation: AvatarAnimation =
    animationProp ??
    (loading
      ? 'shimmer'
      : variant === 'story'
        ? 'story'
        : isInteractive
          ? 'bounce'
          : 'scale');

  const shouldShimmer = (shimmerProp ?? loading) || animation === 'shimmer';
  const shouldPulseStatus = pulseStatus ?? status === 'online';

  const fallbackBg = useMemo(() => {
    if (fallbackColor) return fallbackColor;
    if (variant !== 'soft' && variant !== 'gradient') return undefined;
    const paletteArr = scheme === 'dark' ? FALLBACK_COLORS_DARK : FALLBACK_COLORS_LIGHT;
    const key = (fallback ?? 'user').toLowerCase();
    return paletteArr[hashString(key) % paletteArr.length];
  }, [fallback, fallbackColor, scheme, variant]);

  const fallbackTextColor = useMemo(() => {
    if (variant === 'soft' || variant === 'gradient') return '#ffffff';
    if (variant === 'outline' || variant === 'glass') return colors.foreground;
    return colors.mutedForeground;
  }, [colors.foreground, colors.mutedForeground, variant]);

  const initials = useMemo(() => initialsFromFallback(fallback), [fallback]);

  const scale = useSharedValue(1);
  const entranceScale = useSharedValue(0.92);
  const entranceOpacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);
  const shimmerX = useSharedValue(-dimension * 1.2);
  const breatheScale = useSharedValue(1);
  const storyRotate = useSharedValue(0);
  const statusPulseScale = useSharedValue(1);
  const statusPulseOpacity = useSharedValue(0.55);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);

  useEffect(() => {
    entranceScale.value = withSpring(1, { mass: 0.6, damping: 14, stiffness: 220 });
    entranceOpacity.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.ease) });
  }, [entranceOpacity, entranceScale]);

  useEffect(() => {
    if (isDisabled) {
      cancelAnimation(breatheScale);
      breatheScale.value = 1;
      return;
    }
    if (animation === 'breathe') {
      breatheScale.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
      return () => cancelAnimation(breatheScale);
    }
    if (animation === 'pulse') {
      breatheScale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
      return () => cancelAnimation(breatheScale);
    }
    cancelAnimation(breatheScale);
    breatheScale.value = withTiming(1, { duration: 200 });
  }, [animation, breatheScale, isDisabled]);

  // Shimmer sweep
  useEffect(() => {
    if (!shouldShimmer || isDisabled) {
      cancelAnimation(shimmerX);
      shimmerX.value = -dimension * 1.2;
      return;
    }
    shimmerX.value = withRepeat(
      withSequence(
        withTiming(dimension * 1.2, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(-dimension * 1.2, { duration: 0 }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(shimmerX);
  }, [dimension, isDisabled, shimmerX, shouldShimmer]);

  // Story ring rotation
  useEffect(() => {
    if (variant !== 'story' && animation !== 'story') {
      cancelAnimation(storyRotate);
      return;
    }
    if (isDisabled) {
      cancelAnimation(storyRotate);
      return;
    }
    storyRotate.value = withRepeat(withTiming(360, { duration: 2800, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(storyRotate);
  }, [animation, isDisabled, storyRotate, variant]);

  // Status pulse ring
  useEffect(() => {
    if (!status || !shouldPulseStatus || isDisabled) {
      cancelAnimation(statusPulseScale);
      cancelAnimation(statusPulseOpacity);
      statusPulseScale.value = 1;
      statusPulseOpacity.value = 0;
      return;
    }
    statusPulseScale.value = withRepeat(
      withSequence(
        withTiming(1.55, { duration: 1100, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 0 }),
      ),
      -1,
      false,
    );
    statusPulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1100, easing: Easing.out(Easing.ease) }),
        withTiming(0.55, { duration: 0 }),
      ),
      -1,
      false,
    );
    return () => {
      cancelAnimation(statusPulseScale);
      cancelAnimation(statusPulseOpacity);
    };
  }, [isDisabled, shouldPulseStatus, status, statusPulseOpacity, statusPulseScale]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: entranceOpacity.value,
    transform: [
      { scale: entranceScale.value * scale.value * breatheScale.value },
      { translateY: translateY.value },
    ],
  }));

  const animatedOverlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const animatedShimmerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shimmerX.value }] }));
  const animatedStoryStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${storyRotate.value}deg` }] }));
  const animatedStatusPulseStyle = useAnimatedStyle(() => ({
    opacity: statusPulseOpacity.value,
    transform: [{ scale: statusPulseScale.value }],
  }));
  const animatedRippleStyle = useAnimatedStyle(() => ({
    opacity: rippleOpacity.value,
    transform: [{ scale: rippleScale.value }],
  }));

  const hitSlop = dimension <= 32 ? 10 : dimension <= 40 ? 6 : 4;

  const handlePressIn: PressableProps['onPressIn'] = (e) => {
    if (isDisabled || !isInteractive) {
      onPressIn?.(e);
      return;
    }
    // ripple origin
    const native = e.nativeEvent as unknown as { locationX?: number; locationY?: number };
    if (typeof native.locationX === 'number') {
      // center ripple — avatar is small, center works best
      rippleScale.value = 0;
      rippleOpacity.value = withTiming(0.16, { duration: 120 });
      rippleScale.value = withTiming(1.9, { duration: 420, easing: Easing.out(Easing.ease) });
    }
    switch (animation) {
      case 'bounce':
        scale.value = withSpring(0.9, { mass: 0.35, damping: 10, stiffness: 260 });
        break;
      case 'lift':
        scale.value = withSpring(0.97, { mass: 0.5, damping: 14 });
        translateY.value = withSpring(1.8, { mass: 0.5, damping: 14 });
        overlayOpacity.value = withTiming(0.06, { duration: 120 });
        break;
      case 'story':
        scale.value = withSpring(0.94, { mass: 0.4, damping: 11 });
        break;
      case 'none':
        break;
      case 'scale':
      case 'pulse':
      case 'breathe':
      case 'shimmer':
      default:
        scale.value = withSpring(0.95, { mass: 0.4, damping: 12 });
        overlayOpacity.value = withTiming(0.07, { duration: 110 });
        break;
    }
    onPressIn?.(e);
  };

  const handlePressOut: PressableProps['onPressOut'] = (e) => {
    if (isDisabled || !isInteractive) {
      onPressOut?.(e);
      return;
    }
    switch (animation) {
      case 'bounce':
        scale.value = withSequence(
          withSpring(1.06, { mass: 0.3, damping: 9, stiffness: 320 }),
          withSpring(1, { mass: 0.4, damping: 12 }),
        );
        break;
      case 'lift':
        scale.value = withSpring(1, { mass: 0.4, damping: 12 });
        translateY.value = withSpring(0, { mass: 0.4, damping: 12 });
        overlayOpacity.value = withTiming(0, { duration: 180 });
        break;
      case 'none':
        break;
      default:
        scale.value = withSpring(1, { mass: 0.4, damping: 12 });
        overlayOpacity.value = withTiming(0, { duration: 180 });
        break;
    }
    rippleOpacity.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.ease) });
    onPressOut?.(e);
  };

  const outerRingSize = variant === 'story' ? dimension + 6 : variant === 'ring' ? dimension + 4 : dimension;
  const innerRadius = radius;
  // Story ring uses a 4-tone border to fake a gradient without extra deps.
  const storyBorderColors = {
    borderTopColor: colors.primary,
    borderRightColor: palette.light.warning, // keep warm tone across themes
    borderBottomColor: '#8b5cf6',
    borderLeftColor: STATUS_COLOR.online,
  } as const;

  const needsOuterRing = variant === 'story' || variant === 'ring' || variant === 'gradient';

  const avatarInner = (
    <Animated.View
      style={[
        {
          width: dimension,
          height: dimension,
          borderRadius: innerRadius,
        },
      ]}
      className={cn(
        avatarVariants({ variant, shape }),
        variant === 'soft' && 'shadow-sm',
        isInteractive && !isDisabled && 'cursor-pointer',
        isDisabled && 'opacity-60',
        className,
      )}
    // background fallback handling
    >
      <View
        style={[
          {
            width: dimension,
            height: dimension,
            borderRadius: innerRadius,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor:
              variant === 'gradient'
                ? fallbackBg ?? colors.primary
                : variant === 'soft'
                  ? fallbackBg
                  : undefined,
            borderWidth: variant === 'gradient' ? 0 : undefined,
          },
        ]}
        className={cn(avatarVariants({ variant, shape }))}
      >
        {showImage ? (
          <Image
            source={source}
            style={{ width: dimension, height: dimension, borderRadius: innerRadius }}
            contentFit="cover"
            transition={180}
            onError={() => setErrored(true)}
          />
        ) : (
          <Text
            style={{
              fontSize: dimension * 0.38,
              fontWeight: '700',
              letterSpacing: dimension > 40 ? -0.5 : 0,
              color: fallbackTextColor,
            }}
          >
            {loading ? '' : initials}
          </Text>
        )}

        {/* Subtle press overlay */}
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              borderRadius: innerRadius,
              backgroundColor: '#000',
            },
            animatedOverlayStyle,
          ]}
        />

        {/* Shimmer sweep */}
        {shouldShimmer && !isDisabled ? (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: dimension * 0.55,
                backgroundColor: 'rgba(255,255,255,0.32)',
                opacity: 0.95,
                transform: [{ skewX: '-12deg' }],
              },
              animatedShimmerStyle,
            ]}
          />
        ) : null}

        {/* Ripple */}
        {isInteractive ? (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                width: dimension * 0.65,
                height: dimension * 0.65,
                borderRadius: dimension,
                backgroundColor: '#fff',
                top: dimension * 0.175,
                left: dimension * 0.175,
              },
              animatedRippleStyle,
            ]}
          />
        ) : null}
      </View>
    </Animated.View>
  );

  // Wrapper for variants that need an outer decorative ring
  const wrappedWithRing = needsOuterRing ? (
    <View
      style={{
        width: outerRingSize,
        height: outerRingSize,
        borderRadius: outerRingSize / 2,
        alignItems: 'center',
        justifyContent: 'center',
        padding: variant === 'story' ? 3 : 2,
        backgroundColor:
          variant === 'gradient'
            ? fallbackBg ?? colors.primary
            : variant === 'ring'
              ? (rest as { ringColor?: string }).ringColor ?? colors.border
              : 'transparent',
        // story outer is animated border view instead of solid bg
      }}
    >
      {variant === 'story' ? (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              borderRadius: outerRingSize / 2,
              borderWidth: 3,
              ...storyBorderColors,
            },
            animatedStoryStyle,
          ]}
        />
      ) : null}
      {avatarInner}
    </View>
  ) : (
    avatarInner
  );

  return (
    <Animated.View
      style={[
        { width: outerRingSize, height: outerRingSize, alignItems: 'center', justifyContent: 'center' },
        animatedContainerStyle,
        styleProp as object,
      ]}
    >
      <AnimatedPressable
        accessibilityRole={onPress ? 'button' : 'image'}
        accessibilityLabel={fallback ? `${fallback} avatar` : 'avatar'}
        accessibilityState={{ disabled: isDisabled }}
        disabled={isDisabled || !isInteractive}
        hitSlop={isInteractive ? hitSlop : undefined}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ width: outerRingSize, height: outerRingSize, alignItems: 'center', justifyContent: 'center' }}
        className={cn(!isInteractive && 'pointer-events-none', 'items-center justify-center')}
        {...rest}
      >
        {wrappedWithRing}

        {/* Status dot — approachable large tap target, animated pulse for online */}
        {status ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              right: needsOuterRing ? 0 : -1,
              bottom: needsOuterRing ? 0 : -1,
              width: dimension * 0.32,
              height: dimension * 0.32,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {shouldPulseStatus ? (
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    width: dimension * 0.32,
                    height: dimension * 0.32,
                    borderRadius: 999,
                    backgroundColor: STATUS_COLOR[status] ?? STATUS_COLOR.offline,
                    borderWidth: 2,
                    borderColor: colors.background,
                  },
                  animatedStatusPulseStyle,
                ]}
              />
            ) : null}
            <View
              style={{
                width: dimension * 0.3,
                height: dimension * 0.3,
                borderRadius: 999,
                borderWidth: 2,
                borderColor: colors.background,
                backgroundColor: STATUS_COLOR[status] ?? STATUS_COLOR.offline,
                shadowColor: '#000',
                shadowOpacity: 0.14,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 1 },
                elevation: 2,
              }}
            />
          </View>
        ) : null}
      </AnimatedPressable>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Avatar.Group — overlapping stack, now interactive + animated entrance
// ---------------------------------------------------------------------------

export type AvatarGroupProps = {
  children: React.ReactNode[];
  max?: number;
  className?: string;
  size?: keyof typeof SIZES;
  /** Overlap offset. Larger = more peeking. */
  overlap?: number;
  /** Animate each avatar entrance with stagger. */
  animated?: boolean;
  /** Expand spacing on press (approachable detail). */
  interactive?: boolean;
};

export function AvatarGroup({
  children,
  max,
  className,
  size = 'md',
  overlap = 10,
  animated = true,
  interactive = false,
}: AvatarGroupProps) {
  const items = Array.isArray(children) ? children : [children];
  const visible = max ? items.slice(0, max) : items;
  const extra = max && items.length > max ? items.length - max : 0;
  const dimension = SIZES[size];
  const [expanded, setExpanded] = useState(false);
  const isPressableGroup = interactive && items.length > 2;

  return (
    <Pressable
      onPress={isPressableGroup ? () => setExpanded((v) => !v) : undefined}
      disabled={!isPressableGroup}
      className={cn('flex-row items-center', className)}
      style={{ paddingLeft: 2 }}
    >
      {visible.map((child, i) => {
        const offset = expanded ? 6 : -overlap;
        return (
          <AnimatedGroupItem
            key={i}
            index={i}
            offset={offset}
            dimension={dimension}
            animated={animated}
          >
            <View
              style={{ borderRadius: 999 }}
              className="border-2 border-background shadow-sm"
            >
              {child}
            </View>
          </AnimatedGroupItem>
        );
      })}
      {extra > 0 ? (
        <AnimatedGroupItem index={visible.length} offset={-overlap} dimension={dimension} animated={animated}>
          <View
            style={{
              marginLeft: -overlap,
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
              borderWidth: 2,
              borderColor: palette.light.background, // will be overridden by theme bg via class
            }}
            className="items-center justify-center rounded-full border-2 border-background bg-muted shadow-sm"
          >
            <Text className="text-xs font-bold text-muted-foreground">+{extra}</Text>
          </View>
        </AnimatedGroupItem>
      ) : null}
    </Pressable>
  );
}

function AnimatedGroupItem({
  children,
  index,
  offset,
  dimension: _dimension,
  animated,
}: {
  children: React.ReactNode;
  index: number;
  offset: number;
  dimension: number;
  animated: boolean;
}) {
  const translateX = useSharedValue(animated ? 14 : 0);
  const opacity = useSharedValue(animated ? 0 : 1);
  const scale = useSharedValue(animated ? 0.92 : 1);

  useEffect(() => {
    if (!animated) return;
    const delay = index * 55;
    const id = setTimeout(() => {
      translateX.value = withSpring(0, { mass: 0.55, damping: 14, stiffness: 210 });
      opacity.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.ease) });
      scale.value = withSpring(1, { mass: 0.55, damping: 12 });
    }, delay);
    return () => clearTimeout(id);
  }, [animated, index, opacity, scale, translateX]);

  const style = useAnimatedStyle(() => ({
    marginLeft: index === 0 ? 0 : offset,
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
    zIndex: 10 - index,
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

// ---------------------------------------------------------------------------
// Preset helpers — one-liners for common appealing combos
// ---------------------------------------------------------------------------

/** Story-style avatar (instagram-like). Pair with status="online" for best effect. */
export function StoryAvatar(props: Omit<AvatarProps, 'variant' | 'animation'>) {
  return <Avatar variant="story" animation="story" {...props} />;
}

/** Soft colored fallback — great for lists without images. */
export function SoftAvatar(props: Omit<AvatarProps, 'variant'>) {
  return <Avatar variant="soft" {...props} />;
}

/** Pressable avatar button — always interactive with bounce. */
export function AvatarButton(props: AvatarProps & { onPress: PressableProps['onPress'] }) {
  return <Avatar interactive animation="bounce" {...props} />;
}
