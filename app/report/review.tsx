import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera } from 'lucide-react-native';

import { colors } from '@/constants/colors';
import { corners } from '@/constants/layout';
import { type as typeScale } from '@/constants/typography';
import { Screen } from '@/components/layout/Screen';
import { PageHeading } from '@/components/layout/PageHeading';
import { Chip, ChipWrap, PrimaryButton, TextButton } from '@/components/ui/Buttons';
import { Card, CardRow, CardSection } from '@/components/ui/Card';
import { PressableScale } from '@/components/ui/PressableScale';
import { useEvidencePhoto } from '@/hooks/useEvidencePhoto';
import { useGrid } from '@/hooks/useGrid';
import { campusApi } from '@/data/campusApi';
import { categoryMeta } from '@/data/mock/categories';
import { useReportDraft } from '@/stores/reportDraft';
import type { Severity } from '@/types';
import { locationLine } from '@/utils/format';
import { haptics } from '@/utils/haptics';
import { notifyLocally } from '@/utils/notify';

const SEVERITIES: { id: Severity; label: string }[] = [
  { id: 'low', label: 'Minor' },
  { id: 'medium', label: 'Moderate' },
  { id: 'high', label: 'Blocking' },
];

/**
 * A final confirmation, not a form. Everything the student already supplied
 * is restated in reading order, with one strong action at the end.
 */
export default function ReviewScreen() {
  const router = useRouter();
  const draft = useReportDraft();
  const setSeverity = useReportDraft((state) => state.setSeverity);
  const reset = useReportDraft((state) => state.reset);
  const { photoUri, pickFromLibrary, takePhoto, clear, busy } = useEvidencePhoto();
  const { size } = useGrid();
  const [submitting, setSubmitting] = useState(false);

  const meta = categoryMeta(draft.categoryId);
  const location = draft.location;

  const submit = async () => {
    if (!location || submitting) return;
    setSubmitting(true);
    const report = await campusApi.createReport({
      categoryId: draft.categoryId ?? 'other',
      description: draft.description,
      location,
      severity: draft.severity,
      photoUri,
    });

    haptics.success();
    void notifyLocally(
      'Report submitted',
      `We sent your ${meta.label.toLowerCase()} report to the campus team.`,
    );
    reset();
    router.replace({ pathname: '/report/details', params: { id: report.id } });
  };

  return (
    <Screen back section="Review">
      <PageHeading label="Review" title={meta.title} size="display" />

      <Card style={styles.card}>
        <CardSection
          first
          title="Description"
          description={draft.description.trim() || 'No description added.'}
        />
        <CardRow
          title="Location"
          right={
            <Text style={styles.rowValue} numberOfLines={2}>
              {location ? locationLine(location) : 'Not set'}
            </Text>
          }
        />
      </Card>

      <Card style={styles.card}>
        <CardSection
          first
          title="Severity"
          description="How much is this getting in the way?"
        >
          <ChipWrap>
            {SEVERITIES.map((option) => (
              <Chip
                key={option.id}
                label={option.label}
                active={draft.severity === option.id}
                onPress={() => setSeverity(option.id)}
              />
            ))}
          </ChipWrap>
        </CardSection>
      </Card>

      <Card style={styles.card}>
        <CardSection
          first
          title="Evidence"
          description={
            photoUri ? 'Photo attached — visible to the team only.' : 'Optional, but it speeds up triage.'
          }
        >
          <PressableScale
            onPress={busy ? undefined : pickFromLibrary}
            accessibilityLabel="Attach a photo"
            style={[corners.block, styles.photo, { height: size(150) }]}
          >
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoImage} resizeMode="cover" />
            ) : (
              <View style={styles.photoEmpty}>
                <View style={styles.photoIcon}>
                  <Camera size={20} color={colors.inkSoft} strokeWidth={1.8} />
                </View>
                <Text style={[typeScale.body, styles.photoHint]}>
                  Add a photo from your library
                </Text>
              </View>
            )}
          </PressableScale>

          <View style={styles.evidenceActions}>
            <TextButton
              label={busy ? 'Opening…' : 'Take photo'}
              onPress={takePhoto}
              align="left"
              tone="primary"
            />
            {photoUri ? <TextButton label="Remove" onPress={clear} align="left" /> : null}
          </View>
        </CardSection>
      </Card>

      <PrimaryButton label="Submit report" onPress={submit} loading={submitting} style={styles.submit} />
      <TextButton label="Edit report" onPress={() => router.back()} style={styles.edit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
  },
  rowValue: {
    ...typeScale.bodyStrong,
    flexShrink: 1,
    textAlign: 'right',
  },
  photo: {
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.line,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
  },
  photoIcon: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  photoHint: {
    textAlign: 'center',
    color: colors.faint,
  },
  evidenceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 6,
  },
  submit: {
    marginTop: 26,
  },
  edit: {
    marginTop: 4,
  },
});
