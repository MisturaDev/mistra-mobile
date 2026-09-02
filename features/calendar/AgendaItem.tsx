import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/Card';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import type { CalendarEvent, Task, EventCategory } from '@/types/dashboard';

interface AgendaEventItemProps {
  event: CalendarEvent;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
}

interface AgendaTaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
}

const EVENT_CATEGORY_ICONS: Record<EventCategory, string> = {
  meeting: '👥',
  work: '💼',
  personal: '🏠',
  health: '💪',
  study: '📚',
  general: '🏷️',
};

export function AgendaEventCard({ event, onEdit, onDelete }: AgendaEventItemProps) {
  const icon = EVENT_CATEGORY_ICONS[event.category] || '📅';

  return (
    <Card style={styles.card} padded elevation="none">
      <View style={styles.eventRow}>
        <View style={styles.iconContainer}>
          <Text style={styles.categoryIcon}>{icon}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onEdit(event)}
          style={styles.infoContainer}
        >
          <Text style={styles.eventTitle} numberOfLines={1}>
            {event.title}
          </Text>

          {event.description ? (
            <Text style={styles.eventDesc} numberOfLines={2}>
              {event.description}
            </Text>
          ) : null}

          <View style={styles.timeBadgeRow}>
            <View style={styles.timeBadge}>
              <Ionicons name="time-outline" size={12} color={Colors.primary} />
              <Text style={styles.timeText}>
                {event.isAllDay
                  ? 'All day'
                  : event.startTime && event.endTime
                  ? `${event.startTime} - ${event.endTime}`
                  : event.startTime
                  ? event.startTime
                  : 'Scheduled'}
              </Text>
            </View>

            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{event.category}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onDelete(event)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.deleteButton}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color={Colors.textLight} />
        </TouchableOpacity>
      </View>
    </Card>
  );
}

export function AgendaTaskCard({ task, onToggle }: AgendaTaskItemProps) {
  return (
    <Card
      style={[styles.card, task.completed && styles.cardCompleted]}
      padded
      elevation="none"
    >
      <View style={styles.taskRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onToggle(task.id)}
          style={styles.checkboxHitArea}
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

        <View style={styles.infoContainer}>
          <Text
            style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}
            numberOfLines={1}
          >
            {task.title}
          </Text>

          <View style={styles.taskMetaRow}>
            <View style={styles.taskBadge}>
              <Text style={styles.taskBadgeText}>Due Task</Text>
            </View>

            {task.priority === 'high' ? (
              <View style={styles.highPriorityBadge}>
                <Text style={styles.highPriorityText}>High Priority</Text>
              </View>
            ) : null}

            {task.subtasks.length > 0 ? (
              <Text style={styles.subtaskMetaText}>
                {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} steps
              </Text>
            ) : null}
          </View>
        </View>
      </View>
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
    opacity: 0.7,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  categoryIcon: {
    fontSize: 18,
  },
  infoContainer: {
    flex: 1,
    minWidth: 0,
  },
  eventTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 15,
    marginBottom: 2,
  },
  eventDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    lineHeight: 18,
  },
  timeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  timeText: {
    ...Typography.captionBold,
    color: Colors.primaryDark,
    fontSize: 11,
  },
  categoryBadge: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  categoryBadgeText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 10,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  deleteButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  taskTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 15,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 4,
  },
  taskBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  taskBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  highPriorityBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  highPriorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  subtaskMetaText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11,
  },
});
