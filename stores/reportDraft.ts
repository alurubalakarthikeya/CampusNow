import { create } from 'zustand';

import type { CampusLocation, ReportCategoryId, ReportDraft, Severity } from '@/types';

interface DraftActions {
  beginReport: (categoryId?: ReportCategoryId, description?: string) => void;
  setCategory: (categoryId: ReportCategoryId) => void;
  setDescription: (description: string) => void;
  setLocation: (location: CampusLocation | null) => void;
  setPhoto: (photoUri: string | null) => void;
  setSeverity: (severity: Severity) => void;
  reset: () => void;
}

const EMPTY_DRAFT: ReportDraft = {
  categoryId: null,
  description: '',
  location: null,
  photoUri: null,
  severity: 'medium',
};

/**
 * The report flow is transient state, so it is intentionally not
 * persisted — leaving the app mid-flow should not restore a stale draft.
 */
export const useReportDraft = create<ReportDraft & DraftActions>()((set) => ({
  ...EMPTY_DRAFT,

  beginReport: (categoryId, description) =>
    set(() => ({ ...EMPTY_DRAFT, categoryId: categoryId ?? null, description: description ?? '' })),

  setCategory: (categoryId) => set(() => ({ categoryId })),

  setDescription: (description) => set(() => ({ description })),

  setLocation: (location) => set(() => ({ location })),

  setPhoto: (photoUri) => set(() => ({ photoUri })),

  setSeverity: (severity) => set(() => ({ severity })),

  reset: () => set(() => ({ ...EMPTY_DRAFT })),
}));
