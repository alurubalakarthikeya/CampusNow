import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';

import { colors } from '@/constants/colors';
import { textCorners } from '@/constants/layout';
import { fontFamily } from '@/constants/typography';
import { Screen } from '@/components/layout/Screen';
import { CategoryTile } from '@/components/report/CategoryTile';
import { Col, Grid, Row, Stack } from '@/components/ui/Grid';
import { PrimaryButton } from '@/components/ui/Buttons';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useGrid } from '@/hooks/useGrid';
import { useReportDraft } from '@/stores/reportDraft';
import { categoryMeta } from '@/data/mock/categories';
import type { ReportCategoryId } from '@/types';

/**
 * Report category selection. Eight categories on one grid with varied spans —
 * an editorial poster that is still completely predictable to use, because
 * every tile lays its icon out beside its label.
 */
export default function ReportScreen() {
  const router = useRouter();
  const beginReport = useReportDraft((state) => state.beginReport);
  const { size } = useGrid();
  // Anything typed on Home arrives here as the draft's description.
  const [description, setDescription] = useState(() => useReportDraft.getState().description);

  const pick = (categoryId: ReportCategoryId) => {
    beginReport(categoryId, description.trim() || undefined);
    router.push('/report/location');
  };

  const continueWithDescription = () => {
    beginReport(description.trim() ? 'other' : undefined, description);
    router.push('/report/location');
  };

  const canContinue = description.trim().length > 2;

  return (
    <Screen>
      {/* Asymmetric composition: 1 tall + 2 stacked, 2 stacked + 1 tall,
          then one wide row. Different sizes, one grid. */}
      <Grid>
        <Row>
          <Col span={2}>
            <CategoryTile
              category={categoryMeta('wifi')}
              size="large"
              height={size(132)}
              onPress={() => pick('wifi')}
            />
          </Col>
          <Col span={2}>
            <Stack>
              <CategoryTile
                category={categoryMeta('lab')}
                size="medium"
                height={size(60)}
                onPress={() => pick('lab')}
              />
              <CategoryTile
                category={categoryMeta('projector')}
                size="medium"
                height={size(60)}
                onPress={() => pick('projector')}
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
                onPress={() => pick('mess')}
              />
              <CategoryTile
                category={categoryMeta('access')}
                size="small"
                height={size(56)}
                onPress={() => pick('access')}
              />
            </Stack>
          </Col>
          <Col span={2}>
            <CategoryTile
              category={categoryMeta('ac')}
              size="large"
              height={size(124)}
              onPress={() => pick('ac')}
            />
          </Col>
        </Row>

        <Row style={styles.gridRow}>
          <Col span={3}>
            <CategoryTile
              category={categoryMeta('classroom')}
              size="wide"
              height={size(88)}
              onPress={() => pick('classroom')}
            />
          </Col>
          <Col span={1}>
            <CategoryTile
              category={categoryMeta('other')}
              size="small"
              height={size(88)}
              onPress={() => pick('other')}
            />
          </Col>
        </Row>
      </Grid>

      <SectionLabel style={styles.describeLabel}>Or describe it</SectionLabel>

      <TextInput
        value={description}
        onChangeText={setDescription}
        multiline
        placeholder="Tell us what happened…"
        placeholderTextColor={colors.faint}
        selectionColor={colors.primary}
        textAlignVertical="top"
        style={[textCorners('block'), styles.input]}
      />

      <PrimaryButton
        label="Continue"
        onPress={continueWithDescription}
        disabled={!canContinue}
        style={styles.continue}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  gridRow: {
    marginTop: 10,
  },
  describeLabel: {
    marginTop: 26,
    marginBottom: 8,
  },
  input: {
    minHeight: 108,
    paddingHorizontal: 13,
    paddingVertical: 11,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.ink,
    fontFamily: fontFamily.regular,
    fontSize: 14.5,
    lineHeight: 21,
    outlineWidth: 0,
  },
  continue: {
    marginTop: 20,
  },
});
