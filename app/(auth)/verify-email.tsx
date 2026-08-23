import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { Button } from '@/components/Button';
import { OtpInput, OTP_CODE_LENGTH } from '@/components/OtpInput';
import { supabase } from '@/lib/supabase';

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const userEmail = typeof email === 'string' ? email : '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async () => {
    if (otp.length !== OTP_CODE_LENGTH) {
      setError(`Enter the ${OTP_CODE_LENGTH}-digit code`);
      return;
    }

    if (!userEmail) {
      Alert.alert('Missing email', 'Go back and sign up again.');
      return;
    }

    setLoading(true);
    setError('');

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: userEmail,
      token: otp,
      type: 'signup',
    });

    setLoading(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    router.replace('/(tabs)');
  };

  const handleResend = async () => {
    if (!userEmail || cooldown > 0) return;

    setResendLoading(true);
    setError('');

    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: userEmail,
    });

    setResendLoading(false);

    if (resendError) {
      Alert.alert('Could not resend code', resendError.message);
      return;
    }

    setCooldown(RESEND_COOLDOWN_SECONDS);
    Alert.alert('Code sent', 'Check your email for a new verification code.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back-outline" size={24} color={Colors.text} />
      </TouchableOpacity>

      <View style={styles.iconWrap}>
        <View style={styles.iconCircle}>
          <Ionicons name="mail-outline" size={36} color={Colors.primary} />
        </View>
      </View>

      <Text style={styles.title}>Verify your email</Text>
      <Text style={styles.subtitle}>
        Enter the {OTP_CODE_LENGTH}-digit code sent to{'\n'}
        <Text style={styles.email}>{userEmail || 'your email'}</Text>
      </Text>

      <OtpInput
        value={otp}
        onChange={(value) => {
          setOtp(value);
          setError('');
        }}
        error={error}
        disabled={loading}
      />

      <Button
        title="Verify Email"
        variant="primary"
        size="lg"
        loading={loading}
        onPress={handleVerify}
        style={styles.verifyButton}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  backButton: {
    paddingVertical: Spacing.sm,
    alignSelf: 'flex-start',
    marginBottom: Spacing.lg,
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxl,
  },
  email: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  verifyButton: {
    marginTop: Spacing.xl,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
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
});
