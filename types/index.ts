/**
 * Domain types for CampusNow.
 *
 * These mirror the shapes the CampusNow API (and ServiceNow behind it)
 * will eventually return, so screens never need to change when the
 * mock data layer is replaced.
 */

export type ReportCategoryId =
  | 'wifi'
  | 'lab'
  | 'projector'
  | 'ac'
  | 'mess'
  | 'access'
  | 'classroom'
  | 'other';

/** The lifecycle a report moves through once operations pick it up. */
export type ReportStatus = 'reported' | 'confirmed' | 'assigned' | 'investigating' | 'resolved';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type ServiceHealthState = 'operational' | 'degraded' | 'down';

/** Health level of a campus service, as reported by the pulse endpoint. */
export type ServiceHealth = ServiceHealthState;

export type NotificationKind = 'update' | 'resolved' | 'confirmed' | 'merge' | 'announcement';

export interface User {
  id: string;
  name: string;
  degree: string;
  university: string;
  campusId: string;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

/**
 * A building on the campus diagram. `row` / `span` / `height` describe how
 * the block sits on the 4-column grid (span is in columns, height in
 * reference pixels).
 */
export interface CampusBuilding {
  id: string;
  name: string;
  short: string;
  zone: string;
  row: number;
  span: number;
  height: number;
  /** Number of unresolved issues the building currently carries */
  issues: number;
  coords: GeoPoint;
}

export interface CampusLocation {
  id: string;
  buildingId: string;
  buildingName: string;
  floor?: string;
  room?: string;
}

export interface Service {
  id: string;
  name: string;
  short: string;
  /** 0 – 100 operational score */
  health: number;
  state: ServiceHealth;
  openIssues: number;
  summary: string;
  lead: string;
}

export interface CampusIssue {
  id: string;
  title: string;
  detail: string;
  reportCount: number;
  severity: Severity;
  serviceId: string;
  buildingId: string;
}

export interface Report {
  id: string;
  title: string;
  categoryId: ReportCategoryId;
  serviceId: string;
  status: ReportStatus;
  severity: Severity;
  location: CampusLocation;
  description: string;
  createdAt: string;
  updatedAt: string;
  /** Students this issue is currently affecting */
  affectedStudents: number;
  /** Followed reports still notify the student without a new report */
  followed: boolean;
  /**
   * Filed from this device in the current session, so its lifecycle is
   * tracked live (see LIVE_STAGE_MS). Seeded history has no live clock.
   */
  live?: boolean;
  photoUri?: string;
  /** IDs of reports that were merged into this one */
  mergedReportIds?: string[];
  /** Set once the student confirms a resolved report actually works */
  resolutionConfirmed?: boolean;
}

export interface Preferences {
  reportUpdates: boolean;
  campusAnnouncements: boolean;
}

export interface Notification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  reportId?: string;
}

export interface CampusStatus {
  /** Composite operational score, 0 – 100 */
  score: number;
  label: string;
  majorIssues: number;
  ongoing: number;
  updatedAt: string;
}

/** Everything the Campus Pulse screen renders, in one payload. */
export interface CampusPulse {
  status: CampusStatus;
  services: Service[];
  issues: CampusIssue[];
}

export interface CategoryMeta {
  id: ReportCategoryId;
  label: string;
  /** Headline used when the report is created, e.g. "WiFi problem" */
  title: string;
  serviceId: string;
  blurb: string;
}

/** The in-progress report living in the report draft store. */
export interface ReportDraft {
  categoryId: ReportCategoryId | null;
  description: string;
  location: CampusLocation | null;
  photoUri: string | null;
  severity: Severity;
}

export type ReportFilter = 'all' | 'active' | 'resolved';

export interface TimelineStep {
  status: ReportStatus;
  label: string;
  caption: string;
  at: string | null;
  state: 'done' | 'current' | 'pending';
}

export interface ActivityEntry {
  id: string;
  at: string;
  text: string;
}
