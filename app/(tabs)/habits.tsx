import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabScreenHeader } from '@/components/TabScreenHeader';
import { useTabScreenInsets } from '@/hooks/useTabBarStyle';
import { useAuth } from '@/providers/AuthProvider';
import { useHabits } from '@/hooks/useHabits';
import { HabitItem } from '@/features/dashboard/HabitItem';
import { HabitFormModal } from '@/components/HabitFormModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { toast } from '@/components/AppToast';
import { Button } from '@/components/Button';

export default function HabitsScreen() {
  const tabInsets = useTabScreenInsets();
  const { session } = useAuth();
  const userId = session?.user.id;

  const [habitForm, setHabitForm] = useState<
    { mode: 'create' } | { mode: 'edit'; habitId: string; initialName: string } | null
  >(null);
  const [habitToDelete, setHabitToDelete] = useState<{ id: string; name: string } | null>(null);

  const {
    habits,
    isLoading,
    isError,
    isSaving,
    refetch,
    toggleHabit,
    createHabit,
    updateHabit,
    deleteHabit,
  } = useHabits(userId);

  const closeHabitForm = () => setHabitForm(null);

  const handleCreateHabit = async (name: string) => {
    try {
      await createHabit(name);
      closeHabitForm();
      toast.success({ message: 'Habit added' });
    } catch (error) {
      Alert.alert(
        'Could not add habit',
        error instanceof Error ? error.message : 'Please try again.'
      );
    }
  };

  const handleUpdateHabit = async (name: string) => {
    if (!habitForm || habitForm.mode !== 'edit') return;

    try {
      await updateHabit(habitForm.habitId, name);
      closeHabitForm();
      toast.success({ message: 'Habit updated' });
    } catch (error) {
      Alert.alert(
        'Could not update habit',
        error instanceof Error ? error.message : 'Please try again.'
      );
    }
  };

  const handleDeleteHabitConfirm = async () => {
    if (!habitToDelete) return;

    try {
      await deleteHabit(habitToDelete.id);
      setHabitToDelete(null);
      toast.success({ message: 'Habit deleted' });
    } catch (error) {
      Alert.alert(
        'Could not delete habit',
        error instanceof Error ? error.message : 'Please try again.'
      );
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

  const handleEditHabit = (id: string) => {
    const habit = habits.find((item) => item.id === id);
    if (!habit) return;

    setHabitForm({ mode: 'edit', habitId: id, initialName: habit.name });
  };

  const handleDeleteHabitPress = (id: string) => {
    const habit = habits.find((item) => item.id === id);
    if (!habit) return;

    setHabitToDelete({ id, name: habit.name });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabInsets.paddingBottom }]}
      >
        <TabScreenHeader title="Habits" subtitle="Track routines and streaks" />
        <Button
          title="Add habit"
          variant="primary"
          size="md"
          onPress={() => setHabitForm({ mode: 'create' })}
          style={styles.addButton}
        />
        {isLoading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : null}
        {isError ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateText}>Could not load your habits.</Text>
            <TouchableOpacity onPress={() => refetch()} activeOpacity={0.7}>
              <Text style={styles.retryText}>Tap to retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {!isLoading && !isError ? (
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
                  onEdit={handleEditHabit}
                  onDelete={handleDeleteHabitPress}
                />
              ))}
            </View>
          )
        ) : null}
      </ScrollView>
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
});
