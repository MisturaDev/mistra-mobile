import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing } from '@/constants/theme';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { BottomSheetWrapper } from '@/components/BottomSheetWrapper';

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
    <BottomSheetWrapper
      visible={visible}
      onClose={onClose}
      title={mode === 'create' ? 'New Habit' : 'Edit Habit'}
      subtitle={mode === 'create' ? 'Build a daily routine and keep your streak' : 'Update your habit details'}
      loading={loading}
    >
      <Input
        label="Habit Name"
        placeholder="e.g. Read 20 pages, Morning stretch..."
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
        iconName="sparkles-outline"
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
          title={mode === 'create' ? 'Add Habit' : 'Save Changes'}
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
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
});
