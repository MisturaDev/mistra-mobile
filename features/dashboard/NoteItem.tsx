import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/Card';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export interface NoteItemProps {
  title: string;
  snippet: string;
  updatedAt: string;
  emoji?: string;
}

export const NoteItem: React.FC<NoteItemProps> = ({
  title,
  snippet,
  updatedAt,
  emoji = '📝',
}) => {
  return (
    <Card style={styles.card} padded bordered elevation="none">
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={styles.titleText}>{title}</Text>
        </View>
        <Text style={styles.timeText}>{updatedAt}</Text>
      </View>
      <Text style={styles.snippetText} numberOfLines={2}>
        {snippet}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  emoji: {
    fontSize: 16,
  },
  titleText: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  timeText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  snippetText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});
