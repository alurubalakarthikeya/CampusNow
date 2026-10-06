import { StyleSheet } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { Card, CardRow } from '@/components/ui/Card';
import { FooterNote } from '@/components/ui/FooterNote';
import { Toggle } from '@/components/ui/Toggle';
import { usePreferences } from '@/hooks/useCampusData';
import { useAppStore } from '@/stores/appStore';

/** Notification preferences as a grouped list of switches. */
export default function NotificationPreferencesScreen() {
  const preferences = usePreferences();
  const setPreference = useAppStore((state) => state.setPreference);

  return (
    <Screen back section="Notifications">
      <Card>
        <CardRow
          first
          title="Report updates"
          description="Status changes on reports you follow"
          right={
            <Toggle
              value={preferences.reportUpdates}
              onChange={(value) => setPreference('reportUpdates', value)}
              accessibilityLabel="Report updates"
            />
          }
        />
        <CardRow
          title="Campus announcements"
          description="Outages and campus pulse changes"
          right={
            <Toggle
              value={preferences.campusAnnouncements}
              onChange={(value) => setPreference('campusAnnouncements', value)}
              accessibilityLabel="Campus announcements"
            />
          }
        />
      </Card>

      <FooterNote style={styles.footnote}>
        Critical safety notices are always delivered, whatever these switches are set to.
      </FooterNote>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footnote: {
    marginTop: 20,
  },
});
