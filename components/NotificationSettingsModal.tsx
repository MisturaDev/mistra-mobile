import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { Card } from '@/components/Card';
import { SettingToggle } from '@/components/SettingToggle';
import { Button } from '@/components/Button';
import { useNotificationStore } from '@/store/useNotificationStore';
import { isExpoGo, sendTestNotification } from '@/utils/notifications';
import { toast } from '@/components/AppToast';
import { haptics } from '@/utils/haptics';

interface NotificationSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function NotificationSettingsModal({
  visible,
  onClose,
}: NotificationSettingsModalProps) {
  const {
    pushEnabled,
    dailyReminder,
    taskReminders,
    habitReminders,
    emailUpdates,
    isHydrated,
    hydrate,
    setPushEnabled,
    updatePreference,
  } = useNotificationStore();

  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (visible) {
      hydrate();
    }
  }, [visible, hydrate]);

  const handlePushToggle = async (enabled: boolean) => {
    haptics.selection();
    if (enabled && isExpoGo) {
      Alert.alert(
        'Not available in Expo Go',
        'Push notifications require a development or production build. You can still save your notification preferences here.'
      );
      return;
    }

    const success = await setPushEnabled(enabled);
    if (!success && enabled) {
      Alert.alert(
        'Permission required',
        'Enable notifications in your device settings to receive Mistra reminders.'
      );
    }
  };

  const handlePreferenceChange = (
    key: 'dailyReminder' | 'taskReminders' | 'habitReminders' | 'emailUpdates',
    value: boolean
  ) => {
    haptics.selection();
    updatePreference(key, value);
  };

  const handleTestNotification = async () => {
    haptics.mediumImpact();
    if (isExpoGo) {
      toast.info({
        title: 'Expo Go limitation',
        message: 'Native notifications run on the Dev Client APK build.',
      });
      return;
    }

    setTesting(true);
    try {
      await sendTestNotification();
      toast.success({
        title: 'Notification triggered',
        message: 'A test notification will arrive in 2 seconds.',
      });
    } catch {
      toast.error({
        title: 'Could not send',
        message: 'Check your notification permissions.',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>Notification Settings</Text>
            <Text style={styles.subtitle}>Customize your alerts and reminders</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              haptics.lightImpact();
              onClose();
            }}
            style={styles.closeButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {isExpoGo ? (
            <View style={styles.expoGoBanner}>
              <Ionicons name="information-circle-outline" size={18} color={Colors.primaryDark} />
              <Text style={styles.expoGoBannerText}>
                Push alerts are disabled in Expo Go. Preferences will automatically activate in your Dev Client build.
              </Text>
            </View>
          ) : null}

          <Text style={styles.sectionLabel}>Push notifications</Text>
          <Card style={styles.card} padded elevation="none">
            <SettingToggle
              label="Enable notifications"
              description="Allow Mistra to send alerts on this device"
              value={pushEnabled}
              onValueChange={handlePushToggle}
            />
          </Card>

          <Text style={styles.sectionLabel}>Reminders</Text>
          <Card style={styles.card} padded elevation="none">
            <SettingToggle
              label="Daily morning briefing"
              description="Summary of your tasks and habits for the day"
              value={dailyReminder}
              onValueChange={(value) => handlePreferenceChange('dailyReminder', value)}
              disabled={!pushEnabled}
            />
            <View style={styles.divider} />
            <SettingToggle
              label="Task reminders"
              description="Alerts for due dates and overdue tasks"
              value={taskReminders}
              onValueChange={(value) => handlePreferenceChange('taskReminders', value)}
              disabled={!pushEnabled}
            />
            <View style={styles.divider} />
            <SettingToggle
              label="Habit reminders"
              description="Evening check-ins to preserve your streaks"
              value={habitReminders}
              onValueChange={(value) => handlePreferenceChange('habitReminders', value)}
              disabled={!pushEnabled}
            />
          </Card>

          <Text style={styles.sectionLabel}>Email updates</Text>
          <Card style={styles.card} padded elevation="none">
            <SettingToggle
              label="Product updates"
              description="Occasional updates about new Mistra features"
              value={emailUpdates}
              onValueChange={(value) => handlePreferenceChange('emailUpdates', value)}
            />
          </Card>

          <View style={styles.testSection}>
            <Button
              title={testing ? 'Sending...' : 'Send Test Notification'}
              variant="outline"
              size="md"
              loading={testing}
              onPress={handleTestNotification}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  expoGoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  expoGoBannerText: {
    ...Typography.caption,
    color: Colors.primaryDark,
    flex: 1,
    lineHeight: 18,
  },
  sectionLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  card: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  testSection: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
});
