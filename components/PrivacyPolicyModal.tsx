import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { Button } from '@/components/Button';

interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ visible, onClose }: PrivacyPolicyModalProps) {
  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@mistra.app?subject=Privacy%20Policy%20Inquiry');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>Privacy Policy</Text>
            <Text style={styles.subtitle}>Effective & Updated: September 2026</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Overview & Commitment</Text>
            <Text style={styles.paragraph}>
              At <Text style={styles.bold}>Mistra</Text>, your privacy is our top priority. We
              design our productivity app to help you stay organized without compromising your personal
              data. We never sell, rent, or monetize your workspace content to third parties or
              advertisers.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Information We Collect</Text>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>• Account Details: </Text>
              Your name and email address used for authentication and account security. Passwords are
              always cryptographically hashed.
            </Text>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>• Your Workspace Content: </Text>
              Your tasks, subtasks, habits, notes, calendar events, due dates, and tags. This data is
              stored securely in your private, isolated account database.
            </Text>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>• Device & Notifications: </Text>
              Device tokens used exclusively to send your scheduled reminders and push notifications
              when enabled.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. How We Use Your Data</Text>
            <Text style={styles.paragraph}>
              We use your information strictly to:
              {'\n'}• Provide and maintain your personal workspace
              {'\n'}• Seamlessly sync your data across your devices
              {'\n'}• Deliver task, habit, and calendar notifications you request
              {'\n'}• Provide customer support and diagnose technical issues
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Data Security & Storage</Text>
            <Text style={styles.paragraph}>
              All data is transmitted via encrypted HTTPS (TLS 1.3) protocols and stored in secure
              cloud databases protected with strict Row Level Security (RLS) policies, ensuring only
              your authenticated account can read or write your workspace records.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Data Ownership & Deletion</Text>
            <Text style={styles.paragraph}>
              You retain full ownership of your data at all times. You can edit, export, or permanently
              delete your account and all associated data directly in your Profile settings or by
              contacting support.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. GDPR & CCPA Compliance</Text>
            <Text style={styles.paragraph}>
              We respect your global privacy rights, including rights to access, rectification, data
              portability, and erasure of personal information.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Contact Us</Text>
            <Text style={styles.paragraph}>
              If you have any questions or feedback regarding our privacy practices, please contact us:
            </Text>
            <TouchableOpacity onPress={handleEmailSupport} activeOpacity={0.7} style={styles.emailBadge}>
              <Ionicons name="mail-outline" size={16} color={Colors.primary} />
              <Text style={styles.contactEmail}>support@mistra.app</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonWrap}>
            <Button title="Got it, thanks" variant="primary" size="lg" onPress={onClose} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTextWrap: {
    gap: 2,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.title,
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  paragraph: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
    fontSize: 14,
  },
  bold: {
    fontWeight: '600',
    color: Colors.text,
  },
  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  contactEmail: {
    color: Colors.primaryDark,
    fontWeight: '700',
    fontSize: 14,
  },
  buttonWrap: {
    marginTop: Spacing.md,
  },
});
