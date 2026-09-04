export type NotificationType =
  | 'task_due'
  | 'task_overdue'
  | 'habit_reminder'
  | 'streak_milestone'
  | 'event_today'
  | 'system';

export type NotificationPriority = 'high' | 'medium' | 'low';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO string or relative label
  read: boolean;
  actionRoute?: string;
  priority?: NotificationPriority;
  metadata?: {
    itemId?: string;
    itemType?: 'task' | 'habit' | 'event';
    dueDate?: string;
    streak?: number;
  };
}

export type NotificationFilter = 'all' | 'unread' | 'reminders';
