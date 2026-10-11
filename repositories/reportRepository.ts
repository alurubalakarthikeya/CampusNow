import type { Report, ReportEvent, ReportSource, ReportStatus, SyncStatus } from '@/types';
import { STORAGE_KEYS, readJson, removeKey, writeJson } from './storage';

/**
 * Report persistence.
 *
 * Screens never touch storage: they read through the store, and the store
 * writes through this repository. The document is versioned, every record is
 * validated on the way in, and a record that cannot be understood is dropped
 * rather than shown broken.
 *
 * When the campus backend owns the records, this repository becomes the
 * offline cache in front of it — the interface stays the same.
 */
export interface ReportRepository {
  getAll(): Promise<Report[]>;
  getById(id: string): Promise<Report | null>;
  create(report: Report): Promise<boolean>;
  /** Replaces the whole set — used after a local status change */
  save(reports: Report[]): Promise<boolean>;
  update(id: string, patch: Partial<Report>): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<boolean>;
}

const DOCUMENT_VERSION = 2;

const STATUSES: ReportStatus[] = ['draft', 'reported', 'confirmed', 'assigned', 'investigating', 'resolved'];
const SOURCES: ReportSource[] = ['local', 'backend'];
const SYNC: SyncStatus[] = ['local-only', 'pending', 'synced', 'failed'];

interface StoredDocument {
  version: number;
  reports: Report[];
}

/** A stored record is only trusted after it has been checked field by field. */
function sanitiseReport(value: unknown): Report | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const id = typeof raw.id === 'string' ? raw.id : null;
  const createdAt = typeof raw.createdAt === 'string' ? raw.createdAt : null;
  if (!id || !createdAt) return null;

  const status = STATUSES.includes(raw.status as ReportStatus)
    ? (raw.status as ReportStatus)
    : 'reported';
  const location = raw.location as Report['location'] | undefined;
  if (!location || typeof location.buildingId !== 'string') return null;

  // A status with no record of it cannot be trusted: older builds advanced
  // reports on a timer, so anything unaccounted for goes back to Submitted.
  const history = Array.isArray(raw.history)
    ? (raw.history as ReportEvent[]).filter(
        (event) => event && STATUSES.includes(event.status) && typeof event.at === 'string',
      )
    : [];

  const trusted: ReportEvent[] =
    history.length > 0 ? history : [{ status: status === 'draft' ? 'draft' : 'reported', at: createdAt }];

  return {
    id,
    title: typeof raw.title === 'string' && raw.title.trim().length > 0 ? raw.title : 'Campus problem',
    categoryId: (raw.categoryId ?? 'other') as Report['categoryId'],
    serviceId: typeof raw.serviceId === 'string' ? raw.serviceId : 'facilities',
    status: trusted[trusted.length - 1]?.status ?? status,
    severity: (raw.severity ?? 'medium') as Report['severity'],
    location,
    description: typeof raw.description === 'string' ? raw.description : '',
    createdAt,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : createdAt,
    history: trusted,
    source: SOURCES.includes(raw.source as ReportSource)
      ? (raw.source as ReportSource)
      : 'local',
    syncStatus: SYNC.includes(raw.syncStatus as SyncStatus)
      ? (raw.syncStatus as SyncStatus)
      : 'local-only',
    serverId: typeof raw.serverId === 'string' ? raw.serverId : undefined,
    lastError: typeof raw.lastError === 'string' ? raw.lastError : undefined,
    submittedAt: typeof raw.submittedAt === 'string' ? raw.submittedAt : undefined,
    affectedStudents:
      typeof raw.affectedStudents === 'number' && raw.affectedStudents > 0
        ? raw.affectedStudents
        : 1,
    followed: raw.followed !== false,
    photoUri: typeof raw.photoUri === 'string' ? raw.photoUri : undefined,
    mergedReportIds: Array.isArray(raw.mergedReportIds)
      ? (raw.mergedReportIds as string[])
      : undefined,
    resolutionConfirmed: raw.resolutionConfirmed === true,
    impact: raw.impact as Report['impact'],
    urgency: raw.urgency as Report['urgency'],
    priority: raw.priority as Report['priority'],
  };
}

/**
 * Older installs kept reports inside the previous combined store document.
 * They are read once and handed to the same validation as everything else.
 */
async function readLegacyReports(): Promise<Report[]> {
  const legacy = await readJson<{ state?: { reports?: unknown[] }; reports?: unknown[] }>(
    STORAGE_KEYS.legacyStore,
  );
  const candidates = legacy?.state?.reports ?? legacy?.reports ?? [];
  return Array.isArray(candidates)
    ? candidates.map(sanitiseReport).filter((report): report is Report => report !== null)
    : [];
}

function sortNewestFirst(reports: Report[]): Report[] {
  return [...reports].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

async function readDocument(): Promise<Report[]> {
  const document = await readJson<StoredDocument>(STORAGE_KEYS.reports);

  if (!document || !Array.isArray(document.reports)) {
    // First run on this install: take anything the older store document held
    // and write it forward in the current shape. The old document is only
    // removed once the reports are safely in their own — a failure here must
    // not cost the student their records.
    const migrated = sortNewestFirst(await readLegacyReports());
    const wrote = await writeJson(STORAGE_KEYS.reports, {
      version: DOCUMENT_VERSION,
      reports: migrated,
    });
    if (wrote) await removeKey(STORAGE_KEYS.legacyStore);
    return migrated;
  }

  return sortNewestFirst(
    document.reports.map(sanitiseReport).filter((report): report is Report => report !== null),
  );
}

export function createAsyncStorageReportRepository(): ReportRepository {
  return {
    async getAll() {
      return readDocument();
    },

    async getById(id) {
      const reports = await readDocument();
      return reports.find((report) => report.id === id) ?? null;
    },

    async create(report) {
      const reports = await readDocument();
      return writeJson(STORAGE_KEYS.reports, {
        version: DOCUMENT_VERSION,
        reports: sortNewestFirst([report, ...reports.filter((item) => item.id !== report.id)]),
      });
    },

    async save(reports) {
      return writeJson(STORAGE_KEYS.reports, {
        version: DOCUMENT_VERSION,
        reports: sortNewestFirst(reports),
      });
    },

    async update(id, patch) {
      const reports = await readDocument();
      const next = reports.map((report) => (report.id === id ? { ...report, ...patch } : report));
      return writeJson(STORAGE_KEYS.reports, { version: DOCUMENT_VERSION, reports: next });
    },

    async delete(id) {
      const reports = await readDocument();
      return writeJson(STORAGE_KEYS.reports, {
        version: DOCUMENT_VERSION,
        reports: reports.filter((report) => report.id !== id),
      });
    },

    async clear() {
      return writeJson(STORAGE_KEYS.reports, { version: DOCUMENT_VERSION, reports: [] });
    },
  };
}

export const reportRepository: ReportRepository = createAsyncStorageReportRepository();
