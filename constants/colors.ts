/**
 * CampusNow colour system.
 *
 * Pure white canvas, no colour fills for decoration: everything is white,
 * separation comes from a grey border, and colour is reserved for meaning —
 * black for content, grey for support, blue for actions and the current
 * destination, red for destructive and critical, teal/amber for health.
 */
export const colors = {
  /** Page canvas — pure white */
  background: '#FFFFFF',
  /** Primary content surface — also white: borders do the separating */
  surface: '#FFFFFF',
  /** Quiet neutral fill (chips, icon tiles, callouts) */
  surfaceMuted: '#F4F4F5',
  /** Deeper neutral fill for bars and tracks */
  surfaceSunken: '#EAEAEC',

  /** Primary text — near black */
  ink: '#0B0B0F',
  /** Secondary text */
  inkSoft: '#3F3F46',
  /** Supporting text */
  muted: '#71717A',
  /** Quiet metadata / disabled */
  faint: '#A1A1AA',

  /** Hairlines — the only separation device in the app */
  line: '#E7E7E9',
  lineStrong: '#D4D4D8',

  /** Brand blue — actions, links, the current destination */
  primary: '#287AF5',
  primaryDeep: '#1A5ED6',
  primaryTint: '#EDF3FE',
  primaryTintStrong: '#D8E6FD',

  /** Status accents */
  healthy: '#0E9C87',
  healthyTint: '#E4F4F1',
  warning: '#C68A05',
  warningTint: '#FBF1DC',
  critical: '#DC3B52',
  criticalTint: '#FCEAEC',

  /** Glass */
  glassTint: 'rgba(255,255,255,0.58)',
  glassTintStrong: 'rgba(255,255,255,0.78)',
  /** Grey rim so glass reads on a white page */
  glassBorder: 'rgba(11,11,15,0.09)',
  glassRim: 'rgba(212,212,216,0.7)',

  /** Misc */
  white: '#FFFFFF',
  shadow: '#0B0B0F',
  overlay: 'rgba(11,11,15,0.4)',
} as const;

export type Tone = 'primary' | 'healthy' | 'warning' | 'critical' | 'neutral';

export const toneColor: Record<Tone, string> = {
  primary: colors.primary,
  healthy: colors.healthy,
  warning: colors.warning,
  critical: colors.critical,
  neutral: colors.faint,
};

export const toneTint: Record<Tone, string> = {
  primary: colors.primaryTint,
  healthy: colors.healthyTint,
  warning: colors.warningTint,
  critical: colors.criticalTint,
  neutral: colors.surfaceMuted,
};
