import { StyleSheet, Text, View } from 'react-native';
import { MapPin } from 'lucide-react-native';

import { colors } from '@/constants/colors';
import { corners } from '@/constants/layout';
import { fontFamily, type as typeScale } from '@/constants/typography';
import { Col, Grid, Row } from '@/components/ui/Grid';
import { StatusDot } from '@/components/ui/StatusDot';
import { PressableScale } from '@/components/ui/PressableScale';
import { useGrid } from '@/hooks/useGrid';
import type { CampusBuilding, CampusIssue } from '@/types';

type CampusMapProps = {
  buildings: CampusBuilding[];
  issues?: CampusIssue[];
  selectedId?: string | null;
  onSelect: (building: CampusBuilding) => void;
  /** Read-only mode is used when browsing the campus rather than reporting */
  interactive?: boolean;
};

/**
 * A designed campus diagram, not a map. Blocks sit on the same 4-column
 * grid as the rest of the app with different spans and heights, and faint
 * column guides run behind them to make the system visible.
 */
export function CampusMap({ buildings, issues = [], selectedId, onSelect, interactive = true }: CampusMapProps) {
  const { column, gutter, scale } = useGrid();

  const rows = Array.from(new Set(buildings.map((building) => building.row)))
    .sort((a, b) => a - b)
    .map((row) => buildings.filter((building) => building.row === row));

  const guides = Array.from({ length: 5 }, (_, index) => index * (column + gutter));

  return (
    <View style={styles.canvas}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {guides.map((x, index) => (
          <View key={index} style={[styles.guide, { left: x }]} />
        ))}
      </View>

      <Grid>
        {rows.map((row, rowIndex) => {
          const height = Math.round(Math.max(...row.map((building) => building.height)) * scale);
          return (
            <View key={rowIndex} style={{ marginBottom: gutter }}>
              <Row>
                {row.map((building) => {
                  const buildingIssues = issues.filter((issue) => issue.buildingId === building.id);
                  const selected = selectedId === building.id;
                  return (
                    <Col key={building.id} span={building.span}>
                      <BuildingBlock
                        building={building}
                        height={height}
                        issues={buildingIssues}
                        selected={selected}
                        interactive={interactive}
                        onPress={() => onSelect(building)}
                      />
                    </Col>
                  );
                })}
              </Row>
            </View>
          );
        })}
      </Grid>
    </View>
  );
}

function BuildingBlock({
  building,
  height,
  issues,
  selected,
  interactive,
  onPress,
}: {
  building: CampusBuilding;
  height: number;
  issues: CampusIssue[];
  selected: boolean;
  interactive: boolean;
  onPress: () => void;
}) {
  const worst = issues[0];
  const tone = worst ? (worst.severity === 'high' ? 'critical' : worst.severity === 'medium' ? 'warning' : 'healthy') : null;

  return (
    <PressableScale
      onPress={interactive ? onPress : undefined}
      haptic={interactive}
      style={[
        corners.block,
        styles.block,
        { height },
        selected ? styles.blockSelected : null,
      ]}
      accessibilityLabel={building.name}
    >
      <View style={styles.blockTop}>
        {tone ? <StatusDot tone={tone} size={7} /> : <View style={styles.emptyDot} />}
        {building.issues > 0 ? <Text style={[typeScale.label, styles.count]}>{building.issues}</Text> : null}
      </View>

      <View>
        <Text style={[styles.name, selected ? styles.nameSelected : null]} numberOfLines={1}>
          {building.short}
        </Text>
        <Text style={[typeScale.label, styles.zone]} numberOfLines={1}>
          {selected ? 'Selected' : building.zone}
        </Text>
      </View>

      {selected ? (
        <View style={styles.pin}>
          <MapPin size={13} color={colors.primary} strokeWidth={2} />
        </View>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  canvas: {
    position: 'relative',
  },
  guide: {
    position: 'absolute',
    top: -6,
    bottom: -6,
    width: 1,
    backgroundColor: colors.line,
    opacity: 0.7,
  },
  block: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  blockSelected: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primary,
  },
  blockTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyDot: {
    width: 7,
    height: 7,
  },
  count: {
    color: colors.faint,
  },
  name: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  nameSelected: {
    color: colors.primaryDeep,
  },
  zone: {
    fontSize: 9,
    letterSpacing: 1.2,
  },
  pin: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});
