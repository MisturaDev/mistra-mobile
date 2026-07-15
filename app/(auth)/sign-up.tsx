import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { signupSchema, SignupInput } from '@/utils/validation';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';

export default function SignUpScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: SignupInput) => {
    setLoading(true);
    // Simulate API registration delay
    setTimeout(() => {
      setLoading(false);
      // Route to Home Dashboard
      router.replace('/(tabs)');
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back-outline" size={24} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.titleSection}>
          <Text style={styles.titleText}>Create account</Text>
          <Text style={styles.subtitleText}>Get started with Mistra today.</Text>
        </View>

        <View style={styles.formSection}>
          {/* Name Field */}
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Full Name"
                placeholder="John Doe"
                autoComplete="name"
                iconName="person-outline"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.name?.message}
                disabled={loading}
              />
            )}
          />

          {/* Email Field */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email Address"
                placeholder="john@example.com"
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

          {/* Password Field */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                placeholder="••••••••"
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
                placeholder="••••••••"
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
            title="Create Account"
            variant="primary"
            size="lg"
            loading={loading}
            onPress={handleSubmit(onSubmit)}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
              <Text style={styles.footerLink}>Sign In</Text>
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
    marginBottom: Spacing.sm,
  },
  titleSection: {
    marginBottom: Spacing.lg,
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
    marginBottom: Spacing.lg,
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
