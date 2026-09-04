import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { AppNotification, NotificationType } from '@/types/notifications';
import { haptics } from '@/utils/haptics';

interface NotificationItemCardProps {
  notification: AppNotification;
  onPress?: () => void;
  onDismiss?: () => void;
}

function getNotificationVisuals(type: NotificationType) {
  switch (type) {
    case 'task_due':
      return {
        iconName: 'checkmark-circle-outline' as const,
        iconColor: Colors.primary,
        bgColor: Colors.primaryLight,
        badgeLabel: 'Task Due',
      };
    case 'task_overdue':
      return {
        iconName: 'alert-circle-outline' as const,
        iconColor: Colors.error,
        bgColor: '#FEE2E2',
        badgeLabel: 'Overdue',
      };
    case 'habit_reminder':
      return {
        iconName: 'repeat-outline' as const,
        iconColor: '#8B5CF6',
        bgColor: '#F3E8FF',
        badgeLabel: 'Habit',
      };
    case 'streak_milestone':
      return {
        iconName: 'flame' as const,
        iconColor: '#F59E0B',
        bgColor: '#FEF3C7',
        badgeLabel: 'Streak',
      };
    case 'event_today':
      return {
        iconName: 'calendar-outline' as const,
        iconColor: '#3B82F6',
        bgColor: '#DBEAFE',
        badgeLabel: 'Event',
      };
    case 'system':
    default:
      return {
        iconName: 'sparkles-outline' as const,
        iconColor: Colors.primary,
        bgColor: Colors.primaryLight,
        badgeLabel: 'System',
      };
  }
}

export function NotificationItemCard({
  notification,
  onPress,
  onDismiss,
}: NotificationItemCardProps) {
  const visuals = getNotificationVisuals(notification.type);

  const handlePress = () => {
    haptics.selection();
    onPress?.();
  };

  const handleDismiss = () => {
    haptics.lightImpact();
    onDismiss?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[
        styles.card,
        !notification.read && styles.cardUnread,
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.leftRow}>
          <View style={[styles.iconWrap, { backgroundColor: visuals.bgColor }]}>
            <Ionicons name={visuals.iconName} size={18} color={visuals.iconColor} />
          </View>
          <View style={styles.badge}>
            <Text style={[styles.badgeText, { color: visuals.iconColor }]}>
              {visuals.badgeLabel}
            </Text>
          </View>
          {!notification.read && <View style={styles.unreadDot} />}
        </View>

        <View style={styles.rightRow}>
          <Text style={styles.timestamp}>{notification.timestamp}</Text>
          {onDismiss && (
            <TouchableOpacity
              onPress={handleDismiss}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.dismissButton}
            >
              <Ionicons name="close" size={16} color={Colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={[styles.title, !notification.read && styles.titleUnread]}>
          {notification.title}
        </Text>
        <Text style={styles.message}>{notification.message}</Text>
      </View>

      {notification.actionRoute && (
        <View style={styles.cardFooter}>
          <Text style={styles.actionText}>View details</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  cardUnread: {
    borderColor: Colors.primaryMuted,
    backgroundColor: '#FAFAFF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  badgeText: {
    ...Typography.captionBold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  timestamp: {
    ...Typography.caption,
    color: Colors.textLight,
    fontSize: 12,
  },
  dismissButton: {
    padding: 2,
  },
  cardBody: {
    marginTop: 2,
  },
  title: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  titleUnread: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  message: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: 2,
  },
  actionText: {
    ...Typography.captionBold,
    color: Colors.primary,
    fontSize: 12,
  },
});
