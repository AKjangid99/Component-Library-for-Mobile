import { type LucideIcon } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, Text, View, type ViewProps } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { cn } from '@/ui/lib/cn';
import { useThemeColors } from '@/ui/lib/theme';

export type DialogSize = 'sm' | 'md' | 'lg';

const MAX_WIDTH: Record<DialogSize, number> = { sm: 320, md: 380, lg: 440 };

export interface DialogProps extends ViewProps {
  /** Controls visibility. Mounts on open with a spring entrance. */
  visible: boolean;
  /** Called on backdrop tap (when allowed), Android back, and close affordances you wire. */
  onClose?: () => void;
  /** Tapping the dimmed backdrop dismisses. @default true */
  dismissOnBackdrop?: boolean;
  size?: DialogSize;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Centered modal dialog: dimmed backdrop fades in, the card springs up.
 * Compose variants from parts — `DialogHeader` + text for simple,
 * `DialogFooter` with `Button`s for actions, `Input`s for forms.
 *
 * ```tsx
 * const [open, setOpen] = useState(false);
 * <Button label="Delete" onPress={() => setOpen(true)} />
 * <Dialog visible={open} onClose={() => setOpen(false)}>
 *   <DialogHeader title="Delete project?" description="This can't be undone." />
 *   <DialogFooter>
 *     <Button label="Cancel" variant="outline" className="flex-1" onPress={() => setOpen(false)} />
 *     <Button label="Delete" variant="destructive" className="flex-1" onPress={remove} />
 *   </DialogFooter>
 * </Dialog>
 * ```
 */
export function Dialog({
  visible,
  onClose,
  dismissOnBackdrop = true,
  size = 'md',
  className,
  children,
  ...rest
}: DialogProps) {
  if (!visible) return null;
  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.fill}>
        {/* Backdrop and card are siblings (never nested pressables) so web
            never renders <button> inside <button>. */}
        <Animated.View entering={FadeIn.duration(180)} style={StyleSheet.absoluteFill}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss dialog"
            onPress={dismissOnBackdrop ? onClose : undefined}
            style={[StyleSheet.absoluteFill, { backgroundColor: '#00000088' }]}
          />
        </Animated.View>
        <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, styles.center]}>
          <Animated.View
            entering={ZoomIn.duration(220)}
            style={{ width: '100%', maxWidth: MAX_WIDTH[size] }}
            className={cn(
              'gap-4 rounded-3xl border border-border bg-card p-5 shadow-lg',
              className,
            )}
            {...rest}>
            {children}
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

export interface DialogHeaderProps {
  /** Icon in a tinted tile above the title. */
  icon?: LucideIcon;
  /** Tile background. Defaults to the theme primary. */
  iconColor?: string;
  title: string;
  description?: string;
  className?: string;
}

export function DialogHeader({ icon: Icon, iconColor, title, description, className }: DialogHeaderProps) {
  const colors = useThemeColors();
  const tint = iconColor ?? colors.primary;
  return (
    <View className={cn('gap-3', className)}>
      {Icon ? (
        <View
          className="h-11 w-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${tint}1a` }}>
          <Icon size={22} color={tint} strokeWidth={2.25} />
        </View>
      ) : null}
      <View className="gap-1">
        <Text className="text-lg font-bold tracking-tight text-foreground">{title}</Text>
        {description ? (
          <Text className="text-sm leading-5 text-muted-foreground">{description}</Text>
        ) : null}
      </View>
    </View>
  );
}

export interface DialogFooterProps {
  /** Action buttons — give each `className="flex-1"` to split the row. */
  children: React.ReactNode;
  className?: string;
}

/** Action bar: buttons in an evenly-spaced row that wraps on narrow screens. */
export function DialogFooter({ children, className }: DialogFooterProps) {
  return <View className={cn('flex-row flex-wrap gap-2 pt-1', className)}>{children}</View>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
});
