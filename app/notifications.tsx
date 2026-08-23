import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { Card } from '@/components/Card';
import { SettingToggle } from '@/components/SettingToggle';
import { useNotificationStore } from '@/store/useNotificationStore';
import { isExpoGo } from '@/utils/notifications';

export default function NotificationsScreen() {
  const router = useRouter();
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

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled && isExpoGo) {
      Alert.alert(
        'Not available in Expo Go',
        'Push notifications require a development or production build. You can still save your notification preferences here.'
      );
      return;
    }

    const success = await setPushEnabled(enabled);
    if (!success) {
      Alert.alert(
        'Permission required',
        'Enable notifications in your device settings to receive Mistra reminders.'
      );
    }
  };

  if (!isHydrated) {
    return <SafeAreaView style={styles.container} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back-outline" size={24} color={Colors.text} />
        </TouchableOpacity>

        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>
          Choose what Mistra can notify you about. Push reminders require device permission.
        </Text>

        {isExpoGo ? (
          <View style={styles.expoGoBanner}>
            <Text style={styles.expoGoBannerText}>
              Push notifications are not supported in Expo Go. Build the app to test reminders on
              device.
            </Text>
          </View>
        ) : null}

        <Text style={styles.sectionLabel}>Push notifications</Text>
        <Card style={styles.card} padded elevation="none">
          <SettingToggle
            label="Enable notifications"
            description="Allow Mistra to send reminders on this device"
            value={pushEnabled}
            onValueChange={handlePushToggle}
          />
        </Card>

        <Text style={styles.sectionLabel}>Reminders</Text>
        <Card style={styles.card} padded elevation="none">
          <SettingToggle
            label="Daily briefing"
            description="Morning summary of tasks and habits"
            value={dailyReminder}
            onValueChange={(value) => updatePreference('dailyReminder', value)}
            disabled={!pushEnabled}
          />
          <View style={styles.divider} />
          <SettingToggle
            label="Task reminders"
            description="Due dates and overdue tasks"
            value={taskReminders}
            onValueChange={(value) => updatePreference('taskReminders', value)}
            disabled={!pushEnabled}
          />
          <View style={styles.divider} />
          <SettingToggle
            label="Habit reminders"
            description="Daily habit check-ins and streaks"
            value={habitReminders}
            onValueChange={(value) => updatePreference('habitReminders', value)}
            disabled={!pushEnabled}
          />
        </Card>

        <Text style={styles.sectionLabel}>Email</Text>
        <Card style={styles.card} padded elevation="none">
          <SettingToggle
            label="Product updates"
            description="Occasional emails about new Mistra features"
            value={emailUpdates}
            onValueChange={(value) => updatePreference('emailUpdates', value)}
          />
        </Card>

        <Text style={styles.note}>
          Scheduled reminders will fully activate once tasks and habits sync to your account.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  backButton: {
    paddingVertical: Spacing.sm,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  card: {
    marginBottom: Spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  note: {
    ...Typography.caption,
    color: Colors.textLight,
    lineHeight: 18,
    textAlign: 'center',
  },
  expoGoBanner: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  expoGoBannerText: {
    ...Typography.caption,
    color: Colors.primaryDark,
    lineHeight: 18,
  },
});
