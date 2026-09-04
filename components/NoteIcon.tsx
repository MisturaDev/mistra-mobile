import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export interface NoteIconOption {
  key: string;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

export const NOTE_ICON_OPTIONS: NoteIconOption[] = [
  { key: 'document-text-outline', label: 'Document', iconName: 'document-text-outline' },
  { key: 'bulb-outline', label: 'Idea', iconName: 'bulb-outline' },
  { key: 'flag-outline', label: 'Goal', iconName: 'flag-outline' },
  { key: 'bookmark-outline', label: 'Bookmark', iconName: 'bookmark-outline' },
  { key: 'rocket-outline', label: 'Project', iconName: 'rocket-outline' },
  { key: 'book-outline', label: 'Study', iconName: 'book-outline' },
  { key: 'cafe-outline', label: 'Daily', iconName: 'cafe-outline' },
  { key: 'sparkles-outline', label: 'Highlight', iconName: 'sparkles-outline' },
  { key: 'briefcase-outline', label: 'Work', iconName: 'briefcase-outline' },
  { key: 'pricetag-outline', label: 'Tag', iconName: 'pricetag-outline' },
  { key: 'chatbubble-ellipses-outline', label: 'Thoughts', iconName: 'chatbubble-ellipses-outline' },
  { key: 'key-outline', label: 'Important', iconName: 'key-outline' },
  { key: 'fitness-outline', label: 'Health', iconName: 'fitness-outline' },
  { key: 'code-slash-outline', label: 'Code', iconName: 'code-slash-outline' },
  { key: 'cart-outline', label: 'Shopping', iconName: 'cart-outline' },
  { key: 'heart-outline', label: 'Favorite', iconName: 'heart-outline' },
];

const EMOJI_TO_ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  '📝': 'document-text-outline',
  '💡': 'bulb-outline',
  '🎯': 'flag-outline',
  '📌': 'bookmark-outline',
  '🚀': 'rocket-outline',
  '📚': 'book-outline',
  '☕': 'cafe-outline',
  '✨': 'sparkles-outline',
  '💼': 'briefcase-outline',
  '🏷️': 'pricetag-outline',
  '🏷': 'pricetag-outline',
  '💭': 'chatbubble-ellipses-outline',
  '🔑': 'key-outline',
  '💪': 'fitness-outline',
  '🛒': 'cart-outline',
  '❤️': 'heart-outline',
};

interface NoteIconProps {
  name?: string;
  size?: number;
  color?: string;
}

export function NoteIcon({ name = 'document-text-outline', size = 18, color = Colors.primary }: NoteIconProps) {
  // If it's a known emoji, map to Ionicons
  if (EMOJI_TO_ICON_MAP[name]) {
    return <Ionicons name={EMOJI_TO_ICON_MAP[name]} size={size} color={color} />;
  }

  // Check if valid key in Ionicons glyphMap
  if (name in Ionicons.glyphMap) {
    return <Ionicons name={name as keyof typeof Ionicons.glyphMap} size={size} color={color} />;
  }

  // If it's a custom emoji or unmapped string, render as text
  return <Text style={{ fontSize: size * 0.9 }}>{name}</Text>;
}
