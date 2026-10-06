import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, ChevronLeft, Search } from 'lucide-react-native';

import { colors } from '@/constants/colors';
import { layout } from '@/constants/layout';
import { fontFamily, type as typeScale } from '@/constants/typography';
import { useUnreadCount, useUser } from '@/hooks/useCampusData';
import { PressableScale } from '@/components/ui/PressableScale';

const LOGO = require('../../assets/images/logo-no-bg.png');

type AppHeaderProps = {
  /** Pushed screens swap the mark and the search field for a back control */
  back?: boolean;
  /** Quiet screen name shown in the search slot on pushed screens */
  section?: string;
};

/**
 * App bar — the same bar on every screen: the CampusNow mark at the left, a
 * search field that grows to fill the rest of the row, one icon control and
 * the account avatar. Flat white, a single grey border per control, no shadow,
 * nothing filled in.
 */
export function AppHeader({ back = false, section }: AppHeaderProps) {
  const router = useRouter();
  const user = useUser();
  const unread = useUnreadCount();
  const initial = user.name.trim().charAt(0).toUpperCase();

  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        {back ? (
          <PressableScale
            onPress={() => router.back()}
            style={styles.back}
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={19} color={colors.ink} strokeWidth={2.2} />
          </PressableScale>
        ) : (
          <PressableScale
            onPress={() => router.push('/')}
            style={styles.mark}
            haptic={false}
            scaleTo={0.94}
            accessibilityLabel="CampusNow home"
          >
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          </PressableScale>
        )}

        {back ? (
          <View style={styles.sectionPill}>
            <Text style={styles.sectionText} numberOfLines={1}>
              {section ?? 'CampusNow'}
            </Text>
          </View>
        ) : (
          <PressableScale
            onPress={() => router.push('/search')}
            haptic={false}
            scaleTo={0.99}
            style={styles.search}
            accessibilityLabel="Search campus, reports and services"
          >
            <Search size={16} color={colors.faint} strokeWidth={2.1} />
            <Text style={styles.searchText} numberOfLines={1}>
              Search campus, reports…
            </Text>
          </PressableScale>
        )}

        <PressableScale
          onPress={() => router.push('/notifications')}
          style={styles.ghost}
          haptic={false}
          scaleTo={0.9}
          accessibilityLabel="Notifications"
        >
          <Bell size={17} color={colors.ink} strokeWidth={1.9} />
          {unread > 0 ? <View style={styles.badge} /> : null}
        </PressableScale>

        {back ? null : (
          <PressableScale
            onPress={() => router.push('/profile')}
            style={styles.avatar}
            haptic={false}
            scaleTo={0.94}
            accessibilityLabel="Profile"
          >
            <Text style={styles.avatarInitial}>{initial}</Text>
          </PressableScale>
        )}
      </View>
    </View>
  );
}

/** Edge controls are sized to the glyph, not to the bar, so the bar reads full. */
const EDGE = 34;

const styles = StyleSheet.create({
  wrap: {
    // Matches the content column so the bar never floats wider than the page.
    width: '100%',
    maxWidth: layout.maxContentWidth + layout.headerPadding * 2,
    alignSelf: 'center',
    paddingHorizontal: layout.headerPadding,
    paddingTop: 4,
    paddingBottom: 8,
    backgroundColor: colors.background,
  },
  bar: {
    height: layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mark: {
    width: EDGE,
    height: EDGE,
    alignItems: 'center',
    justifyContent: 'center',
    // Pulls the mark out to the edge of the bar, as in the reference.
    marginLeft: -6,
  },
  /** The logo is wider than it is tall, so it is capped by height, not width. */
  logo: {
    width: 30,
    height: 24,
  },
  /** No border: the chevron alone is the control. */
  back: {
    width: EDGE,
    height: EDGE,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  search: {
    flex: 1,
    height: layout.controlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  searchText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 13.5,
    color: colors.faint,
  },
  sectionPill: {
    flex: 1,
    height: layout.controlHeight,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  sectionText: {
    ...typeScale.bodyStrong,
    fontSize: 14,
  },
  /** No border, no fill — just the glyph, so the bar stays quiet. */
  ghost: {
    width: EDGE,
    height: EDGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  avatarInitial: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    color: colors.inkSoft,
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.critical,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
});
