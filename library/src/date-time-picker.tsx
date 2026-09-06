import RNDateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Clock, Minus, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Pressable, Text, View, type ViewProps } from 'react-native';

import { cn } from '@/ui/lib/cn';
import { useAccent } from '@/ui/lib/customization';
import { Button } from './button';
import { Dialog, DialogFooter, DialogHeader } from './dialog';

export type DateTimePickerMode = 'date' | 'time' | 'datetime';

export interface DateTimePickerFieldProps extends ViewProps {
  /** Controlled date. */
  value?: Date;
  /** Uncontrolled initial date. @default now */
  defaultValue?: Date;
  onChange?: (date: Date) => void;
  /** @default 'date' */
  mode?: DateTimePickerMode;
  label?: string;
  helperText?: string;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  /**
   * Accent driving the field icon and the native picker's `accentColor`.
   * Tip: pass `useAccent()` / `resolvedAccent` for a live-themed field.
   */
  color?: string;
  /** Custom display text. Defaults to locale date / time strings. */
  format?: (date: Date, mode: DateTimePickerMode) => string;
  disabled?: boolean;
  className?: string;
}

function defaultFormat(date: Date, mode: DateTimePickerMode): string {
  if (mode === 'time') return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (mode === 'datetime')
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} · ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Themed date/time field around the native picker (`@react-native-community/datetimepicker`).
 * The field matches `Input` styling; on iOS/web the spinner lives in a
 * themed `Dialog` with Cancel/Done, on Android the system dialog opens
 * directly (`datetime` chains date → time).
 *
 * ```tsx
 * const [birthday, setBirthday] = useState(new Date(2000, 0, 1));
 * <DateTimePickerField label="Birthday" value={birthday} onChange={setBirthday} maximumDate={new Date()} />
 * <DateTimePickerField label="Alarm" mode="time" value={alarm} onChange={setAlarm} />
 * ```
 */
export function DateTimePickerField({
  value,
  defaultValue,
  onChange,
  mode = 'date',
  label,
  helperText,
  placeholder = 'Select',
  minimumDate,
  maximumDate,
  color: colorProp,
  format,
  disabled,
  className,
  ...rest
}: DateTimePickerFieldProps) {
  const accent = useAccent(colorProp);
  const [inner, setInner] = useState(defaultValue ?? new Date());
  const [open, setOpen] = useState(false);
  // Draft for the iOS dialog (confirm/cancel); Android commits immediately.
  const [draft, setDraft] = useState<Date | null>(null);
  // Android `datetime` step: pick date first, then time.
  const [androidStep, setAndroidStep] = useState<'date' | 'time'>('date');

  const current = value ?? inner;
  const Icon = mode === 'time' ? Clock : Calendar;

  const commit = (date: Date) => {
    if (value == null) setInner(date);
    onChange?.(date);
  };

  const openPicker = () => {
    if (disabled) return;
    setDraft(current);
    setAndroidStep('date');
    setOpen(true);
  };

  const handleAndroidChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === 'dismissed') {
      setOpen(false);
      return;
    }
    if (!selected) {
      setOpen(false);
      return;
    }
    if (mode === 'datetime' && androidStep === 'date') {
      // Keep the date, move to the time step with the same day.
      const merged = new Date(current);
      merged.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
      if (value == null) setInner(merged);
      setDraft(merged);
      setAndroidStep('time');
      return;
    }
    if (mode === 'datetime') {
      const merged = new Date(draft ?? current);
      merged.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      commit(merged);
    } else {
      commit(selected);
    }
    setOpen(false);
  };

  const display = format ? format(current, mode) : defaultFormat(current, mode);

  return (
    <View className={cn('w-full gap-1.5', className)} {...rest}>
      {label ? <Text className="px-0.5 text-sm font-medium text-foreground">{label}</Text> : null}

      <Pressable
        onPress={openPicker}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label ? `Pick ${label}, current ${display}` : `Pick, current ${display}`}
        className="h-12 flex-row items-center gap-2.5 rounded-2xl border border-border bg-background px-3.5 active:opacity-70"
        style={{ opacity: disabled ? 0.55 : 1 }}>
        <Icon size={18} color={accent} strokeWidth={2} />
        <Text className="flex-1 text-[16px] text-foreground">{display || placeholder}</Text>
        <ChevronDown size={16} color={accent} />
      </Pressable>

      {helperText ? (
        <Text className="px-0.5 text-xs text-muted-foreground">{helperText}</Text>
      ) : null}

      {/* Android renders the system dialog directly. */}
      {open && Platform.OS === 'android' ? (
        <RNDateTimePicker
          value={draft ?? current}
          mode={mode === 'datetime' ? androidStep : mode}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          accentColor={accent}
          onChange={handleAndroidChange}
        />
      ) : null}

      {/* iOS gets the native spinner inside a themed dialog. */}
      {Platform.OS === 'ios' ? (
        <Dialog visible={open} onClose={() => setOpen(false)} size="sm">
          <DialogHeader
            icon={Icon}
            iconColor={accent}
            title={mode === 'time' ? 'Pick a time' : mode === 'datetime' ? 'Pick date & time' : 'Pick a date'}
          />
          <View className="items-center">
            <RNDateTimePicker
              value={draft ?? current}
              mode={mode}
              display="spinner"
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              accentColor={accent}
              onChange={(_, selected) => {
                if (selected) setDraft(selected);
              }}
              style={{ width: '100%' }}
            />
          </View>
          <ConfirmBar
            accent={accent}
            onCancel={() => setOpen(false)}
            onDone={() => {
              if (draft) commit(draft);
              setOpen(false);
            }}
          />
        </Dialog>
      ) : null}

      {/* Web has no native picker — a custom calendar/time UI in the same dialog. */}
      {Platform.OS === 'web' ? (
        <Dialog visible={open} onClose={() => setOpen(false)} size="sm">
          <DialogHeader
            icon={Icon}
            iconColor={accent}
            title={mode === 'time' ? 'Pick a time' : mode === 'datetime' ? 'Pick date & time' : 'Pick a date'}
          />
          <WebFallback
            draft={draft ?? current}
            mode={mode}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            accent={accent}
            onPick={setDraft}
          />
          <ConfirmBar
            accent={accent}
            onCancel={() => setOpen(false)}
            onDone={() => {
              if (draft) commit(draft);
              setOpen(false);
            }}
          />
        </Dialog>
      ) : null}
    </View>
  );
}

