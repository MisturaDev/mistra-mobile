import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export interface HabitItemProps {
  id: string;
  name: string;
  streak: number;
  completed: boolean;
  onToggle: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const HabitItem: React.FC<HabitItemProps> = ({
  id,
  name,
  streak,
  completed,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const showActions = onEdit !== undefined || onDelete !== undefined;
  
  // Current day index where Mon = 0 ... Sun = 6
  const currentDayIndex = (new Date().getDay() + 6) % 7;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={[styles.info, showActions && styles.infoWithActions]}>
          {onEdit ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onEdit(id)}
              accessibilityRole="button"
              accessibilityLabel={`Edit habit ${name}`}
            >
              <Text style={styles.name}>{name}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.name}>{name}</Text>
          )}
          <View style={styles.streakRow}>
            <Ionicons name="flame" size={16} color="#F59E0B" style={styles.flameIcon} />
            <Text style={styles.streakText}>{streak} day streak</Text>
          </View>
        </View>

        <View style={styles.actions}>
          {onDelete ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onDelete(id)}
              style={styles.deleteButton}
              accessibilityRole="button"
              accessibilityLabel={`Delete habit ${name}`}
            >
              <Ionicons name="trash-outline" size={18} color={Colors.textLight} />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onToggle(id)}
            style={[
              styles.actionBtn,
              {
                backgroundColor: completed ? Colors.successLight : Colors.primaryLight,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={completed ? 'Undo habit log' : 'Log habit'}
          >
            <Ionicons
              name={completed ? 'checkmark-circle' : 'add'}
              size={20}
              color={completed ? Colors.success : Colors.primary}
            />
            <Text
              style={[
                styles.actionText,
                {
                  color: completed ? Colors.success : Colors.primary,
                },
              ]}
            >
              {completed ? 'Done' : 'Log'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 7-Day Completion Dot Strip */}
      <View style={styles.weekStrip}>
        {WEEK_DAYS.map((day, idx) => {
          const isToday = idx === currentDayIndex;
          const isPast = idx < currentDayIndex;
          const isDone = isToday ? completed : isPast && streak > (currentDayIndex - idx);

          return (
            <View
              key={`${day}-${idx}`}
              style={[
                styles.dayDot,
                isDone && styles.dayDotDone,
                isToday && !completed && styles.dayDotToday,
              ]}
            >
              <Text
                style={[
                  styles.dayLabel,
                  isDone && styles.dayLabelDone,
                  isToday && !completed && styles.dayLabelToday,
                ]}
              >
                {day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.sm,
    alignSelf: 'stretch',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  info: {
    flex: 1,
    marginRight: Spacing.md,
    minWidth: 0,
  },
  infoWithActions: {
    marginRight: Spacing.sm,
  },
  name: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flameIcon: {
    marginRight: Spacing.xs,
  },
  streakText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    gap: Spacing.xs,
  },
  actionText: {
    ...Typography.captionBold,
    fontSize: 11,
  },
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  dayDot: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotDone: {
    backgroundColor: Colors.successLight,
  },
  dayDotToday: {
    borderColor: Colors.primaryMuted,
    borderWidth: 1,
    backgroundColor: Colors.primaryLight,
  },
  dayLabel: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textLight,
  },
  dayLabelDone: {
    color: Colors.success,
  },
  dayLabelToday: {
    color: Colors.primary,
  },
});
