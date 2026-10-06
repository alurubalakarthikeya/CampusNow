import type { CampusBuilding, CampusIssue, CampusStatus, Service, User } from '@/types';

import { minutesAgo } from '@/utils/format';

export const MOCK_USER: User = {
  id: 'u-carty',
  name: 'Carty',
  degree: 'B.Tech CSE',
  university: 'Dayananda Sagar University',
  campusId: 'dsu-main',
};

/**
 * Campus diagram blocks. `row` / `span` / `height` are grid instructions:
 * every row sums to exactly 4 columns, which is what keeps the deliberate
 * asymmetry feeling intentional.
 */
export const MOCK_BUILDINGS: CampusBuilding[] = [
  {
    id: 'block-a',
    name: 'Block A',
    short: 'Block A',
    zone: 'North campus',
    row: 1,
    span: 2,
    height: 104,
    issues: 1,
    coords: { latitude: 12.9079, longitude: 77.4992 },
  },
  {
    id: 'block-b',
    name: 'Block B',
    short: 'Block B',
    zone: 'North campus',
    row: 1,
    span: 2,
    height: 104,
    issues: 3,
    coords: { latitude: 12.9076, longitude: 77.4998 },
  },
  {
    id: 'library',
    name: 'Library',
    short: 'Library',
    zone: 'Central',
    row: 2,
    span: 2,
    height: 80,
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
    height: 80,
    issues: 2,
    coords: { latitude: 12.907, longitude: 77.5002 },
  },
  {
    id: 'block-c',
    name: 'Block C',
    short: 'Block C',
    zone: 'East campus',
    row: 2,
    span: 1,
    height: 80,
    issues: 1,
    coords: { latitude: 12.9068, longitude: 77.5008 },
  },
  {
    id: 'labs',
    name: 'Labs',
    short: 'Labs',
    zone: 'East campus',
    row: 3,
    span: 1,
    height: 96,
    issues: 2,
    coords: { latitude: 12.9063, longitude: 77.5007 },
  },
  {
    id: 'classrooms',
    name: 'Classrooms',
    short: 'Classrooms',
    zone: 'South campus',
    row: 3,
    span: 3,
    height: 96,
    issues: 0,
    coords: { latitude: 12.906, longitude: 77.4997 },
  },
];

export const MOCK_SERVICES: Service[] = [
  {
    id: 'it',
    name: 'IT & Network',
    short: 'IT',
    health: 92,
    state: 'operational',
    openIssues: 3,
    summary: 'WiFi, lab systems and classroom tech',
    lead: 'Network team',
  },
  {
    id: 'facilities',
    name: 'Facilities',
    short: 'Facilities',
    health: 87,
    state: 'operational',
    openIssues: 4,
    summary: 'Cooling, power and building upkeep',
    lead: 'Facilities team',
  },
  {
    id: 'food',
    name: 'Food & Mess',
    short: 'Food',
    health: 74,
    state: 'degraded',
    openIssues: 5,
    summary: 'Mess quality, hygiene and timings',
    lead: 'Mess committee',
  },
  {
    id: 'access',
    name: 'Access & ID',
    short: 'Access',
    health: 96,
    state: 'operational',
    openIssues: 1,
    summary: 'ID cards, doors and turnstiles',
    lead: 'Security desk',
  },
];

export const MOCK_ISSUES: CampusIssue[] = [
  {
    id: 'issue-wifi-block-b',
    title: 'WiFi · Block B',
    detail: 'Network team investigating',
    reportCount: 47,
    severity: 'high',
    serviceId: 'it',
    buildingId: 'block-b',
  },
  {
    id: 'issue-mess-quality',
    title: 'Mess A · Food quality',
    detail: 'Hygiene audit scheduled',
    reportCount: 23,
    severity: 'medium',
    serviceId: 'food',
    buildingId: 'mess',
  },
  {
    id: 'issue-lab-204',
    title: 'Lab 204',
    detail: '4 systems unavailable',
    reportCount: 4,
    severity: 'medium',
    serviceId: 'it',
    buildingId: 'labs',
  },
  {
    id: 'issue-ac-block-c',
    title: 'AC · Block C',
    detail: 'Cooling restored in 2 rooms',
    reportCount: 9,
    severity: 'low',
    serviceId: 'facilities',
    buildingId: 'block-c',
  },
  {
    id: 'issue-projector-b204',
    title: 'Projector · B204',
    detail: 'Resolved yesterday',
    reportCount: 6,
    severity: 'low',
    serviceId: 'it',
    buildingId: 'block-b',
  },
];

export function createMockCampusStatus(): CampusStatus {
  return {
    score: 91,
    label: 'Campus operational',
    majorIssues: 3,
    ongoing: 7,
    updatedAt: minutesAgo(4),
  };
}
