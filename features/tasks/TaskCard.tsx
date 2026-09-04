import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/Card';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import type { Task, TaskPriority, TaskCategory } from '@/types/dashboard';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const CATEGORY_META: Record<
  TaskCategory,
  { label: string; color: string; bg: string }
> = {
  general: { label: 'General', color: '#4B5563', bg: '#F3F4F6' },
  work: { label: 'Work', color: '#1D4ED8', bg: '#EFF6FF' },
  personal: { label: 'Personal', color: '#7C3AED', bg: '#F5F3FF' },
  study: { label: 'Study', color: '#D97706', bg: '#FEF3C7' },
  health: { label: 'Health', color: '#059669', bg: '#D1FAE5' },
  shopping: { label: 'Shopping', color: '#DC2626', bg: '#FEE2E2' },
};

const PRIORITY_META: Record<TaskPriority, { label: string; color: string; bg: string } | null> = {
  high: { label: 'High', color: '#DC2626', bg: '#FEE2E2' },
  medium: null,
  low: { label: 'Low', color: '#6B7280', bg: '#F3F4F6' },
};

function formatDueDate(dueDateString?: string | null): { label: string; isOverdue: boolean; isToday: boolean } | null {
  if (!dueDateString) return null;
  try {
    const target = new Date(dueDateString);
    if (isNaN(target.getTime())) return null;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const targetStr = target.toISOString().split('T')[0];

    const isToday = todayStr === targetStr;
    const isPast = targetStr < todayStr;

    if (isToday) return { label: 'Today', isOverdue: false, isToday: true };
    if (isPast) return { label: 'Overdue', isOverdue: true, isToday: false };

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (targetStr === tomorrow.toISOString().split('T')[0]) {
      return { label: 'Tomorrow', isOverdue: false, isToday: false };
    }

    return {
      label: target.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      isOverdue: false,
      isToday: false,
    };
  } catch {
    return null;
  }
}

