import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Note, NoteRow } from '@/types/dashboard';

export interface CreateNoteInput {
  title: string;
  content?: string;
  emoji?: string;
  isPinned?: boolean;
}

export interface UpdateNoteInput {
  id: string;
  title: string;
  content?: string;
  emoji?: string;
  isPinned?: boolean;
}

function mapNote(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content ?? '',
    emoji: row.emoji || 'document-text-outline',
    isPinned: row.is_pinned ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchNotes(userId: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('id, user_id, title, content, emoji, is_pinned, created_at, updated_at')
    .eq('user_id', userId)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapNote);
}

export function useNotes(userId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = ['notes', userId] as const;

  const query = useQuery({
    queryKey,
    queryFn: () => fetchNotes(userId!),
    enabled: !!userId,
  });

  const createMutation = useMutation({
    mutationFn: async ({
      title,
      content = '',
      emoji = 'document-text-outline',
      isPinned = false,
    }: CreateNoteInput) => {
      if (!userId) throw new Error('You must be signed in to add notes.');

      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: userId,
          title,
          content,
          emoji,
          is_pinned: isPinned,
          updated_at: new Date().toISOString(),
        })
        .select('id, user_id, title, content, emoji, is_pinned, created_at, updated_at')
        .single();

      if (error) throw error;
      return mapNote(data);
    },
    onSuccess: (newNote) => {
      queryClient.setQueryData<Note[]>(queryKey, (current) => [newNote, ...(current ?? [])]);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, title, content = '', emoji = 'document-text-outline', isPinned }: UpdateNoteInput) => {
      const updates: Partial<NoteRow> = {
        title,
        content,
        emoji,
        updated_at: new Date().toISOString(),
      };
      if (typeof isPinned === 'boolean') {
        updates.is_pinned = isPinned;
      }

      const { error } = await supabase.from('notes').update(updates).eq('id', id);
      if (error) throw error;
    },
    onMutate: async ({ id, title, content = '', emoji = 'document-text-outline', isPinned }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Note[]>(queryKey);
      queryClient.setQueryData<Note[]>(queryKey, (current) =>
        current?.map((note) =>
          note.id === id
            ? {
                ...note,
                title,
                content,
                emoji,
                isPinned: typeof isPinned === 'boolean' ? isPinned : note.isPinned,
                updatedAt: new Date().toISOString(),
              }
            : note
        ) ?? []
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: async ({ id, isPinned }: { id: string; isPinned: boolean }) => {
      const { error } = await supabase
        .from('notes')
        .update({ is_pinned: isPinned, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onMutate: async ({ id, isPinned }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Note[]>(queryKey);
      queryClient.setQueryData<Note[]>(queryKey, (current) =>
        current
          ?.map((note) => (note.id === id ? { ...note, isPinned } : note))
          .sort((a, b) => {
            if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          }) ?? []
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Note[]>(queryKey);
      queryClient.setQueryData<Note[]>(
        queryKey,
        (current) => current?.filter((note) => note.id !== id) ?? []
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const togglePin = (id: string) => {
    const note = query.data?.find((item) => item.id === id);
    if (!note || togglePinMutation.isPending) return;
    togglePinMutation.mutate({ id, isPinned: !note.isPinned });
  };

  const createNote = (input: CreateNoteInput) => createMutation.mutateAsync(input);
  const updateNote = (input: UpdateNoteInput) => updateMutation.mutateAsync(input);
  const deleteNote = (id: string) => deleteMutation.mutateAsync(id);

  return {
    notes: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    isSaving:
      createMutation.isPending ||
      updateMutation.isPending ||
      togglePinMutation.isPending ||
      deleteMutation.isPending,
    refetch: query.refetch,
    createNote,
    updateNote,
    togglePin,
    deleteNote,
  };
}
