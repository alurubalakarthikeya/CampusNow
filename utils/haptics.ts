import * as Haptics from 'expo-haptics';

/**
 * Haptics are a nice-to-have: every call is fire-and-forget and silently
 * ignored on devices or simulators that cannot vibrate.
 */
function run(action: () => Promise<void>) {
  try {
    void action().catch(() => undefined);
  } catch {
    // Haptics unavailable on this platform — intentionally ignored.
  }
}

export const haptics = {
  tap: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  select: () => run(() => Haptics.selectionAsync()),
  press: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
};
