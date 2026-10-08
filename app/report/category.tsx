import { Text } from 'react-native';
import { useRouter } from 'expo-router';

import { type as typeScale } from '@/constants/typography';
import { Screen } from '@/components/layout/Screen';
import { CategoryTile } from '@/components/report/CategoryTile';
import { PrimaryButton } from '@/components/ui/Buttons';
import { Card, CardRow, Pill } from '@/components/ui/Card';
import { FooterNote } from '@/components/ui/FooterNote';
import { Col, Grid, Row, Stack } from '@/components/ui/Grid';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useGrid } from '@/hooks/useGrid';
import { useServices } from '@/hooks/useCampusData';
import { useReportDraft } from '@/stores/reportDraft';
import { categoryMeta } from '@/data/catalog';
import { priorityMeta, serviceNowPriority } from '@/utils/status';
import { Server, Tag, Users, Flag } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { createStyles } from '@/utils/themedStyles';

/**
 * Step 2 of the report flow — pick what is wrong.
 *
 * The grid is the same asymmetric composition used on Home, and the routing
 * card below it is a read-only preview of where the ticket lands: assignment
 * group, configuration item and priority, all computed from the category and
 * the triage the student set on the previous screen.
 */
export default function CategoryScreen() {
  const router = useRouter();
  const draft = useReportDraft();
  const setCategory = useReportDraft((state) => state.setCategory);
  const services = useServices();
  const { size } = useGrid();

  const active = draft.categoryId ? categoryMeta(draft.categoryId) : null;
  const group = active ? services.find((service) => service.id === active.serviceId) : null;
  const priority = serviceNowPriority(draft.impact, draft.urgency);
  const pMeta = priorityMeta[priority];

  const goLocation = () => {
    if (draft.categoryId) router.push('/report/location');
  };

  return (
    <Screen back section="Category">
      <SectionLabel trailing={active ? <Pill>{active.label}</Pill> : null}>Pick what is wrong</SectionLabel>

      {/* Asymmetric composition: 1 tall + 2 stacked, 2 stacked + 1 tall,
          then one wide row. Different sizes, one grid. */}
      <Grid style={styles.grid}>
        <Row>
          <Col span={2}>
            <CategoryTile
              category={categoryMeta('wifi')}
              size="large"
              height={size(132)}
              selected={draft.categoryId === 'wifi'}
              onPress={() => setCategory('wifi')}
            />
          </Col>
          <Col span={2}>
            <Stack>
              <CategoryTile
                category={categoryMeta('lab')}
                size="medium"
                height={size(60)}
                selected={draft.categoryId === 'lab'}
                onPress={() => setCategory('lab')}
              />
              <CategoryTile
                category={categoryMeta('projector')}
                size="medium"
                height={size(60)}
                selected={draft.categoryId === 'projector'}
                onPress={() => setCategory('projector')}
              />
            </Stack>
          </Col>
        </Row>

        <Row style={styles.gridRow}>
          <Col span={2}>
            <Stack>
              <CategoryTile
                category={categoryMeta('mess')}
                size="medium"
                height={size(56)}
                selected={draft.categoryId === 'mess'}
                onPress={() => setCategory('mess')}
              />
              <CategoryTile
                category={categoryMeta('access')}
                size="small"
                height={size(56)}
                selected={draft.categoryId === 'access'}
                onPress={() => setCategory('access')}
              />
            </Stack>
          </Col>
          <Col span={2}>
            <CategoryTile
              category={categoryMeta('ac')}
              size="large"
              height={size(124)}
              selected={draft.categoryId === 'ac'}
              onPress={() => setCategory('ac')}
            />
          </Col>
        </Row>

        <Row style={styles.gridRow}>
          <Col span={3}>
            <CategoryTile
              category={categoryMeta('classroom')}
              size="wide"
              height={size(88)}
              selected={draft.categoryId === 'classroom'}
              onPress={() => setCategory('classroom')}
            />
          </Col>
          <Col span={1}>
            <CategoryTile
              category={categoryMeta('other')}
              size="small"
              height={size(88)}
              selected={draft.categoryId === 'other'}
              onPress={() => setCategory('other')}
            />
          </Col>
        </Row>
      </Grid>

      <SectionLabel style={styles.groupHeading} textStyle={styles.groupHeadingText}>
        Routing
      </SectionLabel>
      <Text style={[typeScale.label, styles.groupNote]}>
        Where the ticket lands — read-only, filled in from your category and triage.
      </Text>

      {/* Read-only preview of where the incident lands — computed live from
          the category and the triage, exactly as ServiceNow would. */}
      <Card style={styles.groupCard}>
        <CardRow
          first
          dense
          icon={Users}
          title="Assignment group"
          right={<Text style={styles.rowValue}>{group ? group.lead : 'Pick a category'}</Text>}
        />
        <CardRow
          dense
          icon={Server}
          title="Configuration item"
          right={<Text style={styles.rowValue}>{group ? group.name : '—'}</Text>}
        />
        <CardRow
          dense
          icon={Flag}
          title="Priority"
          description={pMeta.blurb}
          right={<Pill tone={pMeta.tone}>{pMeta.label}</Pill>}
        />
        <CardRow
          dense
          icon={Tag}
          title="Category"
          right={<Text style={styles.rowValue}>{active ? active.label : 'Pick a category'}</Text>}
        />
      </Card>

      <PrimaryButton
        label="Continue to location"
        onPress={goLocation}
        disabled={!draft.categoryId}
        style={styles.continue}
      />
      <FooterNote style={styles.note}>
        {draft.categoryId
          ? 'Step 2 of 5 — next you point at the block where it is happening.'
          : 'Pick a category above to continue.'}
      </FooterNote>
    </Screen>
  );
}

const styles = createStyles(() => ({
  grid: {
    marginTop: 8,
  },
  gridRow: {
    marginTop: 8,
  },
  groupHeading: {
    marginTop: 30,
  },
  groupHeadingText: {
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: -0.4,
  },
  groupNote: {
    marginTop: 4,
    marginBottom: 2,
  },
  groupCard: {
    marginTop: 12,
  },
  rowValue: {
    fontFamily: typeScale.bodyStrong.fontFamily,
    fontSize: 13.5,
    color: colors.inkSoft,
    flexShrink: 1,
    textAlign: 'right',
  },
  continue: {
    marginTop: 26,
  },
  note: {
    marginTop: 12,
  },
}));
