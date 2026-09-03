import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { Logo } from '@/components/Logo';
import { BackButton } from '@/components/BackButton';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export function AuthHeader({ title, subtitle, onBack }: AuthHeaderProps) {
  return (
    <View style={styles.container}>
      {onBack ? (
        <BackButton onPress={onBack} style={styles.backButton} />
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
    marginBottom: Spacing.md,
  },
  backPlaceholder: {
    height: 40,
    marginBottom: Spacing.md,
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
