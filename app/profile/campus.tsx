import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin } from 'lucide-react-native';

import { colors } from '@/constants/colors';
import { type as typeScale } from '@/constants/typography';
import { Screen } from '@/components/layout/Screen';
import { Card, CardRow } from '@/components/ui/Card';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { StatusDot } from '@/components/ui/StatusDot';
import { useBuildings, useReportStats, useUser } from '@/hooks/useCampusData';
import { plural } from '@/utils/format';

/** The campus this account is registered to, and every block on it. */
export default function CampusDetailsScreen() {
  const router = useRouter();
  const user = useUser();
  const stats = useReportStats();
  const buildings = useBuildings();

  const openIssues = buildings.reduce((total, building) => total + building.issues, 0);

  return (
    <Screen back section="Campus">
      <Card>
        <CardRow
          first
          title={user.university}
          description={`Campus ID ${user.campusId}`}
        />
        <CardRow
          icon={MapPin}
          title="Campus map"
          description={`${plural(buildings.length, 'block')} · ${plural(openIssues, 'open issue')}`}
          onPress={() => router.push('/campus/map')}
        />
        <CardRow
          title="Reports on this device"
          right={<Text style={styles.value}>{stats.total}</Text>}
        />
        <CardRow title="Resolved" right={<Text style={styles.value}>{stats.resolved}</Text>} />
        <CardRow title="Active" right={<Text style={styles.value}>{stats.active}</Text>} />
      </Card>

      <SectionLabel style={styles.section}>Blocks you can report from</SectionLabel>

      <Card>
        {buildings.map((building, index) => (
          <CardRow
            key={building.id}
            first={index === 0}
            title={building.name}
            description={building.zone}
            right={
              building.issues > 0 ? (
                <View style={styles.issueTag}>
                  <StatusDot tone={building.issues > 2 ? 'critical' : 'warning'} size={6} />
                  <Text style={[typeScale.meta, styles.issueText]}>
                    {plural(building.issues, 'issue')}
                  </Text>
                </View>
              ) : (
                <Text style={[typeScale.meta, styles.clear]}>Clear</Text>
              )
            }
          />
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  value: {
    ...typeScale.bodyStrong,
    fontVariant: ['tabular-nums'],
  },
  section: {
    marginTop: 28,
    marginBottom: 8,
  },
  issueTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  issueText: {
    color: colors.warning,
  },
  clear: {
    color: colors.healthy,
  },
});
