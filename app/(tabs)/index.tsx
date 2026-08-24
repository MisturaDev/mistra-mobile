import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { Avatar } from '@/components/Avatar';
import { DashboardTabHeader } from '@/components/TabScreenHeader';
import { useTabScreenInsets } from '@/hooks/useTabBarStyle';
import { useAuth } from '@/providers/AuthProvider';
import { useProfileAvatar } from '@/hooks/useProfileAvatar';
import { useTasks } from '@/hooks/useTasks';
import { useHabits } from '@/hooks/useHabits';
import { getFirstName, getUserNameFromSession } from '@/utils/userName';
import { ProgressBar } from '@/components/ProgressBar';
import { Card } from '@/components/Card';
import { DashboardSection } from '@/features/dashboard/DashboardSection';
import { TaskItem } from '@/features/dashboard/TaskItem';
import { HabitItem } from '@/features/dashboard/HabitItem';

const HABIT_PREVIEW_LIMIT = 3;
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getFormattedDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function getProgressMessage(percentage: number) {
  if (percentage >= 100) return 'You cleared today. Nice work.';
  if (percentage >= 75) return 'Almost there — strong finish ahead.';
  if (percentage >= 40) return 'Solid pace. Keep going.';
  return 'Small steps add up. Start with one win.';
}

export default function HomeDashboardScreen() {
  const router = useRouter();
  const tabInsets = useTabScreenInsets();
  const { session } = useAuth();
  const { avatarUri } = useProfileAvatar(session?.user.id);

  const userName = getUserNameFromSession(
    session?.user.user_metadata?.name as string | undefined,
    session?.user.email,
    'Mistura'
  );
  const firstName = getFirstName(userName, 'Mistura');
  const userId = session?.user.id;

  const {
    tasks,
    isLoading: tasksLoading,
    isError: tasksError,
    refetch: refetchTasks,
    toggleTask,
  } = useTasks(userId);

  const {
    habits,
    isLoading: habitsLoading,
    isError: habitsError,
    refetch: refetchHabits,
    toggleHabit,
  } = useHabits(userId);

  const isLoading = tasksLoading || habitsLoading;
  const hasError = tasksError || habitsError;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const completedHabits = habits.filter((habit) => habit.completed).length;
  const totalItems = tasks.length + habits.length;
  const completedItems = completedTasks + completedHabits;
  const progressRatio = totalItems > 0 ? completedItems / totalItems : 0;
  const progressPercentage = Math.round(progressRatio * 100);

  const visibleHabits = useMemo(() => habits.slice(0, HABIT_PREVIEW_LIMIT), [habits]);

  const handleRetry = () => {
    refetchTasks();
    refetchHabits();
  };

  const showLists = !isLoading && !hasError;

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: tabInsets.paddingBottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <DashboardTabHeader
            greeting={getGreeting()}
            firstName={firstName}
            date={getFormattedDate()}
            right={
              <Avatar
                uri={avatarUri}
                name={firstName}
                size={48}
                showRing
                onPress={() => router.push('/(tabs)/profile')}
              />
            }
          />
          <Card style={styles.progressCard} padded elevation="md" bordered={false}>
            <View>
              <View style={styles.progressHeader}>
                <View style={styles.progressCopy}>
                  <Text style={styles.progressTitle}>Today</Text>
                  <Text style={styles.progressSub}>{getProgressMessage(progressPercentage)}</Text>
                </View>
                <Text style={styles.progressPercent}>{progressPercentage}%</Text>
              </View>
              <ProgressBar
                progress={progressRatio}
                height={10}
                backgroundColor={Colors.primaryMuted}
                style={styles.progressBar}
              />
              <Text style={styles.progressMeta}>
                Tasks {completedTasks}/{tasks.length} · Habits {completedHabits}/{habits.length}
              </Text>
            </View>
          </Card>
          {isLoading ? (
            <View style={styles.stateContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : null}
          {hasError ? (
            <Card style={styles.stateCard} padded elevation="none">
              <View style={styles.stateCardContent}>
                <Text style={styles.stateText}>Could not load your dashboard.</Text>
                <TouchableOpacity onPress={handleRetry} activeOpacity={0.7}>
                  <Text style={styles.retryText}>Tap to retry</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ) : null}
          {showLists ? (
            <View style={styles.listsSection}>
              <DashboardSection title="Today's tasks">
                <Card style={styles.listCard} padded elevation="none">
                  {tasks.length === 0 ? (
                    <Text style={styles.emptyText}>No tasks yet.</Text>
                  ) : (
                    tasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        id={task.id}
                        title={task.title}
                        completed={task.completed}
                        onToggle={toggleTask}
                      />
                    ))
                  )}
                </Card>
              </DashboardSection>
              <DashboardSection
                title="Today's habits"
                actionLabel="See all"
                onActionPress={() => router.push('/(tabs)/habits')}
              >
                <View style={styles.habitsList}>
                  {visibleHabits.length === 0 ? (
                    <Card style={styles.listCard} padded elevation="none">
                      <Text style={styles.emptyText}>No habits yet. Your habit list will show here.</Text>
                    </Card>
                  ) : (
                    visibleHabits.map((habit) => (
                      <HabitItem
                        key={habit.id}
                        id={habit.id}
                        name={habit.name}
                        streak={habit.streak}
                        completed={habit.completed}
                        onToggle={toggleHabit}
                      />
                    ))
                  )}
                </View>
              </DashboardSection>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContainer: {
    paddingHorizontal: Spacing.xl,
  },
  content: {
    gap: 0,
  },
  listsSection: {
    gap: 0,
  },
  progressCard: {
    backgroundColor: Colors.primaryLight,
    marginBottom: Spacing.xl,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  progressCopy: {
    flex: 1,
  },
  progressTitle: {
    ...Typography.title,
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  progressSub: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    lineHeight: 20,
  },
  progressPercent: {
    ...Typography.h2,
    color: Colors.primary,
    fontWeight: '800',
  },
  progressBar: {
    marginBottom: Spacing.md,
  },
  progressMeta: {
    ...Typography.captionBold,
    color: Colors.primaryDark,
    letterSpacing: 0.2,
  },
  listCard: {
    backgroundColor: Colors.surface,
    borderWidth: 0,
  },
  habitsList: {
    gap: 0,
  },
  stateContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  stateCard: {
    backgroundColor: Colors.surface,
    marginBottom: Spacing.lg,
  },
  stateCardContent: {
    alignItems: 'center',
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
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
});