import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Avatar } from '@/components/Avatar';
import { useAuth } from '@/providers/AuthProvider';

export default function ProfileScreen() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const userName =
    (session?.user.user_metadata?.name as string | undefined) ??
    session?.user.email?.split('@')[0] ??
    'User';

  const userEmail = session?.user.email ?? '';

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      router.replace('/(auth)/welcome');
    } catch (error) {
      Alert.alert('Sign out failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.profileCard}>
        <Avatar name={userName} size={64} />
        <Text style={styles.name}>{userName}</Text>
        <Text style={styles.email}>{userEmail}</Text>
      </View>

      <Button
        title="Sign Out"
        variant="outline"
        size="lg"
        loading={loading}
        onPress={handleSignOut}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.xl,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  name: {
    ...Typography.title,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  email: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
