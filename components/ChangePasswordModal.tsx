import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing } from '@/constants/theme';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { BottomSheetWrapper } from '@/components/BottomSheetWrapper';
import { changePasswordSchema, PASSWORD_HINT } from '@/utils/validation';

interface ChangePasswordModalProps {
  visible: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (currentPassword: string, newPassword: string) => void;
}

export function ChangePasswordModal({
  visible,
  loading = false,
  onClose,
  onSubmit,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) {
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
      setErrors({});
    }
  }, [visible]);

  const handleSubmit = () => {
    const result = changePasswordSchema.safeParse({
      currentPassword,
      password,
      confirmPassword,
    });

    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string' && !nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }

    onSubmit(result.data.currentPassword, result.data.password);
  };

  const clearError = (key: string) => {
    if (errors[key]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  };

  return (
    <BottomSheetWrapper
      visible={visible}
      onClose={onClose}
      title="Change Password"
      subtitle="Ensure your new password meets the security requirements"
      loading={loading}
      scrollable
      maxHeight="92%"
    >
      <Input
        label="Current password"
        placeholder="Enter current password"
        value={currentPassword}
        onChangeText={(value) => {
          setCurrentPassword(value);
          clearError('currentPassword');
        }}
        error={errors.currentPassword}
        secureTextEntry
        iconName="lock-closed-outline"
        disabled={loading}
      />
      <Input
        label="New password"
        placeholder="Create a new password"
        hint={PASSWORD_HINT}
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          clearError('password');
        }}
        error={errors.password}
        secureTextEntry
        iconName="lock-closed-outline"
        disabled={loading}
      />
      <Input
        label="Confirm new password"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChangeText={(value) => {
          setConfirmPassword(value);
          clearError('confirmPassword');
        }}
        error={errors.confirmPassword}
        secureTextEntry
        iconName="lock-closed-outline"
        disabled={loading}
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
          title="Update Password"
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
    marginTop: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
