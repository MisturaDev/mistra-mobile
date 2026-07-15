import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { loginSchema, LoginInput } from '@/utils/validation';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';

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

  const onSubmit = (data: LoginInput) => {
    setLoading(true);
    // Simulate API request delay
    setTimeout(() => {
      setLoading(false);
      // Route to Home Dashboard
      router.replace('/(tabs)');
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Header Navigation Row */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back-outline" size={24} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.titleSection}>
          <Text style={styles.titleText}>Welcome back</Text>
          <Text style={styles.subtitleText}>Sign in to continue organizing your life.</Text>
        </View>

        <View style={styles.formSection}>
          {/* Email field */}
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

          {/* Password field */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                placeholder="••••••••"
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
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
    marginBottom: Spacing.xs,
  },
  subtitleText: {
    ...Typography.subtitle,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  formSection: {
    marginBottom: Spacing.xl,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: Spacing.xs,
  },
  forgotPasswordText: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
  actionSection: {
    marginTop: 'auto',
    gap: Spacing.lg,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
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
