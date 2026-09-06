import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Check, ImagePlus, RotateCcw, X } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View, type ViewProps } from 'react-native';

import { cn } from '@/ui/lib/cn';
import { useAccent } from '@/ui/lib/customization';
import { useThemeColors } from '@/ui/lib/theme';
import { Progress } from './progress';

export type UploadStatus = 'pending' | 'uploading' | 'done' | 'error';

export interface UploadFile {
  id: string;
  uri: string;
  name: string;
  /** Bytes, when reported by the picker. */
  size?: number;
  status: UploadStatus;
  /** 0–100. */
  progress: number;
  error?: string;
}

export interface ImageUploaderProps extends ViewProps {
  /** Max files in the queue. @default 5 */
  maxFiles?: number;
  /** Files larger than this are rejected into an error state. @default 10 (MB) */
  maxSizeMB?: number;
  /** Start the (simulated) upload as soon as files are picked. @default true */
  autoUpload?: boolean;
  /** Show a camera capture button next to the picker. @default true */
  allowCamera?: boolean;
  /** Picker compression quality 0–1. @default 0.8 */
  quality?: number;
  /**
   * Chance (0–1) a simulated upload fails, so error + retry states are
   * demonstrable. Real apps pass their own uploader instead. @default 0
   */
  simulateFailureRate?: number;
  /**
   * Accent for progress bars and actions. Tip: pass `useAccent()` /
   * `resolvedAccent` for a live-themed uploader.
   */
  color?: string;
  label?: string;
  helperText?: string;
  className?: string;
  onFilesChange?: (files: UploadFile[]) => void;
}

