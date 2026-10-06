import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';
import { layout } from '@/constants/layout';
import { spacing } from '@/constants/spacing';
import { AppHeader } from './AppHeader';

type ScreenProps = {
  children: ReactNode;
  /** Renders the CampusNow header bar */
  header?: boolean;
  /** Header shows a back control instead of the wordmark */
  back?: boolean;
  /** Quiet label in the header, e.g. "Report" */
  section?: string;
  scroll?: boolean;
  /** Skip the horizontal padding for full-bleed compositions */
  edgeToEdge?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * Shared page shell: safe area, header, scrolling and the bottom spacing
 * that keeps content clear of the floating dock that overlays it.
 */
export function Screen({
  children,
  header = true,
  back = false,
  section,
  scroll = true,
  edgeToEdge = false,
  contentStyle,
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  // The dock floats over the content, so every screen reserves the band it
  // rides in plus the home indicator.
  const dockClearance = layout.dockHeight + layout.dockMargin + insets.bottom;

  const inner: StyleProp<ViewStyle> = [
    {
      // On wide windows (tablets, desktop preview) the column stays the
      // phone width the grid is tuned for instead of stretching left-anchored.
      width: '100%',
      maxWidth: layout.maxContentWidth,
      alignSelf: 'center',
      paddingHorizontal: edgeToEdge ? 0 : layout.screenPadding,
      paddingTop: spacing.lg,
      paddingBottom: dockClearance + spacing.xl,
    },
    contentStyle,
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {header ? <AppHeader back={back} section={section} /> : null}
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={inner}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, inner]}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
});
