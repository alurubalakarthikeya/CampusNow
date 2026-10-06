import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createSeedState, type SeedState } from '@/data/mock';
import type {
  CampusLocation,
  Notification,
  Preferences,
  Report,
  ReportCategoryId,
  Severity,
  User,
} from '@/types';
import { createId } from '@/utils/id';
import { categoryMeta } from '@/data/mock/categories';
import { LIFECYCLE, liveStageIndex, statusIndex } from '@/utils/status';

export interface NewReportInput {
  categoryId: ReportCategoryId;
  description: string;
  location: CampusLocation;
  severity?: Severity;
  photoUri?: string | null;
  affectedStudents?: number;
}

interface AppActions {
  /** Creates a report locally. The API call replaces this body later. */
  createReport: (input: NewReportInput) => Report;
  /**
   * Moves every live report on to the stage it has reached by now and
   * notifies on each transition. Driven by one interval in the root layout;
   * it returns the same state when there is nothing to move.
   */
  advanceLiveReports: () => void;
  /** Follows an existing issue instead of creating a duplicate report. */
  followReport: (reportId: string) => void;
  /** Student confirms that a resolved report actually works. */
  confirmResolution: (reportId: string) => void;
  /** The fix did not hold — send the report back to the team. */
  reopenReport: (reportId: string) => void;
  /** Edits the signed-in student's own details, kept on this device. */
  updateUser: (patch: Partial<Pick<User, 'name' | 'degree' | 'university' | 'campusId'>>) => void;
  setPreference: (key: keyof Preferences, value: boolean) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  /** Puts the prototype back to its seeded state. */
  resetDemoData: () => void;
}

export type AppState = SeedState & AppActions;

const MAX_NOTIFICATIONS = 40;

function pushNotification(notifications: Notification[], notification: Notification): Notification[] {
  return [notification, ...notifications].slice(0, MAX_NOTIFICATIONS);
}

function makeNotification(input: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification {
  return {
    ...input,
    id: createId('n'),
    createdAt: new Date().toISOString(),
    read: false,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...createSeedState(),

      createReport: (input) => {
        const meta = categoryMeta(input.categoryId);
        const now = new Date().toISOString();
        const report: Report = {
          id: createId('r'),
          title: meta.title,
          categoryId: input.categoryId,
          serviceId: meta.serviceId,
          status: 'reported',
          severity: input.severity ?? 'medium',
          location: input.location,
          description: input.description.trim(),
          createdAt: now,
          updatedAt: now,
          affectedStudents: input.affectedStudents ?? 1,
          followed: true,
          photoUri: input.photoUri ?? undefined,
          // Filed from this device: its lifecycle is tracked live.
          live: true,
        };

        set((state) => ({
          reports: [report, ...state.reports],
          notifications: pushNotification(
            state.notifications,
            makeNotification({
              kind: 'update',
              title: `${meta.label} report submitted`,
              body: `We sent your ${meta.label.toLowerCase()} report to ${report.location.buildingName}. Track its stage live from the report screen.`,
              reportId: report.id,
            }),
          ),
        }));

        return report;
      },

      advanceLiveReports: () =>
        set((state) => {
          const now = Date.now();
          const fresh: Notification[] = [];

          const reports = state.reports.map((report) => {
            if (!report.live || report.status === 'resolved') return report;

            const step = LIFECYCLE[liveStageIndex(report, now)] ?? LIFECYCLE[0];
            if (statusIndex(step.status) <= statusIndex(report.status)) return report;

            fresh.push(
              makeNotification({
                kind: step.status === 'resolved' ? 'resolved' : 'update',
                title: step.status === 'resolved' ? 'Your report was resolved' : `${step.label} · ${report.title}`,
                body: `${report.location.buildingName} — ${step.caption.toLowerCase()}.`,
                reportId: report.id,
              }),
            );

            return { ...report, status: step.status, updatedAt: new Date().toISOString() };
          });

          // Returning the same state keeps this a no-op between transitions.
          if (fresh.length === 0) return state;

          return {
            reports,
            notifications: fresh.reduceRight(pushNotification, state.notifications),
          };
        }),

      followReport: (reportId) => {
        const existing = get().reports.find((report) => report.id === reportId);
        if (!existing) return;
        if (existing.followed) return;

        set((state) => ({
          reports: state.reports.map((report) =>
            report.id === reportId ? { ...report, followed: true } : report,
          ),
          notifications: pushNotification(
            state.notifications,
            makeNotification({
              kind: 'merge',
              title: 'You are following this issue',
              body: `We will notify you when ${existing.title.toLowerCase()} in ${existing.location.buildingName} changes.`,
              reportId,
            }),
          ),
        }));
      },

      confirmResolution: (reportId) => {
        const now = new Date().toISOString();
        set((state) => ({
          reports: state.reports.map((report) =>
            report.id === reportId
              ? { ...report, status: 'resolved', resolutionConfirmed: true, live: undefined, updatedAt: now }
              : report,
          ),
          notifications: pushNotification(
            state.notifications,
            makeNotification({
              kind: 'resolved',
              title: 'Thanks for confirming',
              body: 'We closed this report and shared your confirmation with the operations team.',
              reportId,
            }),
          ),
        }));
      },

      reopenReport: (reportId) => {
        const now = new Date().toISOString();
        set((state) => ({
          reports: state.reports.map((report) =>
            report.id === reportId
              ? {
                  ...report,
                  status: 'investigating',
                  resolutionConfirmed: false,
                  // Reopened manually — the demo clock stops and the stored
                  // status becomes the source of truth again.
                  live: undefined,
                  updatedAt: now,
                }
              : report,
          ),
          notifications: pushNotification(
            state.notifications,
            makeNotification({
              kind: 'update',
              title: 'Report reopened',
              body: 'We sent this back to the team and will keep you posted here.',
              reportId,
            }),
          ),
        }));
      },

      updateUser: (patch) =>
        set((state) => ({
          user: {
            ...state.user,
            ...patch,
            name: (patch.name ?? state.user.name).trim() || state.user.name,
          },
        })),

      setPreference: (key, value) =>
        set((state) => ({ preferences: { ...state.preferences, [key]: value } })),

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification,
          ),
        })),

      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.read ? notification : { ...notification, read: true },
          ),
        })),

      resetDemoData: () => set(() => createSeedState()),
    }),
    {
      name: 'campusnow/store-v1',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        reports: state.reports,
        notifications: state.notifications,
        services: state.services,
        issues: state.issues,
        buildings: state.buildings,
        campus: state.campus,
        preferences: state.preferences,
      }),
    },
  ),
);
