import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { type as typeScale } from '@/constants/typography';
import { Divider } from '@/components/ui/Divider';
import { Surface } from '@/components/ui/Surface';
import { Metric } from '@/components/ui/Metric';
import { StatusDot } from '@/components/ui/StatusDot';
import type { CampusStatus } from '@/types';
import { plural } from '@/utils/format';
import { relativeUpdate } from '@/utils/status';

type PulseBlockProps = {
  status: CampusStatus;
  serviceCount: number;
  onPress?: () => void;
  /** `hero` is the Campus tab treatment, `compact` the home summary */
  variant?: 'hero' | 'compact';
};

/**
 * The campus score. The percentage is the loudest number in the app, so it
 * gets the space; the supporting counts sit below a hairline rule.
 */
export function PulseBlock({ status, serviceCount, onPress, variant = 'compact' }: PulseBlockProps) {
  const isHero = variant === 'hero';

  return (
    <Surface corner="leaf" padding={isHero ? 24 : 20} onPress={onPress} accessibilityLabel="Campus pulse">
      <View style={styles.head}>
        <View style={styles.headCopy}>
          <Text style={typeScale.section}>Campus pulse</Text>
          <Text style={[typeScale.meta, styles.across]} numberOfLines={2}>
            {status.label} · {plural(serviceCount, 'campus service')} · updated{' '}
            {relativeUpdate(status.updatedAt)}
          </Text>
        </View>
        <Metric
          value={status.score}
          unit="%"
          size={isHero ? 'hero' : 'large'}
          valueColor={colors.primary}
          align="right"
        />
      </View>

      <Divider spacing={16} />

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <StatusDot tone="critical" size={7} />
          <Text style={typeScale.bodyStrong}>{plural(status.majorIssues, 'major issue')}</Text>
        </View>
        <View style={styles.footerItem}>
          <StatusDot tone="healthy" size={7} />
          <Text style={typeScale.bodyStrong}>{status.ongoing} ongoing</Text>
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 16,
  },
  headCopy: {
    flex: 1,
    gap: 3,
    paddingRight: 8,
  },
  across: {
    marginTop: 0,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    flexWrap: 'wrap',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
