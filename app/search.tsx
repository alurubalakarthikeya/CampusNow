import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Building2, ChevronLeft, ClipboardList, Search, X } from 'lucide-react-native';

import { colors } from '@/constants/colors';
import { corners, layout } from '@/constants/layout';
import { fontFamily, type as typeScale } from '@/constants/typography';
import { Screen } from '@/components/layout/Screen';
import { Card, CardRow } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { FooterNote } from '@/components/ui/FooterNote';
import { PressableScale } from '@/components/ui/PressableScale';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useBuildings, useIssues, useReports } from '@/hooks/useCampusData';
import type { IconComponent } from '@/utils/icons';
import { locationLine } from '@/utils/format';

const SUGGESTIONS: { label: string; icon: IconComponent; href: Href }[] = [
  { label: 'Campus map', icon: Building2, href: '/campus/map' },
  { label: 'My reports', icon: ClipboardList, href: '/reports' },
];

/** One field over everything the student can act on: reports, issues, blocks. */
export default function SearchScreen() {
  const router = useRouter();
  const reports = useReports();
  const issues = useIssues();
  const buildings = useBuildings();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const term = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (term.length === 0) return { reports: [], issues: [], buildings: [] };
    const match = (...parts: (string | undefined)[]) =>
      parts.filter(Boolean).join(' ').toLowerCase().includes(term);

    return {
      reports: reports
        .filter((report) =>
          match(
            report.title,
            report.description,
            report.location.buildingName,
            report.location.floor,
            report.location.room,
          ),
        )
        .slice(0, 6),
      issues: issues.filter((issue) => match(issue.title, issue.detail)).slice(0, 5),
      buildings: buildings.filter((building) => match(building.name, building.zone)).slice(0, 6),
    };
  }, [buildings, issues, reports, term]);

  const total = results.reports.length + results.issues.length + results.buildings.length;

  return (
    <Screen header={false} edgeToEdge>
      <View style={styles.bar}>
        <PressableScale
          onPress={() => router.back()}
          style={styles.back}
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={19} color={colors.ink} strokeWidth={2.2} />
        </PressableScale>

        <View style={[styles.field, focused ? styles.fieldFocused : null]}>
          <Search size={16} color={focused ? colors.primary : colors.faint} strokeWidth={2.1} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoFocus
            autoCorrect={false}
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            placeholder="Search reports, blocks, services"
            placeholderTextColor={colors.faint}
            returnKeyType="search"
            style={styles.input}
            accessibilityLabel="Search"
          />
          {query.length > 0 ? (
            <PressableScale
              onPress={() => setQuery('')}
              scaleTo={0.9}
              haptic={false}
              accessibilityLabel="Clear search"
            >
              <X size={16} color={colors.faint} strokeWidth={2.2} />
            </PressableScale>
          ) : null}
        </View>
      </View>

      <View style={styles.content}>
        {term.length === 0 ? (
          <>
            <SectionLabel style={styles.section}>Jump to</SectionLabel>
            <Card>
              {SUGGESTIONS.map((item, index) => (
                <CardRow
                  key={item.label}
                  first={index === 0}
                  icon={item.icon}
                  title={item.label}
                  onPress={() => router.push(item.href)}
                />
              ))}
            </Card>
            <FooterNote style={styles.footer}>
              Search matches a report's title, its description, the block, floor or room it was filed
              from, and every service issue on campus.
            </FooterNote>
          </>
        ) : total === 0 ? (
          <EmptyState
            title={`No matches for “${query.trim()}”.`}
            message="Try a block name like Block B, a service like WiFi or Facilities, or a room number."
          />
        ) : (
          <>
            {results.reports.length > 0 ? (
              <>
                <SectionLabel style={styles.section}>Your reports</SectionLabel>
                <Card>
                  {results.reports.map((report, index) => (
                    <CardRow
                      key={report.id}
                      first={index === 0}
                      icon={ClipboardList}
                      title={report.title}
                      description={locationLine(report.location)}
                      onPress={() =>
                        router.push({ pathname: '/report/details', params: { id: report.id } })
                      }
                    />
                  ))}
                </Card>
              </>
            ) : null}

            {results.issues.length > 0 ? (
              <>
                <SectionLabel style={styles.section}>Campus issues</SectionLabel>
                <Card>
                  {results.issues.map((issue, index) => (
                    <CardRow
                      key={issue.id}
                      first={index === 0}
                      icon={Building2}
                      title={issue.title}
                      description={issue.detail}
                      onPress={() =>
                        router.push({ pathname: '/campus/service', params: { id: issue.serviceId } })
                      }
                    />
                  ))}
                </Card>
              </>
            ) : null}

            {results.buildings.length > 0 ? (
              <>
                <SectionLabel style={styles.section}>Blocks</SectionLabel>
                <Card>
                  {results.buildings.map((building, index) => (
                    <CardRow
                      key={building.id}
                      first={index === 0}
                      icon={Building2}
                      title={building.name}
                      description={
                        building.issues > 0
                          ? `${building.zone} · ${building.issues} open`
                          : `${building.zone} · clear`
                      }
                      onPress={() => router.push('/campus/map')}
                    />
                  ))}
                </Card>
              </>
            ) : null}
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: layout.headerPadding,
    paddingTop: 4,
    paddingBottom: 12,
  },
  /** No border — the chevron alone is the control, as in the app bar. */
  back: {
    width: 34,
    height: layout.controlHeight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -6,
  },
  field: {
    flex: 1,
    height: layout.controlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    ...corners.pill,
  },
  fieldFocused: {
    borderColor: colors.primary,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontFamily: fontFamily.regular,
    fontSize: 13.5,
    color: colors.ink,
    padding: 0,
    // The pill is the field: no inner border, and no browser ring (see
    // `installWebBaseStyles` for the parts a style cannot reach on web).
    borderWidth: 0,
    backgroundColor: 'transparent',
    outlineWidth: 0,
  },
  content: {
    paddingHorizontal: layout.screenPadding,
  },
  section: {
    marginTop: 12,
    marginBottom: 8,
  },
  footer: {
    marginTop: 22,
  },
});
