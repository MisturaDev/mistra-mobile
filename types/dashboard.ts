export interface Task {
  id: string;
  title: string;
  completed: boolean;
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
}

export interface HabitRow {
  id: string;
  name: string;
  streak: number;
  completed_today: boolean;
}
