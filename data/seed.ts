import type {
  CampusBuilding,
  CampusIssue,
  CampusStatus,
  Notification,
  Preferences,
  Report,
  Service,
  User,
} from '@/types';

import {
  CAMPUS_BUILDINGS,
  CAMPUS_ISSUES,
  CAMPUS_SERVICES,
  decorateServices,
  deriveCampusStatus,
} from './campus';

/**
 * What the app starts with.
 *
 * The campus directory (blocks, teams, catalogue) is configuration and ships
 * with the app. Everything a student generates — reports, notifications,
 * open issues — starts empty and is written to this device as they use it,
 * so a fresh install never shows work that nobody filed. When the campus API
 * lands, this whole module is replaced by its first fetch.
 */
export interface SeedState {
  user: User;
  reports: Report[];
  notifications: Notification[];
  services: Service[];
  issues: CampusIssue[];
  buildings: CampusBuilding[];
  campus: CampusStatus;
  preferences: Preferences;
}

/** The unverified default. Sign-in replaces every field with the real one. */
const LOCAL_USER: User = {
  id: 'u-local',
  name: 'Student',
  degree: 'Not set',
  university: 'Not set',
  campusId: 'campus',
};

export function createSeedState(): SeedState {
  const issues = [...CAMPUS_ISSUES];

  return {
    user: LOCAL_USER,
    reports: [],
    notifications: [],
    services: decorateServices(CAMPUS_SERVICES, issues),
    issues,
    buildings: CAMPUS_BUILDINGS,
    campus: deriveCampusStatus(issues),
    preferences: {
      reportUpdates: true,
      campusAnnouncements: true,
      pushEnabled: true,
      haptics: true,
    },
  };
}

export { CATEGORIES, categoryMeta } from './catalog';
export { CAMPUS_BUILDINGS, CAMPUS_SERVICES, deriveCampusStatus, decorateServices } from './campus';
