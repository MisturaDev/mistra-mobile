import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export interface ScheduleItemProps {
  time: string;
  title: string;
  category: string;
  categoryColor?: string;
}

export const ScheduleItem: React.FC<ScheduleItemProps> = ({
  time,
  title,
  category,
  categoryColor = Colors.primary,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.timeColumn}>
        <Text style={styles.timeText}>{time}</Text>
      </View>
      <View style={[styles.indicator, { backgroundColor: categoryColor }]} />
      <View style={styles.details}>
        <Text style={styles.titleText}>{title}</Text>
        <Text style={styles.categoryText}>{category}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    alignSelf: 'stretch',
  },
  timeColumn: {
    width: 70,
  },
  timeText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  indicator: {
    width: 4,
    height: 32,
    borderRadius: Radius.xs,
    marginRight: Spacing.md,
  },
  details: {
    flex: 1,
  },
  titleText: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  categoryText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
