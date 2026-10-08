import type { CategoryMeta, ReportCategoryId } from '@/types';

/**
 * The report catalogue — the eight things a student can report.
 *
 * This is the campus's own taxonomy, not sample data. `serviceId` maps a
 * category to the campus team that owns it, which is also the ServiceNow
 * assignment group the incident is routed to.
 */
export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'wifi',
    label: 'WiFi',
    title: 'WiFi problem',
    serviceId: 'it',
    blurb: 'Connectivity, speed, dropouts',
  },
  {
    id: 'lab',
    label: 'Lab',
    title: 'Lab problem',
    serviceId: 'it',
    blurb: 'Computers, software, lab systems',
  },
  {
    id: 'projector',
    label: 'Projector',
    title: 'Projector problem',
    serviceId: 'it',
    blurb: 'Displays, HDMI, audio-visual',
  },
  {
    id: 'ac',
    label: 'AC',
    title: 'AC problem',
    serviceId: 'facilities',
    blurb: 'Cooling, heating, ventilation',
  },
  {
    id: 'mess',
    label: 'Mess',
    title: 'Mess problem',
    serviceId: 'food',
    blurb: 'Food quality, hygiene, timings',
  },
  {
    id: 'access',
    label: 'Access',
    title: 'Access problem',
    serviceId: 'access',
    blurb: 'ID cards, doors, turnstiles',
  },
  {
    id: 'classroom',
    label: 'Classroom',
    title: 'Classroom problem',
    serviceId: 'facilities',
    blurb: 'Seating, lighting, boards',
  },
  {
    id: 'other',
    label: 'Other',
    title: 'Campus problem',
    serviceId: 'facilities',
    blurb: 'Anything else on campus',
  },
];

const BY_ID: Record<string, CategoryMeta> = CATEGORIES.reduce<Record<string, CategoryMeta>>((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

export function categoryMeta(id: ReportCategoryId | null): CategoryMeta {
  if (id && BY_ID[id]) return BY_ID[id];
  const fallback = BY_ID.other;
  if (!fallback) throw new Error('Category catalogue is missing the "other" entry');
  return fallback;
}
