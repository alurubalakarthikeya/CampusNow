import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/constants/colors';
import { PressableScale } from './PressableScale';

const TRACK_W = 46;
const TRACK_H = 26;
const KNOB = 20;
const INSET = (TRACK_H - KNOB) / 2;
const TRAVEL = TRACK_W - KNOB - INSET * 2;

type ToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  accessibilityLabel?: string;
  disabled?: boolean;
};

/**
 * The app's switch.
 *
 * The platform `Switch` is drawn by the OS — Material teal on Android, a
 * tinted capsule on iOS — so it can never match this design on both. This is
 * the same control everywhere: a near-black track when on, a grey one when
 * off, and a white knob that slides.
 */
export function Toggle({ value, onChange, accessibilityLabel, disabled = false }: ToggleProps) {
  const on = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    on.value = withTiming(value ? 1 : 0, { duration: 150 });
  }, [on, value]);

  const knob = useAnimatedStyle(() => ({
    transform: [{ translateX: INSET + on.value * TRAVEL }],
  }));

  return (
    <PressableScale
      onPress={() => onChange(!value)}
      scaleTo={0.96}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
      style={[
        styles.track,
        { backgroundColor: value ? colors.ink : colors.surfaceSunken },
        disabled ? styles.disabled : null,
      ]}
    >
      <Animated.View style={[styles.knob, knob]} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
  },
  knob: {
    position: 'absolute',
    width: KNOB,
    height: KNOB,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(11,11,15,0.08)',
  },
  disabled: {
    opacity: 0.4,
  },
});
