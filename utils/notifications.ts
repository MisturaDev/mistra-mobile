import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export const isExpoGo = Constants.appOwnership === 'expo';

type NotificationsModule = typeof import('expo-notifications');

let notificationsModule: NotificationsModule | null | undefined;
let handlerConfigured = false;

async function getNotificationsModule(): Promise<NotificationsModule | null> {
  if (isExpoGo) return null;

  if (notificationsModule !== undefined) {
    return notificationsModule;
  }

  try {
    notificationsModule = await import('expo-notifications');

    if (!handlerConfigured) {
      notificationsModule.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
      handlerConfigured = true;
    }

    return notificationsModule;
  } catch {
    notificationsModule = null;
    return null;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (isExpoGo || !Device.isDevice) {
    return false;
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications) return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function getNotificationPermissionStatus(): Promise<string> {
  if (isExpoGo) return 'unavailable';

  const Notifications = await getNotificationsModule();
  if (!Notifications) return 'undetermined';

  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

export async function configureAndroidNotificationChannel() {
  if (Platform.OS !== 'android') return;

  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  await Notifications.setNotificationChannelAsync('default', {
    name: 'Mistra',
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: '#7C3AED',
  });
}

export async function sendTestNotification() {
  if (isExpoGo) return;

  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  await configureAndroidNotificationChannel();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Mistra',
      body: 'Notifications are enabled. You will receive reminders here.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
}
