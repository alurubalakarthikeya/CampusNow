import { categoryMeta } from '@/data/mock/categories';
import { useAppStore, type NewReportInput } from '@/stores/appStore';
import type {
  CampusBuilding,
  CampusIssue,
  CampusPulse,
  CampusStatus,
  Notification,
  Report,
  ReportCategoryId,
  Service,
} from '@/types';

/**
 * CampusNow data facade.
 *
 * Right now every function resolves from the local seeded store, which is
 * why the whole prototype works offline with mock data. When the CampusNow
 * API (backed by ServiceNow) is ready, only the bodies below change:
 *
 *   await campusApi.listReports()  →  GET /api/reports
 *   await campusApi.createReport() →  POST /api/reports
 *
 * Screens never talk to storage directly, so no screen has to change.
 */

const resolve = <T>(value: T): Promise<T> => Promise.resolve(value);

function snapshot() {
  return useAppStore.getState();
}

export const campusApi = {
  async listReports(): Promise<Report[]> {
    return resolve(snapshot().reports);
  },

  async getReport(id: string): Promise<Report | null> {
    return resolve(snapshot().reports.find((report) => report.id === id) ?? null);
  },

  async listNotifications(): Promise<Notification[]> {
    return resolve(snapshot().notifications);
  },

  async listServices(): Promise<Service[]> {
    return resolve(snapshot().services);
  },

  async listBuildings(): Promise<CampusBuilding[]> {
    return resolve(snapshot().buildings);
  },

  async listIssues(): Promise<CampusIssue[]> {
    return resolve(snapshot().issues);
  },

  async getCampusStatus(): Promise<CampusStatus> {
    return resolve(snapshot().campus);
  },

  /** Everything the Campus Pulse screen needs, in one call. */
  async getCampusPulse(): Promise<CampusPulse> {
    const state = snapshot();
    return resolve({ status: state.campus, services: state.services, issues: state.issues });
  },

  async createReport(input: NewReportInput): Promise<Report> {
    return resolve(snapshot().createReport(input));
  },

  async followIssue(reportId: string): Promise<void> {
    return resolve(snapshot().followReport(reportId));
  },

  async confirmResolution(reportId: string): Promise<void> {
    return resolve(snapshot().confirmResolution(reportId));
  },

  async markAllNotificationsRead(): Promise<void> {
    return resolve(snapshot().markAllNotificationsRead());
  },

  async markNotificationRead(id: string): Promise<void> {
    return resolve(snapshot().markNotificationRead(id));
  },

  /**
   * Smart duplicate detection. In production this is a ranking call on the
   * backend; locally it matches the same category, then the same service,
   * and links the campus issue that is already tracking it.
   */
  async findDuplicate(
    categoryId: ReportCategoryId | null,
  ): Promise<{ report: Report; issue: CampusIssue | null } | null> {
    const { reports, issues } = snapshot();
    if (!categoryId) return resolve(null);

    const meta = categoryMeta(categoryId);
    const active = reports.filter((report) => report.status !== 'resolved');
    const report =
      active.find((candidate) => candidate.categoryId === categoryId) ??
      active.find((candidate) => candidate.serviceId === meta.serviceId);

    if (!report) return resolve(null);

    const issue =
      issues.find(
        (candidate) =>
          candidate.serviceId === report.serviceId && candidate.buildingId === report.location.buildingId,
      ) ??
      issues.find((candidate) => candidate.serviceId === report.serviceId) ??
      null;

    return resolve({ report, issue });
  },
};

export type CampusApi = typeof campusApi;
