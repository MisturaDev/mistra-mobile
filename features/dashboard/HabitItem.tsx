import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export interface HabitItemProps {
  id: string;
  name: string;
  streak: number;
  completed: boolean;
  onToggle: (id: string) => void;
}

export const HabitItem: React.FC<HabitItemProps> = ({
  id,
  name,
  streak,
  completed,
  onToggle,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.streakRow}>
          <Ionicons name="flame" size={16} color="#F59E0B" style={styles.flameIcon} />
          <Text style={styles.streakText}>{streak} day streak</Text>
        </View>
      </View>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onToggle(id)}
        style={[
          styles.actionBtn,
          {
            backgroundColor: completed ? Colors.successLight : Colors.primaryLight,
          },
        ]}
      >
        <Ionicons
          name={completed ? 'checkmark-circle' : 'add'}
          size={20}
          color={completed ? Colors.success : Colors.primary}
        />
        <Text
          style={[
            styles.actionText,
            {
              color: completed ? Colors.success : Colors.primary,
            },
          ]}
        >
          {completed ? 'Done' : 'Log'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.sm,
    alignSelf: 'stretch',
  },
  info: {
    flex: 1,
    marginRight: Spacing.md,
  },
  name: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flameIcon: {
    marginRight: Spacing.xs,
  },
  streakText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    gap: Spacing.xs,
  },
  actionText: {
    ...Typography.captionBold,
    fontSize: 11,
  },
});
