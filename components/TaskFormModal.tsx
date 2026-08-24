import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

interface TaskFormModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  initialTitle?: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
}

export function TaskFormModal({
  visible,
  mode,
  initialTitle = '',
  loading = false,
  onClose,
  onSubmit,
}: TaskFormModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setTitle(initialTitle);
      setError('');
    }
  }, [visible, initialTitle]);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Enter a task title');
      return;
    }

    onSubmit(trimmed);
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
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
