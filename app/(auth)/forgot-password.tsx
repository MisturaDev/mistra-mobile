import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { forgotPasswordSchema, ForgotPasswordInput } from '@/utils/validation';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';

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

  const onSubmit = (data: ForgotPasswordInput) => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
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
            <View style={styles.titleSection}>
              <Text style={styles.titleText}>Reset password</Text>
              <Text style={styles.subtitleText}>
                Enter the email associated with your account and we will send instructions to reset your password.
              </Text>
            </View>

            <View style={styles.formSection}>
              {/* Email Field */}
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email Address"
                    placeholder="name@domain.com"
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
    marginBottom: Spacing.xl,
  },
  actionSection: {
    marginTop: 'auto',
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
