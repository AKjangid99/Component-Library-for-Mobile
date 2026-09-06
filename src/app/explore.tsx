import { DocsShell } from '@/docs/docs-shell';
import { ToastProvider } from '@/ui';

export default function ComponentsScreen() {
  return (
    <ToastProvider position="bottom">
      <DocsShell />
    </ToastProvider>
  );
}
