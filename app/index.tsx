import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

export default function SplashScreen() {
  const router = useRouter();
  const onboardingCompleted = useAppStore((state) => state.onboardingCompleted);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Fade & scale brand logo in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Route check after delay
    const timer = setTimeout(() => {
      if (onboardingCompleted) {
        router.replace('/(auth)/welcome');
      } else {
        router.replace('/onboarding');
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [onboardingCompleted]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.brandContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Modern minimalistic logo icon: nested concentric violet circles */}
        <View style={styles.logoOuter}>
          <View style={styles.logoMiddle}>
            <View style={styles.logoInner} />
          </View>
        </View>
        <Text style={styles.appName}>Mistra</Text>
        <Text style={styles.tagline}>Your life, organized.</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  logoMiddle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DDD6FE', // lighter violet
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
  },
  appName: {
    ...Typography.h1,
    color: Colors.text,
    letterSpacing: 1.5,
    marginBottom: Spacing.xs,
  },
  tagline: {
    ...Typography.body,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
});
