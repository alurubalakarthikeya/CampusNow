import type { TextStyle } from 'react-native';

import { colors } from './colors';

/**
 * Poppins is loaded in the root layout. Never reference these families
 * before `useCampusFonts()` reports ready.
 */
export const fontFamily = {
  light: 'Poppins_300Light',
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
} as const;

/**
 * Type scale, tuned for a 360–430pt phone first.
 *
 * Screen titles are large and tight, section titles are modest, supporting
 * copy is grey, and `label` is a quiet sentence-case eyebrow — not a loud
 * tracked-out micro header.
 */
/**
 * Type scale.
 *
 * The app has one job for each size and the sizes are deliberately close
 * together — a phone screen is small, and a hierarchy built from 12 to 34px
 * is what makes type look broken. Reading order is:
 *   screenTitle (a subject, used sparingly) > section (group heading) >
 *   title (heading inside a card) > bodyStrong (a row) >
 *   body/meta (support) > label (a caption).
 * Nothing here is large; emphasis comes from weight and colour.
 */
export const type = {
  /** The greeting on Home, and important subjects */
  hero: {
    fontFamily: fontFamily.semibold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.7,
    color: colors.ink,
  },
  /** A screen's subject line */
  display: {
    fontFamily: fontFamily.semibold,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.5,
    color: colors.ink,
  },
  heading: {
    fontFamily: fontFamily.semibold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.4,
    color: colors.ink,
  },
  /** Group heading above a card or a block of rows */
  section: {
    fontFamily: fontFamily.semibold,
    fontSize: 15.5,
    lineHeight: 21,
    letterSpacing: -0.2,
    color: colors.ink,
  },
  /** Heading inside a card */
  title: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 23,
    color: colors.muted,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 14.5,
    lineHeight: 22,
    color: colors.muted,
  },
  bodyStrong: {
    fontFamily: fontFamily.medium,
    fontSize: 14.5,
    lineHeight: 21,
    color: colors.ink,
  },
  meta: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
  },
  /** Caption — the quietest readable size */
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
    textTransform: 'none',
    color: colors.muted,
  },
  metric: {
    fontFamily: fontFamily.semibold,
    fontSize: 22,
    lineHeight: 27,
    letterSpacing: -0.7,
    color: colors.ink,
  },
  metricLarge: {
    fontFamily: fontFamily.semibold,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -1.2,
    color: colors.ink,
  },
  metricHero: {
    fontFamily: fontFamily.semibold,
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -1.8,
    color: colors.ink,
  },
} satisfies Record<string, TextStyle>;

export type TypeToken = keyof typeof type;
