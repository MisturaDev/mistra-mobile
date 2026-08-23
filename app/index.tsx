import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { Colors } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/providers/AuthProvider';
import { Logo } from '@/components/Logo';

export default function AppSplash() {
  const router = useRouter();
  const onboardingCompleted = useAppStore((state) => state.onboardingCompleted);
  const { session, isLoading } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    ExpoSplashScreen.hideAsync();

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

    const timer = setTimeout(() => {
      if (isLoading) return;

      if (session) {
        router.replace('/(tabs)');
      } else if (onboardingCompleted) {
        router.replace('/(auth)/welcome');
      } else {
        router.replace('/onboarding');
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [onboardingCompleted, session, isLoading]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.brandContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Logo size="md" showShadow showWordmark tagline="Your life, organized." />
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
});
