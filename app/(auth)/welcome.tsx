import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroSection}>
        <View style={styles.heroCard}>
          <Logo size="lg" showShadow showWordmark tagline="Your life, organized." />
        </View>

        <Text style={styles.description}>
          Plan your day, build habits, and keep everything that matters in one calm place.
        </Text>
      </View>

      <View style={styles.actionContainer}>
        <Button
          title="Sign In"
          variant="primary"
          size="lg"
          onPress={() => router.push('/(auth)/sign-in')}
          style={styles.button}
        />
        <Button
          title="Create Account"
          variant="outline"
          size="lg"
          onPress={() => router.push('/(auth)/sign-up')}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  heroSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  heroCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.xxl,
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xxl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    width: '100%',
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
  },
  actionContainer: {
    gap: Spacing.md,
  },
  button: {
    width: '100%',
  },
});
