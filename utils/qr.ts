import type { CampusBuilding, CampusLocation } from '@/types';

export interface ScannedLocation {
  buildingId: string;
  floor?: string;
  room?: string;
}

const BUILDING_ALIASES: Record<string, string> = {
  a: 'block-a',
  blocka: 'block-a',
  b: 'block-b',
  blockb: 'block-b',
  c: 'block-c',
  blockc: 'block-c',
  lib: 'library',
  library: 'library',
  mess: 'mess',
  lab: 'labs',
  labs: 'labs',
  classroom: 'classrooms',
  classrooms: 'classrooms',
};

function normaliseBuilding(raw: string): string | null {
  const key = raw.toLowerCase().replace(/[^a-z]/g, '');
  if (!key) return null;
  return BUILDING_ALIASES[key] ?? null;
}

/**
 * Accepts the codes printed on campus QR plates:
 *
 *   CAMPUSNOW:block-b:2nd Floor:B204
 *   CN:B:B204
 *   campusnow://locate?building=block-b&floor=2nd%20Floor&room=B204
 */
export function parseCampusQr(payload: string): ScannedLocation | null {
  const value = payload.trim();
  if (!value) return null;

  if (value.includes('?')) {
    const query = value.slice(value.indexOf('?') + 1);
    const params = new URLSearchParams(query);
    const building = params.get('building');
    if (!building) return null;
    const normalised = normaliseBuilding(building) ?? building;
    return {
      buildingId: normalised,
      floor: params.get('floor') ?? undefined,
      room: params.get('room') ?? undefined,
    };
  }

  const parts = value.split(/[:|/]/).map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return null;

  const body = parts[0]?.toUpperCase() === 'CAMPUSNOW' || parts[0]?.toUpperCase() === 'CN' ? parts.slice(1) : parts;
  const [rawBuilding, ...rest] = body;
  if (!rawBuilding) return null;

  const buildingId = normaliseBuilding(rawBuilding);
  if (!buildingId) return null;

  const floorPart = rest.find((part) => /floor|ground/i.test(part));
  const roomPart = rest.find((part) => part !== floorPart);

  return { buildingId, floor: floorPart, room: roomPart };
}

export function toCampusLocation(scanned: ScannedLocation, buildings: CampusBuilding[]): CampusLocation | null {
  const building = buildings.find((candidate) => candidate.id === scanned.buildingId);
  if (!building) return null;
  return {
    id: `${building.id}-${scanned.room ?? scanned.floor ?? 'site'}`,
    buildingId: building.id,
    buildingName: building.name,
    floor: scanned.floor,
    room: scanned.room,
  };
}
