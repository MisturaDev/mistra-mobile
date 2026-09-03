import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { forgotPasswordSchema, ForgotPasswordInput } from '@/utils/validation';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { AuthHeader } from '@/components/AuthHeader';
import { toast } from '@/components/AppToast';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(data.email);

    setLoading(false);

    if (error) {
      Alert.alert('Reset failed', error.message);
      return;
    }

    toast.info({
      title: 'Code sent',
      message: 'Check your email for a 6-digit reset code.',
    });

    router.push({
      pathname: '/(auth)/reset-password',
      params: { email: data.email },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <AuthHeader
            title="Reset password"
            subtitle="Enter your email address and we'll send you a verification code to reset your password."
            onBack={() => router.back()}
          />

          <View style={styles.formSection}>
            {/* Email Field */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email Address"
                  placeholder="Enter your email address"
                  keyboardType="email-address"
                  autoComplete="email"
                  iconName="mail-outline"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.email?.message}
                  disabled={loading}
                />
              )}
            />
          </View>

          <View style={styles.actionSection}>
            <Button
              title="Send Reset Code"
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleSubmit(onSubmit)}
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Remember password? </Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/sign-in')}>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  formSection: {
    marginBottom: Spacing.md,
  },
  actionSection: {
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  footerText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  footerLink: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
});
