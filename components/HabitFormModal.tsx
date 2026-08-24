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

interface HabitFormModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  initialName?: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export function HabitFormModal({
  visible,
  mode,
  initialName = '',
  loading = false,
  onClose,
  onSubmit,
}: HabitFormModalProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setError('');
    }
  }, [visible, initialName]);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Enter a habit name');
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
            <Text style={styles.title}>{mode === 'create' ? 'New habit' : 'Edit habit'}</Text>
            <Input
              label="Habit"
              placeholder="What do you want to build?"
              value={name}
              onChangeText={(value) => {
                setName(value);
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
                title={mode === 'create' ? 'Add habit' : 'Save'}
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
