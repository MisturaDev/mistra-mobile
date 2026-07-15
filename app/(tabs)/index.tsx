import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';
import { Avatar } from '@/components/Avatar';
import { ProgressBar } from '@/components/ProgressBar';
import { Card } from '@/components/Card';
import { StatCard } from '@/features/dashboard/StatCard';
import { TaskItem } from '@/features/dashboard/TaskItem';
import { HabitItem } from '@/features/dashboard/HabitItem';
import { ScheduleItem } from '@/features/dashboard/ScheduleItem';
import { NoteItem } from '@/features/dashboard/NoteItem';
import { Ionicons } from '@expo/vector-icons';

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

interface Schedule {
  id: string;
  time: string;
  title: string;
  category: string;
  color: string;
}

interface Note {
  id: string;
  title: string;
  snippet: string;
  updatedAt: string;
  emoji: string;
}

export default function HomeDashboardScreen() {
  const router = useRouter();

  // Mock Username
  const userName = 'Mistura';

  // State for Tasks
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Complete Mistra design system', completed: true },
    { id: '2', title: 'Review React Native architecture', completed: true },
    { id: '3', title: 'Integrate Zustand state store', completed: true },
    { id: '4', title: 'Install TanStack Query client', completed: true },
    { id: '5', title: 'Draft onboarding illustrations', completed: false },
    { id: '6', title: 'Review dashboard layout', completed: false },
  ]);

  // State for Habits
  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', name: 'Meditate 10m', streak: 5, completed: true },
    { id: '2', name: 'Read 15 pages', streak: 12, completed: true },
    { id: '3', name: 'Workout 30m', streak: 3, completed: false },
  ]);

  // Mock Schedules
  const [schedules] = useState<Schedule[]>([
    { id: '1', time: '10:00 AM', title: 'Weekly sync with team', category: 'Work Meetings', color: Colors.primary },
    { id: '2', time: '02:30 PM', title: 'Gym session (Cardio)', category: 'Personal Health', color: Colors.success },
  ]);

  // Mock Notes
  const [notes] = useState<Note[]>([
    { id: '1', title: 'App Ideas', snippet: 'Consider using a local storage client to support offline-first note sync.', updatedAt: '2h ago', emoji: '💡' },
    { id: '2', title: 'Weekly Grocery List', snippet: 'Oat milk, organic honey, apples, protein bars, avocados.', updatedAt: 'Yesterday', emoji: '🛒' },
  ]);

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
        if (habit.id === id) {
          const wasCompleted = habit.completed;
          return {
            ...habit,
            completed: !wasCompleted,
            streak: wasCompleted ? Math.max(0, habit.streak - 1) : habit.streak + 1,
          };
        }
        return habit;
      })
    );
  };

  // Dynamic statistics calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;

  const totalHabits = habits.length;
  const completedHabits = habits.filter((h) => h.completed).length;

  const totalItems = totalTasks + totalHabits;
  const completedItems = completedTasks + completedHabits;
  const progressRatio = totalItems > 0 ? completedItems / totalItems : 0;
  const progressPercentage = Math.round(progressRatio * 100);

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header greeting row */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greetingText}>
              {getGreeting()}, <Text style={styles.nameHighlight}>{userName}</Text>
            </Text>
            <Text style={styles.dateText}>{getFormattedDate()}</Text>
          </View>
          <Avatar name={userName} size={48} />
        </View>

        {/* Dynamic Progress Card */}
        <Card style={styles.progressCard} padded elevation="md" bordered={false}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>Daily Completion</Text>
              <Text style={styles.progressSub}>Keep it up! You're making progress.</Text>
            </View>
            <Text style={styles.progressPercent}>{progressPercentage}%</Text>
          </View>
          <ProgressBar progress={progressRatio} height={10} style={styles.progressBar} />
        </Card>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            title="Tasks done"
            value={`${completedTasks}/${totalTasks}`}
            iconName="checkmark-done"
            iconColor={Colors.primary}
          />
          <StatCard
            title="Habits streak"
            value={`${completedHabits}/${totalHabits}`}
            iconName="flame"
            iconColor="#F59E0B"
          />
        </View>

        {/* Today's Schedule */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <Text style={styles.sectionAction}>Calendar</Text>
        </View>

        <Card style={styles.scheduleContainer} padded elevation="none" bordered>
          {schedules.map((schedule) => (
            <ScheduleItem
              key={schedule.id}
              time={schedule.time}
              title={schedule.title}
              category={schedule.category}
              categoryColor={schedule.color}
            />
          ))}
        </Card>

        {/* Today's Checklist */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Focus</Text>
          <Text style={styles.sectionAction}>View all</Text>
        </View>

        <View style={styles.tasksList}>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              id={task.id}
              title={task.title}
              completed={task.completed}
              onToggle={handleToggleTask}
            />
          ))}
        </View>

        {/* Daily Habits */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Habits</Text>
          <Text style={styles.sectionAction}>Edit</Text>
        </View>

        <View style={styles.habitsList}>
          {habits.map((habit) => (
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

        {/* Recent Notes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Notes</Text>
          <Text style={styles.sectionAction}>Create</Text>
        </View>

        <View style={styles.notesList}>
          {notes.map((note) => (
            <NoteItem
              key={note.id}
              title={note.title}
              snippet={note.snippet}
              updatedAt={note.updatedAt}
              emoji={note.emoji}
            />
          ))}
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
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  dateText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.xs,
  },
  greetingText: {
    ...Typography.h2,
    color: Colors.text,
  },
  nameHighlight: {
    fontWeight: '700',
    color: Colors.primary,
  },
  progressCard: {
    backgroundColor: Colors.primaryLight,
    marginBottom: Spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  progressTitle: {
    ...Typography.title,
    color: Colors.primary,
    fontWeight: '700',
  },
  progressSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  progressPercent: {
    ...Typography.h2,
    color: Colors.primary,
    fontWeight: '800',
  },
  progressBar: {
    backgroundColor: '#DDD6FE', // light violet
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.title,
    color: Colors.text,
    fontWeight: '700',
  },
  sectionAction: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
  scheduleContainer: {
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  tasksList: {
    marginBottom: Spacing.lg,
  },
  habitsList: {
    marginBottom: Spacing.lg,
  },
  notesList: {
    marginBottom: Spacing.lg,
  },
});
