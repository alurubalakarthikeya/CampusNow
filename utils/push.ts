import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

/**
 * Real device notifications.
 *
 * CampusNow raises a notification in two places: the moment a report the
 * student follows changes stage, and whenever operations posts an update on
 * one of their reports. Both are delivered as system notifications — banner,
 * lock screen, notification centre — not as in-app banners, so the app
 * behaves like a native client even while it is closed.
 *
 * On the web there is no push channel, so every call here degrades to a
 * no-op and the in-app feed stays the source of truth.
 */

const TOKEN_KEY = 'campusnow/push-token-v1';
const CHANNEL_ID = 'campus-updates';

export type PushState = 'unsupported' | 'undetermined' | 'denied' | 'granted';

function supported(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

/** The channel Android needs before it will show anything. */
export async function configurePushChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Campus updates',
      description: 'Status changes on the reports you file and follow',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 220, 180, 220],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      showBadge: true,
    });
  } catch {
    // Channel already exists or the platform refused — pushes still attempt.
  }
}

/** What the app is allowed to do right now. */
export async function pushState(): Promise<PushState> {
  if (!supported()) return 'unsupported';
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return 'granted';
    return current.canAskAgain ? 'undetermined' : 'denied';
  } catch {
    return 'unsupported';
  }
}

async function deviceToken(): Promise<string | null> {
  const cached = await AsyncStorage.getItem(TOKEN_KEY).catch(() => null);
  if (cached) return cached;
  try {
    const token = await Notifications.getDevicePushTokenAsync();
    const value = typeof token.data === 'string' ? token.data : JSON.stringify(token.data);
    await AsyncStorage.setItem(TOKEN_KEY, value).catch(() => undefined);
    return value;
  } catch {
    return null;
  }
}

/** The token this device registered with, for the settings screen. */
export async function registeredToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY).catch(() => null);
}

export async function forgetToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY).catch(() => undefined);
}

/**
 * Asks for permission and registers the device. Called when the student
 * switches pushes on, never on first launch — an unprompted permission
 * dialog is the fastest way to be refused.
 */
export async function enablePush(): Promise<{ ok: boolean; reason?: string }> {
  if (!supported()) return { ok: false, reason: 'Push needs the iOS or Android build.' };
  try {
    await configurePushChannel();
    const current = await Notifications.getPermissionsAsync();
    if (!current.granted && !current.canAskAgain) {
      return { ok: false, reason: 'Notifications are switched off in system settings.' };
    }
    if (!current.granted) {
      const next = await Notifications.requestPermissionsAsync();
      if (!next.granted) return { ok: false, reason: 'Permission was declined.' };
    }
    await deviceToken();
    return { ok: true };
  } catch {
    return { ok: false, reason: 'This device could not register for push.' };
  }
}

export type PushInput = {
  title: string;
  body: string;
  reportId?: string;
  /** Badge count to display on the app icon */
  badge?: number;
};

/**
 * Delivers a system notification immediately. The prototype raises these
 * locally; the production build posts the same payload through the campus
 * push service, so the call sites do not change.
 */
export async function sendPush({ title, body, reportId, badge }: PushInput): Promise<boolean> {
  if (!supported()) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (!current.granted) return false;

    const content: Notifications.NotificationContentInput & { channelId?: string } = {
      title,
      body,
      sound: true,
      badge,
      data: { reportId: reportId ?? null },
    };
    // Android routes the notification through the channel that carries the
    // vibration pattern and lock-screen visibility.
    if (Platform.OS === 'android') content.channelId = CHANNEL_ID;

    await Notifications.scheduleNotificationAsync({ content, trigger: null });
    return true;
  } catch {
    return false;
  }
}

/** A quiet confirmation that the pipe works, from the settings screen. */
export async function sendTestPush(): Promise<{ ok: boolean; reason?: string }> {
  const ready = await enablePush();
  if (!ready.ok) return ready;
  const sent = await sendPush({
    title: 'CampusNow notifications are on',
    body: 'Status changes on the reports you file will arrive here, even when the app is closed.',
    badge: 1,
  });
  return sent ? { ok: true } : { ok: false, reason: 'We could not deliver the test notification.' };
}

/** Clears the badge after the student has read everything. */
export async function clearBadge(): Promise<void> {
  if (!supported()) return;
  try {
    await Notifications.setBadgeCountAsync(0);
  } catch {
    // Nothing to clear.
  }
}
