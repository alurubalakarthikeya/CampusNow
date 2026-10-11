import type { ReportCategoryId, ReportDraft, Severity } from '@/types';
import { STORAGE_KEYS, readJson, removeKey, writeJson } from './storage';

/**
 * The in-progress report.
 *
 * A student who is interrupted mid-report should find their work where they
 * left it, so the draft is persisted here and restored on open. It is
 * deliberately a separate document from the saved reports: a draft is not a
 * report, has no status, and must never be listed as filed work.
 */
export interface DraftRepository {
  load(): Promise<ReportDraft | null>;
  save(draft: ReportDraft): Promise<boolean>;
  clear(): Promise<boolean>;
}

const DOCUMENT_VERSION = 1;

const CATEGORIES: ReportCategoryId[] = [
  'wifi',
  'lab',
  'projector',
  'ac',
  'mess',
  'access',
  'classroom',
  'other',
];
const SEVERITIES: Severity[] = ['low', 'medium', 'high', 'critical'];

/** Only a draft that still makes sense is restored. */
function sanitiseDraft(value: unknown): ReportDraft | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;

  const categoryId = CATEGORIES.includes(raw.categoryId as ReportCategoryId)
    ? (raw.categoryId as ReportCategoryId)
    : null;
  const location = raw.location as ReportDraft['location'];

  return {
    categoryId,
    title: typeof raw.title === 'string' ? raw.title.slice(0, 160) : '',
    description: typeof raw.description === 'string' ? raw.description.slice(0, 4000) : '',
    location: location && typeof location.buildingId === 'string' ? location : null,
    photoUri: typeof raw.photoUri === 'string' ? raw.photoUri : null,
    severity: SEVERITIES.includes(raw.severity as Severity) ? (raw.severity as Severity) : 'medium',
    impact: (raw.impact ?? 'medium') as ReportDraft['impact'],
    urgency: (raw.urgency ?? 'medium') as ReportDraft['urgency'],
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : undefined,
  };
}

export function createAsyncStorageDraftRepository(): DraftRepository {
  return {
    async load() {
      const document = await readJson<{ version: number; draft: unknown }>(STORAGE_KEYS.draft);
      return document ? sanitiseDraft(document.draft) : null;
    },

    async save(draft) {
      return writeJson(STORAGE_KEYS.draft, { version: DOCUMENT_VERSION, draft });
    },

    async clear() {
      return removeKey(STORAGE_KEYS.draft);
    },
  };
}

export const draftRepository: DraftRepository = createAsyncStorageDraftRepository();
