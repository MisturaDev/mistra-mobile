import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'mistra-notification-preferences';

export interface NotificationPreferences {
  pushEnabled: boolean;
  dailyReminder: boolean;
  taskReminders: boolean;
  habitReminders: boolean;
  emailUpdates: boolean;
}

export const defaultNotificationPreferences: NotificationPreferences = {
  pushEnabled: false,
  dailyReminder: true,
  taskReminders: true,
  habitReminders: true,
  emailUpdates: false,
};

export async function loadNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultNotificationPreferences;
    return { ...defaultNotificationPreferences, ...JSON.parse(stored) };
  } catch {
    return defaultNotificationPreferences;
  }
}

export async function saveNotificationPreferences(preferences: NotificationPreferences) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}
