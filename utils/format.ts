/** Date / copy formatting helpers. Kept dependency-free and locale-safe. */

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function greeting(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export function daysAgo(days: number): string {
  return minutesAgo(days * 24 * 60);
}

export function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

/** 24h clock, e.g. 10:42 */
export function clock(iso: string): string {
  const date = new Date(iso);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/** Today / Yesterday / Mon / 12 Sep */
export function dayLabel(iso: string): string {
  const date = new Date(iso);
  const diff = startOfDay(new Date()) - startOfDay(date);
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) return 'Today';
  if (diff < day * 2) return 'Yesterday';
  if (diff < day * 6) return DAYS[date.getDay()] ?? '';
  return `${date.getDate()} ${MONTHS[date.getMonth()] ?? ''}`;
}

/** Today, 10:42 — used across the report feed and activity lists. */
export function stamp(iso: string): string {
  return `${dayLabel(iso)}, ${clock(iso)}`;
}

/** minutes → "12 min" | "2 h" | "3 d" */
export function duration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} h`;
  return `${Math.round(minutes / (60 * 24))} d`;
}

/** milliseconds → "42s" | "1m 20s" */
export function countdown(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  if (total < 60) return `${total}s`;
  return `${Math.floor(total / 60)}m ${String(total % 60).padStart(2, '0')}s`;
}

export function plural(count: number, singular: string, pluralForm?: string): string {
  return `${count} ${count === 1 ? singular : (pluralForm ?? `${singular}s`)}`;
}

export function locationLine(location: { buildingName: string; floor?: string; room?: string }): string {
  return [location.buildingName, location.floor, location.room].filter(Boolean).join(' · ');
}
