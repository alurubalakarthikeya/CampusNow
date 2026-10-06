import type { ComponentType } from 'react';
import {
  Bell,
  CircleCheck,
  FlaskConical,
  Layers,
  Projector,
  School,
  Snowflake,
  Sparkles,
  Ticket,
  Users,
  Utensils,
  Wifi,
  Wrench,
} from 'lucide-react-native';

import type { NotificationKind, ReportCategoryId } from '@/types';

/**
 * Minimal subset of the icon props we use, so this module does not depend
 * on lucide's internal types.
 */
export type IconComponent = ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

/** Minimal line icons only — no colourful illustrations. */
export const categoryIcons: Record<ReportCategoryId, IconComponent> = {
  wifi: Wifi,
  lab: FlaskConical,
  projector: Projector,
  ac: Snowflake,
  mess: Utensils,
  access: Ticket,
  classroom: School,
  other: Layers,
};

export const serviceIcons: Record<string, IconComponent> = {
  it: Wifi,
  facilities: Wrench,
  food: Utensils,
  access: Ticket,
};

export const notificationIcons: Record<NotificationKind, IconComponent> = {
  update: Sparkles,
  resolved: CircleCheck,
  confirmed: CircleCheck,
  merge: Users,
  announcement: Bell,
};

export const notificationIcon = (kind: NotificationKind): IconComponent => notificationIcons[kind] ?? Bell;
