import type { Notification, Preferences, Report, User } from '@/types';

/**
 * What a fresh install holds.
 *
 * Nothing here is sample content: the campus directory is configuration and
 * lives in `data/campus.ts`, while reports and the inbox are empty until the
 * student files something on this device. Sign-in replaces the placeholder
 * user with the verified identity a moment later.
 *
 * When this client is pointed at the campus server, the same shape comes
 * back from the API — the store is simply hydrated from a fetch instead.
 */
export interface LocalState {
  user: User;
  reports: Report[];
  notifications: Notification[];
  preferences: Preferences;
}

const PLACEHOLDER_USER: User = {
  id: 'local',
  name: 'Student',
  degree: '',
  university: '',
  campusId: '',
};

export function createInitialState(): LocalState {
  return {
    user: PLACEHOLDER_USER,
    reports: [],
    notifications: [],
    preferences: {
      // Notifications start in the app only: push is switched on when the
      // student agrees to it, and the switch reports the truth until then.
      reportUpdates: true,
      campusAnnouncements: true,
      pushEnabled: false,
      haptics: true,
    },
  };
}
