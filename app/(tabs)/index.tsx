import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, Search } from 'lucide-react-native';

import { colors } from '@/constants/colors';
import { fontFamily, type as typeScale } from '@/constants/typography';
import { Screen } from '@/components/layout/Screen';
import { CategoryTile } from '@/components/report/CategoryTile';
import { ReportRow } from '@/components/report/ReportRow';
import { PulseBlock } from '@/components/campus/PulseBlock';
import { Card } from '@/components/ui/Card';
import { Col, Grid, Row, Stack } from '@/components/ui/Grid';
import { PressableScale } from '@/components/ui/PressableScale';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { TextButton } from '@/components/ui/Buttons';
import { useCampusStatus, useRecentActivity, useServices, useUser } from '@/hooks/useCampusData';
import { useGrid } from '@/hooks/useGrid';
import { useReportDraft } from '@/stores/reportDraft';
import { categoryMeta } from '@/data/mock/categories';
import type { ReportCategoryId } from '@/types';
import { greeting } from '@/utils/format';

/**
 * Home. Three jobs, in order: say what is wrong, understand what is happening
 * on campus, and see recent activity. The problem field is a real input — what
 * you type here is carried into the report flow.
 */
export default function HomeScreen() {
  const router = useRouter();
  const user = useUser();
  const status = useCampusStatus();
  const services = useServices();
  const recent = useRecentActivity(3);
  const beginReport = useReportDraft((state) => state.beginReport);
  const { size } = useGrid();
  const [prompt, setPrompt] = useState('');

  const startReport = (categoryId?: ReportCategoryId, description?: string) => {
    beginReport(categoryId, description);
    router.push('/report');
  };

  /** Anything typed here becomes the report's description as you continue. */
  const continueWithPrompt = () => {
    const text = prompt.trim();
    if (text.length === 0) {
      router.push('/report');
      return;
    }
    startReport(undefined, text);
  };

  return (
    <Screen>
      <Text style={[typeScale.heading, styles.greeting]}>
        {greeting()}, {user.name.split(' ')[0]}.
      </Text>

      {/* Report surface — one compact row, the most important control here */}
      <Card style={styles.promptCard}>
        <View style={styles.promptRow}>
          <Search size={17} color={colors.faint} strokeWidth={2.1} />
          <TextInput
            value={prompt}
            onChangeText={setPrompt}
            onSubmitEditing={continueWithPrompt}
            placeholder="Describe a problem…"
            placeholderTextColor={colors.faint}
            selectionColor={colors.primary}
            returnKeyType="next"
            autoCorrect={false}
            style={styles.promptInput}
            accessibilityLabel="Describe a problem"
          />
          <PressableScale
            onPress={continueWithPrompt}
            scaleTo={0.9}
            accessibilityLabel="Continue with this description"
            style={styles.promptGo}
          >
            <ArrowRight size={16} color={colors.white} strokeWidth={2.2} />
          </PressableScale>
        </View>
      </Card>

      <SectionLabel
        style={styles.section}
        trailing={<TextButton label="See all" onPress={() => router.push('/report')} align="right" />}
      >
        Quick report
      </SectionLabel>

      {/* Asymmetric composition: 1 tall + 2 stacked, then 2 stacked + 1 tall */}
      <Grid style={styles.grid}>
        <Row>
          <Col span={2}>
            <CategoryTile
              category={categoryMeta('wifi')}
              size="large"
              height={size(140)}
              onPress={() => startReport('wifi')}
            />
          </Col>
          <Col span={2}>
            <Stack>
              <CategoryTile
                category={categoryMeta('mess')}
                size="medium"
                height={size(64)}
                onPress={() => startReport('mess')}
              />
              <CategoryTile
                category={categoryMeta('lab')}
                size="medium"
                height={size(64)}
                onPress={() => startReport('lab')}
              />
            </Stack>
          </Col>
        </Row>

        <Row style={styles.gridRow}>
          <Col span={2}>
            <Stack>
              <CategoryTile
                category={categoryMeta('ac')}
                size="medium"
                height={size(58)}
                onPress={() => startReport('ac')}
              />
              <CategoryTile
                category={categoryMeta('access')}
                size="small"
                height={size(58)}
                onPress={() => startReport('access')}
              />
            </Stack>
          </Col>
          <Col span={2}>
            <CategoryTile
              category={categoryMeta('projector')}
              size="large"
              height={size(128)}
              onPress={() => startReport('projector')}
            />
          </Col>
        </Row>
      </Grid>

      <View style={styles.section}>
        <PulseBlock
          status={status}
          serviceCount={services.length}
          onPress={() => router.push('/campus')}
        />
      </View>

      <SectionLabel
        style={styles.section}
        trailing={<TextButton label="View all" onPress={() => router.push('/reports')} align="right" />}
      >
        Recent activity
      </SectionLabel>

      <Card style={styles.recentCard}>
        {recent.map((report, index) => (
          <ReportRow
            key={report.id}
            report={report}
            first={index === 0}
            onPress={() => router.push({ pathname: '/report/details', params: { id: report.id } })}
          />
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: {
    letterSpacing: -0.4,
  },
  promptCard: {
    marginTop: 16,
    overflow: 'hidden',
  },
  promptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingLeft: 16,
    paddingRight: 10,
    paddingVertical: 8,
  },
  promptInput: {
    flex: 1,
    // `minWidth: 0` lets the field shrink below its placeholder on a 320pt
    // phone instead of pushing the trailing control off the card.
    minWidth: 0,
    fontFamily: fontFamily.regular,
    fontSize: 14.5,
    color: colors.ink,
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    outlineWidth: 0,
  },
  promptGo: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  section: {
    marginTop: 26,
  },
  grid: {
    marginTop: 10,
  },
  gridRow: {
    marginTop: 10,
  },
  recentCard: {
    marginTop: 10,
  },
});
