/*
 * The react-hooks/immutability and set-state-in-effect rules misfire here:
 * Reanimated shared values are designed to be reassigned (including inside
 * gesture worklets and the open/close effect), and mounting the Modal on the
 * `visible` transition legitimately needs a state flip in an effect so the exit
 * animation can play before unmount.
 */
/* eslint-disable react-hooks/immutability, react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/ui/lib/cn';

export interface SlideSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  /** Hide the drag handle grabber. */
  hideHandle?: boolean;
  className?: string;
}

const OPEN_SPRING = { damping: 22, stiffness: 220, mass: 0.7 };
const DISMISS_VELOCITY = 800;
const DISMISS_DISTANCE = 120;

/**
 * A bottom-sheet modal. It snaps to its content height, animates up over a
 * fading backdrop, and dismisses on backdrop tap or a downward drag — the drag
 * is the bold choice: the sheet tracks your finger 1:1 and flings away on a
 * fast swipe. Ships its own `GestureHandlerRootView` so it works even if the
 * app root doesn't have one.
 */
export function SlideSheet({
  visible,
  onClose,
  title,
  children,
  hideHandle = false,
  className,
}: SlideSheetProps) {
  const { height: winH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const translateY = useSharedValue(winH);
  const [render, setRender] = useState(visible);

  const finishClose = useCallback(() => {
    setRender(false);
    onClose();
  }, [onClose]);

  const requestClose = useCallback(() => {
    translateY.value = withTiming(
      winH,
      { duration: reduceMotion ? 0 : 220 },
      (fin) => fin && runOnJS(finishClose)(),
    );
  }, [finishClose, reduceMotion, translateY, winH]);

  useEffect(() => {
    if (visible) {
      setRender(true);
      translateY.value = reduceMotion ? 0 : withSpring(0, OPEN_SPRING);
    } else if (render) {
      requestClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_DISTANCE || e.velocityY > DISMISS_VELOCITY) {
        runOnJS(requestClose)();
      } else {
        translateY.value = withSpring(0, OPEN_SPRING);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, winH], [1, 0], 'clamp'),
  }));

  if (!render) return null;

  return (
    <Modal transparent visible={render} onRequestClose={requestClose} statusBarTranslucent>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1 justify-end">
          <Animated.View style={backdropStyle} className="absolute inset-0 bg-black/50">
            <Pressable
              className="flex-1"
              accessibilityRole="button"
              accessibilityLabel="Close sheet"
              onPress={requestClose}
            />
          </Animated.View>

          <GestureDetector gesture={pan}>
            <Animated.View
              style={[sheetStyle, { paddingBottom: insets.bottom + 16, maxHeight: winH * 0.9 }]}
              accessibilityViewIsModal
              className={cn('rounded-t-[28px] border-t border-border bg-background px-5 pt-3', className)}>
              {!hideHandle ? (
                <View className="mb-3 items-center">
                  <View className="h-1.5 w-10 rounded-full bg-border" />
                </View>
              ) : null}
              {title ? (
                <Text className="mb-3 text-lg font-semibold text-foreground">{title}</Text>
              ) : null}
              {children}
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
