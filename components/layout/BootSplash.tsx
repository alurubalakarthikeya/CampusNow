import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/constants/colors';
import { fontFamily } from '@/constants/typography';
import { BrandMark } from '@/components/ui/BrandMark';
import { useTheme } from '@/stores/themeStore';
import { createStyles } from '@/utils/themedStyles';

/**
 * The first thing the app paints.
 *
 * The native splash (configured in `app.json`) hands over to this the moment
 * JavaScript starts, so the boot has one continuous look: the mark fades up,
 * the wordmark follows, and a hairline of progress runs underneath until
 * fonts, storage and the theme are ready.
 */
export function BootSplash({ ready }: { ready: boolean }) {
  // Subscribed so the boot screen is already in the right theme.
  useTheme();

  const mark = useSharedValue(0);
  const bar = useSharedValue(0.08);
  const barDone = useSharedValue(0);

  useEffect(() => {
    mark.value = withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) });
  }, [mark]);

  useEffect(() => {
    bar.value = withRepeat(
      withTiming(0.72, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [bar]);

  useEffect(() => {
    if (ready) barDone.value = withTiming(1, { duration: 240, easing: Easing.out(Easing.quad) });
  }, [barDone, ready]);

  const markStyle = useAnimatedStyle(() => ({
    opacity: mark.value,
    transform: [{ translateY: (1 - mark.value) * 10 }, { scale: 0.96 + mark.value * 0.04 }],
  }));

  const barStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: Math.max(barDone.value, bar.value) }],
  }));

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.mark, markStyle]}>
        <BrandMark width={64} height={58} />
        <Text style={styles.word}>CampusNow</Text>
        <Text style={styles.tagline}>Campus operations, in your pocket</Text>
      </Animated.View>

      <View style={styles.track}>
        <Animated.View style={[styles.fill, barStyle]} />
      </View>

      <Text style={styles.status}>Starting campus services…</Text>
    </View>
  );
}

const styles = createStyles(() => ({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 40,
  },
  mark: {
    alignItems: 'center',
  },
  word: {
    marginTop: 14,
    fontFamily: fontFamily.semibold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.6,
    color: colors.ink,
  },
  tagline: {
    marginTop: 4,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
  },
  track: {
    marginTop: 34,
    width: 148,
    height: 2,
    borderRadius: 999,
    backgroundColor: colors.surfaceSunken,
    overflow: 'hidden',
  },
  fill: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  status: {
    marginTop: 14,
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.faint,
  },
}));
