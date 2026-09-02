import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/Avatar';
import { DashboardTabHeader } from '@/components/TabScreenHeader';
import { useTabScreenInsets } from '@/hooks/useTabBarStyle';
import { useAuth } from '@/providers/AuthProvider';
import { useProfileAvatar } from '@/hooks/useProfileAvatar';
import { useTasks } from '@/hooks/useTasks';
import { useHabits } from '@/hooks/useHabits';
import { useNotes } from '@/hooks/useNotes';
import { getFirstName, getUserNameFromSession } from '@/utils/userName';
import { ProgressBar } from '@/components/ProgressBar';
import { Card } from '@/components/Card';
import { DashboardSection } from '@/features/dashboard/DashboardSection';
import { TaskItem } from '@/features/dashboard/TaskItem';
import { HabitItem } from '@/features/dashboard/HabitItem';
import { NoteItem } from '@/features/dashboard/NoteItem';
import { TaskFormModal, TaskFormData } from '@/components/TaskFormModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { toast } from '@/components/AppToast';
import type { Task, TaskPriority, TaskCategory, SubTask } from '@/types/dashboard';

const HABIT_PREVIEW_LIMIT = 3;
const NOTE_PREVIEW_LIMIT = 2;
const TASK_PREVIEW_LIMIT = 4;

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

