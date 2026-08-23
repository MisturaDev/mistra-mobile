import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '@/constants/theme';

export interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  editable?: boolean;
  onPress?: () => void;
  showRing?: boolean;
}

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({
  uri,
  name = '',
  size = 48,
  style,
  editable = false,
  onPress,
  showRing = false,
}: AvatarProps) {
  const initials = getInitials(name);
  const fontSize = Math.max(12, size * 0.36);
  const iconSize = Math.max(20, size * 0.42);
  const ringSize = size + (showRing ? 8 : 0);
  const badgeSize = Math.max(24, size * 0.3);

  const content = uri ? (
    <Image source={{ uri }} style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]} contentFit="cover" />
  ) : initials ? (
    <View style={[styles.fallbackContainer, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initialsText, { fontSize }]}>{initials}</Text>
    </View>
  ) : (
    <View style={[styles.fallbackContainer, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name="person" size={iconSize} color={Colors.primary} />
    </View>
  );

  const avatarBody = (
    <View
      style={[
        styles.wrapper,
        showRing && styles.ring,
        {
          width: ringSize,
          height: ringSize,
          borderRadius: ringSize / 2,
        },
        style,
      ]}
    >
      {content}
      {editable ? (
        <View
          style={[
            styles.editBadge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              right: showRing ? 0 : -2,
              bottom: showRing ? 0 : -2,
            },
          ]}
        >
          <Ionicons name="camera" size={badgeSize * 0.48} color={Colors.white} />
        </View>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Profile"
      >
        {avatarBody}
      </TouchableOpacity>
    );
  }

  return avatarBody;
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ring: {
    backgroundColor: Colors.white,
    ...Shadows.sm,
  },
  image: {
    backgroundColor: Colors.surface,
  },
  fallbackContainer: {
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryMuted,
  },
  initialsText: {
    ...Typography.subtitle,
    color: Colors.primary,
    fontWeight: '700',
  },
  editBadge: {
    position: 'absolute',
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
});
