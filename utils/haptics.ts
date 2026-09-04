import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isSupported = Platform.OS === 'ios' || Platform.OS === 'android';

export const haptics = {
  /** Subtle tap feedback for UI interactions like tab switches and light button clicks */
  selection: () => {
    if (!isSupported) return;
    try {
      Haptics.selectionAsync().catch(() => {});
    } catch {}
  },

  /** Light impact for small actions like toggles or minor state updates */
  lightImpact: () => {
    if (!isSupported) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
  },

  /** Medium impact for affirmative actions like creating an item or opening modals */
  mediumImpact: () => {
    if (!isSupported) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } catch {}
  },

  /** Heavy impact for primary or destructive triggers */
  heavyImpact: () => {
    if (!isSupported) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    } catch {}
  },

  /** Celebratory tactile feedback when completing tasks or habits */
  notificationSuccess: () => {
    if (!isSupported) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch {}
  },

  /** Tactile feedback for warning dialogs */
  notificationWarning: () => {
    if (!isSupported) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    } catch {}
  },

  /** Tactile feedback for errors or destructive deletions */
  notificationError: () => {
    if (!isSupported) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    } catch {}
  },
};
