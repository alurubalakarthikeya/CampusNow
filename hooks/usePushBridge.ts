import { useEffect, useRef } from 'react';

import { useAppStore } from '@/stores/appStore';
import { sendPush } from '@/utils/push';

/**
 * Bridges the in-app feed to the device notification channel.
 *
 * A status change is written to the inbox the moment it is recorded, so this
 * hook only has to notice what arrived while the app is running and let the
 * system deliver the same entry as a notification — banner, lock screen,
 * notification centre. The feed stays the source of truth; on the web, where
 * there is no push channel, `sendPush` is a no-op.
 */
export function usePushBridge() {
  const newest = useAppStore((state) => state.notifications[0]);
  const pushEnabled = useAppStore((state) => state.preferences.pushEnabled);
  const unread = useAppStore((state) =>
    state.notifications.reduce((count, notification) => count + (notification.read ? 0 : 1), 0),
  );

  // Whatever was already in the feed when the app opened has been seen.
  const seen = useRef<string | null>(null);

  useEffect(() => {
    if (!newest) return;
    if (seen.current === null) {
      seen.current = newest.id;
      return;
    }
    if (seen.current === newest.id) return;
    seen.current = newest.id;

    if (!pushEnabled) return;
    void sendPush({
      title: newest.title,
      body: newest.body,
      reportId: newest.reportId,
      badge: unread,
    });
  }, [newest, pushEnabled, unread]);
}
