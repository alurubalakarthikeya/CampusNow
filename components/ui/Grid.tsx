import { createContext, useContext, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { layout } from '@/constants/layout';
import { useGrid, type GridMetrics } from '@/hooks/useGrid';

const GridContext = createContext<GridMetrics | null>(null);

function useGridContext(): GridMetrics {
  const value = useContext(GridContext);
  if (!value) throw new Error('Row/Col/Stack must be rendered inside <Grid>');
  return value;
}

type GridProps = {
  children: ReactNode;
  /** Defaults to the 4 column CampusNow grid */
  columns?: number;
  gutter?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Publishes the grid metrics to its children. Compositions are then written
 * as Rows and Cols with explicit spans — different sizes, one system.
 */
export function Grid({ children, columns = layout.columns, gutter = layout.gutter, style }: GridProps) {
  const metrics = useGrid(columns, gutter);
  return (
    <GridContext.Provider value={metrics}>
      <View style={style}>{children}</View>
    </GridContext.Provider>
  );
}

type RowProps = {
  children: ReactNode;
  gap?: number;
  style?: StyleProp<ViewStyle>;
  align?: ViewStyle['alignItems'];
};

/** A row of grid cells. All cells in a row stretch to the tallest block. */
export function Row({ children, gap, style, align = 'stretch' }: RowProps) {
  const { gutter } = useGridContext();
  return (
    <View style={[{ flexDirection: 'row', alignItems: align, gap: gap ?? gutter }, style]}>{children}</View>
  );
}

type ColProps = {
  children: ReactNode;
  /** How many grid columns this cell spans */
  span?: number;
  style?: StyleProp<ViewStyle>;
};

/** A cell spanning n columns of the grid, gutters included. */
export function Col({ children, span = 1, style }: ColProps) {
  const { span: spanWidth, columns } = useGridContext();
  const width = span >= columns ? '100%' : spanWidth(span);
  return <View style={[{ width }, style]}>{children}</View>;
}

type StackProps = {
  children: ReactNode;
  gap?: number;
  style?: StyleProp<ViewStyle>;
};

/** Vertical stack used inside a Col to build 2-up compositions. */
export function Stack({ children, gap, style }: StackProps) {
  const { gutter } = useGridContext();
  return <View style={[{ flex: 1, gap: gap ?? gutter }, style]}>{children}</View>;
}
