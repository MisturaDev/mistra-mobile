import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { Avatar } from '@/components/Avatar';
import { DashboardTabHeader } from '@/components/TabScreenHeader';
import { useTabScreenInsets } from '@/hooks/useTabBarStyle';
import { useAuth } from '@/providers/AuthProvider';
import { useProfileAvatar } from '@/hooks/useProfileAvatar';
import { getFirstName, getUserNameFromSession } from '@/utils/userName';
import { ProgressBar } from '@/components/ProgressBar';
import { Card } from '@/components/Card';
import { DashboardSection } from '@/features/dashboard/DashboardSection';
import { TaskItem } from '@/features/dashboard/TaskItem';
import { HabitItem } from '@/features/dashboard/HabitItem';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface Habit {
  id: string;
  name: string;
  streak: number;
  completed: boolean;
}

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

  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: "Review today's priorities", completed: true },
    { id: '2', title: 'Finish project proposal', completed: true },
    { id: '3', title: 'Reply to client emails', completed: false },
    { id: '4', title: "Plan tomorrow's schedule", completed: false },
    { id: '5', title: 'Pick up groceries', completed: false },
  ]);

  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', name: 'Meditate 10m', streak: 5, completed: true },
    { id: '2', name: 'Read 15 pages', streak: 12, completed: true },
    { id: '3', name: 'Workout 30m', streak: 3, completed: false },
    { id: '4', name: 'Drink 2L water', streak: 8, completed: false },
  ]);

  const completedTasks = tasks.filter((task) => task.completed).length;
  const completedHabits = habits.filter((habit) => habit.completed).length;
  const totalItems = tasks.length + habits.length;
  const completedItems = completedTasks + completedHabits;
  const progressRatio = totalItems > 0 ? completedItems / totalItems : 0;
  const progressPercentage = Math.round(progressRatio * 100);

  const visibleHabits = useMemo(() => habits.slice(0, HABIT_PREVIEW_LIMIT), [habits]);

  const handleToggleTask = (id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleToggleHabit = (id: string) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        if (habit.id !== id) return habit;

        const wasCompleted = habit.completed;
        return {
          ...habit,
          completed: !wasCompleted,
          streak: wasCompleted ? Math.max(0, habit.streak - 1) : habit.streak + 1,
        };
      })
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: tabInsets.paddingBottom }]}
        showsVerticalScrollIndicator={false}
      >
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
        </Card>

        <DashboardSection title="Today's tasks">
          <Card style={styles.listCard} padded elevation="none">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                id={task.id}
                title={task.title}
                completed={task.completed}
                onToggle={handleToggleTask}
              />
            ))}
          </Card>
        </DashboardSection>

        <DashboardSection
          title="Today's habits"
          actionLabel="See all"
          onActionPress={() => router.push('/(tabs)/habits')}
        >
          <View style={styles.habitsList}>
            {visibleHabits.map((habit) => (
              <HabitItem
                key={habit.id}
                id={habit.id}
                name={habit.name}
                streak={habit.streak}
                completed={habit.completed}
                onToggle={handleToggleHabit}
              />
            ))}
          </View>
        </DashboardSection>
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
});
