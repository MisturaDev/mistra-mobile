import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { Logo } from '@/components/Logo';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export function AuthHeader({ title, subtitle, onBack }: AuthHeaderProps) {
  return (
    <View style={styles.container}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.backPlaceholder} />
      )}

      <Logo size="sm" style={styles.logo} />

      <View style={styles.titleSection}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  backButton: {
    paddingVertical: Spacing.sm,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  backPlaceholder: {
    height: 40,
  },
  logo: {
    marginBottom: Spacing.lg,
  },
  titleSection: {
    gap: Spacing.xs,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
  },
  subtitle: {
    ...Typography.subtitle,
    color: Colors.textSecondary,
    fontWeight: '400',
    lineHeight: 22,
  },
});
