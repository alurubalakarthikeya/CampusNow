import type { TextStyle, ViewStyle } from 'react-native';

import { colors } from './colors';

/**
 * Layout constants. `columns` + `gutter` define the invisible grid that
 * every screen composition snaps to.
 */
export const layout = {
  screenPadding: 20,
  columns: 4,
  gutter: 12,
  maxContentWidth: 640,
  /** Top bar — a little taller than the controls inside it */
  headerHeight: 52,
  /** Top bar controls */
  controlHeight: 40,
  /** The bar hugs the screen edge so the mark sits further left */
  headerPadding: 14,
  /** Floating dock — a slim pill; the icons set the width */
  dockHeight: 50,
  dockItem: 41,
  dockItemHeight: 42,
  dockIcon: 22,
  dockPadding: 8,
  dockMargin: 14,
  cardPadding: 18,
  /** Vertical breathing room between conceptual sections */
  sectionGap: 28,
  /** Design reference width used to scale fixed block heights */
  baseWidth: 390,
} as const;

export type CornerKey =
  | 'none'
  | 'tiny'
  | 'block'
  | 'leaf'
  | 'leafFlip'
  | 'wide'
  | 'wideFlip'
  | 'panel'
  | 'dock'
  | 'button'
  | 'buttonGhost'
  | 'chip'
  | 'pill'
  | 'blockFlip';

/**
 * Radius scale. Every container is rounded equally on all four sides; the
 * token only decides how round. Pills are for badges and the dock.
 * Cards sit around 18, controls around 12 — flat, modern, never bubbly.
 */
export const corners: Record<CornerKey, ViewStyle> = {
  none: { borderRadius: 0 },
  tiny: { borderRadius: 10 },
  block: { borderRadius: 13 },
  blockFlip: { borderRadius: 13 },
  leaf: { borderRadius: 16 },
  leafFlip: { borderRadius: 16 },
  wide: { borderRadius: 20 },
  wideFlip: { borderRadius: 20 },
  panel: { borderRadius: 18 },
  dock: { borderRadius: 999 },
  button: { borderRadius: 12 },
  buttonGhost: { borderRadius: 12 },
  chip: { borderRadius: 10 },
  pill: { borderRadius: 999 },
};

/** The one border in the app: a single pixel of grey. */
export const hairline = { borderWidth: 1, borderColor: colors.line } as const;

/** Same, spaced for a control rather than a rule. */
export const controlBorder = {
  borderWidth: 1,
  borderColor: colors.line,
  backgroundColor: colors.surface,
} as const;

/**
 * The same corner geometry for text-styled surfaces (TextInput).
 * Text inputs take a TextStyle, so the values are re-expressed here rather
 * than duplicated per screen.
 */
export function textCorners(key: CornerKey): TextStyle {
  return corners[key] as TextStyle;
}

/**
 * The app has no drop shadows. Separation comes from a 1px grey border
 * (`colors.line`), which is what keeps a white-on-white interface readable
 * and calm instead of puffy. The keys are kept so call sites stay stable.
 */
export const shadows = {
  none: {},
  hairline: {},
  soft: {},
  float: {},
  dock: {},
} satisfies Record<string, ViewStyle>;
