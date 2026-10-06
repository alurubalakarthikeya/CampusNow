import { useMemo } from 'react';

import { useAppStore } from '@/stores/appStore';
import type { ReportFilter } from '@/types';
import { filterReports, reportCounts } from '@/utils/status';

/**
 * Read hooks. Each one subscribes to a single slice of the store, so when
 * the mock store is replaced by API responses these calls stay identical
 * (they would simply read from a query cache instead).
 */
export const useUser = () => useAppStore((state) => state.user);

export const useReports = () => useAppStore((state) => state.reports);

export const useServices = () => useAppStore((state) => state.services);

export const useIssues = () => useAppStore((state) => state.issues);

export const useBuildings = () => useAppStore((state) => state.buildings);

export const useCampusStatus = () => useAppStore((state) => state.campus);

export const usePreferences = () => useAppStore((state) => state.preferences);

export const useNotifications = () => useAppStore((state) => state.notifications);

export const useUnreadCount = () =>
  useAppStore((state) => state.notifications.reduce((count, item) => (item.read ? count : count + 1), 0));

export function useReport(reportId?: string | string[] | null) {
  const reports = useReports();
  const id = Array.isArray(reportId) ? reportId[0] : reportId;
  return useMemo(() => reports.find((report) => report.id === id) ?? null, [reports, id]);
}

export function useReportStats() {
  const reports = useReports();
  return useMemo(() => reportCounts(reports), [reports]);
}

export function useFilteredReports(filter: ReportFilter) {
  const reports = useReports();
  return useMemo(() => filterReports(reports, filter), [reports, filter]);
}

/** Reports created after the seeded history, used for the "your reports" hero. */
export function useRecentActivity(limit = 2) {
  const reports = useReports();
  return useMemo(() => [...reports].sort(byNewest).slice(0, limit), [reports, limit]);
}

function byNewest(a: { createdAt: string }, b: { createdAt: string }) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}
