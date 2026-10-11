import { Alert, Platform } from 'react-native';

/**
 * Confirmation for an action that cannot be undone.
 *
 * React Native's `Alert` is a no-op on the web, which would make a delete
 * silently do nothing in the web preview. This helper uses the platform's own
 * dialog where one exists and the browser's `confirm` on the web, so a
 * destructive action always asks first — and only ever runs after a yes.
 */
export function confirmDestructive(options: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
}): void {
  const { title, message, confirmLabel, onConfirm } = options;

  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    const accepted = typeof window !== 'undefined' && typeof window.confirm === 'function'
      ? window.confirm(`${title}\n\n${message}`)
      : false;
    if (accepted) void onConfirm();
    return;
  }

  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    {
      text: confirmLabel,
      style: 'destructive',
      onPress: () => {
        void onConfirm();
      },
    },
  ]);
}
