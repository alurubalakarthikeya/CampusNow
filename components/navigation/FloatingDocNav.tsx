import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ClipboardList, FilePlus, House, Map, User } from 'lucide-react-native';
import type { BottomTabBarProps } from 'expo-router/js-tabs';

import { colors } from '@/constants/colors';
import { layout } from '@/constants/layout';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { PressableScale } from '@/components/ui/PressableScale';
import { haptics } from '@/utils/haptics';
import type { IconComponent } from '@/utils/icons';

type TabMeta = { label: string; icon: IconComponent };

/** Route name → dock item. Order here is the order on screen. */
const TABS: Record<string, TabMeta> = {
  index: { label: 'Home', icon: House },
  report: { label: 'Report', icon: FilePlus },
  campus: { label: 'Campus', icon: Map },
  reports: { label: 'Reports', icon: ClipboardList },
  profile: { label: 'Profile', icon: User },
};

/**
 * The floating dock.
 *
 * A slim white glass pill that sits over the content: icon-only and sized by
 * the icons, so its width is just the row plus its padding. The current
 * destination is marked by a blue icon — no filled block behind it — which is
 * the quietest way to say "you are here".
 */
export function FloatingDocNav({ state, navigation, insets }: BottomTabBarProps) {
  const entrance = useSharedValue(0);

  useEffect(() => {
    entrance.value = withTiming(1, { duration: 360 });
  }, [entrance]);

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
    transform: [{ translateY: (1 - entrance.value) * 14 }],
  }));

  return (
    <View
      style={[
        styles.container,
        {
          height: layout.dockHeight + layout.dockMargin + insets.bottom,
          paddingBottom: insets.bottom + layout.dockMargin / 2,
        },
      ]}
    >
      <Animated.View style={[styles.dock, entranceStyle]}>
        {/* Glass, so the content underneath stays visible through the pill. */}
        <GlassSurface corner="dock" intensity={44} wash={0.6} bordered>
          <View style={styles.row}>
            {state.routes.map((route, index) => {
              const meta = TABS[route.name];
              if (!meta) return null;
              const focused = state.index === index;

              return (
                <DockItem
                  key={route.key}
                  label={meta.label}
                  Icon={meta.icon}
                  focused={focused}
                  onPress={() => {
                    const event = navigation.emit({
                      type: 'tabPress',
                      target: route.key,
                      canPreventDefault: true,
                    });
                    if (!focused && !event.defaultPrevented) {
                      haptics.select();
                      navigation.navigate(route.name);
                    }
                  }}
                />
              );
            })}
          </View>
        </GlassSurface>
      </Animated.View>
    </View>
  );
}

function DockItem({
  label,
  Icon,
  focused,
  onPress,
}: {
  label: string;
  Icon: IconComponent;
  focused: boolean;
  onPress: () => void;
}) {
  const focus = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    focus.value = withSpring(focused ? 1 : 0, { damping: 18, stiffness: 240, mass: 0.7 });
  }, [focus, focused]);

  /** The active icon lifts and settles — the only motion in the dock. */
  const activeIconStyle = useAnimatedStyle(() => ({
    opacity: focus.value,
    transform: [{ scale: 0.92 + focus.value * 0.08 }],
  }));

  const idleIconStyle = useAnimatedStyle(() => ({
    opacity: 1 - focus.value,
  }));

  return (
    <PressableScale
      onPress={onPress}
      haptic={false}
      scaleTo={0.9}
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      style={styles.item}
    >
      <View style={styles.iconLayer}>
        <Animated.View style={[styles.iconCenter, idleIconStyle]}>
          <Icon size={layout.dockIcon} color={colors.muted} strokeWidth={1.9} />
        </Animated.View>
        <Animated.View style={[styles.iconCenter, activeIconStyle]}>
          <Icon size={layout.dockIcon} color={colors.primary} strokeWidth={2.3} />
        </Animated.View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  dock: {
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: layout.dockHeight,
    paddingHorizontal: layout.dockPadding,
  },
  item: {
    width: layout.dockItem,
    height: layout.dockItemHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLayer: {
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { zIndex: 3 } : null),
  },
  iconCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
