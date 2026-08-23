import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { useAuth } from '@/providers/AuthProvider';
import { ProfileMenuRow } from '@/features/profile/ProfileMenuRow';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useProfileAvatar } from '@/hooks/useProfileAvatar';
import { useTabScreenInsets } from '@/hooks/useTabBarStyle';

function formatMemberSince(dateString?: string) {
  if (!dateString) return 'Recently joined';

  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export default function ProfileScreen() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const { pushEnabled, hydrate, isHydrated } = useNotificationStore();
  const { avatarUri, pickAvatar, removeAvatar } = useProfileAvatar(session?.user.id);
  const tabInsets = useTabScreenInsets();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const userName =
    (session?.user.user_metadata?.name as string | undefined) ??
    session?.user.email?.split('@')[0] ??
    'User';

  const userEmail = session?.user.email ?? '';
  const isVerified = Boolean(session?.user.email_confirmed_at);
  const memberSince = formatMemberSince(session?.user.created_at);
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await signOut();
            router.replace('/(auth)/welcome');
          } catch (error) {
            Alert.alert(
              'Sign out failed',
              error instanceof Error ? error.message : 'Please try again.'
            );
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const showComingSoon = (feature: string) => {
    Alert.alert('Coming soon', `${feature} will be available in a future update.`);
  };

  const handleAvatarPress = () => {
    if (avatarUri) {
      Alert.alert('Profile photo', undefined, [
        { text: 'Choose new photo', onPress: pickAvatar },
        { text: 'Remove photo', style: 'destructive', onPress: removeAvatar },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    pickAvatar();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabInsets.paddingBottom }]}
      >
        <Text style={styles.title}>Profile</Text>

        <Card style={styles.heroCard} padded elevation="md" bordered={false}>
          <View style={styles.heroContent}>
            <Avatar
              uri={avatarUri}
              name={userName}
              size={96}
              showRing
              editable
              onPress={handleAvatarPress}
            />
            <Text style={styles.avatarHint}>
              {avatarUri ? 'Tap photo to change' : 'Tap to add profile photo'}
            </Text>
            <Text style={styles.name}>{userName}</Text>
            <Text style={styles.email}>{userEmail}</Text>

            <View style={styles.badges}>
              <View style={[styles.badge, isVerified ? styles.badgeSuccess : styles.badgeMuted]}>
                <Text style={[styles.badgeText, isVerified ? styles.badgeTextSuccess : null]}>
                  {isVerified ? 'Email verified' : 'Email not verified'}
                </Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Member since {memberSince}</Text>
              </View>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionLabel}>Account</Text>
        <Card style={styles.menuCard} padded elevation="none">
          <ProfileMenuRow
            icon="person-outline"
            label="Edit profile"
            value="Update your name and details"
            onPress={() => showComingSoon('Edit profile')}
          />
          <View style={styles.divider} />
          <ProfileMenuRow
            icon="mail-outline"
            label="Email"
            value={userEmail}
            showChevron={false}
          />
          <View style={styles.divider} />
          <ProfileMenuRow
            icon="lock-closed-outline"
            label="Change password"
            value="Update your account password"
            onPress={() => showComingSoon('Change password')}
          />
        </Card>

        <Text style={styles.sectionLabel}>Preferences</Text>
        <Card style={styles.menuCard} padded elevation="none">
          <ProfileMenuRow
            icon="notifications-outline"
            label="Notifications"
            value={isHydrated ? (pushEnabled ? 'On' : 'Off') : 'Reminders and daily alerts'}
            onPress={() => router.push('/notifications')}
          />
          <View style={styles.divider} />
          <ProfileMenuRow
            icon="moon-outline"
            label="Appearance"
            value="Theme and display options"
            onPress={() => showComingSoon('Appearance')}
          />
        </Card>

        <Text style={styles.sectionLabel}>Support</Text>
        <Card style={styles.menuCard} padded elevation="none">
          <ProfileMenuRow
            icon="help-circle-outline"
            label="Help & support"
            onPress={() => showComingSoon('Help & support')}
          />
          <View style={styles.divider} />
          <ProfileMenuRow
            icon="document-text-outline"
            label="Privacy policy"
            onPress={() => showComingSoon('Privacy policy')}
          />
        </Card>

        <View style={styles.actions}>
          <Button
            title="Sign Out"
            variant="outline"
            size="lg"
            loading={loading}
            onPress={handleSignOut}
          />
        </View>

        <Text style={styles.version}>Mistra v{appVersion}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  heroCard: {
    backgroundColor: Colors.primaryLight,
    marginBottom: Spacing.xl,
  },
  heroContent: {
    alignItems: 'center',
  },
  avatarHint: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  name: {
    ...Typography.h2,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  email: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  badge: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  badgeSuccess: {
    backgroundColor: Colors.successLight,
  },
  badgeMuted: {
    backgroundColor: Colors.borderLight,
  },
  badgeText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  badgeTextSuccess: {
    color: Colors.success,
  },
  sectionLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  menuCard: {
    marginBottom: Spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  actions: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  version: {
    ...Typography.caption,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
