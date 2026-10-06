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

import { MOCK_BUILDINGS, MOCK_ISSUES, MOCK_SERVICES, MOCK_USER, createMockCampusStatus } from './campus';
import { createMockNotifications } from './notifications';
import { createMockReports } from './reports';

/** Everything the local data layer starts with on a fresh install. */
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

export function createSeedState(): SeedState {
  return {
    user: MOCK_USER,
    reports: createMockReports(),
    notifications: createMockNotifications(),
    services: MOCK_SERVICES,
    issues: MOCK_ISSUES,
    buildings: MOCK_BUILDINGS,
    campus: createMockCampusStatus(),
    preferences: { reportUpdates: true, campusAnnouncements: true },
  };
}

export { CATEGORIES, categoryMeta } from './categories';
export { MOCK_BUILDINGS, MOCK_ISSUES, MOCK_SERVICES, MOCK_USER } from './campus';
