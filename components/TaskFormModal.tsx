import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetWrapper } from '@/components/BottomSheetWrapper';
import type { TaskPriority, TaskCategory, SubTask } from '@/types/dashboard';

export interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: string | null;
  subtasks: SubTask[];
}

interface TaskFormModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  initialTitle?: string;
  initialDescription?: string;
  initialPriority?: TaskPriority;
  initialCategory?: TaskCategory;
  initialDueDate?: string | null;
  initialSubtasks?: SubTask[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
}

const PRIORITIES: { key: TaskPriority; label: string; color: string; bg: string }[] = [
  { key: 'low', label: 'Low', color: '#4B5563', bg: '#F3F4F6' },
  { key: 'medium', label: 'Medium', color: Colors.primary, bg: '#F5F3FF' },
  { key: 'high', label: 'High', color: '#DC2626', bg: '#FEE2E2' },
];

const CATEGORIES: { key: TaskCategory; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'work', label: 'Work' },
  { key: 'personal', label: 'Personal' },
  { key: 'study', label: 'Study' },
  { key: 'health', label: 'Health' },
  { key: 'shopping', label: 'Shopping' },
];

const DUE_DATE_OPTIONS: { key: string; label: string; getDate: () => string | null }[] = [
  { key: 'none', label: 'No date', getDate: () => null },
  {
    key: 'today',
    label: 'Today',
    getDate: () => new Date().toISOString().split('T')[0],
  },
  {
    key: 'tomorrow',
    label: 'Tomorrow',
    getDate: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d.toISOString().split('T')[0];
    },
  },
  {
    key: 'next_week',
    label: 'Next week',
    getDate: () => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d.toISOString().split('T')[0];
    },
  },
];

export function TaskFormModal({
  visible,
  mode,
  initialTitle = '',
  initialDescription = '',
  initialPriority = 'medium',
  initialCategory = 'general',
  initialDueDate = null,
  initialSubtasks = [],
  loading = false,
  onClose,
  onSubmit,
}: TaskFormModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [priority, setPriority] = useState<TaskPriority>(initialPriority);
  const [category, setCategory] = useState<TaskCategory>(initialCategory);
  const [dueDate, setDueDate] = useState<string | null>(initialDueDate);
  const [subtasks, setSubtasks] = useState<SubTask[]>(initialSubtasks);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setTitle(initialTitle);
      setDescription(initialDescription);
      setPriority(initialPriority);
      setCategory(initialCategory);
      setDueDate(initialDueDate);
      setSubtasks(initialSubtasks || []);
      setNewSubtaskTitle('');
      setError('');
    }
  }, [visible, initialTitle, initialDescription, initialPriority, initialCategory, initialDueDate, initialSubtasks]);

  const handleAddSubtask = () => {
    const trimmed = newSubtaskTitle.trim();
    if (!trimmed) return;
    const newSubtask: SubTask = {
      id: Math.random().toString(36).substring(2, 9),
      title: trimmed,
      completed: false,
    };
    setSubtasks([...subtasks, newSubtask]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((item) => item.id !== id));
  };

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Enter a task title');
      return;
    }

    onSubmit({
      title: trimmed,
      description: description.trim(),
      priority,
      category,
      dueDate,
      subtasks,
    });
  };

  return (
    <BottomSheetWrapper
      visible={visible}
      onClose={onClose}
      title={mode === 'create' ? 'New Task' : 'Edit Task'}
      subtitle={mode === 'create' ? 'Add an actionable task to your list' : 'Update your task details'}
      loading={loading}
      scrollable
      maxHeight="92%"
    >
      {/* Title Input */}
      <Input
        label="Task Title"
        placeholder="What needs to be done?"
        value={title}
        onChangeText={(value) => {
          setTitle(value);
          if (error) setError('');
        }}
        error={error}
        autoFocus={mode === 'create'}
        disabled={loading}
      />

      {/* Category Selector (clean text-only pills) */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => setCategory(cat.key)}
                style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                activeOpacity={0.7}
              >
                <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Priority Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Priority</Text>
        <View style={styles.priorityRow}>
          {PRIORITIES.map((p) => {
            const isSelected = priority === p.key;
            return (
              <TouchableOpacity
                key={p.key}
                onPress={() => setPriority(p.key)}
                style={[
                  styles.priorityChip,
                  { backgroundColor: isSelected ? p.bg : Colors.surface },
                  isSelected && { borderColor: p.color, borderWidth: 1.5 },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.priorityChipText,
                    { color: isSelected ? p.color : Colors.textSecondary },
                    isSelected && { fontWeight: '700' },
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Due Date Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Due Date</Text>
        <View style={styles.dateRow}>
          {DUE_DATE_OPTIONS.map((opt) => {
            const targetDate = opt.getDate();
            const isSelected =
              (dueDate === null && opt.key === 'none') || (dueDate !== null && dueDate === targetDate);
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setDueDate(targetDate)}
                style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                activeOpacity={0.7}
              >
                <Text style={[styles.dateText, isSelected && styles.dateTextSelected]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Subtasks Section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Subtasks</Text>
        {subtasks.map((st) => (
          <View key={st.id} style={styles.subtaskItem}>
            <Ionicons name="checkbox-outline" size={16} color={Colors.primary} />
            <Text style={styles.subtaskItemTitle} numberOfLines={1}>
              {st.title}
            </Text>
            <TouchableOpacity onPress={() => handleRemoveSubtask(st.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={16} color={Colors.textLight} />
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.addSubtaskRow}>
          <TextInput
            style={styles.subtaskInput}
            placeholder="Add a step or subtask..."
            placeholderTextColor={Colors.textLight}
            value={newSubtaskTitle}
            onChangeText={setNewSubtaskTitle}
            returnKeyType="done"
            onSubmitEditing={handleAddSubtask}
          />
          <TouchableOpacity onPress={handleAddSubtask} style={styles.addSubtaskButton} activeOpacity={0.7}>
            <Ionicons name="add" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Description (Optional)</Text>
        <TextInput
          style={styles.descriptionInput}
          placeholder="Add details, links, or notes..."
          placeholderTextColor={Colors.textLight}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Cancel"
          variant="outline"
          size="md"
          onPress={onClose}
          disabled={loading}
          style={styles.actionButton}
        />
        <Button
          title={mode === 'create' ? 'Create Task' : 'Save Changes'}
          variant="primary"
          size="md"
          loading={loading}
          onPress={handleSubmit}
          style={styles.actionButton}
        />
      </View>
    </BottomSheetWrapper>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  categoryText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  priorityChip: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priorityChipText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  dateChip: {
    flex: 1,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateChipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  dateText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  dateTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  subtaskItemTitle: {
    ...Typography.caption,
    color: Colors.text,
    flex: 1,
  },
  addSubtaskRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  subtaskInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    ...Typography.caption,
    color: Colors.text,
  },
  addSubtaskButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  descriptionInput: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    ...Typography.body,
    color: Colors.text,
    minHeight: 60,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
