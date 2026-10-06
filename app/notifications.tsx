import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { colors } from '@/constants/colors';
import { type as typeScale } from '@/constants/typography';
import { Screen } from '@/components/layout/Screen';
import { TextButton } from '@/components/ui/Buttons';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PressableScale } from '@/components/ui/PressableScale';
import { StatusDot } from '@/components/ui/StatusDot';
import { useNotifications } from '@/hooks/useCampusData';
import { campusApi } from '@/data/campusApi';
import { notificationIcon } from '@/utils/icons';
import type { Notification } from '@/types';
import { relativeUpdate } from '@/utils/status';

/**
 * Notifications. One card, one row per update — the same grammar as every
 * other list in the app, with a deliberately quiet empty state.
 */
export default function NotificationsScreen() {
  const router = useRouter();
  const notifications = useNotifications();
  const unread = notifications.filter((item) => !item.read).length;

  const open = async (item: Notification) => {
    await campusApi.markNotificationRead(item.id);
    if (item.reportId) {
      router.push({ pathname: '/report/details', params: { id: item.reportId } });
    }
  };

  return (
    <Screen back section="Inbox">
      <SectionLabel
        trailing={
          unread > 0 ? (
            <TextButton
              label="Mark all read"
              tone="primary"
              align="right"
              onPress={() => {
                void campusApi.markAllNotificationsRead();
              }}
            />
          ) : null
        }
      >
        {unread > 0 ? `${unread} unread` : 'Latest'}
      </SectionLabel>

      {notifications.length === 0 ? (
        <EmptyState
          title="You're all caught up."
          message="No new campus updates. We will nudge you the moment a report you follow changes."
        />
      ) : (
        <Card style={styles.list}>
          {notifications.map((item, index) => {
            const Icon = notificationIcon(item.kind);
            return (
              <PressableScale
                key={item.id}
                onPress={() => open(item)}
                accessibilityLabel={item.title}
                style={[styles.item, index === 0 ? null : styles.itemRule]}
              >
                <View style={styles.iconTile}>
                  <Icon
                    size={16}
                    color={item.read ? colors.faint : colors.primary}
                    strokeWidth={1.9}
                  />
                </View>

                <View style={styles.copy}>
                  <Text
                    style={[typeScale.bodyStrong, item.read ? styles.titleRead : null]}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                  <Text style={typeScale.meta} numberOfLines={2}>
                    {item.body}
                  </Text>
                  <Text style={styles.timestamp}>{relativeUpdate(item.createdAt)}</Text>
                </View>

                {item.read ? null : <StatusDot tone="primary" size={7} />}
              </PressableScale>
            );
          })}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    marginTop: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  itemRule: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  iconTile: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  titleRead: {
    color: colors.inkSoft,
    fontFamily: typeScale.body.fontFamily,
  },
  timestamp: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 16,
    color: colors.faint,
  },
});
