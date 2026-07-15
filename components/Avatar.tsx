import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType, ViewStyle } from 'react-native';
import { Colors, Radius, Typography } from '@/constants/theme';

export interface AvatarProps {
  source?: ImageSourcePropType;
  name?: string;
  size?: number;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name = '',
  size = 48,
  style,
}) => {
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    if (parts.length === 0 || !parts[0]) return 'M';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    ...(style as object),
  };

  if (source) {
    return (
      <Image
        source={source}
        style={[styles.image, containerStyle]}
        resizeMode="cover"
      />
    );
  }

  // Fallback with initials
  const initials = getInitials(name);
  const fontSize = size * 0.4;

  return (
    <View style={[styles.fallbackContainer, containerStyle]}>
      <Text style={[styles.initialsText, { fontSize }]}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: Colors.surface,
  },
  fallbackContainer: {
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    ...Typography.subtitle,
    color: Colors.primary,
    fontWeight: '600',
  },
});
