/**
 * Student identity rules.
 *
 * CampusNow has no sign-up: accounts exist because a campus IT office
 * created one, so the two things the app checks are that the address really
 * belongs to a college and that the USN looks like a real university seat
 * number. Both checks are pure functions so they can be unit tested and,
 * later, replaced by a server-side verification call.
 */

/** Academic suffixes that identify a college domain. */
const ACADEMIC_SUFFIXES = [
  'edu',
  'edu.in',
  'ac.in',
  'edu.au',
  'ac.uk',
  'edu.sg',
  'ac.jp',
  'edu.pk',
  'ac.ae',
  'edu.cn',
  'edu.my',
  'ac.nz',
];

const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

/** The domain part of an address, lower-cased. */
export function emailDomain(email: string): string {
  return email.trim().toLowerCase().split('@')[1] ?? '';
}

/** True when the address is a well-formed college email. */
export function isCollegeEmail(email: string): boolean {
  const value = email.trim().toLowerCase();
  if (!EMAIL.test(value)) return false;
  const domain = emailDomain(value);
  return ACADEMIC_SUFFIXES.some((suffix) => domain === suffix || domain.endsWith(`.${suffix}`));
}

/** Why an address was rejected — used for the field's inline message. */
export function emailProblem(email: string): string | null {
  const value = email.trim();
  if (value.length === 0) return null;
  if (!EMAIL.test(value)) return 'Enter your full college email address.';
  if (!isCollegeEmail(value)) {
    return 'That is not a college address. Use the email your campus issued you.';
  }
  return null;
}

/** A readable campus name from a domain: dsu.edu.in -> Dsu */
export function campusFromEmail(email: string): string {
  const domain = emailDomain(email);
  const first = domain.split('.')[0] ?? '';
  return first ? first.toUpperCase() : 'Campus';
}

/** USNs are upper-case and have no spaces. */
export function normaliseUsn(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

/**
 * A seat number.
 *
 * Every university issues these differently — `1DS21CS001`, `ENG23CS0520`,
 * `2023CSE0142`, or a purely numeric campus ID — so the app deliberately does
 * not impose a pattern. It only checks that the student typed something of a
 * plausible length; the campus verifies the real format when it checks the
 * record against the ID card.
 */
export function isUsn(value: string): boolean {
  const usn = normaliseUsn(value);
  return usn.length >= 5 && usn.length <= 24;
}

/** Why a USN was rejected — used for the field's inline message. */
export function usnProblem(value: string): string | null {
  const raw = value.trim();
  if (raw.length === 0) return null;
  if (!isUsn(raw)) return 'Enter your seat number as printed on your college ID card.';
  return null;
}

/** The six digits that verify the address. */
export function makeVerificationCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** `1DS21CS001` -> `1DS•••S001`, for quiet display in the profile. */
export function maskUsn(usn: string): string {
  if (usn.length <= 4) return usn;
  return `${usn.slice(0, 3)}${'•'.repeat(Math.max(0, usn.length - 7))}${usn.slice(-4)}`;
}
