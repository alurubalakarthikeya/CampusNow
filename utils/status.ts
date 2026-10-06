import type { Tone } from '@/constants/colors';
import type {
  ActivityEntry,
  Report,
  ReportStatus,
  ServiceHealthState,
  Severity,
  TimelineStep,
} from '@/types';

import { addMinutes } from './format';

export const statusMeta: Record<ReportStatus, { label: string; tone: Tone }> = {
  reported: { label: 'Submitted', tone: 'primary' },
  confirmed: { label: 'Confirmed', tone: 'primary' },
  assigned: { label: 'Assigned', tone: 'warning' },
  investigating: { label: 'Investigating', tone: 'warning' },
  resolved: { label: 'Resolved', tone: 'healthy' },
};

export const severityMeta: Record<Severity, { label: string; tone: Tone }> = {
  low: { label: 'Low', tone: 'healthy' },
  medium: { label: 'Moderate', tone: 'warning' },
  high: { label: 'High', tone: 'critical' },
  critical: { label: 'Critical', tone: 'critical' },
};

export const healthStateMeta: Record<ServiceHealthState, { label: string; tone: Tone }> = {
  operational: { label: 'Operational', tone: 'healthy' },
  degraded: { label: 'Degraded', tone: 'warning' },
  down: { label: 'Down', tone: 'critical' },
};

type StepSeed = { status: ReportStatus; label: string; caption: string; offset: number };

/**
 * Operations lifecycle. The offsets are the minutes after submission at
 * which each step normally lands — the mock "backend" uses them to build
 * the timeline and the activity log.
 */
export const LIFECYCLE: StepSeed[] = [
  { status: 'reported', label: 'Reported', caption: 'Report submitted', offset: 0 },
  { status: 'confirmed', label: 'Confirmed', caption: 'Issue confirmed', offset: 6 },
  { status: 'assigned', label: 'Assigned', caption: 'Team assigned', offset: 21 },
  { status: 'investigating', label: 'Investigating', caption: 'Team on site', offset: 34 },
  { status: 'resolved', label: 'Resolved', caption: 'Marked resolved', offset: 186 },
];

export function statusIndex(status: ReportStatus): number {
  return LIFECYCLE.findIndex((step) => step.status === status);
}

/**
 * How long one lifecycle stage lasts for a report filed from this device.
 *
 * The mock backend cannot move in real hours, so a live report advances one
 * stage every 45 seconds: the tracker on the report screen is genuinely
 * live rather than a static snapshot. Seeded history (`report.live` unset)
 * keeps the timestamps it was generated with.
 */
export const LIVE_STAGE_MS = 45_000;

/** Stage a report is in right now. Live reports move; history does not. */
export function liveStageIndex(report: Report, now: number = Date.now()): number {
  if (!report.live) return Math.max(0, statusIndex(report.status));
  const elapsed = now - new Date(report.createdAt).getTime();
  return Math.min(LIFECYCLE.length - 1, Math.max(0, Math.floor(elapsed / LIVE_STAGE_MS)));
}

export type LiveStage = {
  /** 0-based position in LIFECYCLE */
  index: number;
  status: ReportStatus;
  label: string;
  caption: string;
  /** 0 – 1 progress through the current stage */
  progress: number;
  /** Milliseconds until the next stage, null once resolved */
  msToNext: number | null;
  nextLabel: string | null;
};

/** Everything the live tracker needs for the stage a report is in. */
export function liveStage(report: Report, now: number = Date.now()): LiveStage {
  const index = liveStageIndex(report, now);
  const step = LIFECYCLE[index] ?? LIFECYCLE[0];
  const isLast = index >= LIFECYCLE.length - 1;
  const elapsed = Math.max(0, now - new Date(report.createdAt).getTime());
  const withinStage = isLast ? LIVE_STAGE_MS : elapsed % LIVE_STAGE_MS;

  return {
    index,
    status: step.status,
    label: step.label,
    caption: step.caption,
    progress: isLast ? 1 : withinStage / LIVE_STAGE_MS,
    msToNext: isLast ? null : LIVE_STAGE_MS - withinStage,
    nextLabel: isLast ? null : (LIFECYCLE[index + 1]?.label ?? null),
  };
}


export function isResolved(report: Report): boolean {
  return report.status === 'resolved';
}

/**
 * When a step landed. History uses the generated minute offsets; a live
 * report uses its compressed clock so no timestamp is ever in the future.
 */
function stepTime(report: Report, index: number): string {
  if (report.live) {
    return new Date(new Date(report.createdAt).getTime() + index * LIVE_STAGE_MS).toISOString();
  }
  return addMinutes(report.createdAt, LIFECYCLE[index]?.offset ?? 0);
}

export function buildTimeline(report: Report, now: number = Date.now()): TimelineStep[] {
  const current = liveStageIndex(report, now);
  return LIFECYCLE.map((step, index) => {
    const state: TimelineStep['state'] = index < current ? 'done' : index === current ? 'current' : 'pending';
    return {
      status: step.status,
      label: step.label,
      caption: step.caption,
      at: index <= current ? stepTime(report, index) : null,
      state: index === current && report.status === 'resolved' ? 'done' : state,
    };
  });
}

export function buildActivity(report: Report, now: number = Date.now()): ActivityEntry[] {
  const current = liveStageIndex(report, now);
  return LIFECYCLE.slice(0, current + 1)
    .map((step, index) => ({
      id: `${report.id}-${step.status}`,
      at: stepTime(report, index),
      text: step.caption,
    }))
    .reverse();
}

/**
 * "30 min" style expected update window. Resolved reports report the
 * closing summary instead.
 */
export function expectedUpdate(report: Report): string {
  if (report.status === 'resolved') return 'Closed';
  if (report.status === 'reported') return '10 min';
  if (report.status === 'confirmed') return '15 min';
  if (report.status === 'assigned') return '30 min';
  return '45 min';
}

export function statusCaption(report: Report): string {
  switch (report.status) {
    case 'reported':
      return 'Campus operations received your report and will confirm it shortly.';
    case 'confirmed':
      return 'Campus operations confirmed the issue and queued it for a team.';
    case 'assigned':
      return 'A technician has been assigned and is on the way.';
    case 'investigating':
      return `The ${report.serviceId === 'it' ? 'network' : 'campus'} team is on site and checking ${report.location.buildingName}.`;
    case 'resolved':
      return 'This issue was marked resolved. Confirm if everything works for you.';
  }
}

export function statusHeadline(report: Report): string {
  switch (report.status) {
    case 'reported':
      return 'Waiting for confirmation';
    case 'confirmed':
      return 'Issue confirmed';
    case 'assigned':
      return 'Team assigned';
    case 'investigating':
      return `${report.serviceId === 'it' ? 'Network' : 'Campus'} team investigating`;
    case 'resolved':
      return 'Resolved';
  }
}

export function reportCounts(reports: Report[]): { total: number; resolved: number; active: number } {
  const resolved = reports.filter((report) => report.status === 'resolved').length;
  return { total: reports.length, resolved, active: reports.length - resolved };
}

export function filterReports(reports: Report[], filter: 'all' | 'active' | 'resolved'): Report[] {
  if (filter === 'all') return reports;
  const wantResolved = filter === 'resolved';
  return reports.filter((report) => isResolved(report) === wantResolved);
}

export function relativeUpdate(iso: string): string {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} h ago`;
  return `${Math.round(minutes / (60 * 24))} d ago`;
}
