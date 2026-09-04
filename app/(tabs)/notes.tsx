import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabScreenHeader } from '@/components/TabScreenHeader';
import { useTabScreenInsets } from '@/hooks/useTabBarStyle';
import { useAuth } from '@/providers/AuthProvider';
import { useNotes } from '@/hooks/useNotes';
import { NoteCard } from '@/features/notes/NoteCard';
import { NoteFormModal, NoteFormData } from '@/components/NoteFormModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { toast } from '@/components/AppToast';
import { Button } from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';
import type { Note } from '@/types/dashboard';

export default function NotesScreen() {
  const tabInsets = useTabScreenInsets();
  const { session } = useAuth();
  const userId = session?.user.id;

  const [searchQuery, setSearchQuery] = useState('');
  const [noteForm, setNoteForm] = useState<
    { mode: 'create' } | { mode: 'edit'; note: Note } | null
  >(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  const {
    notes,
    isLoading,
    isError,
    isSaving,
    refetch,
    createNote,
    updateNote,
    togglePin,
    deleteNote,
  } = useNotes(userId);

  const filteredNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(q) ||
        note.content.toLowerCase().includes(q)
    );
  }, [notes, searchQuery]);

  const pinnedNotes = useMemo(
    () => filteredNotes.filter((note) => note.isPinned),
    [filteredNotes]
  );

  const otherNotes = useMemo(
    () => filteredNotes.filter((note) => !note.isPinned),
    [filteredNotes]
  );

  const closeNoteForm = () => setNoteForm(null);

  const handleCreateNote = async (data: NoteFormData) => {
    try {
      await createNote({
        title: data.title,
        content: data.content,
        emoji: data.emoji,
        isPinned: data.isPinned,
      });
      closeNoteForm();
      toast.success({ message: 'Note created' });
    } catch (error) {
      Alert.alert(
        'Could not create note',
        error instanceof Error ? error.message : 'Please try again.'
      );
    }
  };

  const handleUpdateNote = async (data: NoteFormData) => {
    if (!noteForm || noteForm.mode !== 'edit') return;

    try {
      await updateNote({
        id: noteForm.note.id,
        title: data.title,
        content: data.content,
        emoji: data.emoji,
        isPinned: data.isPinned,
      });
      closeNoteForm();
      toast.success({ message: 'Note updated' });
    } catch (error) {
      Alert.alert(
        'Could not update note',
        error instanceof Error ? error.message : 'Please try again.'
      );
    }
  };

  const handleFormSubmit = (data: NoteFormData) => {
    if (noteForm?.mode === 'create') {
      void handleCreateNote(data);
      return;
    }

    if (noteForm?.mode === 'edit') {
      void handleUpdateNote(data);
    }
  };

  const handleTogglePin = (id: string) => {
    const target = notes.find((item) => item.id === id);
    if (!target) return;
    togglePin(id);
    toast.info({
      message: target.isPinned ? 'Note unpinned' : 'Note pinned to top',
    });
  };

  const handleDeleteConfirm = async () => {
    if (!noteToDelete) return;

    try {
      await deleteNote(noteToDelete.id);
      setNoteToDelete(null);
      toast.success({ message: 'Note deleted' });
    } catch (error) {
      Alert.alert(
        'Could not delete note',
        error instanceof Error ? error.message : 'Please try again.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabInsets.paddingBottom }]}
        keyboardShouldPersistTaps="handled"
      >
        <TabScreenHeader title="Notes" subtitle="Your personal knowledge base" />

        {notes.length > 0 ? (
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={18} color={Colors.textLight} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search notes by keyword..."
              placeholderTextColor={Colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.clearSearchButton}
              >
                <Ionicons name="close-circle" size={18} color={Colors.textLight} />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        <View style={styles.topActionsRow}>
          <Button
            title="Add note"
            variant="primary"
            size="md"
            onPress={() => setNoteForm({ mode: 'create' })}
            style={styles.addButton}
          />
        </View>

        {isLoading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : null}

        {isError ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateText}>Could not load your notes.</Text>
            <TouchableOpacity onPress={() => refetch()} activeOpacity={0.7}>
              <Text style={styles.retryText}>Tap to retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!isLoading && !isError ? (
          notes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="document-text-outline" size={36} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No notes yet</Text>
              <Text style={styles.emptyText}>
                Jot down ideas, meeting notes, daily journal entries, or quick thoughts.
              </Text>
              <Button
                title="Create your first note"
                variant="outline"
                size="md"
                onPress={() => setNoteForm({ mode: 'create' })}
                style={styles.emptyActionButton}
              />
            </View>
          ) : filteredNotes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No matches found</Text>
              <Text style={styles.emptyText}>
                No notes match "{searchQuery}". Try a different keyword.
              </Text>
              <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                <Text style={styles.retryText}>Clear search</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.list}>
              {pinnedNotes.length > 0 ? (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="pin" size={14} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>Pinned</Text>
                  </View>
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onPress={(item) => setNoteForm({ mode: 'edit', note: item })}
                      onTogglePin={handleTogglePin}
                      onDelete={(item) => setNoteToDelete(item)}
                    />
                  ))}
                </View>
              ) : null}

              {otherNotes.length > 0 ? (
                <View style={styles.section}>
                  {pinnedNotes.length > 0 ? (
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Other Notes</Text>
                    </View>
                  ) : null}
                  {otherNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onPress={(item) => setNoteForm({ mode: 'edit', note: item })}
                      onTogglePin={handleTogglePin}
                      onDelete={(item) => setNoteToDelete(item)}
                    />
                  ))}
                </View>
              ) : null}
            </View>
          )
        ) : null}
      </ScrollView>

      {/* Create / Edit Note Modal */}
      <NoteFormModal
        visible={noteForm !== null}
        mode={noteForm?.mode ?? 'create'}
        initialTitle={noteForm?.mode === 'edit' ? noteForm.note.title : ''}
        initialContent={noteForm?.mode === 'edit' ? noteForm.note.content : ''}
        initialEmoji={noteForm?.mode === 'edit' ? noteForm.note.emoji : 'document-text-outline'}
        initialIsPinned={noteForm?.mode === 'edit' ? noteForm.note.isPinned : false}
        loading={isSaving}
        onClose={closeNoteForm}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={noteToDelete !== null}
        title="Delete note?"
        message={
          noteToDelete
            ? `"${noteToDelete.title}" will be permanently removed.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        loading={isSaving}
        onCancel={() => setNoteToDelete(null)}
        onConfirm={() => void handleDeleteConfirm()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.md,
    height: 44,
  },
  topActionsRow: {
    marginBottom: Spacing.lg,
  },
  addButton: {
    width: '100%',
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    paddingVertical: 0,
  },
  clearSearchButton: {
    padding: Spacing.xs,
  },
  list: {
    gap: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  stateContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  stateCard: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  stateText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  retryText: {
    ...Typography.bodyBold,
    color: Colors.primary,
    marginTop: Spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    maxWidth: 280,
  },
  emptyActionButton: {
    marginTop: Spacing.xs,
  },
});
