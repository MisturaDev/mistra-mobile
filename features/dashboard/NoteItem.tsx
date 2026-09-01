import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/Card';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';

export interface NoteItemProps {
  id?: string;
  title: string;
  snippet: string;
  updatedAt: string;
  emoji?: string;
  onPress?: () => void;
}

export const NoteItem: React.FC<NoteItemProps> = ({
  title,
  snippet,
  updatedAt,
  emoji = '📝',
  onPress,
}) => {
  return (
    <Card style={styles.card} padded bordered elevation="none">
      <TouchableOpacity
        activeOpacity={onPress ? 0.7 : 1}
        onPress={onPress}
        disabled={!onPress}
        style={styles.touchable}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.titleText} numberOfLines={1}>
              {title}
            </Text>
          </View>
          <Text style={styles.timeText}>{updatedAt}</Text>
        </View>
        {snippet ? (
          <Text style={styles.snippetText} numberOfLines={2}>
            {snippet}
          </Text>
        ) : null}
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.sm,
    borderRadius: Radius.lg,
  },
  touchable: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  emoji: {
    fontSize: 16,
  },
  titleText: {
    ...Typography.bodyBold,
    color: Colors.text,
    flex: 1,
  },
  timeText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11,
  },
  snippetText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
});
