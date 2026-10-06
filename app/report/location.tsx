import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, QrCode } from 'lucide-react-native';

import { colors } from '@/constants/colors';
import { textCorners } from '@/constants/layout';
import { fontFamily, type as typeScale } from '@/constants/typography';
import { Screen } from '@/components/layout/Screen';
import { CampusMap } from '@/components/campus/CampusMap';
import { Chip, ChipWrap, PrimaryButton, SecondaryButton } from '@/components/ui/Buttons';
import { Card, CardSection, Pill } from '@/components/ui/Card';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { StatusDot } from '@/components/ui/StatusDot';
import { useBuildings, useIssues } from '@/hooks/useCampusData';
import { useNearestBuilding } from '@/hooks/useNearestBuilding';
import { categoryMeta } from '@/data/mock/categories';
import { useReportDraft } from '@/stores/reportDraft';
import type { CampusBuilding } from '@/types';

const FLOORS = ['Ground', '1st Floor', '2nd Floor', '3rd Floor'];

/**
 * Where is it happening? The campus diagram is the centrepiece: seven blocks
 * on one grid, deliberately different sizes, with active issues marked by
 * status dots. The refinement fields stay in one quiet card below it.
 */
export default function LocationScreen() {
  const router = useRouter();
  const buildings = useBuildings();
  const issues = useIssues();
  const draft = useReportDraft();
  const setLocation = useReportDraft((state) => state.setLocation);

  const [selectedId, setSelectedId] = useState<string | null>(draft.location?.buildingId ?? null);
  const [floor, setFloor] = useState<string | undefined>(draft.location?.floor);
  const [room, setRoom] = useState(draft.location?.room ?? '');

  const { locate, locating, message } = useNearestBuilding();
  const meta = categoryMeta(draft.categoryId);

  const selected = useMemo(
    () => buildings.find((building) => building.id === selectedId) ?? null,
    [buildings, selectedId],
  );

  const onSelect = (building: CampusBuilding) => {
    setSelectedId(building.id);
  };

  const summary = selected
    ? [selected.name, floor, room.trim() || undefined].filter(Boolean).join(' · ')
    : 'No location selected yet';

  const confirm = () => {
    if (!selected) return;
    setLocation({
      id: `${selected.id}-${room.trim() || floor || 'site'}`,
      buildingId: selected.id,
      buildingName: selected.name,
      floor,
      room: room.trim() || undefined,
    });
    router.push('/report/duplicate');
  };

  const useMyLocation = async () => {
    const located = await locate();
    if (located) setSelectedId(located.buildingId);
  };

  return (
    <Screen back section="Location">
      <SectionLabel trailing={<Pill>{meta.label} problem</Pill>}>Tap the block</SectionLabel>

      <View style={styles.map}>
        <CampusMap
          buildings={buildings}
          issues={issues}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <StatusDot tone="critical" size={6} />
          <Text style={typeScale.label}>Active issue</Text>
        </View>
        <Text style={[typeScale.label, styles.legendNote]}>4 columns · 7 blocks</Text>
      </View>

      <Card style={styles.block}>
        <CardSection
          first
          title="Refine the location"
          description="Optional — a floor and room help the team find it faster."
        >
          <ChipWrap>
            {FLOORS.map((option) => (
              <Chip
                key={option}
                label={option}
                active={floor === option}
                onPress={() => setFloor(floor === option ? undefined : option)}
              />
            ))}
          </ChipWrap>
        </CardSection>
      </Card>

      {/* The field stands on its own — nothing inside another container. */}
      <TextInput
        value={room}
        onChangeText={setRoom}
        placeholder="Room or lab, e.g. B204"
        placeholderTextColor={colors.faint}
        selectionColor={colors.primary}
        style={[textCorners('block'), styles.input]}
      />

      <Card style={styles.block}>
        <CardSection first title="Selected location" description={summary}>
          {message ? <Text style={[typeScale.meta, styles.locateMessage]}>{message}</Text> : null}

          <View style={styles.actions}>
            <SecondaryButton
              label="Scan QR"
              icon={<QrCode size={17} color={colors.primary} strokeWidth={1.9} />}
              onPress={() => router.push('/report/scan')}
              style={styles.scanButton}
            />
            <SecondaryButton
              label={locating ? 'Locating…' : 'Use my location'}
              icon={<MapPin size={17} color={colors.inkSoft} strokeWidth={1.9} />}
              onPress={useMyLocation}
              disabled={locating}
              style={styles.locateButton}
            />
          </View>
        </CardSection>
      </Card>

      <PrimaryButton
        label="Continue"
        onPress={confirm}
        disabled={!selected}
        style={styles.continue}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  map: {
    marginTop: 10,
  },
  legend: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendNote: {
    color: colors.faint,
  },
  block: {
    marginTop: 20,
  },
  input: {
    marginTop: 10,
    height: 46,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.ink,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    outlineWidth: 0,
  },
  locateMessage: {
    color: colors.muted,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  scanButton: {
    flex: 1,
    height: 46,
    backgroundColor: colors.primaryTint,
    borderColor: colors.primaryTintStrong,
  },
  locateButton: {
    flex: 1.2,
    height: 46,
  },
  continue: {
    marginTop: 16,
  },
});
