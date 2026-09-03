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
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

    setSuccess(true);
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
          {success ? (
            <View style={styles.successSection}>
              <View style={styles.successIconContainer}>
                <Ionicons name="checkmark-circle-outline" size={80} color={Colors.success} />
              </View>
              <Text style={styles.titleText}>Check your email</Text>
              <Text style={styles.descriptionText}>
                We have sent password reset instructions to your email address.
              </Text>
              <Button
                title="Back to Sign In"
                variant="primary"
                size="lg"
                onPress={() => router.replace('/(auth)/sign-in')}
                style={styles.successBtn}
              />
            </View>
          ) : (
            <>
              <AuthHeader
                title="Reset password"
                subtitle="Enter the email associated with your account and we will send instructions to reset your password."
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
                    placeholder="you@example.com"
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
                title="Send Instructions"
                variant="primary"
                size="lg"
                loading={loading}
                onPress={handleSubmit(onSubmit)}
              />
            </View>
          </>
        )}
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
  backButton: {
    paddingVertical: Spacing.sm,
    alignSelf: 'flex-start',
    marginBottom: Spacing.lg,
  },
  titleSection: {
    marginBottom: Spacing.xxl,
  },
  titleText: {
    ...Typography.h1,
    color: Colors.text,
    textAlign: 'left',
    marginBottom: Spacing.xs,
  },
  subtitleText: {
    ...Typography.subtitle,
    color: Colors.textSecondary,
    fontWeight: '400',
    lineHeight: 22,
  },
  formSection: {
    marginBottom: Spacing.md,
  },
  actionSection: {
    marginTop: Spacing.sm,
  },
  successSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  descriptionText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  successBtn: {
    width: '100%',
  },
});
