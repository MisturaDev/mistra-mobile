import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { resetPasswordSchema, ResetPasswordInput, PASSWORD_HINT } from '@/utils/validation';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { AuthHeader } from '@/components/AuthHeader';
import { OtpInput, OTP_CODE_LENGTH } from '@/components/OtpInput';
import { toast } from '@/components/AppToast';
import { supabase } from '@/lib/supabase';

const RESEND_COOLDOWN_SECONDS = 60;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const userEmail = typeof email === 'string' ? email : '';

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      otp: '',
      password: '',
      confirmPassword: '',
    },
  });

  const otpValue = watch('otp');

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!userEmail || cooldown > 0) return;

    setResendLoading(true);

    const { error: resendError } = await supabase.auth.resetPasswordForEmail(userEmail);

    setResendLoading(false);

    if (resendError) {
      Alert.alert('Could not resend code', resendError.message);
      return;
    }

    setCooldown(RESEND_COOLDOWN_SECONDS);
    toast.info({ title: 'Code sent', message: 'Check your email for a new reset code.' });
  };

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!userEmail) {
      Alert.alert('Missing email', 'Go back and request a reset code again.');
      return;
    }

    setLoading(true);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: userEmail,
      token: data.otp,
      type: 'recovery',
    });

    if (verifyError) {
      setLoading(false);
      Alert.alert('Verification failed', verifyError.message);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: data.password,
    });

    setLoading(false);

    if (updateError) {
      Alert.alert('Password update failed', updateError.message);
      return;
    }

    toast.success({
      title: 'Password updated',
      message: 'Your password has been reset successfully. Please sign in.',
    });

    await supabase.auth.signOut();
    router.replace('/(auth)/sign-in');
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
            title="Create new password"
            subtitle={`Enter the ${OTP_CODE_LENGTH}-digit code sent to ${userEmail || 'your email'} and choose a new password.`}
            onBack={() => router.back()}
          />

          <View style={styles.formSection}>
            <View style={styles.otpSection}>
              <Text style={styles.otpLabel}>Verification Code</Text>
              <OtpInput
                value={otpValue}
                onChange={(val) => setValue('otp', val, { shouldValidate: true })}
                error={errors.otp?.message}
                disabled={loading}
              />
            </View>

            {/* Password Field */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="New Password"
                  placeholder="Enter your new password"
                  hint={PASSWORD_HINT}
                  secureTextEntry
                  iconName="lock-closed-outline"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message}
                  disabled={loading}
                />
              )}
            />

            {/* Confirm Password Field */}
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirm Password"
                  placeholder="Confirm your new password"
                  secureTextEntry
                  iconName="lock-closed-outline"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.confirmPassword?.message}
                  disabled={loading}
                />
              )}
            />
          </View>

          <View style={styles.actionSection}>
            <Button
              title="Reset Password"
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleSubmit(onSubmit)}
            />

            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Didn't get the code? </Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={cooldown > 0 || resendLoading}
                activeOpacity={0.7}
              >
                <Text style={[styles.resendLink, cooldown > 0 && styles.resendDisabled]}>
                  {resendLoading
                    ? 'Sending...'
                    : cooldown > 0
                      ? `Resend in ${cooldown}s`
                      : 'Resend code'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Remember password? </Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/sign-in')}>
                <Text style={styles.footerLink}>Login</Text>
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
  otpSection: {
    marginBottom: Spacing.lg,
  },
  otpLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionSection: {
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  resendText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  resendLink: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
  resendDisabled: {
    color: Colors.textLight,
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
