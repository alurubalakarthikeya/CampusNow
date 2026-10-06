import { StyleSheet, View } from 'react-native';

import { ChipButton } from '@/components/ui/Buttons';
import type { ReportFilter } from '@/types';

type FilterTabsProps = {
  value: ReportFilter;
  onChange: (filter: ReportFilter) => void;
  counts: { total: number; resolved: number; active: number };
};

const LABELS: { id: ReportFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'resolved', label: 'Resolved' },
];

/** Deliberately simple: three chips, a count, no decoration. */
export function FilterTabs({ value, onChange, counts }: FilterTabsProps) {
  const countFor = (filter: ReportFilter) =>
    filter === 'all' ? counts.total : filter === 'active' ? counts.active : counts.resolved;

  return (
    <View style={styles.row}>
      {LABELS.map((item) => (
        <ChipButton
          key={item.id}
          label={`${item.label} · ${countFor(item.id)}`}
          active={value === item.id}
          onPress={() => onChange(item.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
});
