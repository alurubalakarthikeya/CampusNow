import { StyleSheet, Text, View } from 'react-native';

import { colors, toneColor, type Tone } from '@/constants/colors';
import { corners } from '@/constants/layout';
import { fontFamily, type as typeScale } from '@/constants/typography';
import { Metric } from '@/components/ui/Metric';
import { PressableScale } from '@/components/ui/PressableScale';
import type { Service } from '@/types';
import { plural } from '@/utils/format';

type ServiceHealthBlockProps = {
  service: Service;
  /** tall keeps the number big; compact is a single line; wide spans the grid */
  variant?: 'tall' | 'compact' | 'wide';
  height?: number;
  onPress?: () => void;
  style?: { backgroundColor?: string; borderColor?: string };
};

function toneFor(health: number): Tone {
  if (health >= 90) return 'healthy';
  if (health >= 80) return 'primary';
  return 'warning';
}

/**
 * Service health. Sizes vary across the grid, but the score is always the
 * loudest element and the bar always runs the full width of the block.
 */
export function ServiceHealthBlock({ service, variant = 'tall', height, onPress, style }: ServiceHealthBlockProps) {
  const tone = toneFor(service.health);

  if (variant === 'compact') {
    return (
      <PressableScale
        onPress={onPress}
        accessibilityLabel={`${service.name} ${service.health} percent`}
        style={[corners.tiny, styles.block, styles.compactBlock, { height }, style]}
      >
        <View style={styles.compactRow}>
          <Text style={styles.compactLabel} numberOfLines={1}>
            {service.short}
          </Text>
          <Text style={[styles.compactValue, { color: toneColor[tone] }]}>{service.health}%</Text>
        </View>
        <HealthBar health={service.health} tone={tone} />
      </PressableScale>
    );
  }

  if (variant === 'wide') {
    return (
      <PressableScale
        onPress={onPress}
        accessibilityLabel={`${service.name} ${service.health} percent`}
        style={[corners.wideFlip, styles.block, styles.wide, { height }, style]}
      >
        <View style={styles.wideCopy}>
          <Text style={styles.wideTitle} numberOfLines={1}>
            {service.name}
          </Text>
          <Text style={typeScale.meta} numberOfLines={1}>
            {plural(service.openIssues, 'open issue')} · {service.summary}
          </Text>
        </View>
        <Metric value={service.health} unit="%" size="default" valueColor={toneColor[tone]} align="right" />
      </PressableScale>
    );
  }

  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={`${service.name} ${service.health} percent`}
      style={[corners.block, styles.block, styles.tall, { height }, style]}
    >
      <Text style={typeScale.label}>{service.short}</Text>
      <View style={styles.tallBody}>
        <Metric value={service.health} unit="%" size="large" valueColor={toneColor[tone]} />
      </View>
      <View style={styles.tail}>
        <HealthBar health={service.health} tone={tone} />
        <Text style={[typeScale.meta, styles.issues]}>{plural(service.openIssues, 'issue')}</Text>
      </View>
    </PressableScale>
  );
}

function HealthBar({ health, tone }: { health: number; tone: Tone }) {
  return (
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          { width: `${Math.max(4, Math.min(100, health))}%`, backgroundColor: toneColor[tone] },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    flex: 1,
    padding: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  compactBlock: {
    paddingVertical: 11,
    justifyContent: 'space-between',
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  compactLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.ink,
    flex: 1,
  },
  compactValue: {
    fontFamily: fontFamily.semibold,
    fontSize: 17,
    letterSpacing: -0.5,
  },
  tall: {
    justifyContent: 'space-between',
  },
  tallBody: {
    flex: 1,
    justifyContent: 'center',
  },
  tail: {
    gap: 7,
  },
  wide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  wideCopy: {
    flex: 1,
    gap: 2,
  },
  wideTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  issues: {
    color: colors.faint,
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: colors.surfaceSunken,
  },
  fill: {
    height: 4,
    borderRadius: 2,
  },
});
