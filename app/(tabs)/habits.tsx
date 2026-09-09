import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabScreenHeader } from '@/components/TabScreenHeader';
import { useTabScreenInsets } from '@/hooks/useTabBarStyle';
import { useAuth } from '@/providers/AuthProvider';
import { useHabits } from '@/hooks/useHabits';
import { useGoals, CreateGoalInput, UpdateGoalInput } from '@/hooks/useGoals';
import { HabitItem } from '@/features/dashboard/HabitItem';
import { GoalCard } from '@/features/goals/GoalCard';
import { HabitFormModal } from '@/components/HabitFormModal';
import { GoalFormModal, GoalFormData } from '@/components/GoalFormModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { toast } from '@/components/AppToast';
import { Button } from '@/components/Button';
import { Ionicons, Feather } from '@expo/vector-icons';
import { haptics } from '@/utils/haptics';
import type { Goal } from '@/types/dashboard';

type TopSegment = 'habits' | 'goals';
type GoalFilter = 'all' | 'in_progress' | 'completed';

const GOAL_FILTERS: { key: GoalFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
];

export default function HabitsScreen() {
  const tabInsets = useTabScreenInsets();
  const { session } = useAuth();
  const userId = session?.user.id;

  const [activeSegment, setActiveSegment] = useState<TopSegment>('habits');
  const [goalFilter, setGoalFilter] = useState<GoalFilter>('all');

  // Habit Form & Delete States
  const [habitForm, setHabitForm] = useState<
    { mode: 'create' } | { mode: 'edit'; habitId: string; initialName: string } | null
  >(null);
  const [habitToDelete, setHabitToDelete] = useState<{ id: string; name: string } | null>(null);

  // Goal Form & Delete States
  const [goalForm, setGoalForm] = useState<
    { mode: 'create' } | { mode: 'edit'; goal: Goal } | null
  >(null);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  // Habits Data
  const {
    habits,
    isLoading: habitsLoading,
    isError: habitsError,
    isSaving: habitsSaving,
    refetch: refetchHabits,
    toggleHabit,
    createHabit,
    updateHabit,
    deleteHabit,
  } = useHabits(userId);

  // Goals Data
  const {
    goals,
    isLoading: goalsLoading,
    isError: goalsError,
    isSaving: goalsSaving,
    refetch: refetchGoals,
    createGoal,
    updateGoal,
    updateProgress,
    toggleComplete: toggleGoalComplete,
    deleteGoal,
  } = useGoals(userId);

  // Filtered Goals
  const filteredGoals = useMemo(() => {
    switch (goalFilter) {
      case 'in_progress':
        return goals.filter((g) => g.status === 'in_progress');
      case 'completed':
        return goals.filter((g) => g.status === 'completed');
      default:
        return goals;
    }
  }, [goals, goalFilter]);

  // Segment Switching
  const handleSegmentChange = (seg: TopSegment) => {
    if (seg === activeSegment) return;
    haptics.selection();
    setActiveSegment(seg);
  };

  // Habit Handlers
  const closeHabitForm = () => setHabitForm(null);

  const handleCreateHabit = async (name: string) => {
    try {
      await createHabit(name);
      closeHabitForm();
      toast.success({ message: 'Habit added' });
    } catch (error) {
      Alert.alert('Could not add habit', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const handleUpdateHabit = async (name: string) => {
    if (!habitForm || habitForm.mode !== 'edit') return;
    try {
      await updateHabit(habitForm.habitId, name);
      closeHabitForm();
      toast.success({ message: 'Habit updated' });
    } catch (error) {
      Alert.alert('Could not update habit', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const handleDeleteHabitConfirm = async () => {
    if (!habitToDelete) return;
    try {
      await deleteHabit(habitToDelete.id);
      setHabitToDelete(null);
      toast.success({ message: 'Habit deleted' });
    } catch (error) {
      Alert.alert('Could not delete habit', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const handleHabitFormSubmit = (name: string) => {
    if (habitForm?.mode === 'create') {
      void handleCreateHabit(name);
      return;
    }
    if (habitForm?.mode === 'edit') {
      void handleUpdateHabit(name);
    }
  };

  // Goal Handlers
  const closeGoalForm = () => setGoalForm(null);

  const handleGoalFormSubmit = async (data: GoalFormData) => {
    try {
      if (goalForm?.mode === 'create') {
        const payload: CreateGoalInput = {
          title: data.title,
          description: data.description,
          category: data.category,
          targetDate: data.targetDate,
          targetValue: data.targetValue,
          currentValue: data.currentValue,
          unit: data.unit,
          color: data.color,
        };
        await createGoal(payload);
        closeGoalForm();
        toast.success({ title: 'Goal created', message: 'Keep tracking your milestone.' });
      } else if (goalForm?.mode === 'edit') {
        const payload: UpdateGoalInput = {
          id: goalForm.goal.id,
          title: data.title,
          description: data.description,
          category: data.category,
          targetDate: data.targetDate,
          targetValue: data.targetValue,
          currentValue: data.currentValue,
          unit: data.unit,
          color: data.color,
        };
        await updateGoal(payload);
        closeGoalForm();
        toast.success({ message: 'Goal updated' });
      }
    } catch (error) {
      Alert.alert('Could not save goal', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const handleQuickIncrement = async (goal: Goal) => {
    const step = goal.unit === '%' ? 10 : 1;
    const nextVal = Math.min(goal.targetValue, goal.currentValue + step);
    try {
      await updateProgress(goal.id, nextVal);
      if (nextVal >= goal.targetValue) {
        toast.success({ title: 'Goal Completed!', message: `You reached your goal: ${goal.title}` });
      }
    } catch (error) {
      Alert.alert('Could not update progress', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const handleToggleGoalComplete = async (goal: Goal) => {
    try {
      await toggleGoalComplete(goal.id);
      if (goal.status !== 'completed') {
        toast.success({ title: 'Goal Completed!', message: `Congratulations on finishing: ${goal.title}` });
      }
    } catch (error) {
      Alert.alert('Could not update goal', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const handleDeleteGoalConfirm = async () => {
    if (!goalToDelete) return;
    try {
      await deleteGoal(goalToDelete.id);
      setGoalToDelete(null);
      toast.success({ message: 'Goal deleted' });
    } catch (error) {
      Alert.alert('Could not delete goal', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const isSaving = habitsSaving || goalsSaving;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabInsets.paddingBottom }]}
      >
        <TabScreenHeader
          title="Habits & Goals"
          subtitle={
            activeSegment === 'habits'
              ? 'Track daily routines and compound streaks'
              : 'Set milestones and monitor long-term growth'
          }
        />

        {/* Top Segment Controller */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeSegment === 'habits' && styles.segmentBtnActive]}
            onPress={() => handleSegmentChange('habits')}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeSegment === 'habits' }}
          >
            <Ionicons
              name={activeSegment === 'habits' ? 'repeat' : 'repeat-outline'}
              size={16}
              color={activeSegment === 'habits' ? Colors.primary : Colors.textSecondary}
            />
            <Text style={[styles.segmentText, activeSegment === 'habits' && styles.segmentTextActive]}>
              Daily Habits
            </Text>
            {habits.length > 0 && (
              <View
                style={[
                  styles.countBadge,
                  activeSegment === 'habits' && styles.countBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.countBadgeText,
                    activeSegment === 'habits' && styles.countBadgeTextActive,
                  ]}
                >
                  {habits.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeSegment === 'goals' && styles.segmentBtnActive]}
            onPress={() => handleSegmentChange('goals')}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeSegment === 'goals' }}
          >
            <Feather
              name="target"
              size={16}
              color={activeSegment === 'goals' ? Colors.primary : Colors.textSecondary}
            />
            <Text style={[styles.segmentText, activeSegment === 'goals' && styles.segmentTextActive]}>
              Long-Term Goals
            </Text>
            {goals.length > 0 && (
              <View
                style={[
                  styles.countBadge,
                  activeSegment === 'goals' && styles.countBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.countBadgeText,
                    activeSegment === 'goals' && styles.countBadgeTextActive,
                  ]}
                >
                  {goals.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ===================== HABITS SEGMENT ===================== */}
        {activeSegment === 'habits' ? (
          <>
            <Button
              title="Add habit"
              variant="primary"
              size="md"
              onPress={() => setHabitForm({ mode: 'create' })}
              style={styles.addButton}
            />

            {habitsLoading ? (
              <View style={styles.stateContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : null}

            {habitsError ? (
              <View style={styles.stateCard}>
                <Text style={styles.stateText}>Could not load your habits.</Text>
                <TouchableOpacity onPress={() => refetchHabits()} activeOpacity={0.7}>
                  <Text style={styles.retryText}>Tap to retry</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {!habitsLoading && !habitsError ? (
              habits.length === 0 ? (
                <Text style={styles.emptyText}>No habits yet. Tap Add habit to start a streak.</Text>
              ) : (
                <View style={styles.list}>
                  {habits.map((habit) => (
                    <HabitItem
                      key={habit.id}
                      id={habit.id}
                      name={habit.name}
                      streak={habit.streak}
                      completed={habit.completed}
                      onToggle={toggleHabit}
                      onEdit={(id) => {
                        const h = habits.find((item) => item.id === id);
                        if (h) setHabitForm({ mode: 'edit', habitId: id, initialName: h.name });
                      }}
                      onDelete={(id) => {
                        const h = habits.find((item) => item.id === id);
                        if (h) setHabitToDelete({ id, name: h.name });
                      }}
                    />
                  ))}
                </View>
              )
            ) : null}
          </>
        ) : null}

        {/* ===================== GOALS SEGMENT ===================== */}
        {activeSegment === 'goals' ? (
          <>
            {/* Filter Pills */}
            <View style={styles.filterRow}>
              {GOAL_FILTERS.map((f) => {
                const isSelected = goalFilter === f.key;
                return (
                  <TouchableOpacity
                    key={f.key}
                    onPress={() => {
                      haptics.selection();
                      setGoalFilter(f.key);
                    }}
                    style={[styles.filterChip, isSelected && styles.filterChipActive]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Button
              title="New Goal"
              variant="primary"
              size="md"
              onPress={() => setGoalForm({ mode: 'create' })}
              style={styles.addButton}
            />

            {goalsLoading ? (
              <View style={styles.stateContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : null}

            {goalsError ? (
              <View style={styles.stateCard}>
                <Text style={styles.stateText}>Could not load your goals.</Text>
                <TouchableOpacity onPress={() => refetchGoals()} activeOpacity={0.7}>
                  <Text style={styles.retryText}>Tap to retry</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {!goalsLoading && !goalsError ? (
              filteredGoals.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconWrap}>
                    <Feather name="target" size={32} color={Colors.primary} />
                  </View>
                  <Text style={styles.emptyTitle}>
                    {goalFilter === 'completed'
                      ? 'No completed goals yet'
                      : goalFilter === 'in_progress'
                      ? 'No active goals'
                      : 'No goals set yet'}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {goalFilter === 'all'
                      ? 'Set clear milestones to stay focused and measure long-term progress.'
                      : 'Update your progress or create a new goal above.'}
                  </Text>
                </View>
              ) : (
                <View style={styles.list}>
                  {filteredGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={(g) => setGoalForm({ mode: 'edit', goal: g })}
                      onDelete={(g) => setGoalToDelete(g)}
                      onQuickIncrement={handleQuickIncrement}
                      onToggleComplete={handleToggleGoalComplete}
                    />
                  ))}
                </View>
              )
            ) : null}
          </>
        ) : null}
      </ScrollView>

      {/* Habit Modals */}
      <HabitFormModal
        visible={habitForm !== null}
        mode={habitForm?.mode ?? 'create'}
        initialName={habitForm?.mode === 'edit' ? habitForm.initialName : ''}
        loading={isSaving}
        onClose={closeHabitForm}
        onSubmit={handleHabitFormSubmit}
      />
      <ConfirmModal
        visible={habitToDelete !== null}
        title="Delete habit?"
        message={
          habitToDelete
            ? `"${habitToDelete.name}" and its streak will be removed.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        loading={isSaving}
        onCancel={() => setHabitToDelete(null)}
        onConfirm={() => void handleDeleteHabitConfirm()}
      />

      {/* Goal Modals */}
      <GoalFormModal
        visible={goalForm !== null}
        mode={goalForm?.mode ?? 'create'}
        initialGoal={goalForm?.mode === 'edit' ? goalForm.goal : null}
        loading={isSaving}
        onClose={closeGoalForm}
        onSubmit={handleGoalFormSubmit}
      />
      <ConfirmModal
        visible={goalToDelete !== null}
        title="Delete goal?"
        message={
          goalToDelete
            ? `"${goalToDelete.title}" and its progress history will be removed.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        loading={isSaving}
        onCancel={() => setGoalToDelete(null)}
        onConfirm={() => void handleDeleteGoalConfirm()}
      />
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
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: Radius.full,
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    ...Typography.captionBold,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: Colors.border,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.full,
  },
  countBadgeActive: {
    backgroundColor: Colors.primaryLight,
  },
  countBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  countBadgeTextActive: {
    color: Colors.primary,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryMuted,
  },
  filterText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  addButton: {
    marginBottom: Spacing.lg,
  },
  list: {
    gap: 0,
  },
  stateContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  stateCard: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  stateText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  retryText: {
    ...Typography.bodyBold,
    color: Colors.primary,
    marginTop: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.md,
  },
  emptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.title,
    fontSize: 17,
    color: Colors.text,
    marginBottom: 4,
  },
  emptySubtitle: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