export function TaskCard({
  task,
  onToggle,
  onToggleSubtask,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const [subtasksExpanded, setSubtasksExpanded] = useState(false);
  const cat = CATEGORY_META[task.category] || CATEGORY_META.general;
  const pri = PRIORITY_META[task.priority];
  const due = formatDueDate(task.dueDate);

  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <Card
      style={[
        styles.card,
        task.completed && styles.cardCompleted,
      ]}
      padded
      elevation="none"
      bordered={false}
    >
      <View style={styles.topRow}>
        {/* Main Checkbox */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onToggle(task.id)}
          style={styles.checkboxHitArea}
          accessibilityRole="button"
          accessibilityLabel={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
        >
          <View
            style={[
              styles.checkbox,
              {
                borderColor: task.completed ? Colors.primary : Colors.textLight,
                backgroundColor: task.completed ? Colors.primary : 'transparent',
              },
            ]}
          >
            {task.completed ? <Ionicons name="checkmark" size={14} color={Colors.white} /> : null}
          </View>
        </TouchableOpacity>

        {/* Title & Info */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onEdit(task)}
          style={styles.infoArea}
        >
          <View style={styles.titleContainer}>
            <Text
              style={[
                styles.title,
                task.completed && styles.titleCompleted,
              ]}
              numberOfLines={2}
            >
              {task.title}
            </Text>
          </View>

          {task.description ? (
            <Text
              style={[
                styles.description,
                task.completed && styles.descriptionCompleted,
              ]}
              numberOfLines={2}
            >
              {task.description}
            </Text>
          ) : null}

          {/* Badges Row */}
          <View style={styles.badgesRow}>
            {/* Category Badge (Clean Text-Only Pill) */}
            <View style={[styles.categoryBadge, { backgroundColor: cat.bg }]}>
              <Text style={[styles.categoryLabel, { color: cat.color }]}>{cat.label}</Text>
            </View>

            {/* Priority Badge */}
            {pri && !task.completed ? (
              <View style={[styles.priorityBadge, { backgroundColor: pri.bg }]}>
                <Text style={[styles.priorityLabel, { color: pri.color }]}>{pri.label}</Text>
              </View>
            ) : null}

            {/* Due Date Badge */}
            {due && !task.completed ? (
              <View
                style={[
                  styles.dueBadge,
                  due.isOverdue && styles.dueBadgeOverdue,
                  due.isToday && styles.dueBadgeToday,
                ]}
              >
                <Ionicons
                  name={due.isOverdue ? 'alert-circle' : 'calendar-outline'}
                  size={12}
                  color={due.isOverdue ? Colors.error : due.isToday ? Colors.primary : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.dueLabel,
                    due.isOverdue && styles.dueLabelOverdue,
                    due.isToday && styles.dueLabelToday,
                  ]}
                >
                  {due.label}
                </Text>
              </View>
            ) : null}
          </View>
        </TouchableOpacity>

        {/* Delete button */}
        <TouchableOpacity
          onPress={() => onDelete(task)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.deleteButton}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color={Colors.textLight} />
        </TouchableOpacity>
      </View>

      {/* Subtasks Progress / Expandable Accordion */}
      {totalSubtasks > 0 ? (
        <View style={styles.subtasksContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setSubtasksExpanded(!subtasksExpanded)}
            style={styles.subtasksHeader}
          >
            <View style={styles.subtaskProgressPill}>
              <Ionicons name="list-outline" size={12} color={Colors.primary} />
              <Text style={styles.subtaskProgressText}>
                {completedSubtasks}/{totalSubtasks} subtasks
              </Text>
            </View>
            <Ionicons
              name={subtasksExpanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={Colors.textLight}
            />
          </TouchableOpacity>

          {subtasksExpanded ? (
            <View style={styles.subtasksList}>
              {task.subtasks.map((st) => (
                <TouchableOpacity
                  key={st.id}
                  activeOpacity={0.7}
                  onPress={() => onToggleSubtask(task.id, st.id)}
                  style={styles.subtaskRow}
                >
                  <View
                    style={[
                      styles.subtaskCheckbox,
                      st.completed && styles.subtaskCheckboxDone,
                    ]}
                  >
                    {st.completed ? (
                      <Ionicons name="checkmark" size={10} color={Colors.white} />
                    ) : null}
                  </View>
                  <Text
                    style={[
                      styles.subtaskTitle,
                      st.completed && styles.subtaskTitleDone,
                    ]}
                    numberOfLines={1}
                  >
                    {st.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardCompleted: {
    opacity: 0.75,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxHitArea: {
    marginRight: Spacing.md,
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoArea: {
    flex: 1,
    minWidth: 0,
  },
  titleContainer: {
    marginBottom: 2,
  },
  title: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 15,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  description: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    lineHeight: 18,
  },
  descriptionCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textLight,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
    marginTop: Spacing.xs,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  priorityLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  dueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  dueBadgeToday: {
    borderColor: Colors.primaryMuted,
    backgroundColor: Colors.primaryLight,
  },
  dueBadgeOverdue: {
    borderColor: Colors.errorLight,
    backgroundColor: Colors.errorLight,
  },
  dueLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  dueLabelToday: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  dueLabelOverdue: {
    color: Colors.error,
    fontWeight: '700',
  },
  deleteButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  subtasksContainer: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  subtasksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtaskProgressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subtaskProgressText: {
    ...Typography.captionBold,
    color: Colors.primary,
    fontSize: 11,
  },
  subtasksList: {
    marginTop: Spacing.xs,
    gap: Spacing.xs,
    paddingLeft: Spacing.xs,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  subtaskCheckbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.textLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskCheckboxDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  subtaskTitle: {
    ...Typography.caption,
    color: Colors.text,
    flex: 1,
  },
  subtaskTitleDone: {
    textDecorationLine: 'line-through',
    color: Colors.textLight,
  },
});
