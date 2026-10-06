import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import { layout } from '@/constants/layout';

export interface GridMetrics {
  /** Full window width */
  width: number;
  /** Width available for grid content */
  contentWidth: number;
  /** Width of a single grid column */
  column: number;
  gutter: number;
  columns: number;
  /** Height / spacing multiplier so fixed block heights stay proportional */
  scale: number;
  /** Pixel width of an n-column span, gutters included */
  span: (columns: number) => number;
  /** Scale a reference height or gap */
  size: (value: number) => number;
}

/**
 * Single source of truth for the invisible grid. Every asymmetric
 * composition measures itself through this hook, so nothing is hardcoded
 * to one device width.
 */
export function useGrid(columns: number = layout.columns, gutter: number = layout.gutter): GridMetrics {
  const { width } = useWindowDimensions();

  return useMemo(() => {
    const contentWidth = Math.min(width, layout.maxContentWidth) - layout.screenPadding * 2;
    const column = (contentWidth - gutter * (columns - 1)) / columns;
    const scale = Math.min(1.18, Math.max(0.88, width / layout.baseWidth));

    return {
      width,
      contentWidth,
      column,
      gutter,
      columns,
      scale,
      span: (span: number) => column * span + gutter * (span - 1),
      size: (value: number) => Math.round(value * scale),
    };
  }, [width, columns, gutter]);
}