function ConfirmBar({
  accent,
  onCancel,
  onDone,
}: {
  accent: string;
  onCancel: () => void;
  onDone: () => void;
}) {
  return (
    <DialogFooter>
      <Button label="Cancel" variant="ghost" className="flex-1" onPress={onCancel} />
      <Button label="Done" className="flex-1" color={accent} onPress={onDone} />
    </DialogFooter>
  );
}

/* -------------------------------------------------------------------------- */
/* Web fallback: custom month calendar + time steppers (no native picker web)  */
/* -------------------------------------------------------------------------- */

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function stripTime(d: Date): number {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c.getTime();
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function WebFallback({
  draft,
  mode,
  minimumDate,
  maximumDate,
  accent,
  onPick,
}: {
  draft: Date;
  mode: DateTimePickerMode;
  minimumDate?: Date;
  maximumDate?: Date;
  accent: string;
  onPick: (d: Date) => void;
}) {
  const [viewYear, setViewYear] = useState(draft.getFullYear());
  const [viewMonth, setViewMonth] = useState(draft.getMonth());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const cells: (number | null)[] = [
    ...Array<null>(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const shiftMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const pickDay = (day: number) => {
    const next = new Date(draft);
    next.setFullYear(viewYear, viewMonth, day);
    onPick(next);
  };

  const inRange = (day: number) => {
    const t = new Date(viewYear, viewMonth, day).getTime();
    if (minimumDate && t < stripTime(minimumDate)) return false;
    if (maximumDate && t > stripTime(maximumDate)) return false;
    return true;
  };

  return (
    <View className="gap-4">
      {mode !== 'time' ? (
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => shiftMonth(-1)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              className="h-8 w-8 items-center justify-center rounded-full active:opacity-60">
              <ChevronLeft size={17} color={accent} />
            </Pressable>
            <Text className="text-[15px] font-bold text-foreground">
              {MONTHS[viewMonth]} {viewYear}
            </Text>
            <Pressable
              onPress={() => shiftMonth(1)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Next month"
              className="h-8 w-8 items-center justify-center rounded-full active:opacity-60">
              <ChevronRight size={17} color={accent} />
            </Pressable>
          </View>
          <View className="flex-row">
            {WEEKDAYS.map((w, i) => (
              <Text
                key={i}
                className="flex-1 text-center font-mono text-[10px] font-bold uppercase text-muted-foreground">
                {w}
              </Text>
            ))}
          </View>
          <View className="flex-row flex-wrap">
            {cells.map((day, i) =>
              day === null ? (
                <View key={`b-${i}`} className="w-[14.28%] items-center py-1" />
              ) : (
                (() => {
                  const selected = sameDay(draft, new Date(viewYear, viewMonth, day));
                  const enabled = inRange(day);
                  return (
                    <View key={day} className="w-[14.28%] items-center py-0.5">
                      <Pressable
                        onPress={() => pickDay(day)}
                        disabled={!enabled}
                        accessibilityRole="button"
                        accessibilityLabel={`${MONTHS[viewMonth]} ${day}`}
                        accessibilityState={{ selected, disabled: !enabled }}
                        className="h-9 w-9 items-center justify-center rounded-full active:opacity-70"
                        style={{
                          backgroundColor: selected ? accent : 'transparent',
                          opacity: enabled ? 1 : 0.3,
                        }}>
                        <Text
                          className={cn(
                            'text-sm tabular-nums',
                            selected ? 'font-bold text-white' : 'text-foreground',
                          )}>
                          {day}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })()
              ),
            )}
          </View>
        </View>
      ) : null}
      {mode !== 'date' ? (
        <TimeSteppers draft={draft} accent={accent} onPick={onPick} />
      ) : null}
    </View>
  );
}

function TimeSteppers({
  draft,
  accent,
  onPick,
}: {
  draft: Date;
  accent: string;
  onPick: (d: Date) => void;
}) {
  const h24 = draft.getHours();
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 || 12;
  const minute = draft.getMinutes();

  const setTime = (nextH12: number, nextMin: number, nextAmpm: 'AM' | 'PM') => {
    const next = new Date(draft);
    next.setHours((nextH12 % 12) + (nextAmpm === 'PM' ? 12 : 0), nextMin, 0, 0);
    onPick(next);
  };

  const unit = (label: string, display: string, onMinus: () => void, onPlus: () => void) => (
    <View className="flex-1 items-center gap-1">
      <Text className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Text>
      <View className="flex-row items-center gap-1">
        <Pressable
          onPress={onMinus}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
          className="h-7 w-7 items-center justify-center rounded-full border border-border active:opacity-60">
          <Minus size={13} color={accent} />
        </Pressable>
        <Text className="w-9 text-center text-lg font-bold tabular-nums text-foreground">
          {display}
        </Text>
        <Pressable
          onPress={onPlus}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
          className="h-7 w-7 items-center justify-center rounded-full border border-border active:opacity-60">
          <Plus size={13} color={accent} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View className="flex-row items-start justify-center gap-1 rounded-2xl border border-border bg-background px-2 py-3">
      {unit('Hour', String(h12).padStart(2, '0'),
        () => setTime(h12 - 1 < 1 ? 12 : h12 - 1, minute, ampm),
        () => setTime(h12 + 1 > 12 ? 1 : h12 + 1, minute, ampm))}
      <Text className="pt-6 text-lg font-bold text-muted-foreground">:</Text>
      {unit('Min', String(minute).padStart(2, '0'),
        () => setTime(h12, (minute + 59) % 60, ampm),
        () => setTime(h12, (minute + 1) % 60, ampm))}
      <View className="flex-1 items-center gap-1">
        <Text className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          AM/PM
        </Text>
        <Pressable
          onPress={() => setTime(h12, minute, ampm === 'AM' ? 'PM' : 'AM')}
          accessibilityRole="button"
          accessibilityLabel="Toggle AM PM"
          className="h-9 justify-center rounded-full px-4 active:opacity-70"
          style={{ backgroundColor: `${accent}1a` }}>
          <Text className="text-sm font-bold" style={{ color: accent }}>
            {ampm}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
