/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/refs -- PanResponder factory only writes Reanimated
   shared values inside gesture callbacks that run post-render, never during it. */
import { Check, Info, TriangleAlert, X } from 'lucide-react-native';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { PanResponder, Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ToastVariant = 'default' | 'success' | 'error' | 'info';
export type ToastPosition = 'top' | 'bottom';

export interface ToastAction {
  label: string;
  onPress: () => void;
}

export interface ToastOptions {
  /** @default 'default' */
  variant?: ToastVariant;
  /** Action button on the right. */
  action?: ToastAction;
  /** Auto-dismiss ms. `0` sticks until dismissed. @default 3500 */
  duration?: number;
}

interface ToastItem extends Required<Pick<ToastOptions, 'variant'>> {
  id: number;
  message: string;
  action?: ToastAction;
  duration: number;
}

interface ToastContextValue {
  toast: (message: string, options?: ToastOptions) => number;
  dismiss: (id: number) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

let toastId = 0;

/**
 * Snackbar-style toasts. Wrap a screen once, then fire from anywhere:
 *
 * ```tsx
 * <ToastProvider position="bottom">
 *   <Screen />
 * </ToastProvider>
 *
 * const { toast } = useToast();
 * toast('Saved', { variant: 'success', action: { label: 'Undo', onPress: undo } });
 * ```
 *
 * Cards spring in, auto-dismiss on a timer, and drag horizontally to
 * dismiss early (velocity flings them off). Stacks the latest three.
 */
export function ToastProvider({
  children,
  position = 'bottom',
  maxVisible = 3,
}: {
  children: ReactNode;
  position?: ToastPosition;
  maxVisible?: number;
}) {
  const insets = useSafeAreaInsets();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => setToasts([]), []);

  const toast = useCallback((message: string, options?: ToastOptions) => {
    const id = (toastId += 1);
    const item: ToastItem = {
      id,
      message,
      variant: options?.variant ?? 'default',
      action: options?.action,
      duration: options?.duration ?? 3500,
    };
    setToasts((prev) => [...prev.slice(-(maxVisible - 1)), item]);
    return id;
  }, [maxVisible]);

  const value = useMemo(() => ({ toast, dismiss, dismissAll }), [toast, dismiss, dismissAll]);

  return (
    <ToastContext.Provider value={value}>
      <View style={{ flex: 1 }}>
        {children}
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: position === 'top' ? insets.top + 8 : undefined,
            bottom: position === 'bottom' ? insets.bottom + 8 : undefined,
            alignItems: 'center',
            paddingHorizontal: 20,
            gap: 8,
          }}>
          {toasts.map((t) => (
            <ToastCard key={t.id} item={t} onDone={() => dismiss(t.id)} />
          ))}
        </View>
      </View>
    </ToastContext.Provider>
  );
}

const VARIANT_META: Record<ToastVariant, { bg: string; fg: string; bar: string }> = {
  default: { bg: '#1c1d20', fg: '#ffffff', bar: '#8b93a7' },
  success: { bg: '#0d2b1f', fg: '#ffffff', bar: '#3dd68c' },
  error: { bg: '#331114', fg: '#ffffff', bar: '#ff6369' },
  info: { bg: '#12233d', fg: '#ffffff', bar: '#3c87f7' },
};

function VariantIcon({ variant, color }: { variant: ToastVariant; color: string }) {
  switch (variant) {
    case 'success':
      return <Check size={17} color={color} strokeWidth={2.75} />;
    case 'error':
      return <TriangleAlert size={17} color={color} strokeWidth={2.25} />;
    case 'info':
      return <Info size={17} color={color} strokeWidth={2.25} />;
    default:
      return null;
  }
}

const SPRING_IN = { mass: 0.6, damping: 17, stiffness: 260 } as const;
const SWIPE_OFF = 96;

function ToastCard({ item, onDone }: { item: ToastItem; onDone: () => void }) {
  const reduceMotion = useReducedMotion();
  const ty = useSharedValue(reduceMotion ? 0 : 24);
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const dragX = useSharedValue(0);
  const leaving = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const leave = useCallback(
    (direction: number = 1) => {
      if (leaving.current) return;
      leaving.current = true;
      if (timer.current) clearTimeout(timer.current);
      if (reduceMotion) {
        onDone();
        return;
      }
      dragX.value = withTiming(direction * 320, { duration: 200, easing: Easing.in(Easing.ease) });
      opacity.value = withTiming(0, { duration: 200 }, (finished) => {
        if (finished) runOnJS(onDone)();
      });
    },
    [dragX, onDone, opacity, reduceMotion],
  );

  // Entrance.
  useEffect(() => {
    if (!reduceMotion) {
      ty.value = withSpring(0, SPRING_IN);
      opacity.value = withTiming(1, { duration: 200 });
    }
  }, [opacity, reduceMotion, ty]);

  // Auto-dismiss timer.
  useEffect(() => {
    if (item.duration <= 0) return;
    timer.current = setTimeout(() => leave(1), item.duration);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [item.duration, leave]);

  // Created once per `leave` identity; no ref access during render.
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderMove: (_, g) => {
          dragX.value = g.dx;
        },
        onPanResponderRelease: (_, g) => {
          if (Math.abs(g.dx) > SWIPE_OFF || Math.abs(g.vx) > 0.7) {
            leave(g.dx >= 0 ? 1 : -1);
          } else {
            dragX.value = withSpring(0, { mass: 0.5, damping: 16, stiffness: 300 });
          }
        },
        onPanResponderTerminate: () => {
          dragX.value = withSpring(0, { mass: 0.5, damping: 16, stiffness: 300 });
        },
      }),
    [dragX, leave],
  );

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: ty.value }, { translateX: dragX.value }],
  }));

  const meta = VARIANT_META[item.variant];

  return (
    <Animated.View
      {...responder.panHandlers}
      style={[
        cardStyle,
        {
          width: '100%',
          maxWidth: 420,
          borderRadius: 16,
          backgroundColor: meta.bg,
          borderLeftWidth: 3,
          borderLeftColor: meta.bar,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 6,
        },
      ]}>
      <View className="flex-row items-center gap-2.5 px-4 py-3.5">
        <VariantIcon variant={item.variant} color={meta.bar} />
        <Text className="flex-1 text-sm font-medium leading-5" style={{ color: meta.fg }} numberOfLines={3}>
          {item.message}
        </Text>
        {item.action ? (
          <Pressable
            onPress={() => {
              item.action?.onPress();
              leave(1);
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={item.action.label}>
            <Text className="text-sm font-bold" style={{ color: meta.bar }}>
              {item.action.label}
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={() => leave(1)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Dismiss notification"
          className="rounded-full p-1">
          <X size={14} color="#ffffffaa" strokeWidth={2.5} />
        </Pressable>
      </View>
    </Animated.View>
  );
}
