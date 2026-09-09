import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import type { Goal, GoalCategory } from '@/types/dashboard';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
  onQuickIncrement: (goal: Goal) => void;
  onToggleComplete: (goal: Goal) => void;
}

const CATEGORY_META: Record<
  GoalCategory,
  { label: string; color: string; bg: string }
> = {
  personal: { label: 'Personal', color: '#7C3AED', bg: '#F5F3FF' },
  career: { label: 'Career', color: '#2563EB', bg: '#EFF6FF' },
  health: { label: 'Health', color: '#059669', bg: '#ECFDF5' },
  finance: { label: 'Finance', color: '#D97706', bg: '#FFFBEB' },
  learning: { label: 'Learning', color: '#DB2777', bg: '#FDF2F8' },
};

function formatTargetDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function GoalCard({
  goal,
  onEdit,
  onDelete,
  onQuickIncrement,
  onToggleComplete,
}: GoalCardProps) {
  const cat = CATEGORY_META[goal.category] || CATEGORY_META.personal;
  const isCompleted = goal.status === 'completed';

  const percentage = Math.min(
    100,
    Math.max(0, Math.round((goal.currentValue / (goal.targetValue || 1)) * 100))
  );

  const formattedDate = formatTargetDate(goal.targetDate);

  const incrementStep = goal.unit === '%' ? 10 : 1;

  return (
    <View style={[styles.card, isCompleted && styles.cardCompleted]}>
      {/* Card Header: Category & Status */}
      <View style={styles.headerRow}>
        <View style={[styles.categoryBadge, { backgroundColor: cat.bg }]}>
          <Text style={[styles.categoryText, { color: cat.color }]}>{cat.label}</Text>
        </View>

        <View style={styles.actionsGroup}>
          <TouchableOpacity
            onPress={() => onEdit(goal)}
            style={styles.actionIconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Edit goal"
          >
            <Ionicons name="pencil-outline" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDelete(goal)}
            style={styles.actionIconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Delete goal"
          >
            <Ionicons name="trash-outline" size={16} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Goal Title & Description */}
      <View style={styles.content}>
        <Text style={[styles.title, isCompleted && styles.titleCompleted]}>
          {goal.title}
        </Text>
        {goal.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {goal.description}
          </Text>
        ) : null}
      </View>

      {/* Progress Bar & Metric Info */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressValueText}>
            {goal.unit === '$' ? `$${goal.currentValue.toLocaleString()}` : goal.currentValue}{' '}
            <Text style={styles.targetTotalText}>
              /{' '}
              {goal.unit === '$'
                ? `$${goal.targetValue.toLocaleString()}`
                : `${goal.targetValue} ${goal.unit !== '%' && goal.unit !== '$' ? goal.unit : ''}`}
            </Text>
          </Text>
          <Text style={[styles.percentageText, isCompleted && { color: Colors.success }]}>
            {percentage}%
          </Text>
        </View>

        {/* Progress Track */}
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${percentage}%`,
                backgroundColor: isCompleted ? Colors.success : goal.color || cat.color,
              },
            ]}
          />
        </View>
      </View>

      {/* Footer: Target date & Quick Stepper */}
      <View style={styles.footerRow}>
        {formattedDate ? (
          <View style={styles.targetDateWrap}>
            <Ionicons name="calendar-outline" size={13} color={Colors.textLight} />
            <Text style={styles.targetDateText}>Target: {formattedDate}</Text>
          </View>
        ) : (
          <View />
        )}

        <View style={styles.stepperWrap}>
          {/* Quick Increment Button */}
          {!isCompleted && (
            <TouchableOpacity
              onPress={() => onQuickIncrement(goal)}
              style={styles.incrementButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Add ${incrementStep} ${goal.unit}`}
            >
              <Ionicons name="add" size={15} color={Colors.primary} />
              <Text style={styles.incrementText}>+{incrementStep}</Text>
            </TouchableOpacity>
          )}

          {/* Toggle Complete Checkbox Button */}
          <TouchableOpacity
            onPress={() => onToggleComplete(goal)}
            style={[styles.completeButton, isCompleted && styles.completeButtonActive]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={isCompleted ? 'Mark in progress' : 'Mark completed'}
          >
            <Ionicons
              name={isCompleted ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={18}
              color={isCompleted ? Colors.success : Colors.textSecondary}
            />
            <Text style={[styles.completeBtnText, isCompleted && styles.completeBtnTextActive]}>
              {isCompleted ? 'Completed' : 'Done'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  cardCompleted: {
    backgroundColor: '#FAF5FF',
    borderColor: '#E9D5FF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  categoryText: {
    ...Typography.captionBold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionIconBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  content: {
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.title,
    fontSize: 17,
    color: Colors.text,
  },
  titleCompleted: {
    color: Colors.textSecondary,
    textDecorationLine: 'none',
  },
  description: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  progressContainer: {
    marginBottom: Spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressValueText: {
    ...Typography.bodyBold,
    fontSize: 15,
    color: Colors.text,
  },
  targetTotalText: {
    fontWeight: '400',
    color: Colors.textLight,
    fontSize: 13,
  },
  percentageText: {
    ...Typography.captionBold,
    fontSize: 14,
    color: Colors.primary,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.borderLight,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  targetDateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  targetDateText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginLeft: 'auto',
  },
  incrementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryMuted,
  },
  incrementText: {
    ...Typography.captionBold,
    color: Colors.primary,
    marginLeft: 2,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  completeButtonActive: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success,
  },
  completeBtnText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  completeBtnTextActive: {
    color: Colors.success,
  },
});
