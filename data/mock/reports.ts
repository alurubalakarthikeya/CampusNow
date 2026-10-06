import type { Report, ReportCategoryId, ReportStatus, Severity } from '@/types';
import { addMinutes, minutesAgo } from '@/utils/format';
import { statusIndex, LIFECYCLE } from '@/utils/status';

import { MOCK_BUILDINGS } from './campus';
import { categoryMeta } from './categories';

type ReportSeed = {
  id: string;
  categoryId: ReportCategoryId;
  buildingId: string;
  floor?: string;
  room?: string;
  status: ReportStatus;
  severity: Severity;
  description: string;
  minutesAgo: number;
  affected: number;
  followed?: boolean;
};

/**
 * Fourteen reports: three still active, eleven resolved — which is what
 * the profile counters read from. The four newest match the report feed
 * hierarchy in the reference designs.
 */
const SEEDS: ReportSeed[] = [
  {
    id: 'r-wifi-block-b',
    categoryId: 'wifi',
    buildingId: 'block-b',
    floor: '2nd Floor',
    room: 'B204',
    status: 'investigating',
    severity: 'high',
    description: 'WiFi keeps disconnecting. Signal drops every few minutes in the second floor corridor.',
    minutesAgo: 128,
    affected: 47,
  },
  {
    id: 'r-projector-b204',
    categoryId: 'projector',
    buildingId: 'block-b',
    room: 'B204',
    status: 'resolved',
    severity: 'low',
    description: 'Projector flickers whenever an HDMI source is connected.',
    minutesAgo: 60 * 26,
    affected: 6,
  },
  {
    id: 'r-lab-204',
    categoryId: 'lab',
    buildingId: 'labs',
    room: 'Lab 204',
    status: 'assigned',
    severity: 'medium',
    description: 'Three systems in Lab 204 are not booting past the login screen.',
    minutesAgo: 60 * 50,
    affected: 4,
  },
  {
    id: 'r-ac-block-c',
    categoryId: 'ac',
    buildingId: 'block-c',
    room: 'Room 18',
    status: 'confirmed',
    severity: 'medium',
    description: 'AC has not been cooling since this morning, the room stays warm through the lecture.',
    minutesAgo: 60 * 74,
    affected: 9,
  },
  {
    id: 'r-wifi-block-a',
    categoryId: 'wifi',
    buildingId: 'block-a',
    floor: '1st Floor',
    status: 'resolved',
    severity: 'medium',
    description: 'Campus WiFi was asking for the login page repeatedly.',
    minutesAgo: 60 * 24 * 4,
    affected: 22,
  },
  {
    id: 'r-mess-quality',
    categoryId: 'mess',
    buildingId: 'mess',
    room: 'Mess A',
    status: 'resolved',
    severity: 'high',
    description: 'Dinner plates were not clean and the serving counter looked unhygienic.',
    minutesAgo: 60 * 24 * 5,
    affected: 31,
  },
  {
    id: 'r-classroom-fan',
    categoryId: 'classroom',
    buildingId: 'classrooms',
    room: 'CR 12',
    status: 'resolved',
    severity: 'medium',
    description: 'Two ceiling fans in CR 12 were making a loud grinding noise.',
    minutesAgo: 60 * 24 * 6,
    affected: 40,
  },
  {
    id: 'r-access-idcard',
    categoryId: 'access',
    buildingId: 'library',
    room: 'Main gate',
    status: 'resolved',
    severity: 'medium',
    description: 'ID card was not reading at the library turnstile.',
    minutesAgo: 60 * 24 * 8,
    affected: 3,
  },
  {
    id: 'r-lab-printer',
    categoryId: 'lab',
    buildingId: 'labs',
    room: 'Lab 102',
    status: 'resolved',
    severity: 'low',
    description: 'Lab printer kept jamming on the first page of every job.',
    minutesAgo: 60 * 24 * 9,
    affected: 12,
  },
  {
    id: 'r-projector-b103',
    categoryId: 'projector',
    buildingId: 'block-b',
    room: 'B103',
    status: 'resolved',
    severity: 'low',
    description: 'Projector remote was missing and the display stayed on a blue screen.',
    minutesAgo: 60 * 24 * 11,
    affected: 5,
  },
  {
    id: 'r-ac-block-a',
    categoryId: 'ac',
    buildingId: 'block-a',
    room: 'Room 04',
    status: 'resolved',
    severity: 'medium',
    description: 'AC unit was leaking water near the seating area.',
    minutesAgo: 60 * 24 * 13,
    affected: 18,
  },
  {
    id: 'r-wifi-library',
    categoryId: 'wifi',
    buildingId: 'library',
    floor: 'Ground Floor',
    status: 'resolved',
    severity: 'low',
    description: 'WiFi in the library reading room was extremely slow in the evening.',
    minutesAgo: 60 * 24 * 15,
    affected: 27,
  },
  {
    id: 'r-mess-water',
    categoryId: 'mess',
    buildingId: 'mess',
    room: 'Wash area',
    status: 'resolved',
    severity: 'medium',
    description: 'Drinking water dispenser near the mess wash area was not working.',
    minutesAgo: 60 * 24 * 18,
    affected: 15,
  },
  {
    id: 'r-classroom-lights',
    categoryId: 'classroom',
    buildingId: 'classrooms',
    room: 'CR 07',
    status: 'resolved',
    severity: 'low',
    description: 'Three tube lights in CR 07 were flickering during lectures.',
    minutesAgo: 60 * 24 * 21,
    affected: 38,
  },
];

function buildingName(buildingId: string): string {
  return MOCK_BUILDINGS.find((building) => building.id === buildingId)?.name ?? 'Campus';
}

/** The "server" fills in service, title and derived timestamps. */
export function buildReport(seed: ReportSeed): Report {
  const meta = categoryMeta(seed.categoryId);
  const createdAt = minutesAgo(seed.minutesAgo);
  const step = LIFECYCLE[Math.max(0, statusIndex(seed.status))] ?? LIFECYCLE[0];
  return {
    id: seed.id,
    title: meta.title,
    categoryId: seed.categoryId,
    serviceId: meta.serviceId,
    status: seed.status,
    severity: seed.severity,
    location: {
      id: `${seed.buildingId}-${seed.room ?? seed.floor ?? 'site'}`,
      buildingId: seed.buildingId,
      buildingName: buildingName(seed.buildingId),
      floor: seed.floor,
      room: seed.room,
    },
    description: seed.description,
    createdAt,
    updatedAt: addMinutes(createdAt, step.offset),
    affectedStudents: seed.affected,
    followed: seed.followed ?? true,
  };
}

const BY_DATE_DESC = (a: Report, b: Report) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

export function createMockReports(): Report[] {
  return SEEDS.map(buildReport).sort(BY_DATE_DESC);
}
