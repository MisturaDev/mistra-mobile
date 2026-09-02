import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { AppToast } from '@/components/AppToast';
import { useAppStore } from '@/store/useAppStore';

SplashScreen.preventAutoHideAsync();

// Configure TanStack Query client for future API operations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function RootNavigation() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const isHydrated = useAppStore((state) => state.isHydrated);

  useEffect(() => {
    if (!isHydrated || isLoading) return;

    const rootSegment = segments[0];
    const inAuthGroup = rootSegment === '(auth)';
    const inOnboarding = rootSegment === 'onboarding';
    const inTabsGroup = rootSegment === '(tabs)';

    // Do not redirect while on the splash screen
    if (!rootSegment) return;

    if (session) {
      if (inAuthGroup || inOnboarding) {
        router.replace('/(tabs)');
      }
    } else {
      if (inTabsGroup) {
        router.replace('/(auth)/welcome');
      }
    }
  }, [session, isLoading, isHydrated, segments, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FFFFFF' },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="calendar" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}

export default function RootLayout() {
  const hydrate = useAppStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <RootNavigation />
          <AppToast />
        </SafeAreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
