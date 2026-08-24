import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Task, TaskRow } from '@/types/dashboard';

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
  };
}

async function fetchTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, completed')
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
    mutationFn: async (title: string) => {
      if (!userId) throw new Error('You must be signed in to add tasks.');

      const { data, error } = await supabase
        .from('tasks')
        .insert({ user_id: userId, title })
        .select('id, title, completed')
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
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { error } = await supabase.from('tasks').update({ title }).eq('id', id);
      if (error) throw error;
    },
    onMutate: async ({ id, title }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Task[]>(queryKey);
      queryClient.setQueryData<Task[]>(queryKey, (current) =>
        current?.map((task) => (task.id === id ? { ...task, title } : task)) ?? []
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

  const createTask = (title: string) => createMutation.mutateAsync(title);
  const updateTask = (id: string, title: string) => updateMutation.mutateAsync({ id, title });
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
