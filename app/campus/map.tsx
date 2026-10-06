import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { colors } from '@/constants/colors';
import { corners } from '@/constants/layout';
import { type as typeScale } from '@/constants/typography';
import { Screen } from '@/components/layout/Screen';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { CampusMap } from '@/components/campus/CampusMap';
import { IssueRow } from '@/components/campus/IssueRow';
import { PrimaryButton } from '@/components/ui/Buttons';
import { Card, CardSection } from '@/components/ui/Card';
import { StatusDot } from '@/components/ui/StatusDot';
import { useBuildings, useIssues } from '@/hooks/useCampusData';
import { beginReportAndLocate } from '@/utils/startReport';

const LEGEND = [
  { tone: 'critical' as const, label: 'Major issue' },
  { tone: 'warning' as const, label: 'Moderate' },
  { tone: 'healthy' as const, label: 'Minor' },
];

/**
 * The campus diagram on its own, so students can browse blocks and see where
 * the open issues are before deciding to report anything.
 */
export default function CampusMapScreen() {
  const router = useRouter();
  const buildings = useBuildings();
  const issues = useIssues();
  const [selectedId, setSelectedId] = useState<string | null>(buildings[0]?.id ?? null);

  const selected = buildings.find((building) => building.id === selectedId) ?? null;
  const selectedIssues = issues.filter((issue) => issue.buildingId === selectedId);

  const reportHere = () => {
    if (!selected) return;
    beginReportAndLocate({
      id: `${selected.id}-site`,
      buildingId: selected.id,
      buildingName: selected.name,
    });
    router.push('/report');
  };

  return (
    <Screen back section="Campus">
      <SectionLabel>Pick a block</SectionLabel>

      <View style={styles.map}>
        <CampusMap
          buildings={buildings}
          issues={issues}
          selectedId={selectedId}
          onSelect={(building) => setSelectedId(building.id)}
        />
      </View>

      <View style={styles.legend}>
        {LEGEND.map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <StatusDot tone={item.tone} size={6} />
            <Text style={typeScale.label}>{item.label}</Text>
          </View>
        ))}
      </View>

      {selected ? (
        <Card style={styles.card}>
          <CardSection
            first
            title={selected.name}
            description={
              selected.issues === 0
                ? 'No open issues in this block.'
                : `${selected.issues} open ${selected.issues === 1 ? 'issue' : 'issues'} right now.`
            }
          >
            <View style={styles.zonePill}>
              <Text style={styles.zoneText}>{selected.zone}</Text>
            </View>
            <PrimaryButton label="Report an issue here" onPress={reportHere} style={styles.action} />
          </CardSection>
        </Card>
      ) : null}

      {selectedIssues.length > 0 ? (
        <>
          <SectionLabel style={styles.section}>Open here</SectionLabel>
          <Card>
            {selectedIssues.map((issue, index) => (
              <IssueRow key={issue.id} issue={issue} first={index === 0} />
            ))}
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  map: {
    marginTop: 10,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  card: {
    marginTop: 24,
  },
  zonePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: corners.chip.borderRadius,
    borderWidth: 1,
    borderColor: colors.line,
  },
  zoneText: {
    fontSize: 12.5,
    lineHeight: 16,
    color: colors.muted,
  },
  action: {
    marginTop: 16,
  },
  section: {
    marginTop: 30,
    marginBottom: 8,
  },
});
