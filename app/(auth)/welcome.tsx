import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';
import { Button } from '@/components/Button';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroSection}>
        {/* Concentric Circle Brand Symbol */}
        <View style={styles.logoContainer}>
          <View style={styles.logoOuter}>
            <View style={styles.logoMiddle}>
              <View style={styles.logoInner} />
            </View>
          </View>
        </View>

        <Text style={styles.appName}>Mistra</Text>
        <Text style={styles.tagline}>Your life, organized.</Text>
        <Text style={styles.description}>
          Manage tasks, establish healthy habits, structure notes, and stay on top of your daily calendar schedules.
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
  logoContainer: {
    marginBottom: Spacing.xxl,
  },
  logoOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  logoMiddle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
  },
  appName: {
    ...Typography.h1,
    fontSize: 32,
    color: Colors.text,
    letterSpacing: 1.5,
    marginBottom: Spacing.xs,
  },
  tagline: {
    ...Typography.subtitle,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: Spacing.lg,
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
