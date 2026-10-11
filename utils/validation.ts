import type { Impact, ReportCategoryId, ReportDraft, Severity, Urgency } from '@/types';

/**
 * Input rules for a report, shared by the client and mirrored by the API
 * schemas in `backend/app/schemas/report.py`.
 *
 * The client checks so the student gets a field-level message before
 * anything is written; the server checks again because client validation is
 * never a security boundary.
 */
export const REPORT_LIMITS = {
  title: 90,
  description: 1000,
  room: 40,
} as const;

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
const IMPACTS: Impact[] = ['low', 'medium', 'high'];
const URGENCIES: Urgency[] = ['low', 'medium', 'high'];

/** Collapses runs of whitespace and trims — what actually gets stored. */
export function cleanText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function isCategory(value: unknown): value is ReportCategoryId {
  return typeof value === 'string' && CATEGORIES.includes(value as ReportCategoryId);
}

export function isSeverity(value: unknown): value is Severity {
  return typeof value === 'string' && SEVERITIES.includes(value as Severity);
}

export function isImpact(value: unknown): value is Impact {
  return typeof value === 'string' && IMPACTS.includes(value as Impact);
}

export function isUrgency(value: unknown): value is Urgency {
  return typeof value === 'string' && URGENCIES.includes(value as Urgency);
}

export interface TextProblems {
  title?: string;
  description?: string;
}

export interface DraftValidation extends TextProblems {
  category?: string;
  location?: string;
  /** True when the draft can be submitted */
  valid: boolean;
}

/** Field-level messages for the two free-text inputs, shown as they type. */
export function validateText(title: string, description: string): TextProblems {
  const problems: TextProblems = {};
  const short = cleanText(title);

  if (short.length === 0) {
    problems.title = 'Add a short summary of the problem.';
  } else if (short.length > REPORT_LIMITS.title) {
    problems.title = `Keep the summary under ${REPORT_LIMITS.title} characters.`;
  }

  if (cleanText(description).length > REPORT_LIMITS.description) {
    problems.description = `Keep the description under ${REPORT_LIMITS.description} characters.`;
  }

  return problems;
}

/** Everything a report needs before it can be submitted. */
export function validateDraft(draft: ReportDraft): DraftValidation {
  const problems: Omit<DraftValidation, 'valid'> = {
    ...validateText(draft.title, draft.description),
  };

  if (!isCategory(draft.categoryId)) problems.category = 'Pick the category that matches the fault.';
  if (!draft.location) problems.location = 'Choose the block where the problem is.';
  if (!isSeverity(draft.severity)) problems.location = problems.location ?? 'Set how much this is blocking you.';

  return { ...problems, valid: Object.keys(problems).length === 0 };
}
