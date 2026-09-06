/* eslint-disable react-hooks/immutability */
import { Star } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, Text, View, type ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/ui/lib/cn';
import { useAccent } from '@/ui/lib/customization';
import { useThemeColors } from '@/ui/lib/theme';

/** Airbnb Rausch — the recognizable review-star red. Override with `color`. */
const DEFAULT_STAR = '#FF5A5F';

export interface StarRatingProps extends ViewProps {
  /** Controlled rating (supports halves like 4.5). */
  value?: number;
  /** Uncontrolled initial rating. @default 0 */
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** Star count. @default 5 */
  max?: number;
  /** Star diameter. @default 28 */
  size?: number;
  /** Gap between stars. @default 4 */
  gap?: number;
  /** Filled portion color. Defaults to the gallery accent, else Airbnb red. */
  color?: string;
  /** Empty portion color. Defaults to the theme border. */
  emptyColor?: string;
  /** Display-only (listing style) — no touch handling. */
  readonly?: boolean;
  /** Show the numeric value beside the stars. */
  showValue?: boolean;
  /** Review count rendered Airbnb-style: "★ 4.92 · 128 reviews". */
  reviews?: number;
  className?: string;
}

const clampRating = (v: number, max: number) => Math.max(0, Math.min(max, v));

/**
 * Airbnb-style star rating. Tap a star to rate — full stars only, with a
 * springy pop and animated fill — and `readonly` + `reviews` gives the
 * familiar listing row.
 *
 * ```tsx
 * const [rating, setRating] = useState(4);
 * <StarRating value={rating} onChange={setRating} showValue />
 * <StarRating value={5} readonly reviews={128} size={14} />
 * ```
 */
export function StarRating({
  value,
  defaultValue = 0,
  onChange,
  max = 5,
  size = 28,
  gap = 4,
  color: colorProp,
  emptyColor: emptyColorProp,
  readonly = false,
  showValue = false,
  reviews,
  className,
  ...rest
}: StarRatingProps) {
  const colors = useThemeColors();
  const accent = useAccent(colorProp);
  // No explicit color and no customization active → Airbnb red.
  const color = colorProp ?? (accent === colors.primary ? DEFAULT_STAR : accent);
  const emptyColor = emptyColorProp ?? colors.border;

  const [inner, setInner] = useState(defaultValue);
  const rating = clampRating(value ?? inner, max);

  const setRating = (next: number) => {
    // Full stars only — always round to the nearest whole star.
    const clamped = clampRating(Math.round(next), max);
    if (value == null) setInner(clamped);
    onChange?.(clamped);
  };

  return (
    <View
      accessibilityRole={readonly ? 'text' : 'adjustable'}
      accessibilityLabel={
        readonly ? `Rated ${rating} out of ${max}` : `Rate ${max} stars, current ${rating}`
      }
      accessibilityValue={readonly ? undefined : { min: 0, max, now: rating }}
      className={cn('flex-row items-center', className)}
      style={{ gap: gap + 8 }}
      {...rest}>
      <View className="flex-row" style={{ gap }}>
        {Array.from({ length: max }, (_, i) => (
          <StarCell
            key={i}
            index={i}
            rating={rating}
            size={size}
            color={color}
            emptyColor={emptyColor}
            readonly={readonly}
            onRate={setRating}
          />
        ))}
      </View>
      {showValue || reviews != null ? (
        <View className="flex-row items-baseline gap-1.5">
          <Text className="text-[15px] font-bold tabular-nums text-foreground">
            {rating % 1 === 0 ? rating.toFixed(0) : rating.toFixed(1)}
          </Text>
          {reviews != null ? (
            <Text className="text-sm text-muted-foreground">
              · {reviews} review{reviews === 1 ? '' : 's'}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function StarCell({
  index,
  rating,
  size,
  color,
  emptyColor,
  readonly,
  onRate,
}: {
  index: number;
  rating: number;
  size: number;
  color: string;
  emptyColor: string;
  readonly: boolean;
  onRate: (v: number) => void;
}) {
  const reduceMotion = useReducedMotion();
  const press = useSharedValue(1);
  // 0–1 fill of this star; animates whenever the rating changes.
  const fill = useSharedValue(Math.max(0, Math.min(1, rating - index)));

  useEffect(() => {
    const target = Math.max(0, Math.min(1, rating - index));
    fill.value = reduceMotion ? target : withTiming(target, { duration: 250 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rating, index, reduceMotion]);

  const fillStyle = useAnimatedStyle(() => ({ width: fill.value * size }));
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));

  const star = (
    <Animated.View style={[{ width: size, height: size }, pressStyle]}>
      <View style={{ width: size, height: size }}>
        <Star size={size} color={emptyColor} fill={emptyColor} strokeWidth={1.5} />
        <Animated.View
          pointerEvents="none"
          style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, overflow: 'hidden' }, fillStyle]}>
          <Star size={size} color={color} fill={color} strokeWidth={1.5} />
        </Animated.View>
      </View>
    </Animated.View>
  );

  if (readonly) return star;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Rate ${index + 1} star${index === 0 ? '' : 's'}`}
      hitSlop={4}
      onPressIn={() => {
        press.value = reduceMotion ? 1 : withSpring(0.82, { mass: 0.3, damping: 14 });
      }}
      onPressOut={() => {
        press.value = reduceMotion ? 1 : withSpring(1, { mass: 0.3, damping: 12 });
      }}
      onPress={() => onRate(index + 1)}>
      {star}
    </Pressable>
  );
}
