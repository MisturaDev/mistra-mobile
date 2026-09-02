import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { CalendarEvent, CalendarEventRow, EventCategory } from '@/types/dashboard';

export interface CreateEventInput {
  title: string;
  description?: string;
  eventDate: string; // YYYY-MM-DD
  startTime?: string | null;
  endTime?: string | null;
  category?: EventCategory;
  color?: string;
  isAllDay?: boolean;
}

export interface UpdateEventInput {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  startTime?: string | null;
  endTime?: string | null;
  category?: EventCategory;
  color?: string;
  isAllDay?: boolean;
}

function mapEvent(row: CalendarEventRow): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    eventDate: row.event_date,
    startTime: row.start_time ?? null,
    endTime: row.end_time ?? null,
    category: (row.category as EventCategory) || 'general',
    color: row.color || '#7C3AED',
    isAllDay: !!row.is_all_day,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchEvents(userId: string): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select('id, user_id, title, description, event_date, start_time, end_time, category, color, is_all_day, created_at, updated_at')
    .eq('user_id', userId)
    .order('event_date', { ascending: true })
    .order('start_time', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return (data ?? []).map(mapEvent);
}

export function useEvents(userId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = ['events', userId] as const;

  const query = useQuery({
    queryKey,
    queryFn: () => fetchEvents(userId!),
    enabled: !!userId,
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateEventInput) => {
      if (!userId) throw new Error('You must be signed in to add events.');

      const { data, error } = await supabase
        .from('events')
        .insert({
          user_id: userId,
          title: input.title,
          description: input.description ?? '',
          event_date: input.eventDate,
          start_time: input.startTime ?? null,
          end_time: input.endTime ?? null,
          category: input.category || 'general',
          color: input.color || '#7C3AED',
          is_all_day: input.isAllDay ?? false,
          updated_at: new Date().toISOString(),
        })
        .select('id, user_id, title, description, event_date, start_time, end_time, category, color, is_all_day, created_at, updated_at')
        .single();

      if (error) throw error;
      return mapEvent(data);
    },
    onSuccess: (newEvent) => {
      queryClient.setQueryData<CalendarEvent[]>(queryKey, (current) => [...(current ?? []), newEvent]);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (input: UpdateEventInput) => {
      const updates: Partial<CalendarEventRow> = {
        title: input.title,
        event_date: input.eventDate,
        updated_at: new Date().toISOString(),
      };
      if (input.description !== undefined) updates.description = input.description;
      if (input.startTime !== undefined) updates.start_time = input.startTime;
      if (input.endTime !== undefined) updates.end_time = input.endTime;
      if (input.category) updates.category = input.category;
      if (input.color) updates.color = input.color;
      if (input.isAllDay !== undefined) updates.is_all_day = input.isAllDay;

      const { error } = await supabase.from('events').update(updates).eq('id', input.id);
      if (error) throw error;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CalendarEvent[]>(queryKey);
      queryClient.setQueryData<CalendarEvent[]>(queryKey, (current) =>
        current?.map((ev) =>
          ev.id === input.id
            ? {
                ...ev,
                title: input.title,
                description: input.description !== undefined ? input.description : ev.description,
                eventDate: input.eventDate,
                startTime: input.startTime !== undefined ? input.startTime : ev.startTime,
                endTime: input.endTime !== undefined ? input.endTime : ev.endTime,
                category: input.category || ev.category,
                color: input.color || ev.color,
                isAllDay: input.isAllDay !== undefined ? input.isAllDay : ev.isAllDay,
                updatedAt: new Date().toISOString(),
              }
            : ev
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CalendarEvent[]>(queryKey);
      queryClient.setQueryData<CalendarEvent[]>(
        queryKey,
        (current) => current?.filter((ev) => ev.id !== id) ?? []
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

  const createEvent = (input: CreateEventInput) => createMutation.mutateAsync(input);
  const updateEvent = (input: UpdateEventInput) => updateMutation.mutateAsync(input);
  const deleteEvent = (id: string) => deleteMutation.mutateAsync(id);

  return {
    events: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    isSaving: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    refetch: query.refetch,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
