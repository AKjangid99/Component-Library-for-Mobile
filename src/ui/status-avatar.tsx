import { Image, type ImageSource } from 'expo-image';
import { Text, View, type ViewProps } from 'react-native';

import { cn } from '@/ui/lib/cn';

const SIZES = {
  sm: { box: 32, text: 12, dot: 9, ring: 2 },
  md: { box: 40, text: 15, dot: 11, ring: 2 },
  lg: { box: 56, text: 20, dot: 14, ring: 3 },
  xl: { box: 72, text: 26, dot: 18, ring: 3 },
} as const;

type Size = keyof typeof SIZES;
type Status = 'online' | 'away' | 'offline';

const STATUS_COLOR: Record<Status, string> = {
  online: '#30a46c',
  away: '#f5a524',
  offline: '#9ca3af',
};

// Deterministic, pleasant fallback background derived from the name.
const FALLBACK_BG = ['#208aef', '#7c3aed', '#e5484d', '#30a46c', '#f5a524', '#0ea5e9', '#ec4899'];

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function bgFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return FALLBACK_BG[Math.abs(hash) % FALLBACK_BG.length];
}

export interface StatusAvatarProps extends ViewProps {
  /** Remote/local image. Falls back to initials if absent or it fails to load. */
  source?: ImageSource | string;
  /** Used for initials and the deterministic fallback color. */
  name?: string;
  size?: Size;
  status?: Status;
  className?: string;
}

export function StatusAvatar({
  source,
  name = '',
  size = 'md',
  status,
  className,
  ...rest
}: StatusAvatarProps) {
  const s = SIZES[size];
  const initials = initialsOf(name);
  const label = name ? `${name}${status ? `, ${status}` : ''}` : 'Avatar';

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={label}
      style={{ width: s.box, height: s.box }}
      className={cn('relative', className)}
      {...rest}>
      {/* Initials sit underneath so a missing/broken image reveals them. */}
      <View
        style={{ width: s.box, height: s.box, backgroundColor: bgFor(name || 'x') }}
        className="absolute items-center justify-center rounded-full">
        <Text style={{ fontSize: s.text }} className="font-semibold text-white">
          {initials}
        </Text>
      </View>
      {source ? (
        <Image
          source={typeof source === 'string' ? { uri: source } : source}
          style={{ width: s.box, height: s.box, borderRadius: s.box / 2 }}
          contentFit="cover"
          transition={200}
        />
      ) : null}

      {status ? (
        <View
          // The ring punches the dot out of the avatar, matching the page bg.
          style={{
            width: s.dot + s.ring * 2,
            height: s.dot + s.ring * 2,
            borderWidth: s.ring,
            backgroundColor: STATUS_COLOR[status],
          }}
          className="absolute bottom-0 right-0 rounded-full border-background"
        />
      ) : null}
    </View>
  );
}

export interface StatusAvatarGroupProps extends ViewProps {
  /** `StatusAvatar` elements. Beyond `max`, the rest collapse into a +N bubble. */
  children: React.ReactNode;
  max?: number;
  size?: Size;
  className?: string;
}

export function StatusAvatarGroup({
  children,
  max = 4,
  size = 'md',
  className,
  ...rest
}: StatusAvatarGroupProps) {
  const items = Array.isArray(children) ? children.filter(Boolean) : [children];
  const shown = items.slice(0, max);
  const overflow = items.length - shown.length;
  const s = SIZES[size];
  const overlap = -Math.round(s.box * 0.32);

  return (
    <View
      accessibilityRole="none"
      className={cn('flex-row items-center', className)}
      style={{ paddingLeft: -overlap }}
      {...rest}>
      {shown.map((child, i) => (
        <View
          key={i}
          style={{ marginLeft: i === 0 ? 0 : overlap, zIndex: shown.length - i }}
          className="rounded-full border-2 border-background">
          {child}
        </View>
      ))}
      {overflow > 0 ? (
        <View
          style={{ width: s.box, height: s.box, marginLeft: overlap }}
          className="items-center justify-center rounded-full border-2 border-background bg-secondary">
          <Text style={{ fontSize: s.text }} className="font-semibold text-secondary-foreground">
            +{overflow}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
