import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { colors } from '@/constants/colors';
import { corners } from '@/constants/layout';
import { fontFamily, type as typeScale } from '@/constants/typography';
import { PressableScale } from '@/components/ui/PressableScale';
import type { CategoryMeta } from '@/types';
import { categoryIcons } from '@/utils/icons';

export type CategoryTileSize = 'large' | 'medium' | 'small' | 'wide';

type CategoryTileProps = {
  category: CategoryMeta;
  onPress: () => void;
  size?: CategoryTileSize;
  selected?: boolean;
  /** Block height, scaled per device by the caller */
  height?: number;
  style?: StyleProp<ViewStyle>;
};

/** Icon and label are sized together so the ratio never drifts. */
const glyphSize: Record<CategoryTileSize, number> = {
  large: 21,
  medium: 19,
  small: 18,
  wide: 20,
};

const labelSize: Record<CategoryTileSize, number> = {
  large: 15,
  medium: 14.5,
  small: 14,
  wide: 14.5,
};

/**
 * Category cell.
 *
 * The icon always sits beside its label — never above it — so a column of
 * tiles reads as a list of choices rather than a set of posters. The `wide`
 * variant is the only one that adds a line of supporting copy.
 */
export function CategoryTile({
  category,
  onPress,
  size = 'medium',
  selected = false,
  height,
  style,
}: CategoryTileProps) {
  const Icon = categoryIcons[category.id];
  // Only the blocks tall enough to hold a second line show the blurb.
  const detailed = size === 'wide' || size === 'large';

  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={category.label}
      accessibilityState={{ selected }}
      style={[
        styles.base,
        corners[size === 'small' ? 'tiny' : 'block'],
        height ? { height } : null,
        selected ? styles.selected : null,
        style,
      ]}
    >
      <Icon
        size={glyphSize[size]}
        color={selected ? colors.primary : colors.inkSoft}
        strokeWidth={1.8}
      />

      <View style={styles.copy}>
        <Text style={[styles.label, { fontSize: labelSize[size] }]} numberOfLines={1}>
          {category.label}
        </Text>
        {detailed ? (
          <Text style={[typeScale.meta, styles.blurb]} numberOfLines={size === 'wide' ? 1 : 2}>
            {category.blurb}
          </Text>
        ) : null}
      </View>

      {detailed ? <ChevronRight size={16} color={colors.faint} strokeWidth={1.9} /> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  selected: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primaryTintStrong,
  },
  copy: {
    flex: 1,
    gap: 1,
  },
  label: {
    fontFamily: fontFamily.medium,
    letterSpacing: -0.2,
    color: colors.ink,
  },
  blurb: {
    fontSize: 12.5,
    lineHeight: 17,
  },
});
