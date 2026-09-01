export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskCategory =
  | 'general'
  | 'work'
  | 'personal'
  | 'study'
  | 'health'
  | 'shopping';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate?: string | null;
  subtasks: SubTask[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  completed: boolean;
}

export interface TaskRow {
  id: string;
  user_id?: string;
  title: string;
  description?: string | null;
  completed: boolean;
  priority?: TaskPriority | null;
  category?: TaskCategory | null;
  due_date?: string | null;
  subtasks?: SubTask[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface HabitRow {
  id: string;
  name: string;
  streak: number;
  completed_today: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  emoji: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteRow {
  id: string;
  user_id: string;
  title: string;
  content: string;
  emoji: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

