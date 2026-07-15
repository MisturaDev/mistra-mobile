import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '@/constants/theme';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padded?: boolean;
  bordered?: boolean;
  elevation?: keyof typeof Shadows;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  padded = true,
  bordered = true,
  elevation = 'sm',
}) => {
  const cardStyle: ViewStyle = {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: bordered ? 1 : 0,
    borderColor: Colors.borderLight,
    padding: padded ? Spacing.lg : 0,
    ...Shadows[elevation],
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={[styles.base, cardStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.base, cardStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
});
