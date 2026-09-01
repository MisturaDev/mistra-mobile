import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Task, TaskPriority, TaskRow } from '@/types/dashboard';

export interface CreateTaskInput {
  title: string;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface UpdateTaskInput {
  id: string;
  title: string;
  priority?: TaskPriority;
  dueDate?: string | null;
}

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    priority: row.priority || 'medium',
    dueDate: row.due_date ?? null,
  };
}

async function fetchTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, completed, priority, due_date')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapTask);
}

export function useTasks(userId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = ['tasks', userId] as const;

  const query = useQuery({
    queryKey,
    queryFn: () => fetchTasks(userId!),
    enabled: !!userId,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase.from('tasks').update({ completed }).eq('id', id);
      if (error) throw error;
    },
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Task[]>(queryKey);
      queryClient.setQueryData<Task[]>(queryKey, (current) =>
        current?.map((task) => (task.id === id ? { ...task, completed } : task)) ?? []
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

  const createMutation = useMutation({
    mutationFn: async (input: string | CreateTaskInput) => {
      if (!userId) throw new Error('You must be signed in to add tasks.');

      const title = typeof input === 'string' ? input : input.title;
      const priority = typeof input === 'string' ? 'medium' : input.priority || 'medium';
      const dueDate = typeof input === 'string' ? null : input.dueDate ?? null;

      const { data, error } = await supabase
        .from('tasks')
        .insert({ user_id: userId, title, priority, due_date: dueDate })
        .select('id, title, completed, priority, due_date')
        .single();

      if (error) throw error;
      return mapTask(data);
    },
    onSuccess: (task) => {
      queryClient.setQueryData<Task[]>(queryKey, (current) => [...(current ?? []), task]);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (input: { id: string; title: string; priority?: TaskPriority; dueDate?: string | null }) => {
      const { id, title, priority, dueDate } = input;
      const updates: Partial<TaskRow> = { title };
      if (priority) updates.priority = priority;
      if (dueDate !== undefined) updates.due_date = dueDate;

      const { error } = await supabase.from('tasks').update(updates).eq('id', id);
      if (error) throw error;
    },
    onMutate: async ({ id, title, priority, dueDate }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Task[]>(queryKey);
      queryClient.setQueryData<Task[]>(queryKey, (current) =>
        current?.map((task) =>
          task.id === id
            ? {
                ...task,
                title,
                priority: priority || task.priority,
                dueDate: dueDate !== undefined ? dueDate : task.dueDate,
              }
            : task
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
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Task[]>(queryKey);
      queryClient.setQueryData<Task[]>(
        queryKey,
        (current) => current?.filter((task) => task.id !== id) ?? []
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

  const toggleTask = (id: string) => {
    const task = query.data?.find((item) => item.id === id);
    if (!task || toggleMutation.isPending) return;
    toggleMutation.mutate({ id, completed: !task.completed });
  };

  const createTask = (input: string | CreateTaskInput) => createMutation.mutateAsync(input);
  const updateTask = (id: string, title: string, priority?: TaskPriority) =>
    updateMutation.mutateAsync({ id, title, priority });
  const deleteTask = (id: string) => deleteMutation.mutateAsync(id);

  return {
    tasks: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    isSaving:
      createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    refetch: query.refetch,
    toggleTask,
    createTask,
    updateTask,
    deleteTask,
  };
}
