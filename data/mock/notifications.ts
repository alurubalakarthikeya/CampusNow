import type { Notification } from '@/types';
import { daysAgo, minutesAgo } from '@/utils/format';

export function createMockNotifications(): Notification[] {
  return [
    {
      id: 'n-network-assigned',
      kind: 'update',
      title: 'Network team assigned',
      body: 'Your WiFi report in Block B is now being handled by the network team.',
      createdAt: minutesAgo(18),
      read: false,
      reportId: 'r-wifi-block-b',
    },
    {
      id: 'n-merged',
      kind: 'merge',
      title: '47 students affected',
      body: 'Your report was linked with a nearby WiFi issue so you get updates without duplicates.',
      createdAt: minutesAgo(52),
      read: false,
      reportId: 'r-wifi-block-b',
    },
    {
      id: 'n-projector-resolved',
      kind: 'resolved',
      title: 'Projector in B204 resolved',
      body: 'Operations marked the B204 projector as fixed. Confirm if it works for you.',
      createdAt: daysAgo(1),
      read: false,
      reportId: 'r-projector-b204',
    },
    {
      id: 'n-ac-confirmed',
      kind: 'confirmed',
      title: 'AC report confirmed',
      body: 'Facilities confirmed your Block C cooling report and queued a technician.',
      createdAt: daysAgo(3),
      read: true,
      reportId: 'r-ac-block-c',
    },
  ];
}
