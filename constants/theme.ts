/**
 * CampusNow theme system.
 *
 * The app is drawn from a single token set, so "dark mode" is one extra
 * palette with the *same keys* — every screen, card, border and glyph picks
 * up the new values because nothing in the app hard-codes a colour.
 *
 * Two pieces make it work:
 *
 *  1. `colors` (see `constants/colors.ts`) is a live proxy over the palette
 *     that is currently active, so any read — during render or while a
 *     stylesheet is being built — always sees today's values.
 *  2. Stylesheets are built lazily by `createStyles` (see
 *     `utils/themedStyles.ts`), which rebuilds them whenever
 *     `paletteVersion` changes.
 *
 * Together those two mean the theme flips without a reload and without a
 * second copy of every screen.
 */

/** Light — pure white canvas, grey hairlines, near-black ink. */
const light = {
  /** Page canvas */
  background: '#FFFFFF',
  /** Primary content surface — also white: borders do the separating */
  surface: '#FFFFFF',
  /** Quiet neutral fill (chips, icon tiles, callouts) */
  surfaceMuted: '#F4F4F5',
  /** Deeper neutral fill for bars and tracks */
  surfaceSunken: '#EAEAEC',

  /** Primary text */
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

  /** Brand — actions, links, the current destination. Greyscale so the app stays calm. */
  primary: '#52525B',
  primaryDeep: '#3A3A40',
  primaryTint: '#F2F2F4',
  primaryTintStrong: '#E4E4E7',

  /** Filled control (the one strong button) and the content that sits on it */
  solid: '#18181B',
  onSolid: '#FFFFFF',
  /** Switch knob while the control is off */
  knob: '#FFFFFF',

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
  /** Tint laid over the blur, at whatever alpha the surface asks for */
  glassWash: '255,255,255',

  /** Misc */
  white: '#FFFFFF',
  shadow: '#0B0B0F',
  overlay: 'rgba(11,11,15,0.4)',
} as const;

export type Palette = { [K in keyof typeof light]: string };

/** Dark — the same system inverted: near-black canvas, lifted surfaces, light ink. */
export const darkPalette: Palette = {
  background: '#08090A',
  surface: '#0E0F11',
  surfaceMuted: '#17181B',
  surfaceSunken: '#232428',

  ink: '#F7F7F8',
  inkSoft: '#D4D4D8',
  muted: '#9A9AA2',
  faint: '#6E6E76',

  line: '#26272B',
  lineStrong: '#34353A',

  primary: '#E4E4E7',
  primaryDeep: '#FAFAFA',
  primaryTint: '#191A1D',
  primaryTintStrong: '#2A2B2F',

  solid: '#FAFAFA',
  onSolid: '#0A0A0B',
  knob: '#D4D4D8',

  healthy: '#34D1B4',
  healthyTint: '#102A26',
  warning: '#D9A341',
  warningTint: '#2A2313',
  critical: '#F87171',
  criticalTint: '#2C1418',

  glassTint: 'rgba(14,15,17,0.6)',
  glassTintStrong: 'rgba(14,15,17,0.82)',
  glassBorder: 'rgba(255,255,255,0.09)',
  glassRim: 'rgba(255,255,255,0.07)',
  glassWash: '14,15,17',

  white: '#FFFFFF',
  shadow: '#000000',
  overlay: 'rgba(0,0,0,0.6)',
};

export const lightPalette: Palette = light;

/** How the student wants the app to look. `system` follows the device. */
export type ThemeMode = 'light' | 'dark' | 'system';

/** What is actually painted right now. */
export type ThemeScheme = 'light' | 'dark';

export const themeModes: { id: ThemeMode; label: string; blurb: string }[] = [
  { id: 'system', label: 'System', blurb: 'Follows the device setting' },
  { id: 'light', label: 'Light', blurb: 'White canvas, grey hairlines' },
  { id: 'dark', label: 'Dark', blurb: 'Near-black canvas, lifted surfaces' },
];

let active: Palette = lightPalette;
let scheme: ThemeScheme = 'light';

/**
 * Bumped on every palette change. Stylesheets created by `createStyles`
 * compare against it and rebuild when it moves.
 */
export const paletteVersion = { current: 0 };

export function palette(): Palette {
  return active;
}

export function activeScheme(): ThemeScheme {
  return scheme;
}

/** Swaps the live palette. Called by the theme store, never by a screen. */
export function applyPalette(next: ThemeScheme): void {
  scheme = next;
  active = next === 'dark' ? darkPalette : lightPalette;
  paletteVersion.current += 1;
}
