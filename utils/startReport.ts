import { useReportDraft } from '@/stores/reportDraft';
import type { CampusLocation } from '@/types';

/**
 * Puts the report flow into a known state. Screens use this instead of
 * touching the draft store directly, so the flow can grow more steps later
 * without rewriting callers.
 */
export function beginReportAndLocate(location: CampusLocation): void {
  const draft = useReportDraft.getState();
  draft.beginReport();
  draft.setLocation(location);
}
