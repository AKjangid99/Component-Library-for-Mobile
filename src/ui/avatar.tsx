import { Image } from 'expo-image';
import { useState } from 'react';
import { Text, View, type ViewProps } from 'react-native';

import { cn } from '@/ui/lib/cn';

const SIZES = { sm: 32, md: 40, lg: 56, xl: 72 } as const;

export type AvatarProps = ViewProps & {
  source?: string;
  /** Fallback text (usually initials) shown when there's no image. */
  fallback?: string;
  size?: keyof typeof SIZES;
  className?: string;
};

export function Avatar({ source, fallback, size = 'md', className, ...rest }: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const dimension = SIZES[size];
  const showImage = source && !errored;

  return (
    <View
      className={cn('items-center justify-center overflow-hidden rounded-full bg-muted', className)}
      style={{ width: dimension, height: dimension }}
      {...rest}>
      {showImage ? (
        <Image
          source={source}
          style={{ width: dimension, height: dimension }}
          contentFit="cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <Text
          className="font-semibold text-muted-foreground"
          style={{ fontSize: dimension * 0.4 }}>
          {fallback ?? '?'}
        </Text>
      )}
    </View>
  );
}
