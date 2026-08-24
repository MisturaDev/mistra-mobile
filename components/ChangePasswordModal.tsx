import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={loading ? undefined : onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.title}>Change password</Text>
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
                  title="Update password"
                  variant="primary"
                  size="md"
                  loading={loading}
                  onPress={handleSubmit}
                  style={styles.actionButton}
                />
              </View>
            </ScrollView>
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
    maxHeight: '90%',
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
