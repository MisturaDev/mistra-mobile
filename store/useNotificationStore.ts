import { create } from 'zustand';
import {
  NotificationPreferences,
  defaultNotificationPreferences,
  loadNotificationPreferences,
  saveNotificationPreferences,
} from '@/utils/notificationPreferences';
import {
  isExpoGo,
  requestNotificationPermission,
  sendTestNotification,
} from '@/utils/notifications';

interface NotificationState extends NotificationPreferences {
  isHydrated: boolean;
  permissionStatus: string;
  hydrate: () => Promise<void>;
  setPushEnabled: (enabled: boolean) => Promise<boolean>;
  updatePreference: <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  ...defaultNotificationPreferences,
  isHydrated: false,
  permissionStatus: 'undetermined',

  hydrate: async () => {
    const preferences = await loadNotificationPreferences();
    set({ ...preferences, isHydrated: true });
  },

  setPushEnabled: async (enabled) => {
    if (enabled) {
      if (isExpoGo) {
        set({ permissionStatus: 'unavailable' });
        return false;
      }

      const granted = await requestNotificationPermission();
      if (!granted) {
        set({ permissionStatus: 'denied' });
        return false;
      }

      set({ pushEnabled: true, permissionStatus: 'granted' });
      const state = get();
      await saveNotificationPreferences({
        pushEnabled: true,
        dailyReminder: state.dailyReminder,
        taskReminders: state.taskReminders,
        habitReminders: state.habitReminders,
        emailUpdates: state.emailUpdates,
      });

      await sendTestNotification();
      return true;
    }

    set({ pushEnabled: false });
    const state = get();
    await saveNotificationPreferences({
      pushEnabled: false,
      dailyReminder: state.dailyReminder,
      taskReminders: state.taskReminders,
      habitReminders: state.habitReminders,
      emailUpdates: state.emailUpdates,
    });
    return true;
  },

  updatePreference: async (key, value) => {
    set({ [key]: value } as Partial<NotificationPreferences>);
    const state = get();
    await saveNotificationPreferences({
      pushEnabled: state.pushEnabled,
      dailyReminder: state.dailyReminder,
      taskReminders: state.taskReminders,
      habitReminders: state.habitReminders,
      emailUpdates: state.emailUpdates,
    });
  },
}));
