import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { haptics } from '@/utils/haptics';

interface BackButtonProps {
  onPress: () => void;
  style?: ViewStyle;
  iconName?: keyof typeof Ionicons.glyphMap;
  size?: number;
}

export function BackButton({
  onPress,
  style,
  iconName = 'chevron-back',
  size = 20,
}: BackButtonProps) {
  const handlePress = () => {
    haptics.lightImpact();
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.button, style]}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons name={iconName} size={size} color={Colors.text} style={styles.icon} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginLeft: -1, // optical center for chevron-back
  },
});
