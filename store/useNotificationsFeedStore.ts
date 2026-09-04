import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppNotification, NotificationFilter } from '@/types/notifications';
import { Task, Habit, CalendarEvent } from '@/types/dashboard';

const STORAGE_KEY_READ_IDS = 'mistra_notifications_read_ids_v1';
const STORAGE_KEY_DISMISSED_IDS = 'mistra_notifications_dismissed_ids_v1';

interface NotificationsFeedState {
  notifications: AppNotification[];
  readIds: string[];
  dismissedIds: string[];
  filter: NotificationFilter;
  isHydrated: boolean;
  unreadCount: number;

  hydrate: () => Promise<void>;
  setFilter: (filter: NotificationFilter) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  syncFromDashboard: (data: {
    tasks?: Task[];
    habits?: Habit[];
    events?: CalendarEvent[];
    userName?: string;
  }) => void;
}

const DEFAULT_WELCOME_NOTIFICATION: AppNotification = {
  id: 'sys-welcome',
  type: 'system',
  title: 'Welcome to Mistra',
  message: 'Plan your day, build consistent habits, and organize your thoughts with ease.',
  timestamp: 'Just now',
  read: false,
  priority: 'low',
};

export const useNotificationsFeedStore = create<NotificationsFeedState>((set, get) => ({
  notifications: [DEFAULT_WELCOME_NOTIFICATION],
  readIds: [],
  dismissedIds: [],
  filter: 'all',
  isHydrated: false,
  unreadCount: 1,

  hydrate: async () => {
    try {
      const [readRaw, dismissedRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_READ_IDS),
        AsyncStorage.getItem(STORAGE_KEY_DISMISSED_IDS),
      ]);

      const readIds = readRaw ? JSON.parse(readRaw) : [];
      const dismissedIds = dismissedRaw ? JSON.parse(dismissedRaw) : [];

      const current = get().notifications;
      const updated = current
        .filter((n) => !dismissedIds.includes(n.id))
        .map((n) => ({
          ...n,
          read: readIds.includes(n.id) || n.read,
        }));

      const unreadCount = updated.filter((n) => !n.read).length;

      set({
        readIds,
        dismissedIds,
        notifications: updated,
        unreadCount,
        isHydrated: true,
      });
    } catch {
      set({ isHydrated: true });
    }
  },

  setFilter: (filter) => {
    set({ filter });
  },

  markAsRead: async (id) => {
    const { readIds, notifications } = get();
    if (readIds.includes(id)) return;

    const newReadIds = [...readIds, id];
    const updatedNotifications = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    const unreadCount = updatedNotifications.filter((n) => !n.read).length;

    set({
      readIds: newReadIds,
      notifications: updatedNotifications,
      unreadCount,
    });

    try {
      await AsyncStorage.setItem(STORAGE_KEY_READ_IDS, JSON.stringify(newReadIds));
    } catch {}
  },

  markAllAsRead: async () => {
    const { notifications, readIds } = get();
    const allIds = Array.from(new Set([...readIds, ...notifications.map((n) => n.id)]));
    const updatedNotifications = notifications.map((n) => ({ ...n, read: true }));

    set({
      readIds: allIds,
      notifications: updatedNotifications,
      unreadCount: 0,
    });

    try {
      await AsyncStorage.setItem(STORAGE_KEY_READ_IDS, JSON.stringify(allIds));
    } catch {}
  },

  dismissNotification: async (id) => {
    const { dismissedIds, notifications } = get();
    const newDismissedIds = [...dismissedIds, id];
    const updatedNotifications = notifications.filter((n) => n.id !== id);
    const unreadCount = updatedNotifications.filter((n) => !n.read).length;

    set({
      dismissedIds: newDismissedIds,
      notifications: updatedNotifications,
      unreadCount,
    });

    try {
      await AsyncStorage.setItem(STORAGE_KEY_DISMISSED_IDS, JSON.stringify(newDismissedIds));
    } catch {}
  },

  clearAll: async () => {
    const { notifications, dismissedIds } = get();
    const allDismissed = Array.from(new Set([...dismissedIds, ...notifications.map((n) => n.id)]));

    set({
      dismissedIds: allDismissed,
      notifications: [],
      unreadCount: 0,
    });

    try {
      await AsyncStorage.setItem(STORAGE_KEY_DISMISSED_IDS, JSON.stringify(allDismissed));
    } catch {}
  },

  syncFromDashboard: ({ tasks = [], habits = [], events = [] }) => {
    const { readIds, dismissedIds } = get();
    const todayStr = new Date().toISOString().split('T')[0];
    const newNotifications: AppNotification[] = [];

    // 1. Welcome system notification
    if (!dismissedIds.includes(DEFAULT_WELCOME_NOTIFICATION.id)) {
      newNotifications.push({
        ...DEFAULT_WELCOME_NOTIFICATION,
        read: readIds.includes(DEFAULT_WELCOME_NOTIFICATION.id),
      });
    }

    // 2. Due today tasks & Overdue tasks
    tasks.forEach((task) => {
      if (task.completed || !task.dueDate) return;

      const taskDate = task.dueDate.split('T')[0];
      const isOverdue = taskDate < todayStr;
      const isDueToday = taskDate === todayStr;

      if (isDueToday) {
        const notifId = `task-due-${task.id}-${todayStr}`;
        if (!dismissedIds.includes(notifId)) {
          newNotifications.push({
            id: notifId,
            type: 'task_due',
            title: 'Task due today',
            message: `"${task.title}" is scheduled for today.`,
            timestamp: 'Today',
            read: readIds.includes(notifId),
            actionRoute: '/(tabs)/tasks',
            priority: task.priority === 'high' ? 'high' : 'medium',
            metadata: { itemId: task.id, itemType: 'task', dueDate: task.dueDate },
          });
        }
      } else if (isOverdue) {
        const notifId = `task-overdue-${task.id}-${todayStr}`;
        if (!dismissedIds.includes(notifId)) {
          newNotifications.push({
            id: notifId,
            type: 'task_overdue',
            title: 'Overdue task',
            message: `"${task.title}" was due on ${taskDate}.`,
            timestamp: 'Overdue',
            read: readIds.includes(notifId),
            actionRoute: '/(tabs)/tasks',
            priority: 'high',
            metadata: { itemId: task.id, itemType: 'task', dueDate: task.dueDate },
          });
        }
      }
    });

    // 3. Habits reminder & streaks
    const pendingHabits = habits.filter((h) => !h.completed);
    if (pendingHabits.length > 0) {
      const notifId = `habits-pending-${todayStr}`;
      if (!dismissedIds.includes(notifId)) {
        newNotifications.push({
          id: notifId,
          type: 'habit_reminder',
          title: 'Daily habits pending',
          message: `You have ${pendingHabits.length} habit${pendingHabits.length > 1 ? 's' : ''} left to complete today.`,
          timestamp: 'Today',
          read: readIds.includes(notifId),
          actionRoute: '/(tabs)/habits',
          priority: 'medium',
        });
      }
    }

    habits.forEach((habit) => {
      if (habit.streak >= 3) {
        const notifId = `habit-streak-${habit.id}-${habit.streak}`;
        if (!dismissedIds.includes(notifId)) {
          newNotifications.push({
            id: notifId,
            type: 'streak_milestone',
            title: 'Streak milestone!',
            message: `🔥 ${habit.streak}-day streak on "${habit.name}". Keep it up!`,
            timestamp: 'Milestone',
            read: readIds.includes(notifId),
            actionRoute: '/(tabs)/habits',
            priority: 'medium',
            metadata: { itemId: habit.id, itemType: 'habit', streak: habit.streak },
          });
        }
      }
    });

    // 4. Events today
    events.forEach((event) => {
      if (event.eventDate === todayStr) {
        const notifId = `event-today-${event.id}-${todayStr}`;
        if (!dismissedIds.includes(notifId)) {
          newNotifications.push({
            id: notifId,
            type: 'event_today',
            title: 'Event scheduled today',
            message: `"${event.title}" is on your calendar for today.`,
            timestamp: 'Today',
            read: readIds.includes(notifId),
            actionRoute: '/(tabs)/calendar',
            priority: 'medium',
            metadata: { itemId: event.id, itemType: 'event' },
          });
        }
      }
    });

    const unreadCount = newNotifications.filter((n) => !n.read).length;

    set({
      notifications: newNotifications,
      unreadCount,
    });
  },
}));
