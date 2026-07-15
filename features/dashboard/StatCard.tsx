import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Card } from '@/components/Card';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export interface StatCardProps {
  title: string;
  value: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  iconName,
  iconColor = Colors.primary,
  style,
}) => {
  return (
    <Card style={[styles.card, style]} padded bordered={false} elevation="sm">
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
          <Ionicons name={iconName} size={20} color={iconColor} />
        </View>
      </View>
      <Text style={styles.valueText}>{value}</Text>
      <Text style={styles.titleText}>{title}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 100,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    padding: Spacing.sm,
    borderRadius: 8,
  },
  valueText: {
    ...Typography.h2,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  titleText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