function formatSize(bytes?: number): string {
  if (bytes == null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

let idCounter = 0;
const nextId = () => `upload-${Date.now()}-${(idCounter += 1)}`;

/**
 * Image picker + upload queue with per-file progress. Files are chosen with
 * the system UI (`expo-image-picker`, library + camera), previewed as
 * thumbnails, and each runs an animated progress bar to done — oversized
 * files land in an error state with retry/remove. Swap the simulation for a
 * real uploader by driving `progress`/`status` from your own `onFilesChange`.
 */
export function ImageUploader({
  maxFiles = 5,
  maxSizeMB = 10,
  autoUpload = true,
  allowCamera = true,
  quality = 0.8,
  simulateFailureRate = 0,
  color: colorProp,
  label = 'Photos',
  helperText,
  className,
  onFilesChange,
  ...rest
}: ImageUploaderProps) {
  const colors = useThemeColors();
  const accent = useAccent(colorProp);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const timers = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  useEffect(() => () => {
    Object.values(timers.current).forEach(clearInterval);
  }, []);

  useEffect(() => {
    onFilesChange?.(files);
  }, [files, onFilesChange]);

  const patchFile = useCallback((id: string, patch: Partial<UploadFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }, []);

  const runUpload = useCallback(
    (file: UploadFile) => {
      if (timers.current[file.id]) clearInterval(timers.current[file.id]);
      patchFile(file.id, { status: 'uploading', error: undefined });
      timers.current[file.id] = setInterval(() => {
        setFiles((prev) => {
          const target = prev.find((f) => f.id === file.id);
          if (!target || target.status !== 'uploading') {
            clearInterval(timers.current[file.id]);
            return prev;
          }
          const step = 6 + Math.random() * 10;
          const next = Math.min(100, target.progress + step);
          if (next >= 100) {
            clearInterval(timers.current[file.id]);
            const failed = Math.random() < simulateFailureRate;
            return prev.map((f) =>
              f.id === file.id
                ? {
                    ...f,
                    progress: failed ? f.progress : 100,
                    status: failed ? 'error' : 'done',
                    error: failed ? 'Upload failed — tap retry.' : undefined,
                  }
                : f,
            );
          }
          return prev.map((f) => (f.id === file.id ? { ...f, progress: next } : f));
        });
      }, 130);
    },
    [patchFile, simulateFailureRate],
  );

  const addAssets = useCallback(
    (assets: ImagePicker.ImagePickerAsset[]) => {
      setFiles((prev) => {
        const room = Math.max(0, maxFiles - prev.length);
        const picked = assets.slice(0, room);
        if (assets.length > room) {
          setNotice(`Only ${maxFiles} files allowed — extras skipped.`);
        }
        const next: UploadFile[] = picked.map((a, i) => {
          const tooBig = a.fileSize != null && a.fileSize > maxSizeMB * 1024 * 1024;
          return {
            id: nextId() + `-${i}`,
            uri: a.uri,
            name: a.fileName ?? `Photo ${prev.length + i + 1}`,
            size: a.fileSize ?? undefined,
            status: tooBig ? 'error' : 'pending',
            progress: 0,
            error: tooBig ? `Over ${maxSizeMB} MB limit.` : undefined,
          };
        });
        const merged = [...prev, ...next];
        if (autoUpload) {
          next
            .filter((f) => f.status === 'pending')
            .forEach((f) => setTimeout(() => runUpload({ ...f, status: 'pending', progress: 0 }), 60));
        }
        return merged;
      });
    },
    [autoUpload, maxFiles, maxSizeMB, runUpload],
  );

  const pickFromLibrary = useCallback(async () => {
    setNotice(null);
    setBusy(true);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setNotice('Photo access denied — enable it in Settings to pick images.');
        return;
      }
      const remaining = maxFiles - files.length;
      if (remaining <= 0) {
        setNotice(`Only ${maxFiles} files allowed.`);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        quality,
      });
      if (!result.canceled) addAssets(result.assets);
    } finally {
      setBusy(false);
    }
  }, [addAssets, files.length, maxFiles, quality]);

  const takePhoto = useCallback(async () => {
    setNotice(null);
    setBusy(true);
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        setNotice('Camera access denied — enable it in Settings to take photos.');
        return;
      }
      if (files.length >= maxFiles) {
        setNotice(`Only ${maxFiles} files allowed.`);
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ quality });
      if (!result.canceled) addAssets(result.assets);
    } finally {
      setBusy(false);
    }
  }, [addAssets, files.length, maxFiles, quality]);

  const removeFile = useCallback((id: string) => {
    if (timers.current[id]) clearInterval(timers.current[id]);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const retryFile = useCallback(
    (file: UploadFile) => {
      patchFile(file.id, { progress: 0, error: undefined });
      runUpload({ ...file, progress: 0 });
    },
    [patchFile, runUpload],
  );

  const done = files.filter((f) => f.status === 'done').length;
  const active = files.filter((f) => f.status === 'uploading' || f.status === 'pending');
  const overall =
    files.length === 0 ? 0 : Math.round(files.reduce((s, f) => s + f.progress, 0) / files.length);
  const full = files.length >= maxFiles;

  return (
    <View className={cn('w-full gap-3', className)} {...rest}>
      {label ? <Text className="text-sm font-medium text-foreground">{label}</Text> : null}

      {/* Dropzone */}
      <View className="flex-row gap-2">
        <Pressable
          onPress={pickFromLibrary}
          disabled={busy || full}
          accessibilityRole="button"
          accessibilityLabel="Pick photos from library"
          className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card px-4 py-5 active:opacity-70"
          style={{ opacity: busy || full ? 0.5 : 1 }}>
          <ImagePlus size={20} color={full ? colors.mutedForeground : accent} />
          <View className="gap-0.5">
            <Text className="text-sm font-semibold text-foreground">
              {full ? 'Queue full' : busy ? 'Opening…' : 'Add photos'}
            </Text>
            <Text className="text-xs text-muted-foreground">
              {files.length} of {maxFiles} · up to {maxSizeMB} MB each
            </Text>
          </View>
        </Pressable>
        {allowCamera ? (
          <Pressable
            onPress={takePhoto}
            disabled={busy || full}
            accessibilityRole="button"
            accessibilityLabel="Take a photo"
            className="w-[68px] items-center justify-center rounded-2xl border border-border bg-card active:opacity-70"
            style={{ opacity: busy || full ? 0.5 : 1 }}>
            <Camera size={20} color={colors.foreground} />
            <Text className="mt-1 text-[11px] font-medium text-muted-foreground">Camera</Text>
          </Pressable>
        ) : null}
      </View>

      {notice ? <Text className="text-xs leading-4 text-warning">{notice}</Text> : null}
      {helperText && !notice ? (
        <Text className="text-xs leading-4 text-muted-foreground">{helperText}</Text>
      ) : null}

      {/* Overall progress */}
      {files.length > 0 ? (
        <View className="gap-1.5">
          <View className="flex-row items-center justify-between">
            <Text className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {active.length > 0 ? `Uploading… ${overall}%` : `${done} of ${files.length} done`}
            </Text>
            <Text className="font-mono text-[10px] text-muted-foreground">{overall}%</Text>
          </View>
          <Progress value={overall} size="sm" color={accent} />
        </View>
      ) : null}

      {/* Thumbnails */}
      {files.length > 0 ? (
        <View className="flex-row flex-wrap gap-2">
          {files.map((file) => (
            <UploadTile
              key={file.id}
              file={file}
              accent={accent}
              onRemove={() => removeFile(file.id)}
              onRetry={() => retryFile(file)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function UploadTile({
  file,
  accent,
  onRemove,
  onRetry,
}: {
  file: UploadFile;
  accent: string;
  onRemove: () => void;
  onRetry: () => void;
}) {
  const colors = useThemeColors();
  const uploading = file.status === 'uploading' || file.status === 'pending';
  const failed = file.status === 'error';
  const complete = file.status === 'done';

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`${file.name}, ${file.status} ${Math.round(file.progress)} percent`}
      className="overflow-hidden rounded-2xl border border-border bg-card"
      style={{ width: 104 }}>
      <View>
        <Image
          source={file.uri}
          style={{ width: 104, height: 84 }}
          contentFit="cover"
          transition={200}
        />
        {uploading ? (
          <View
            className="absolute inset-0 items-center justify-center"
            style={{ backgroundColor: '#00000055' }}>
            <Text className="text-sm font-bold tabular-nums text-white">
              {Math.round(file.progress)}%
            </Text>
          </View>
        ) : null}
        {complete ? (
          <View
            className="absolute right-1.5 top-1.5 h-5 w-5 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.success }}>
            <Check size={12} color="#fff" strokeWidth={3} />
          </View>
        ) : null}
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${file.name}`}
          className="absolute left-1.5 top-1.5 h-5 w-5 items-center justify-center rounded-full bg-black/60">
          <X size={12} color="#fff" strokeWidth={2.5} />
        </Pressable>
      </View>
      <View className="gap-1 px-2 py-1.5">
        <Text className="text-[11px] font-medium text-foreground" numberOfLines={1}>
          {file.name}
        </Text>
        <Text className="font-mono text-[9px] text-muted-foreground" numberOfLines={1}>
          {formatSize(file.size)}
        </Text>
        {uploading ? (
          <Progress value={file.progress} size="xs" color={accent} />
        ) : failed ? (
          <Pressable
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel={`Retry ${file.name}`}
            className="flex-row items-center gap-1">
            <RotateCcw size={11} color={colors.destructive} />
            <Text className="text-[11px] font-semibold text-destructive">Retry</Text>
          </Pressable>
        ) : (
          <Text className="text-[11px] font-semibold text-success">Done</Text>
        )}
      </View>
      {failed && file.error ? (
        <Text className="px-2 pb-1.5 text-[10px] leading-3 text-destructive" numberOfLines={2}>
          {file.error}
        </Text>
      ) : null}
    </View>
  );
}
