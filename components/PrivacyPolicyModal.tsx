import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { Button } from '@/components/Button';

interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ visible, onClose }: PrivacyPolicyModalProps) {
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
            <Text style={styles.subtitle}>Last updated: March 2026</Text>
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
            <Text style={styles.sectionTitle}>1. Introduction</Text>
            <Text style={styles.paragraph}>
              Welcome to Mistra. We value your trust and are committed to protecting your personal
              information and privacy. This Privacy Policy explains how we collect, use, and safe-guard
              your information when you use our mobile application.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Information We Collect</Text>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>Account Information: </Text>
              When you create an account, we collect your name and email address to authenticate you
              and sync your data across devices.
            </Text>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>Your Productivity Data: </Text>
              Your tasks, habits, notes, calendar events, and reminders are securely stored in your
              encrypted private account database and are never shared or sold to third parties.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
            <Text style={styles.paragraph}>
              We use your information solely to:
              {'\n'}• Provide, operate, and maintain your personal workspace
              {'\n'}• Sync your tasks, habits, notes, and events across devices
              {'\n'}• Send essential security and reminder notifications (if enabled)
              {'\n'}• Respond to customer support requests
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Data Security</Text>
            <Text style={styles.paragraph}>
              We implement industry-standard encryption protocols (SSL/TLS in transit and encrypted
              at rest) to safeguard your personal information against unauthorized access, disclosure,
              or loss.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Your Rights & Data Control</Text>
            <Text style={styles.paragraph}>
              You have full ownership of your data. You can export, modify, or permanently delete
              your account and all associated data at any time from your Profile settings.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Contact Us</Text>
            <Text style={styles.paragraph}>
              If you have any questions or concerns regarding this Privacy Policy, please contact us
              at:
              {'\n'}
              <Text style={styles.contactEmail}>support@mistra.app</Text>
            </Text>
          </View>

          <View style={styles.buttonWrap}>
            <Button title="Done" variant="primary" size="lg" onPress={onClose} />
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
  contactEmail: {
    color: Colors.primary,
    fontWeight: '600',
  },
  buttonWrap: {
    marginTop: Spacing.md,
  },
});
