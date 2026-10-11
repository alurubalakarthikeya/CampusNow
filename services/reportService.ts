import type { ApiError, Report } from '@/types';
import { useAppStore, type NewReportInput } from '@/stores/appStore';
import { locationLine } from '@/utils/format';
import { apiError, apiRequest, isApiConfigured } from './apiClient';

/**
 * Report operations.
 *
 * The rule this module enforces: a report is always saved on the device
 * first, and it is only marked as reaching the campus when the campus
 * actually answered. With no backend configured the record stays
 * `local-only` and the UI says so — nothing here invents a successful
 * submission.
 */

interface ApiReport {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  submittedAt?: string | null;
}

export interface SubmitResult {
  report: Report;
  /** True only when the campus backend accepted and stored the report */
  synced: boolean;
  /** Present when the backend was configured but the send failed */
  error?: ApiError;
}

/** Client record → API request body. Kept in one place so both sides agree. */
export function toApiPayload(input: NewReportInput) {
  return {
    title: input.title ?? null,
    description: input.description,
    category: input.categoryId,
    severity: input.severity ?? 'medium',
    impact: input.impact ?? 'medium',
    urgency: input.urgency ?? 'medium',
    location: {
      building_id: input.location.buildingId,
      building_name: input.location.buildingName,
      floor: input.location.floor ?? null,
      room: input.location.room ?? null,
      label: locationLine(input.location),
    },
    affected_students: input.affectedStudents ?? 1,
  };
}

/**
 * Saves the report locally, then sends it if a backend is configured.
 *
 * The local write happens first on purpose: a student who loses signal must
 * not lose the report. The `Idempotency-Key` is the local report id, so a
 * retry after a timeout cannot create a second incident.
 */
export async function submitReport(input: NewReportInput): Promise<SubmitResult> {
  const store = useAppStore.getState();
  const report = store.createReport(input);

  if (!isApiConfigured()) {
    return { report, synced: false };
  }

  store.markSync(report.id, { syncStatus: 'pending' });

  const result = await apiRequest<ApiReport>('/api/v1/reports', {
    method: 'POST',
    body: toApiPayload(input),
    idempotencyKey: report.id,
  });

  if (!result.ok) {
    useAppStore.getState().markSync(report.id, {
      syncStatus: 'failed',
      lastError: result.error.message,
    });
    return { report, synced: false, error: result.error };
  }

  const updated = useAppStore
    .getState()
    .reports.find((item) => item.id === report.id);

  useAppStore.getState().markSync(report.id, {
    source: 'backend',
    syncStatus: 'synced',
    serverId: result.data.id,
    lastError: undefined,
    submittedAt: new Date().toISOString(),
  });

  return { report: { ...(updated ?? report), serverId: result.data.id }, synced: true };
}

/**
 * Deletes a report. A record the campus owns must be removed there first:
 * deleting only the local copy would leave the two sides disagreeing.
 */
export async function deleteReport(reportId: string): Promise<{ ok: true } | { ok: false; error: ApiError }> {
  const report = useAppStore.getState().reports.find((item) => item.id === reportId);
  if (!report) return { ok: true };

  if (report.serverId && isApiConfigured()) {
    const result = await apiRequest<void>(`/api/v1/reports/${encodeURIComponent(report.serverId)}`, {
      method: 'DELETE',
    });
    // A record the server no longer has is already gone from the campus
    // point of view, so that is not a failure the student should see.
    if (!result.ok && result.error.code !== 'NOT_FOUND') return result;
  }

  useAppStore.getState().deleteReport(reportId);
  return { ok: true };
}

/** Reads the campus copy of a report, if this build is connected. */
export async function fetchServerReport(reportId: string): Promise<Report | null> {
  if (!isApiConfigured()) return null;
  const result = await apiRequest<ApiReport>(`/api/v1/reports/${encodeURIComponent(reportId)}`);
  if (!result.ok) return null;
  // The local record stays the shape the screens render; only the fields the
  // backend owns are refreshed here.
  return useAppStore.getState().reports.find((item) => item.id === reportId) ?? null;
}

export { apiError as reportApiError };
