import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import type { TaskPriority } from '@/types/dashboard';

export interface TaskItemProps {
  id: string;
  title: string;
  completed: boolean;
  priority?: TaskPriority;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_BADGES: Record<TaskPriority, { label: string; bg: string; text: string } | null> = {
  high: { label: 'High', bg: '#FEE2E2', text: '#DC2626' },
  medium: null, // neutral / subtle
  low: { label: 'Low', bg: '#F3F4F6', text: '#6B7280' },
};

export const TaskItem: React.FC<TaskItemProps> = ({
  id,
  title,
  completed,
  priority = 'medium',
  onToggle,
  onEdit,
  onDelete,
}) => {
  const badge = PRIORITY_BADGES[priority];

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: completed ? Colors.borderLight : Colors.border,
          backgroundColor: completed ? Colors.surface : Colors.white,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onToggle(id)}
        style={styles.checkboxHitArea}
        accessibilityRole="button"
        accessibilityLabel={completed ? 'Mark task incomplete' : 'Mark task complete'}
      >
        <View
          style={[
            styles.checkbox,
            {
              borderColor: completed ? Colors.primary : Colors.textLight,
              backgroundColor: completed ? Colors.primary : 'transparent',
            },
          ]}
        >
          {completed ? <Ionicons name="checkmark" size={14} color={Colors.white} /> : null}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onEdit(id)}
        style={styles.titleButton}
        accessibilityRole="button"
        accessibilityLabel={`Edit task ${title}`}
      >
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.title,
              {
                color: completed ? Colors.textSecondary : Colors.text,
                textDecorationLine: completed ? 'line-through' : 'none',
              },
            ]}
            numberOfLines={2}
          >
            {title}
          </Text>

          {badge && !completed ? (
            <View style={[styles.priorityBadge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.priorityBadgeText, { color: badge.text }]}>
                {badge.label}
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onDelete(id)}
        style={styles.deleteButton}
        accessibilityRole="button"
        accessibilityLabel={`Delete task ${title}`}
      >
        <Ionicons name="trash-outline" size={18} color={Colors.textLight} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    alignSelf: 'stretch',
  },
  checkboxHitArea: {
    marginRight: Spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleButton: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  title: {
    ...Typography.body,
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.full,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  deleteButton: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
});
