import type { Impact, Severity, Urgency } from '@/types';

/**
 * Triage choices, declared once.
 *
 * The words are the student's ("Blocking" rather than "High severity"), the
 * values are ServiceNow's. Any screen that offers a choice reads it from
 * here, so the same question can never be asked with different options.
 */
export const SEVERITY_OPTIONS: { id: Severity; label: string }[] = [
  { id: 'low', label: 'Minor' },
  { id: 'medium', label: 'Moderate' },
  { id: 'high', label: 'Blocking' },
];

export const IMPACT_OPTIONS: { id: Impact; label: string }[] = [
  { id: 'low', label: '1–2 students' },
  { id: 'medium', label: 'One class' },
  { id: 'high', label: 'Whole block' },
];

export const URGENCY_OPTIONS: { id: Urgency; label: string }[] = [
  { id: 'low', label: 'When possible' },
  { id: 'medium', label: 'Today' },
  { id: 'high', label: 'Immediate' },
];

/** The student-facing word for a severity value. */
export function severityLabel(severity: Severity): string {
  return SEVERITY_OPTIONS.find((option) => option.id === severity)?.label ?? 'Moderate';
}