function formatRelativeTime(dateString: string) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24 && now.getDate() === date.getDate()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
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

  const [taskForm, setTaskForm] = useState<
    | { mode: 'create' }
    | { mode: 'edit'; task: Task }
    | null
  >(null);
  const [taskToDelete, setTaskToDelete] = useState<{ id: string; title: string } | null>(null);

  const {
    tasks,
    isLoading: tasksLoading,
    isError: tasksError,
    isSaving: tasksSaving,
    refetch: refetchTasks,
    toggleTask,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks(userId);

  const {
    habits,
    isLoading: habitsLoading,
    isError: habitsError,
    refetch: refetchHabits,
    toggleHabit,
  } = useHabits(userId);

  const {
    notes,
    isLoading: notesLoading,
    isError: notesError,
    refetch: refetchNotes,
  } = useNotes(userId);

  const isLoading = tasksLoading || habitsLoading || notesLoading;
  const hasError = tasksError || habitsError || notesError;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const completedHabits = habits.filter((habit) => habit.completed).length;
  const totalItems = tasks.length + habits.length;
  const completedItems = completedTasks + completedHabits;
  const progressRatio = totalItems > 0 ? completedItems / totalItems : 0;
  const progressPercentage = Math.round(progressRatio * 100);

  const visibleTasks = useMemo(() => tasks.slice(0, TASK_PREVIEW_LIMIT), [tasks]);
  const visibleHabits = useMemo(() => habits.slice(0, HABIT_PREVIEW_LIMIT), [habits]);
  const visibleNotes = useMemo(() => notes.slice(0, NOTE_PREVIEW_LIMIT), [notes]);

  const handleRetry = () => {
    refetchTasks();
    refetchHabits();
    refetchNotes();
  };

  const showLists = !isLoading && !hasError;

  const closeTaskForm = () => setTaskForm(null);

  const handleCreateTask = async (data: TaskFormData) => {
    try {
      await createTask({
        title: data.title,
        description: data.description,
        priority: data.priority,
        category: data.category,
        dueDate: data.dueDate,
        subtasks: data.subtasks,
      });
      closeTaskForm();
      toast.success({ message: 'Task added' });
    } catch (error) {
      Alert.alert(
        'Could not add task',
        error instanceof Error ? error.message : 'Please try again.'
      );
    }
  };

  const handleUpdateTask = async (data: TaskFormData) => {
    if (!taskForm || taskForm.mode !== 'edit') return;

    try {
      await updateTask({
        id: taskForm.task.id,
        title: data.title,
        description: data.description,
        priority: data.priority,
        category: data.category,
        dueDate: data.dueDate,
        subtasks: data.subtasks,
      });
      closeTaskForm();
      toast.success({ message: 'Task updated' });
    } catch (error) {
      Alert.alert(
        'Could not update task',
        error instanceof Error ? error.message : 'Please try again.'
      );
    }
  };

  const handleDeleteTaskConfirm = async () => {
    if (!taskToDelete) return;

    try {
      await deleteTask(taskToDelete.id);
      setTaskToDelete(null);
      toast.success({ message: 'Task deleted' });
    } catch (error) {
      Alert.alert(
        'Could not delete task',
        error instanceof Error ? error.message : 'Please try again.'
      );
    }
  };

  const handleTaskFormSubmit = (data: TaskFormData) => {
    if (taskForm?.mode === 'create') {
      void handleCreateTask(data);
      return;
    }

    if (taskForm?.mode === 'edit') {
      void handleUpdateTask(data);
    }
  };

  const handleEditTask = (id: string) => {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    setTaskForm({
      mode: 'edit',
      task,
    });
  };

  const handleDeleteTaskPress = (id: string) => {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    setTaskToDelete({ id, title: task.title });
  };

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
              <View style={styles.headerRightRow}>
                <TouchableOpacity
                  onPress={() => router.push('/calendar' as any)}
                  style={styles.calendarHeaderButton}
                  activeOpacity={0.7}
                  accessibilityLabel="Open Calendar"
                >
                  <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                </TouchableOpacity>
                <Avatar
                  uri={avatarUri}
                  name={firstName}
                  size={44}
                  showRing
                  onPress={() => router.push('/(tabs)/profile')}
                />
              </View>
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
              <DashboardSection
                title="Today's tasks"
                actionLabel="See all"
                onActionPress={() => router.push('/(tabs)/tasks')}
              >
                <Card style={styles.listCard} padded elevation="none">
                  {visibleTasks.length === 0 ? (
                    <Text style={styles.emptyText}>No tasks yet. Tap See all to add one.</Text>
                  ) : (
                    visibleTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        id={task.id}
                        title={task.title}
                        completed={task.completed}
                        priority={task.priority}
                        onToggle={toggleTask}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTaskPress}
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
                      <Text style={styles.emptyText}>No habits yet. Tap See all to add one.</Text>
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

              <DashboardSection
                title="Recent notes"
                actionLabel="See all"
                onActionPress={() => router.push('/(tabs)/notes')}
              >
                <View style={styles.notesList}>
                  {visibleNotes.length === 0 ? (
                    <Card style={styles.listCard} padded elevation="none">
                      <Text style={styles.emptyText}>No notes yet. Tap See all to add one.</Text>
                    </Card>
                  ) : (
                    visibleNotes.map((note) => (
                      <NoteItem
                        key={note.id}
                        id={note.id}
                        title={note.title}
                        snippet={note.content}
                        emoji={note.emoji}
                        updatedAt={formatRelativeTime(note.updatedAt || note.createdAt || '')}
                        onPress={() => router.push('/(tabs)/notes')}
                      />
                    ))
                  )}
                </View>
              </DashboardSection>
            </View>
          ) : null}
        </View>
      </ScrollView>
      <TaskFormModal
        visible={taskForm !== null}
        mode={taskForm?.mode ?? 'create'}
        initialTitle={taskForm?.mode === 'edit' ? taskForm.task.title : ''}
        initialDescription={taskForm?.mode === 'edit' ? taskForm.task.description : ''}
        initialPriority={taskForm?.mode === 'edit' ? taskForm.task.priority : 'medium'}
        initialCategory={taskForm?.mode === 'edit' ? taskForm.task.category : 'general'}
        initialDueDate={taskForm?.mode === 'edit' ? taskForm.task.dueDate : null}
        initialSubtasks={taskForm?.mode === 'edit' ? taskForm.task.subtasks : []}
        loading={tasksSaving}
        onClose={closeTaskForm}
        onSubmit={handleTaskFormSubmit}
      />
      <ConfirmModal
        visible={taskToDelete !== null}
        title="Delete task?"
        message={
          taskToDelete
            ? `"${taskToDelete.title}" will be removed from your list.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        loading={tasksSaving}
        onCancel={() => setTaskToDelete(null)}
        onConfirm={() => void handleDeleteTaskConfirm()}
      />
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
  notesList: {
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
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  calendarHeaderButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
});