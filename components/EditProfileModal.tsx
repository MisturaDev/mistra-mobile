import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing } from '@/constants/theme';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { BottomSheetWrapper } from '@/components/BottomSheetWrapper';
import { profileNameSchema } from '@/utils/validation';

interface EditProfileModalProps {
  visible: boolean;
  initialName?: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export function EditProfileModal({
  visible,
  initialName = '',
  loading = false,
  onClose,
  onSubmit,
}: EditProfileModalProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setError('');
    }
  }, [visible, initialName]);

  const handleSubmit = () => {
    const result = profileNameSchema.safeParse({ name });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Enter a valid name');
      return;
    }

    onSubmit(result.data.name);
  };

  return (
    <BottomSheetWrapper
      visible={visible}
      onClose={onClose}
      title="Edit Profile"
      subtitle="Update your display name across your workspace"
      loading={loading}
    >
      <Input
        label="Full name"
        placeholder="Enter your full name"
        value={name}
        onChangeText={(value) => {
          setName(value);
          if (error) setError('');
        }}
        error={error}
        autoComplete="name"
        autoFocus
        disabled={loading}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        iconName="person-outline"
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
          title="Save Changes"
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
