import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabScreenHeader } from '@/components/TabScreenHeader';
import { useTabScreenInsets } from '@/hooks/useTabBarStyle';
import { useAuth } from '@/providers/AuthProvider';
import { useTasks } from '@/hooks/useTasks';
import { TaskCard } from '@/features/tasks/TaskCard';
import { TaskFormModal, TaskFormData } from '@/components/TaskFormModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { toast } from '@/components/AppToast';
import { Button } from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';
import type { Task, TaskCategory } from '@/types/dashboard';

type TaskSegment = 'all' | 'today' | 'upcoming' | 'completed';

const SEGMENTS: { key: TaskSegment; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
];

const CATEGORIES: { key: 'all' | TaskCategory; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: '✨' },
  { key: 'work', label: 'Work', icon: '💼' },
  { key: 'personal', label: 'Personal', icon: '🏠' },
  { key: 'study', label: 'Study', icon: '📚' },
  { key: 'health', label: 'Health', icon: '💪' },
  { key: 'shopping', label: 'Shopping', icon: '🛒' },
  { key: 'general', label: 'General', icon: '🏷️' },
];

export default function TasksScreen() {
  const tabInsets = useTabScreenInsets();
  const { session } = useAuth();
  const userId = session?.user.id;

  const [activeSegment, setActiveSegment] = useState<TaskSegment>('all');
  const [activeCategory, setActiveCategory] = useState<'all' | TaskCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [taskForm, setTaskForm] = useState<
    { mode: 'create' } | { mode: 'edit'; task: Task } | null
  >(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const {
    tasks,
    isLoading,
    isError,
    isSaving,
    refetch,
    toggleTask,
    toggleSubtask,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks(userId);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter tasks based on segment, category, and search query
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Segment filtering
      if (activeSegment === 'completed') {
        if (!task.completed) return false;
      } else {
        if (task.completed) return false;

        if (activeSegment === 'today') {
          if (!task.dueDate || task.dueDate !== todayStr) return false;
        } else if (activeSegment === 'upcoming') {
          if (!task.dueDate || task.dueDate <= todayStr) return false;
        }
      }

      // 2. Category filtering
      if (activeCategory !== 'all' && task.category !== activeCategory) {
        return false;
      }

      // 3. Search query filtering
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = (task.description || '').toLowerCase().includes(q);
        const matchesSubtasks = task.subtasks.some((st) =>
          st.title.toLowerCase().includes(q)
        );
        if (!matchesTitle && !matchesDesc && !matchesSubtasks) return false;
      }

      return true;
    });
  }, [tasks, activeSegment, activeCategory, searchQuery, todayStr]);

  // Counts for segments
  const segmentCounts = useMemo(() => {
    const active = tasks.filter((t) => !t.completed);
    const today = active.filter((t) => t.dueDate === todayStr);
    const upcoming = active.filter((t) => t.dueDate && t.dueDate > todayStr);
    const completed = tasks.filter((t) => t.completed);

    return {
      all: active.length,
      today: today.length,
      upcoming: upcoming.length,
      completed: completed.length,
    };
  }, [tasks, todayStr]);

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
      toast.success({ message: 'Task created' });
    } catch (error) {
      Alert.alert(
        'Could not create task',
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

  const handleFormSubmit = (data: TaskFormData) => {
    if (taskForm?.mode === 'create') {
      void handleCreateTask(data);
      return;
    }

    if (taskForm?.mode === 'edit') {
      void handleUpdateTask(data);
    }
  };

  const handleDeleteConfirm = async () => {
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabInsets.paddingBottom }]}
        keyboardShouldPersistTaps="handled"
      >
        <TabScreenHeader title="Tasks" subtitle="Organize to-dos, priorities & due dates" />

        {/* Search Bar */}
        {tasks.length > 0 ? (
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={18} color={Colors.textLight} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tasks, descriptions, subtasks..."
              placeholderTextColor={Colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.clearSearchButton}
              >
                <Ionicons name="close-circle" size={18} color={Colors.textLight} />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        {/* Add Task Primary Action */}
        <View style={styles.topActionsRow}>
          <Button
            title="Add task"
            variant="primary"
            size="md"
            onPress={() => setTaskForm({ mode: 'create' })}
            style={styles.addButton}
          />
        </View>

        {/* Segment Filter Tabs */}
        <View style={styles.segmentContainer}>
          {SEGMENTS.map((seg) => {
            const isSelected = activeSegment === seg.key;
            const count = segmentCounts[seg.key];
            return (
              <TouchableOpacity
                key={seg.key}
                onPress={() => setActiveSegment(seg.key)}
                style={[styles.segmentTab, isSelected && styles.segmentTabActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.segmentLabel, isSelected && styles.segmentLabelActive]}>
                  {seg.label}
                </Text>
                {count > 0 ? (
                  <View style={[styles.segmentCountBadge, isSelected && styles.segmentCountBadgeActive]}>
                    <Text style={[styles.segmentCountText, isSelected && styles.segmentCountTextActive]}>
                      {count}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => setActiveCategory(cat.key)}
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={[styles.categoryChipLabel, isSelected && styles.categoryChipLabelActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* State Indicators */}
        {isLoading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : null}

        {isError ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateText}>Could not load your tasks.</Text>
            <TouchableOpacity onPress={() => refetch()} activeOpacity={0.7}>
              <Text style={styles.retryText}>Tap to retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Task List / Empty States */}
        {!isLoading && !isError ? (
          tasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="checkbox-outline" size={36} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No tasks yet</Text>
              <Text style={styles.emptyText}>
                Plan your day, set priorities, and break goals into actionable steps.
              </Text>
              <Button
                title="Create your first task"
                variant="outline"
                size="md"
                onPress={() => setTaskForm({ mode: 'create' })}
                style={styles.emptyActionButton}
              />
            </View>
          ) : filteredTasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No tasks in this view</Text>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? `No tasks match "${searchQuery}".`
                  : activeSegment === 'today'
                  ? 'No tasks scheduled for today.'
                  : activeSegment === 'upcoming'
                  ? 'No upcoming tasks scheduled.'
                  : activeSegment === 'completed'
                  ? 'No completed tasks yet.'
                  : 'No tasks found in this category.'}
              </Text>
              {(activeCategory !== 'all' || searchQuery || activeSegment !== 'all') ? (
                <TouchableOpacity
                  onPress={() => {
                    setActiveSegment('all');
                    setActiveCategory('all');
                    setSearchQuery('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.retryText}>Reset filters</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <View style={styles.tasksList}>
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onToggleSubtask={toggleSubtask}
                  onEdit={(t) => setTaskForm({ mode: 'edit', task: t })}
                  onDelete={(t) => setTaskToDelete(t)}
                />
              ))}
            </View>
          )
        ) : null}
      </ScrollView>

      {/* Create / Edit Modal */}
      <TaskFormModal
        visible={taskForm !== null}
        mode={taskForm?.mode ?? 'create'}
        initialTitle={taskForm?.mode === 'edit' ? taskForm.task.title : ''}
        initialDescription={taskForm?.mode === 'edit' ? taskForm.task.description : ''}
        initialPriority={taskForm?.mode === 'edit' ? taskForm.task.priority : 'medium'}
        initialCategory={taskForm?.mode === 'edit' ? taskForm.task.category : 'general'}
        initialDueDate={taskForm?.mode === 'edit' ? taskForm.task.dueDate : null}
        initialSubtasks={taskForm?.mode === 'edit' ? taskForm.task.subtasks : []}
        loading={isSaving}
        onClose={closeTaskForm}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirm Modal */}
      <ConfirmModal
        visible={taskToDelete !== null}
        title="Delete task?"
        message={
          taskToDelete
            ? `"${taskToDelete.title}" will be permanently removed.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        loading={isSaving}
        onCancel={() => setTaskToDelete(null)}
        onConfirm={() => void handleDeleteConfirm()}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.md,
    height: 44,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    paddingVertical: 0,
  },
  clearSearchButton: {
    padding: Spacing.xs,
  },
  topActionsRow: {
    marginBottom: Spacing.md,
  },
  addButton: {
    width: '100%',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 3,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    gap: 4,
  },
  segmentTabActive: {
    backgroundColor: Colors.white,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  segmentLabel: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  segmentLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  segmentCountBadge: {
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Radius.full,
  },
  segmentCountBadgeActive: {
    backgroundColor: Colors.primaryLight,
  },
  segmentCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  segmentCountTextActive: {
    color: Colors.primary,
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  categoryChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  categoryIcon: {
    fontSize: 12,
  },
  categoryChipLabel: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryChipLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  tasksList: {
    gap: 0,
  },
  stateContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    maxWidth: 280,
  },
  emptyActionButton: {
    marginTop: Spacing.xs,
  },
});
