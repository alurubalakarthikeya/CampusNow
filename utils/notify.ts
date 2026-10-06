import * as Notifications from 'expo-notifications';

/**
 * Local notifications are a bonus layer on top of the in-app notification
 * feed. Everything here is best-effort: the prototype must stay usable on
 * simulators and inside Expo Go where permissions may be unavailable.
 */
export function configureNotifications(): void {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: true,
      }),
    });
  } catch {
    // Notification handler unavailable — in-app feed still works.
  }
}

async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

export async function notifyLocally(title: string, body: string): Promise<boolean> {
  try {
    if (!(await ensurePermission())) return false;
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
    return true;
  } catch {
    return false;
  }
}
