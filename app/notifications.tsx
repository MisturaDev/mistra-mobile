import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { BackButton } from '@/components/BackButton';
import { NotificationItemCard } from '@/components/NotificationItemCard';
import { NotificationSettingsModal } from '@/components/NotificationSettingsModal';
import { useNotificationsFeedStore } from '@/store/useNotificationsFeedStore';
import { useAuth } from '@/providers/AuthProvider';
import { useTasks } from '@/hooks/useTasks';
import { useHabits } from '@/hooks/useHabits';
import { useEvents } from '@/hooks/useEvents';
import { NotificationFilter } from '@/types/notifications';
import { haptics } from '@/utils/haptics';

export default function NotificationsScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;

  const [settingsVisible, setSettingsVisible] = useState(false);

  const { tasks } = useTasks(userId);
  const { habits } = useHabits(userId);
  const { events } = useEvents(userId);

  const {
    notifications,
    filter,
    isHydrated,
    unreadCount,
    hydrate,
    setFilter,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll,
    syncFromDashboard,
  } = useNotificationsFeedStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isHydrated) {
      syncFromDashboard({ tasks, habits, events });
    }
  }, [isHydrated, tasks, habits, events, syncFromDashboard]);

  const filteredNotifications = useMemo(() => {
    switch (filter) {
      case 'unread':
        return notifications.filter((n) => !n.read);
      case 'reminders':
        return notifications.filter(
          (n) => n.type === 'task_due' || n.type === 'task_overdue' || n.type === 'habit_reminder'
        );
      case 'all':
      default:
        return notifications;
    }
  }, [notifications, filter]);

  const handleFilterPress = (nextFilter: NotificationFilter) => {
    haptics.selection();
    setFilter(nextFilter);
  };

  const handleNotificationPress = async (actionRoute?: string, id?: string) => {
    if (id) {
      await markAsRead(id);
    }
    if (actionRoute) {
      router.push(actionRoute as any);
    }
  };

  const handleMarkAllRead = async () => {
    haptics.lightImpact();
    await markAllAsRead();
  };

  const handleClearAll = async () => {
    haptics.notificationWarning();
    await clearAll();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity
          onPress={() => {
            haptics.lightImpact();
            setSettingsVisible(true);
          }}
          style={styles.settingsButton}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Notification Settings"
        >
          <Ionicons name="options-outline" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          onPress={() => handleFilterPress('all')}
          style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleFilterPress('unread')}
          style={[styles.filterChip, filter === 'unread' && styles.filterChipActive]}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>
            Unread {unreadCount > 0 ? `(${unreadCount})` : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleFilterPress('reminders')}
          style={[styles.filterChip, filter === 'reminders' && styles.filterChipActive]}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filter === 'reminders' && styles.filterTextActive]}>
            Reminders
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sub-actions row */}
      {notifications.length > 0 && (
        <View style={styles.actionsRow}>
          <Text style={styles.resultsCount}>
            {filteredNotifications.length} notification{filteredNotifications.length === 1 ? '' : 's'}
          </Text>
          <View style={styles.actionButtonsGroup}>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={handleMarkAllRead} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.actionButtonText}>Mark all as read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleClearAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.clearAllText}>Clear all</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* List / Feed */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <NotificationItemCard
              key={notif.id}
              notification={notif}
              onPress={() => handleNotificationPress(notif.actionRoute, notif.id)}
              onDismiss={() => dismissNotification(notif.id)}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="notifications-off-outline" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>You're all caught up!</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'unread'
                ? 'No unread notifications at the moment.'
                : filter === 'reminders'
                  ? 'No pending task or habit reminders right now.'
                  : 'You have no new notifications or alerts.'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Settings Modal */}
      <NotificationSettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </SafeAreaView>
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
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.white,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  resultsCount: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  actionButtonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  actionButtonText: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  clearAllText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xxl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 1.5,
    paddingHorizontal: Spacing.lg,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.title,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});
