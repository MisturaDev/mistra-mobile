import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Task, TaskPriority, TaskCategory, SubTask, TaskRow } from '@/types/dashboard';

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  category?: TaskCategory;
  dueDate?: string | null;
  subtasks?: SubTask[];
}

export interface UpdateTaskInput {
  id: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  category?: TaskCategory;
  dueDate?: string | null;
  subtasks?: SubTask[];
  completed?: boolean;
}

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    completed: row.completed,
    priority: (row.priority as TaskPriority) || 'medium',
    category: (row.category as TaskCategory) || 'general',
    dueDate: row.due_date ?? null,
    subtasks: Array.isArray(row.subtasks) ? row.subtasks : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('id, user_id, title, description, completed, priority, category, due_date, subtasks, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

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
      const { error } = await supabase
        .from('tasks')
        .update({ completed, updated_at: new Date().toISOString() })
        .eq('id', id);
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
      const description = typeof input === 'string' ? '' : input.description ?? '';
      const priority = typeof input === 'string' ? 'medium' : input.priority || 'medium';
      const category = typeof input === 'string' ? 'general' : input.category || 'general';
      const dueDate = typeof input === 'string' ? null : input.dueDate ?? null;
      const subtasks = typeof input === 'string' ? [] : input.subtasks ?? [];

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          title,
          description,
          priority,
          category,
          due_date: dueDate,
          subtasks,
          updated_at: new Date().toISOString(),
        })
        .select('id, user_id, title, description, completed, priority, category, due_date, subtasks, created_at, updated_at')
        .single();

      if (error) throw error;
      return mapTask(data);
    },
    onSuccess: (task) => {
      queryClient.setQueryData<Task[]>(queryKey, (current) => [task, ...(current ?? [])]);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (input: UpdateTaskInput) => {
      const { id, title, description, priority, category, dueDate, subtasks, completed } = input;
      const updates: Partial<TaskRow> = {
        title,
        updated_at: new Date().toISOString(),
      };
      if (description !== undefined) updates.description = description;
      if (priority) updates.priority = priority;
      if (category) updates.category = category;
      if (dueDate !== undefined) updates.due_date = dueDate;
      if (subtasks !== undefined) updates.subtasks = subtasks;
      if (completed !== undefined) updates.completed = completed;

      const { error } = await supabase.from('tasks').update(updates).eq('id', id);
      if (error) throw error;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Task[]>(queryKey);
      queryClient.setQueryData<Task[]>(queryKey, (current) =>
        current?.map((task) =>
          task.id === input.id
            ? {
                ...task,
                title: input.title,
                description: input.description !== undefined ? input.description : task.description,
                priority: input.priority || task.priority,
                category: input.category || task.category,
                dueDate: input.dueDate !== undefined ? input.dueDate : task.dueDate,
                subtasks: input.subtasks !== undefined ? input.subtasks : task.subtasks,
                completed: input.completed !== undefined ? input.completed : task.completed,
                updatedAt: new Date().toISOString(),
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

  const toggleSubtaskMutation = useMutation({
    mutationFn: async ({ taskId, subtaskId }: { taskId: string; subtaskId: string }) => {
      const task = query.data?.find((t) => t.id === taskId);
      if (!task) return;

      const updatedSubtasks = task.subtasks.map((st) =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      );

      const { error } = await supabase
        .from('tasks')
        .update({ subtasks: updatedSubtasks, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) throw error;
    },
    onMutate: async ({ taskId, subtaskId }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Task[]>(queryKey);
      queryClient.setQueryData<Task[]>(queryKey, (current) =>
        current?.map((task) =>
          task.id === taskId
            ? {
                ...task,
                subtasks: task.subtasks.map((st) =>
                  st.id === subtaskId ? { ...st, completed: !st.completed } : st
                ),
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

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    toggleSubtaskMutation.mutate({ taskId, subtaskId });
  };

  const createTask = (input: string | CreateTaskInput) => createMutation.mutateAsync(input);
  const updateTask = (input: UpdateTaskInput) => updateMutation.mutateAsync(input);
  const deleteTask = (id: string) => deleteMutation.mutateAsync(id);

  return {
    tasks: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    isSaving:
      createMutation.isPending ||
      updateMutation.isPending ||
      toggleMutation.isPending ||
      toggleSubtaskMutation.isPending ||
      deleteMutation.isPending,
    refetch: query.refetch,
    toggleTask,
    toggleSubtask,
    createTask,
    updateTask,
    deleteTask,
  };
}
