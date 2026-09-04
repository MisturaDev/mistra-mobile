import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { ConfirmModal } from '@/components/ConfirmModal';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import { EditProfileModal } from '@/components/EditProfileModal';
import { PrivacyPolicyModal } from '@/components/PrivacyPolicyModal';
import { NotificationSettingsModal } from '@/components/NotificationSettingsModal';
import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { useAuth } from '@/providers/AuthProvider';
import { ProfileMenuRow } from '@/features/profile/ProfileMenuRow';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useProfileAvatar } from '@/hooks/useProfileAvatar';
import { TabScreenHeader } from '@/components/TabScreenHeader';
import { useTabScreenInsets } from '@/hooks/useTabBarStyle';
import { updateProfileName } from '@/lib/profileStorage';
import { changePassword } from '@/lib/authStorage';
import { toast } from '@/components/AppToast';
import { getUserNameFromSession } from '@/utils/userName';
import { haptics } from '@/utils/haptics';

export default function ProfileScreen() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [notificationSettingsVisible, setNotificationSettingsVisible] = useState(false);
  const [confirmModal, setConfirmModal] = useState<'signOut' | 'deleteAccount' | null>(null);
  const { pushEnabled, hydrate, isHydrated } = useNotificationStore();
  const { avatarUri, pickAvatar, removeAvatar } = useProfileAvatar(session?.user.id);
  const tabInsets = useTabScreenInsets();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const userName = getUserNameFromSession(
    session?.user.user_metadata?.name as string | undefined,
    session?.user.email,
    'User'
  );
  const profileName = (session?.user.user_metadata?.name as string | undefined)?.trim() ?? '';

  const userEmail = session?.user.email ?? '';
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const handleHelpAndSupport = async () => {
    const subject = encodeURIComponent(`Mistra Support Request (v${appVersion})`);
    const body = encodeURIComponent(
      `Hi Mistra Support Team,\n\nI need help with:\n\n---\nApp Version: ${appVersion}\nPlatform: ${Platform.OS} (${Platform.Version})\nUser: ${userEmail}`
    );
    const mailtoUrl = `mailto:support@mistra.app?subject=${subject}&body=${body}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert(
          'Contact Support',
          'You can reach our support team anytime at:\n\nsupport@mistra.app',
          [{ text: 'OK' }]
        );
      }
    } catch {
      Alert.alert(
        'Contact Support',
        'You can reach our support team anytime at:\n\nsupport@mistra.app',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSignOutPress = () => {
    haptics.notificationWarning();
    setConfirmModal('signOut');
  };

  const handleSignOutConfirm = async () => {
    setLoading(true);
    try {
      await signOut();
      setConfirmModal(null);
      toast.info({
        title: 'Signed out successfully',
        message: 'You have been safely signed out.',
      });
      router.replace('/(auth)/welcome');
    } catch (error) {
      setConfirmModal(null);
      Alert.alert(
        'Log out failed',
        error instanceof Error ? error.message : 'Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccountPress = () => {
    haptics.notificationWarning();
    setConfirmModal('deleteAccount');
  };

  const handleDeleteAccountConfirm = () => {
    setConfirmModal(null);
    showComingSoon('Delete account');
  };

  const showComingSoon = (feature: string) => {
    Alert.alert('Coming soon', `${feature} will be available in a future update.`);
  };

  const handleSaveProfile = async (name: string) => {
    if (!session?.user.id) return;

    setSavingProfile(true);
    try {
      await updateProfileName(session.user.id, name);
      setEditProfileVisible(false);
      haptics.notificationSuccess();
      toast.success({ message: 'Profile updated' });
    } catch (error) {
      Alert.alert(
        'Could not update profile',
        error instanceof Error ? error.message : 'Please try again.'
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setChangePasswordVisible(false);
      haptics.notificationSuccess();
      toast.success({ message: 'Password updated' });
    } catch (error) {
      Alert.alert(
        'Could not update password',
        error instanceof Error ? error.message : 'Please try again.'
      );
    } finally {
      setSavingPassword(false);
    }
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
        <TabScreenHeader title="Profile" subtitle="Account, settings, and support" />

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
          </View>
        </Card>

        <Text style={styles.sectionLabel}>Account</Text>
        <Card style={styles.menuCard} padded elevation="none">
          <ProfileMenuRow
            icon="person-outline"
            label="Edit profile"
            value="Update your name"
            onPress={() => setEditProfileVisible(true)}
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
            onPress={() => setChangePasswordVisible(true)}
          />
        </Card>

        <Text style={styles.sectionLabel}>Settings</Text>
        <Card style={styles.menuCard} padded elevation="none">
          <ProfileMenuRow
            icon="notifications-outline"
            label="Notifications"
            value={isHydrated ? (pushEnabled ? 'On' : 'Off') : 'Reminders and daily alerts'}
            onPress={() => {
              haptics.selection();
              setNotificationSettingsVisible(true);
            }}
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
            value="support@mistra.app"
            onPress={handleHelpAndSupport}
          />
          <View style={styles.divider} />
          <ProfileMenuRow
            icon="document-text-outline"
            label="Privacy policy"
            onPress={() => setPrivacyModalVisible(true)}
          />
        </Card>

        <Card style={styles.actionsCard} padded elevation="none">
          <ProfileMenuRow
            icon="log-out-outline"
            label="Log out"
            destructive
            onPress={handleSignOutPress}
            showChevron={false}
          />
          <View style={styles.actionsDivider} />
          <ProfileMenuRow
            icon="trash-outline"
            label="Delete account"
            destructive
            onPress={handleDeleteAccountPress}
            showChevron={false}
          />
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerBrand}>Mistra</Text>
          <Text style={styles.footerVersion}>Version {appVersion}</Text>
        </View>
      </ScrollView>

      <EditProfileModal
        visible={editProfileVisible}
        initialName={profileName}
        loading={savingProfile}
        onClose={() => setEditProfileVisible(false)}
        onSubmit={(name) => void handleSaveProfile(name)}
      />

      <ChangePasswordModal
        visible={changePasswordVisible}
        loading={savingPassword}
        onClose={() => setChangePasswordVisible(false)}
        onSubmit={(currentPassword, newPassword) =>
          void handleChangePassword(currentPassword, newPassword)
        }
      />

      <ConfirmModal
        visible={confirmModal === 'signOut'}
        title="Log out?"
        message="Are you sure you want to log out?"
        confirmLabel="Log out"
        destructive
        loading={loading}
        onCancel={() => setConfirmModal(null)}
        onConfirm={handleSignOutConfirm}
      />

      <ConfirmModal
        visible={confirmModal === 'deleteAccount'}
        title="Delete account?"
        message="This will permanently delete your account and all associated data. This action cannot be undone."
        confirmLabel="Delete account"
        destructive
        onCancel={() => setConfirmModal(null)}
        onConfirm={handleDeleteAccountConfirm}
      />

      <PrivacyPolicyModal
        visible={privacyModalVisible}
        onClose={() => setPrivacyModalVisible(false)}
      />

      <NotificationSettingsModal
        visible={notificationSettingsVisible}
        onClose={() => setNotificationSettingsVisible(false)}
      />
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
  actionsCard: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  actionsDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.xs,
  },
  footer: {
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  footerBrand: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
  footerVersion: {
    ...Typography.caption,
    color: Colors.textLight,
  },
});
