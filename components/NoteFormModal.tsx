import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetWrapper } from '@/components/BottomSheetWrapper';

export interface NoteFormData {
  title: string;
  content: string;
  emoji: string;
  isPinned: boolean;
}

interface NoteFormModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  initialTitle?: string;
  initialContent?: string;
  initialEmoji?: string;
  initialIsPinned?: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: NoteFormData) => void;
}

export function NoteFormModal({
  visible,
  mode,
  initialTitle = '',
  initialContent = '',
  initialEmoji = 'document-text-outline',
  initialIsPinned = false,
  loading = false,
  onClose,
  onSubmit,
}: NoteFormModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isPinned, setIsPinned] = useState(initialIsPinned);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setTitle(initialTitle);
      setContent(initialContent);
      setIsPinned(initialIsPinned);
      setError('');
    }
  }, [visible, initialTitle, initialContent, initialIsPinned]);

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Enter a note title');
      return;
    }

    onSubmit({
      title: trimmedTitle,
      content: content.trim(),
      emoji: initialEmoji || 'document-text-outline',
      isPinned,
    });
  };

  const headerRightElement = (
    <TouchableOpacity
      onPress={() => setIsPinned(!isPinned)}
      style={[styles.pinToggle, isPinned && styles.pinToggleActive]}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={isPinned ? 'Unpin note' : 'Pin note to top'}
    >
      <Ionicons
        name={isPinned ? 'pin' : 'pin-outline'}
        size={14}
        color={isPinned ? Colors.primary : Colors.textSecondary}
      />
      <Text style={[styles.pinToggleText, isPinned && styles.pinToggleTextActive]}>
        {isPinned ? 'Pinned' : 'Pin'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <BottomSheetWrapper
      visible={visible}
      onClose={onClose}
      title={mode === 'create' ? 'New Note' : 'Edit Note'}
      subtitle={mode === 'create' ? 'Capture quick thoughts, ideas, or references' : 'Update note content'}
      headerRight={headerRightElement}
      loading={loading}
      scrollable
      maxHeight="92%"
    >
      {/* Title Input */}
      <Input
        label="Title"
        placeholder="Give your note a name..."
        value={title}
        onChangeText={(val) => {
          setTitle(val);
          if (error) setError('');
        }}
        error={error}
        disabled={loading}
        autoFocus={mode === 'create'}
      />

      {/* Content Multiline Area */}
      <View style={styles.contentSection}>
        <Text style={styles.contentLabel}>Notes & Details</Text>
        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            placeholder="Write your thoughts, checklist, or ideas..."
            placeholderTextColor={Colors.textLight}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={content}
            onChangeText={setContent}
            editable={!loading}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          title="Cancel"
          variant="outline"
          size="md"
          onPress={onClose}
          disabled={loading}
          style={styles.actionButton}
        />
        <Button
          title={mode === 'create' ? 'Create Note' : 'Save Changes'}
          variant="primary"
          size="md"
          loading={loading}
          onPress={handleSubmit}
          style={styles.actionButton}
        />
      </View>
    </BottomSheetWrapper>
  );
}

const styles = StyleSheet.create({
  pinToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 4,
  },
  pinToggleActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryMuted,
  },
  pinToggleText: {
    ...Typography.captionBold,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  pinToggleTextActive: {
    color: Colors.primary,
  },
  contentSection: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  contentLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textAreaContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    minHeight: 120,
  },
  textArea: {
    ...Typography.body,
    color: Colors.text,
    minHeight: 100,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  actionButton: {
    flex: 1,
  },
});
