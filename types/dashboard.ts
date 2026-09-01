export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  completed: boolean;
}

export interface TaskRow {
  id: string;
  title: string;
  completed: boolean;
  priority?: TaskPriority;
  due_date?: string | null;
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

