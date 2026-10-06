import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { colors, toneColor, toneTint, type Tone } from '@/constants/colors';
import { type as typeScale } from '@/constants/typography';
import { Screen } from '@/components/layout/Screen';
import { PageHeading } from '@/components/layout/PageHeading';
import { IssueRow } from '@/components/campus/IssueRow';
import { Card, CardRow, CardSection } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { FooterNote } from '@/components/ui/FooterNote';
import { Metric } from '@/components/ui/Metric';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { StatusDot } from '@/components/ui/StatusDot';
import { useIssues, useServices } from '@/hooks/useCampusData';
import { serviceIcons } from '@/utils/icons';
import { plural } from '@/utils/format';
import { healthStateMeta } from '@/utils/status';

function toneFor(health: number): Tone {
  if (health >= 90) return 'healthy';
  if (health >= 80) return 'primary';
  return 'warning';
}

/** One campus service: its score, who owns it, and what is open right now. */
export default function ServiceScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const services = useServices();
  const issues = useIssues();

  const service = services.find((item) => item.id === params.id) ?? services[0];

  if (!service) {
    return (
      <Screen back section="Service">
        <EmptyState title="Service not found." message="Campus services could not be loaded." />
      </Screen>
    );
  }

  const tone = toneFor(service.health);
  const state = healthStateMeta[service.state];
  const serviceIssues = issues.filter((issue) => issue.serviceId === service.id);

  return (
    <Screen back section="Service">
      <PageHeading label={state.label} title={service.name} size="display" />

      {/* Score card — the one place a large number belongs on this screen. */}
      <Card style={styles.card}>
        <CardSection first title="Operational score" description={service.summary}>
          <View style={styles.scoreRow}>
            <Metric value={service.health} unit="%" size="large" valueColor={toneColor[tone]} />
          </View>
          <View style={styles.track}>
            <View
              style={[styles.fill, { width: `${service.health}%`, backgroundColor: toneColor[tone] }]}
            />
          </View>
        </CardSection>
      </Card>

      {/* Ownership and load, as a plain grouped list — long team names stay at
          body size so nothing is stretched into a headline. */}
      <Card style={styles.card}>
        <CardRow
          first
          title="Assigned team"
          right={
            <Text style={[typeScale.bodyStrong, styles.value]} numberOfLines={2}>
              {service.lead}
            </Text>
          }
        />
        <CardRow
          title="Open issues"
          right={
            <Text style={[typeScale.bodyStrong, styles.value]}>{service.openIssues}</Text>
          }
        />
        <CardRow
          title="Current status"
          right={
            <View style={[styles.stateTag, { backgroundColor: toneTint[state.tone] }]}>
              <StatusDot tone={state.tone} size={6} />
              <Text style={[styles.stateText, { color: toneColor[state.tone] }]}>{state.label}</Text>
            </View>
          }
        />
      </Card>

      <SectionLabel style={styles.section}>Open in this service</SectionLabel>

      {serviceIssues.length === 0 ? (
        <EmptyState
          title="Nothing open here."
          message="This service has no unresolved issues on campus right now."
        />
      ) : (
        <Card>
          {serviceIssues.map((issue, index) => (
            <IssueRow key={issue.id} issue={issue} first={index === 0} />
          ))}
        </Card>
      )}

      <FooterNote style={styles.footnote}>
        Reports in this service are routed to the {service.lead} ·{' '}
        {plural(serviceIssues.length, 'active issue')} tracked
      </FooterNote>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
  },
  scoreRow: {
    alignItems: 'flex-start',
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: colors.surfaceSunken,
    marginTop: 14,
  },
  fill: {
    height: 6,
    borderRadius: 3,
  },
  value: {
    flexShrink: 1,
    textAlign: 'right',
  },
  stateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  stateText: {
    fontSize: 12.5,
    lineHeight: 16,
  },
  section: {
    marginTop: 30,
    marginBottom: 8,
  },
  footnote: {
    marginTop: 24,
  },
});
