import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { PulseBlock } from '@/components/campus/PulseBlock';
import { ServiceHealthBlock } from '@/components/campus/ServiceHealthBlock';
import { IssueRow } from '@/components/campus/IssueRow';
import { Card } from '@/components/ui/Card';
import { Col, Grid, Row, Stack } from '@/components/ui/Grid';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { TextButton } from '@/components/ui/Buttons';
import { useCampusStatus, useIssues, useServices } from '@/hooks/useCampusData';
import { useGrid } from '@/hooks/useGrid';

/**
 * Campus Pulse. The operational score leads, service health follows on an
 * asymmetric grid, and the major issues close the page in one quiet card.
 */
export default function CampusScreen() {
  const router = useRouter();
  const status = useCampusStatus();
  const services = useServices();
  const issues = useIssues();
  const { size } = useGrid();

  const service = (id: string) => services.find((item) => item.id === id);
  const food = service('food');
  const it = service('it');
  const facilities = service('facilities');
  const access = service('access');

  return (
    <Screen>
      <PulseBlock status={status} serviceCount={services.length} variant="hero" />

      <SectionLabel
        style={styles.section}
        trailing={
          <TextButton label="Campus map" onPress={() => router.push('/campus/map')} align="right" />
        }
      >
        Service health
      </SectionLabel>

      <Grid style={styles.grid}>
        <Row>
          <Col span={2}>
            {food ? (
              <ServiceHealthBlock
                service={food}
                height={size(128)}
                onPress={() =>
                  router.push({ pathname: '/campus/service', params: { id: food.id } })
                }
              />
            ) : null}
          </Col>
          <Col span={2}>
            <Stack>
              {it ? (
                <ServiceHealthBlock
                  service={it}
                  variant="compact"
                  height={size(58)}
                  onPress={() => router.push({ pathname: '/campus/service', params: { id: it.id } })}
                />
              ) : null}
              {facilities ? (
                <ServiceHealthBlock
                  service={facilities}
                  variant="compact"
                  height={size(58)}
                  onPress={() =>
                    router.push({ pathname: '/campus/service', params: { id: facilities.id } })
                  }
                />
              ) : null}
            </Stack>
          </Col>
        </Row>

        <Row style={styles.gridRow}>
          <Col span={4}>
            {access ? (
              <ServiceHealthBlock
                service={access}
                variant="wide"
                height={size(78)}
                onPress={() =>
                  router.push({ pathname: '/campus/service', params: { id: access.id } })
                }
              />
            ) : null}
          </Col>
        </Row>
      </Grid>

      <SectionLabel style={styles.section}>Major issues</SectionLabel>

      <Card style={styles.issues}>
        {issues.map((issue, index) => (
          <IssueRow
            key={issue.id}
            issue={issue}
            first={index === 0}
            onPress={() =>
              router.push({ pathname: '/campus/service', params: { id: issue.serviceId } })
            }
          />
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 28,
  },
  grid: {
    marginTop: 12,
  },
  gridRow: {
    marginTop: 12,
  },
  issues: {
    marginTop: 12,
  },
});
