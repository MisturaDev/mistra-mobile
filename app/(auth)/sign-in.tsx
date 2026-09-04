import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { loginSchema, LoginInput } from '@/utils/validation';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { AuthHeader } from '@/components/AuthHeader';
import { toast } from '@/components/AppToast';
import { haptics } from '@/utils/haptics';
import { supabase } from '@/lib/supabase';

export default function SignInScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    setLoading(false);

    if (error) {
      const isUnverified = error.message.toLowerCase().includes('email not confirmed');

      if (isUnverified) {
        Alert.alert(
          'Email not verified',
          'Enter the verification code we sent to your email.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Enter code',
              onPress: () =>
                router.push({
                  pathname: '/(auth)/verify-email',
                  params: { email: data.email },
                }),
            },
          ]
        );
        return;
      }

      Alert.alert('Sign in failed', error.message);
      return;
    }

    haptics.notificationSuccess();
    toast.success({
      title: 'Signed in successfully',
      message: 'Welcome back to Mistra.',
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
            title="Welcome back"
            subtitle="Sign in to continue organizing your life."
            onBack={() => router.back()}
          />

          <View style={styles.formSection}>
            {/* Email field */}
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

            {/* Password field */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  secureTextEntry
                  autoComplete="password"
                  iconName="lock-closed-outline"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message}
                  disabled={loading}
                />
              )}
            />

            {/* Forgot Password Link */}
            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.forgotPasswordContainer}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionSection}>
            <Button
              title="Sign In"
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleSubmit(onSubmit)}
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
                <Text style={styles.footerLink}>Sign Up</Text>
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
    marginBottom: Spacing.sm,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  forgotPasswordText: {
    ...Typography.bodyBold,
    color: Colors.primary,
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
