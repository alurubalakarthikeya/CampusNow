import type { CampusBuilding, GeoPoint } from '@/types';

const EARTH_RADIUS_M = 6_371_000;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

/** Great-circle distance in metres. */
export function distanceInMetres(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Picks the building closest to a position. Stands in for the campus
 * geofencing service that will eventually come from the API.
 */
export function nearestBuilding(
  position: GeoPoint,
  buildings: CampusBuilding[],
): { building: CampusBuilding; metres: number } | null {
  let best: { building: CampusBuilding; metres: number } | null = null;
  for (const building of buildings) {
    const metres = distanceInMetres(position, building.coords);
    if (!best || metres < best.metres) best = { building, metres };
  }
  return best;
}
