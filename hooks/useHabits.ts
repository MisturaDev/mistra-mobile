import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Habit, HabitRow } from '@/types/dashboard';

function mapHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    streak: row.streak,
    completed: row.completed_today,
  };
}

async function fetchHabits(userId: string): Promise<Habit[]> {
  const { data, error } = await supabase
    .from('habits')
    .select('id, name, streak, completed_today')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapHabit);
}

export function useHabits(userId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = ['habits', userId] as const;

  const query = useQuery({
    queryKey,
    queryFn: () => fetchHabits(userId!),
    enabled: !!userId,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({
      id,
      completed,
      streak,
    }: {
      id: string;
      completed: boolean;
      streak: number;
    }) => {
      const { error } = await supabase
        .from('habits')
        .update({ completed_today: completed, streak })
        .eq('id', id);

      if (error) throw error;
    },
    onMutate: async ({ id, completed, streak }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Habit[]>(queryKey);
      queryClient.setQueryData<Habit[]>(queryKey, (current) =>
        current?.map((habit) =>
          habit.id === id ? { ...habit, completed, streak } : habit
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

  const toggleHabit = (id: string) => {
    const habit = query.data?.find((item) => item.id === id);
    if (!habit || toggleMutation.isPending) return;

    const wasCompleted = habit.completed;
    toggleMutation.mutate({
      id,
      completed: !wasCompleted,
      streak: wasCompleted ? Math.max(0, habit.streak - 1) : habit.streak + 1,
    });
  };

  return {
    habits: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    toggleHabit,
  };
}
