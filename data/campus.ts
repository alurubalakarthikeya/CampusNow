import type {
  CampusBuilding,
  CampusIssue,
  CampusStatus,
  Service,
  ServiceHealth,
} from '@/types';

/**
 * Campus directory.
 *
 * This is the campus's own structure — the blocks on the map and the
 * operations teams a report can be routed to. It is configuration, not
 * sample data: it stays the same no matter how many reports exist, and the
 * campus API replaces it wholesale when it lands:
 *
 *   CAMPUS_BUILDINGS  →  GET /api/campus/buildings
 *   CAMPUS_SERVICES   →  GET /api/campus/services
 *
 * Reports, notifications and open issues start empty on purpose: everything
 * you see under those headings in the app was filed on this device.
 */

/**
 * Blocks on the campus diagram. `row` / `span` / `height` are grid
 * instructions: every row sums to exactly 4 columns, which is what keeps the
 * deliberate asymmetry feeling intentional on every screen width.
 */
export const CAMPUS_BUILDINGS: CampusBuilding[] = [
  {
    id: 'block-a',
    name: 'Block A',
    short: 'Block A',
    zone: 'North campus',
    row: 1,
    span: 2,
    height: 84,
    issues: 0,
    coords: { latitude: 12.9079, longitude: 77.4992 },
  },
  {
    id: 'block-b',
    name: 'Block B',
    short: 'Block B',
    zone: 'North campus',
    row: 1,
    span: 2,
    height: 84,
    issues: 0,
    coords: { latitude: 12.9076, longitude: 77.4998 },
  },
  {
    id: 'library',
    name: 'Library',
    short: 'Library',
    zone: 'Central',
    row: 2,
    span: 2,
    height: 66,
    issues: 0,
    coords: { latitude: 12.9071, longitude: 77.4995 },
  },
  {
    id: 'mess',
    name: 'Mess',
    short: 'Mess',
    zone: 'Central',
    row: 2,
    span: 1,
    height: 66,
    issues: 0,
    coords: { latitude: 12.907, longitude: 77.5002 },
  },
  {
    id: 'block-c',
    name: 'Block C',
    short: 'Block C',
    zone: 'East campus',
    row: 2,
    span: 1,
    height: 66,
    issues: 0,
    coords: { latitude: 12.9068, longitude: 77.5008 },
  },
  {
    id: 'labs',
    name: 'Labs',
    short: 'Labs',
    zone: 'East campus',
    row: 3,
    span: 1,
    height: 74,
    issues: 0,
    coords: { latitude: 12.9063, longitude: 77.5007 },
  },
  {
    id: 'classrooms',
    name: 'Classrooms',
    short: 'Classrooms',
    zone: 'South campus',
    row: 3,
    span: 3,
    height: 74,
    issues: 0,
    coords: { latitude: 12.906, longitude: 77.4997 },
  },
];

/**
 * The four teams that own campus work. `lead` is the assignment group a
 * ServiceNow incident is routed to, and each report category maps to exactly
 * one of these — nothing may be filed without a destination.
 */
export const CAMPUS_SERVICES: Service[] = [
  {
    id: 'it',
    name: 'IT & Network',
    short: 'IT',
    health: 100,
    state: 'operational',
    openIssues: 0,
    summary: 'WiFi, lab systems and classroom tech',
    lead: 'Network team',
  },
  {
    id: 'facilities',
    name: 'Facilities',
    short: 'Facilities',
    health: 100,
    state: 'operational',
    openIssues: 0,
    summary: 'Cooling, power and building upkeep',
    lead: 'Facilities team',
  },
  {
    id: 'food',
    name: 'Food & Mess',
    short: 'Food',
    health: 100,
    state: 'operational',
    openIssues: 0,
    summary: 'Mess quality, hygiene and timings',
    lead: 'Mess committee',
  },
  {
    id: 'access',
    name: 'Access & ID',
    short: 'Access',
    health: 100,
    state: 'operational',
    openIssues: 0,
    summary: 'ID cards, doors and turnstiles',
    lead: 'Security desk',
  },
];

/** Open campus issues — derived from live reports, empty on a fresh install. */
export const CAMPUS_ISSUES: CampusIssue[] = [];

/**
 * Campus pulse, computed from the issues that actually exist rather than a
 * stored number. With nothing open the campus reads as operational.
 */
export function deriveCampusStatus(issues: CampusIssue[], ongoing = 0): CampusStatus {
  const majorIssues = issues.filter((issue) => issue.severity === 'high').length;

  return {
    score: Math.max(0, 100 - majorIssues * 8 - issues.length * 3),
    label: issues.length === 0 ? 'No open issues' : 'Campus operations',
    majorIssues,
    ongoing: issues.length + ongoing,
    updatedAt: new Date().toISOString(),
  };
}

/** Recomputes each service's score and state from the open issues it owns. */
export function decorateServices(services: Service[], issues: CampusIssue[]): Service[] {
  return services.map((service) => {
    const owned = issues.filter((issue) => issue.serviceId === service.id);
    const health = Math.max(20, 100 - owned.length * 6);
    const state: ServiceHealth = owned.length === 0 ? 'operational' : health >= 80 ? 'operational' : 'degraded';

    return { ...service, health, state, openIssues: owned.length };
  });
}
