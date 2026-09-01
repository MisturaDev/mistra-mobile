import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import type { TaskPriority } from '@/types/dashboard';

interface TaskFormModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  initialTitle?: string;
  initialPriority?: TaskPriority;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; priority: TaskPriority }) => void;
}

const PRIORITIES: { key: TaskPriority; label: string; bg: string; text: string; activeBg: string }[] = [
  { key: 'low', label: 'Low', bg: '#F3F4F6', text: '#4B5563', activeBg: '#E5E7EB' },
  { key: 'medium', label: 'Medium', bg: '#F5F3FF', text: Colors.primary, activeBg: '#DDD6FE' },
  { key: 'high', label: 'High', bg: '#FEE2E2', text: '#DC2626', activeBg: '#FCA5A5' },
];

export function TaskFormModal({
  visible,
  mode,
  initialTitle = '',
  initialPriority = 'medium',
  loading = false,
  onClose,
  onSubmit,
}: TaskFormModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [priority, setPriority] = useState<TaskPriority>(initialPriority);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setTitle(initialTitle);
      setPriority(initialPriority);
      setError('');
    }
  }, [visible, initialTitle, initialPriority]);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Enter a task title');
      return;
    }

    onSubmit({ title: trimmed, priority });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={loading ? undefined : onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.title}>{mode === 'create' ? 'New task' : 'Edit task'}</Text>
            
            <Input
              label="Task"
              placeholder="What do you need to do?"
              value={title}
              onChangeText={(value) => {
                setTitle(value);
                if (error) setError('');
              }}
              error={error}
              autoFocus
              disabled={loading}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            {/* Priority Selector */}
            <View style={styles.prioritySection}>
              <Text style={styles.priorityLabel}>Priority</Text>
              <View style={styles.priorityRow}>
                {PRIORITIES.map((item) => {
                  const isSelected = priority === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      onPress={() => setPriority(item.key)}
                      style={[
                        styles.priorityChip,
                        { backgroundColor: isSelected ? item.bg : Colors.surface },
                        isSelected && { borderColor: item.text, borderWidth: 1.5 },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.priorityChipText,
                          { color: isSelected ? item.text : Colors.textSecondary },
                          isSelected && { fontWeight: '700' },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

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
                title={mode === 'create' ? 'Add task' : 'Save'}
                variant="primary"
                size="md"
                loading={loading}
                onPress={handleSubmit}
                style={styles.actionButton}
              />
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  keyboardView: {
    width: '100%',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  prioritySection: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  priorityLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
