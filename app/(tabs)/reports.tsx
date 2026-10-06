import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { FilterTabs } from '@/components/report/FilterTabs';
import { ReportHero, ReportRow } from '@/components/report/ReportRow';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useFilteredReports, useReportStats } from '@/hooks/useCampusData';
import type { ReportFilter } from '@/types';

/**
 * My reports. The report you are currently waiting on gets the hero block;
 * everything else drops into one quiet card so the screen has two weights
 * instead of a stack of identical boxes.
 */
export default function ReportsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<ReportFilter>('all');
  const stats = useReportStats();
  const reports = useFilteredReports(filter);

  const open = (id: string) => router.push({ pathname: '/report/details', params: { id } });
  const [hero, ...rest] = reports;

  return (
    <Screen>
      <FilterTabs value={filter} onChange={setFilter} counts={stats} />

      {hero ? (
        <View style={styles.body}>
          <ReportHero report={hero} index={1} onPress={() => open(hero.id)} />

          {rest.length > 0 ? (
            <Card style={styles.list}>
              {rest.map((report, index) => (
                <ReportRow
                  key={report.id}
                  report={report}
                  first={index === 0}
                  index={index + 2}
                  onPress={() => open(report.id)}
                />
              ))}
            </Card>
          ) : null}
        </View>
      ) : (
        <View style={styles.body}>
          <EmptyState
            title={filter === 'active' ? 'Nothing active right now.' : 'No reports here yet.'}
            message={
              filter === 'resolved'
                ? 'Resolved reports will collect here once operations close them.'
                : 'Report something from the Report tab and it will appear here with live progress.'
            }
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    marginTop: 18,
  },
  list: {
    marginTop: 14,
  },
});
