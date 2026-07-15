import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export interface TaskItemProps {
  id: string;
  title: string;
  completed: boolean;
  onToggle: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  id,
  title,
  completed,
  onToggle,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onToggle(id)}
      style={[
        styles.container,
        {
          borderColor: completed ? Colors.borderLight : Colors.border,
          backgroundColor: completed ? Colors.surface : Colors.white,
        },
      ]}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: completed ? Colors.primary : Colors.textLight,
            backgroundColor: completed ? Colors.primary : 'transparent',
          },
        ]}
      >
        {completed && (
          <Ionicons name="checkmark" size={14} color={Colors.white} />
        )}
      </View>
      <Text
        style={[
          styles.title,
          {
            color: completed ? Colors.textSecondary : Colors.text,
            textDecorationLine: completed ? 'line-through' : 'none',
          },
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    alignSelf: 'stretch',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  title: {
    ...Typography.body,
    fontWeight: '500',
    flex: 1,
  },
});
