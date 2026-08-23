import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/constants/theme';

interface ProfileMenuRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  showChevron?: boolean;
}

export function ProfileMenuRow({
  icon,
  label,
  value,
  onPress,
  destructive = false,
  showChevron = true,
}: ProfileMenuRowProps) {
  const color = destructive ? Colors.error : Colors.text;
  const iconColor = destructive ? Colors.error : Colors.primary;

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={[styles.iconWrap, destructive && styles.iconWrapDestructive]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.label, { color }]}>{label}</Text>
        {value ? <Text style={styles.value}>{value}</Text> : null}
      </View>

      {showChevron && onPress ? (
        <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapDestructive: {
    backgroundColor: Colors.errorLight,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  label: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  value: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});
