import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { haptics } from '@/utils/haptics';
import type { Goal, GoalCategory, GoalStatus, GoalRow } from '@/types/dashboard';

export interface CreateGoalInput {
  title: string;
  description?: string;
  category?: GoalCategory;
  targetDate?: string | null;
  targetValue: number;
  currentValue?: number;
  unit?: string;
  color?: string;
}

export interface UpdateGoalInput {
  id: string;
  title?: string;
  description?: string;
  category?: GoalCategory;
  targetDate?: string | null;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  status?: GoalStatus;
  color?: string;
}

function mapGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    category: (row.category as GoalCategory) || 'personal',
    targetDate: row.target_date ?? null,
    currentValue: Number(row.current_value) || 0,
    targetValue: Number(row.target_value) || 100,
    unit: row.unit || '%',
    status: (row.status as GoalStatus) || 'in_progress',
    color: row.color || '#7C3AED',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchGoals(userId: string): Promise<Goal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('id, user_id, title, description, category, target_date, current_value, target_value, unit, status, color, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapGoal);
}

export function useGoals(userId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = ['goals', userId] as const;

  const query = useQuery({
    queryKey,
    queryFn: () => fetchGoals(userId!),
    enabled: !!userId,
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateGoalInput) => {
      if (!userId) throw new Error('You must be signed in to create goals.');

      const targetValue = input.targetValue > 0 ? input.targetValue : 100;
      const currentValue = input.currentValue ?? 0;
      const status: GoalStatus = currentValue >= targetValue ? 'completed' : 'in_progress';

      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: userId,
          title: input.title.trim(),
          description: input.description?.trim() ?? '',
          category: input.category || 'personal',
          target_date: input.targetDate ?? null,
          target_value: targetValue,
          current_value: currentValue,
          unit: input.unit || '%',
          status,
          color: input.color || '#7C3AED',
          updated_at: new Date().toISOString(),
        })
        .select('id, user_id, title, description, category, target_date, current_value, target_value, unit, status, color, created_at, updated_at')
        .single();

      if (error) throw error;
      return mapGoal(data);
    },
    onSuccess: (newGoal) => {
      queryClient.setQueryData<Goal[]>(queryKey, (current) => [newGoal, ...(current ?? [])]);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (input: UpdateGoalInput) => {
      const updates: Partial<GoalRow> = {
        updated_at: new Date().toISOString(),
      };
      if (input.title !== undefined) updates.title = input.title.trim();
      if (input.description !== undefined) updates.description = input.description.trim();
      if (input.category !== undefined) updates.category = input.category;
      if (input.targetDate !== undefined) updates.target_date = input.targetDate;
      if (input.targetValue !== undefined) updates.target_value = input.targetValue;
      if (input.currentValue !== undefined) updates.current_value = input.currentValue;
      if (input.unit !== undefined) updates.unit = input.unit;
      if (input.status !== undefined) updates.status = input.status;
      if (input.color !== undefined) updates.color = input.color;

      const { error } = await supabase.from('goals').update(updates).eq('id', input.id);
      if (error) throw error;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Goal[]>(queryKey);
      queryClient.setQueryData<Goal[]>(queryKey, (current) =>
        current?.map((goal) => {
          if (goal.id !== input.id) return goal;
          const nextTarget = input.targetValue !== undefined ? input.targetValue : goal.targetValue;
          const nextCurrent = input.currentValue !== undefined ? input.currentValue : goal.currentValue;
          const derivedStatus: GoalStatus =
            input.status !== undefined
              ? input.status
              : nextCurrent >= nextTarget
              ? 'completed'
              : 'in_progress';

          return {
            ...goal,
            title: input.title !== undefined ? input.title : goal.title,
            description: input.description !== undefined ? input.description : goal.description,
            category: input.category || goal.category,
            targetDate: input.targetDate !== undefined ? input.targetDate : goal.targetDate,
            targetValue: nextTarget,
            currentValue: nextCurrent,
            unit: input.unit !== undefined ? input.unit : goal.unit,
            status: derivedStatus,
            color: input.color || goal.color,
            updatedAt: new Date().toISOString(),
          };
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

  const updateProgressMutation = useMutation({
    mutationFn: async ({ id, newValue }: { id: string; newValue: number }) => {
      const goal = query.data?.find((g) => g.id === id);
      const target = goal?.targetValue || 100;
      const status: GoalStatus = newValue >= target ? 'completed' : 'in_progress';

      const { error } = await supabase
        .from('goals')
        .update({
          current_value: newValue,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onMutate: async ({ id, newValue }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Goal[]>(queryKey);
      queryClient.setQueryData<Goal[]>(queryKey, (current) =>
        current?.map((goal) => {
          if (goal.id !== id) return goal;
          const status: GoalStatus = newValue >= goal.targetValue ? 'completed' : 'in_progress';
          return {
            ...goal,
            currentValue: newValue,
            status,
            updatedAt: new Date().toISOString(),
          };
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
      const { error } = await supabase.from('goals').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Goal[]>(queryKey);
      queryClient.setQueryData<Goal[]>(queryKey, (current) =>
        current?.filter((goal) => goal.id !== id) ?? []
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

  const createGoal = (input: CreateGoalInput) => {
    haptics.mediumImpact();
    return createMutation.mutateAsync(input);
  };

  const updateGoal = (input: UpdateGoalInput) => {
    haptics.lightImpact();
    return updateMutation.mutateAsync(input);
  };

  const updateProgress = (id: string, newValue: number) => {
    const goal = query.data?.find((g) => g.id === id);
    if (goal && newValue >= goal.targetValue && goal.status !== 'completed') {
      haptics.notificationSuccess();
    } else {
      haptics.selection();
    }
    return updateProgressMutation.mutateAsync({ id, newValue });
  };

  const toggleComplete = (id: string) => {
    const goal = query.data?.find((g) => g.id === id);
    if (!goal) return;
    const nextStatus: GoalStatus = goal.status === 'completed' ? 'in_progress' : 'completed';
    const nextValue = nextStatus === 'completed' ? goal.targetValue : Math.min(goal.currentValue, goal.targetValue - 1);
    
    if (nextStatus === 'completed') {
      haptics.notificationSuccess();
    } else {
      haptics.lightImpact();
    }
    return updateMutation.mutateAsync({
      id,
      status: nextStatus,
      currentValue: nextValue,
    });
  };

  const deleteGoal = (id: string) => {
    haptics.notificationWarning();
    return deleteMutation.mutateAsync(id);
  };

  return {
    goals: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    isSaving:
      createMutation.isPending ||
      updateMutation.isPending ||
      updateProgressMutation.isPending ||
      deleteMutation.isPending,
    refetch: query.refetch,
    createGoal,
    updateGoal,
    updateProgress,
    toggleComplete,
    deleteGoal,
  };
}
