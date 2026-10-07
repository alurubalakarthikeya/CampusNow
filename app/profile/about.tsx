import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { BrandMark } from '@/components/ui/BrandMark';

import { colors } from '@/constants/colors';
import { layout } from '@/constants/layout';
import { fontFamily, type as typeScale } from '@/constants/typography';
import { Screen } from '@/components/layout/Screen';
import { Card, CardRow, CardSection, Pill } from '@/components/ui/Card';
import { FooterNote } from '@/components/ui/FooterNote';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useSessionStore } from '@/stores/sessionStore';
import { useAppStore } from '@/stores/appStore';
import { useTheme } from '@/stores/themeStore';
import { plural } from '@/utils/format';
import { forgetToken, pushState, registeredToken } from '@/utils/push';
import { createStyles } from '@/utils/themedStyles';

const VERSION = '1.0.0';
const BUILD = 'prototype · local campus data';

/**
 * About. What this build is, what it stores on the device, and the two
 * controls a student actually needs: clear the read feed, or start over.
 */
export default function AboutScreen() {
  const resetDemoData = useAppStore((state) => state.resetDemoData);
  const markAllRead = useAppStore((state) => state.markAllNotificationsRead);
  const reports = useAppStore((state) => state.reports.length);
  const unread = useAppStore((state) =>
    state.notifications.reduce((count, item) => count + (item.read ? 0 : 1), 0),
  );
  const signOut = useSessionStore((state) => state.signOut);
  const email = useSessionStore((state) => state.email);
  const { scheme } = useTheme();

  const [push, setPush] = useState('checking');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    void pushState().then((state) => setPush(state));
    void registeredToken().then(setToken);
  }, []);

  const confirmReset = () => {
    Alert.alert(
      'Reset this device?',
      'Every report, notification and preference on this device returns to the seeded prototype state. Your verified student identity stays.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset data',
          style: 'destructive',
          onPress: () => resetDemoData(),
        },
      ],
    );
  };

  const confirmForget = async () => {
    await forgetToken();
    setToken(null);
    Alert.alert('Device registration cleared', 'The next time you switch pushes on we register again.');
  };

  return (
    <Screen back section="About">
      <Card>
        <CardSection first title="CampusNow" description="Campus operations, in your pocket.">
          <View style={styles.brand}>
            <BrandMark width={34} height={30} />
            <View style={styles.brandCopy}>
              <Text style={styles.version}>Version {VERSION}</Text>
              <Text style={[typeScale.meta, styles.build]}>{BUILD}</Text>
            </View>
            <Pill tone="primary">{scheme === 'dark' ? 'Dark' : 'Light'}</Pill>
          </View>
          <Text style={[typeScale.meta, styles.blurb]}>
            A student client for the campus operations desk. Reports you file here reach the same
            queue the campus manages in ServiceNow, with your verified identity attached.
          </Text>
        </CardSection>
      </Card>

      <SectionLabel style={styles.section}>On this device</SectionLabel>

      <Card>
        <CardRow
          first
          title="Verified account"
          description={email ?? 'No account verified on this device'}
        />
        <CardRow
          title="Reports stored"
          description={plural(reports, 'report')}
        />
        <CardRow
          title="Unread notifications"
          description={unread === 0 ? 'Nothing waiting' : `${unread} in the feed`}
        />
        <CardRow
          title="Push registration"
          description={
            token
              ? `Device token ${token.slice(0, 12)}…`
              : push === 'granted'
                ? 'Permission granted, no token yet'
                : push === 'unsupported'
                  ? 'Needs the iOS or Android build'
                  : 'Not registered'
          }
          right={token ? <Pill tone="healthy">Registered</Pill> : undefined}
        />
      </Card>

      <SectionLabel style={styles.section}>Data controls</SectionLabel>

      <Card>
        <CardRow
          first
          title="Mark all notifications read"
          description="Clears the badge without deleting anything"
          onPress={() => markAllRead()}
        />
        <CardRow
          title="Clear push registration"
          description="Useful when handing the phone to someone else"
          onPress={confirmForget}
        />
        <CardRow
          title="Reset prototype data"
          description="Puts reports and notifications back to the seeded state"
          onPress={confirmReset}
        />
      </Card>

      <Card style={styles.danger}>
        <CardRow
          first
          title="Sign out and clear identity"
          description="You will need your college email and USN to sign back in"
          tone="critical"
          onPress={() => signOut()}
        />
      </Card>

      <FooterNote style={styles.footnote}>
        CampusNow {VERSION} · maximum content width {layout.maxContentWidth}px · built for the
        campus operations prototype
      </FooterNote>
    </Screen>
  );
}

const styles = createStyles(() => ({
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandCopy: {
    flex: 1,
    gap: 1,
  },
  version: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  build: {
    color: colors.faint,
  },
  blurb: {
    marginTop: 14,
  },
  section: {
    marginTop: 26,
    marginBottom: 8,
  },
  danger: {
    marginTop: 14,
  },
  footnote: {
    marginTop: 20,
  },
}));
