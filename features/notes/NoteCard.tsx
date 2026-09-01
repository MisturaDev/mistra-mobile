import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/Card';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import type { Note } from '@/types/dashboard';

interface NoteCardProps {
  note: Note;
  onPress: (note: Note) => void;
  onTogglePin: (id: string) => void;
  onDelete: (note: Note) => void;
}

function formatNoteDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24 && now.getDate() === date.getDate()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diffDays === 1 || (diffHours < 48 && now.getDate() - date.getDate() === 1)) {
      return 'Yesterday';
    }
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

export function NoteCard({ note, onPress, onTogglePin, onDelete }: NoteCardProps) {
  const formattedDate = formatNoteDate(note.updatedAt || note.createdAt);

  return (
    <Card style={styles.card} padded elevation="none" bordered={false}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onPress(note)}
        style={styles.touchArea}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.emoji}>{note.emoji || '📝'}</Text>
            <Text style={styles.title} numberOfLines={1}>
              {note.title}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => onTogglePin(note.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
              style={[styles.pinButton, note.isPinned && styles.pinButtonActive]}
              accessibilityRole="button"
              accessibilityLabel={note.isPinned ? 'Unpin note' : 'Pin note'}
            >
              <Ionicons
                name={note.isPinned ? 'pin' : 'pin-outline'}
                size={16}
                color={note.isPinned ? Colors.primary : Colors.textLight}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onDelete(note)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
              style={styles.deleteButton}
              accessibilityRole="button"
              accessibilityLabel="Delete note"
            >
              <Ionicons name="trash-outline" size={16} color={Colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        {note.content ? (
          <Text style={styles.content} numberOfLines={3}>
            {note.content}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          {note.isPinned ? (
            <View style={styles.pinnedBadge}>
              <Ionicons name="pin" size={10} color={Colors.primary} />
              <Text style={styles.pinnedBadgeText}>Pinned</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    marginBottom: Spacing.md,
    borderRadius: Radius.lg,
  },
  touchArea: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emoji: {
    fontSize: 18,
  },
  title: {
    ...Typography.title,
    color: Colors.text,
    flex: 1,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pinButton: {
    padding: Spacing.xs,
    borderRadius: Radius.full,
  },
  pinButtonActive: {
    backgroundColor: Colors.primaryLight,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  content: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  dateText: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  pinnedBadgeText: {
    ...Typography.captionBold,
    color: Colors.primary,
    fontSize: 10,
  },
});
