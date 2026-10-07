export type Priority = 'p1' | 'p2' | 'p3' | 'p4';

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';

export type EnergyLevel = 'deep_work' | 'quick_hit' | 'low_energy';

export type RecurrencePattern = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'after_completion_4d';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  details?: string;
}

export interface Task {
  id: string;
  userId: string;
  projectId?: string;
  parentId?: string; // For nested hierarchy
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  scheduledDate?: string; // YYYY-MM-DD (Do Today / Scheduled Horizon)
  estimatedMinutes?: number;
  energy?: EnergyLevel;
  tags: string[];
  subtasks: Subtask[];
  recurrence?: RecurrencePattern;
  rescheduleCount: number;
  sortOrder: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  activityLogs?: ActivityLog[];
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  isFavorite: boolean;
  description?: string;
  archivedAt?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export type ViewType =
  | 'inbox'
  | 'today'
  | 'upcoming'
  | 'anytime'
  | 'someday'
  | 'matrix'
  | 'project'
  | 'tag';

export type GroupingMode = 'priority' | 'project' | 'dueDate' | 'energy' | 'none';

export interface ParsedTaskTokens {
  cleanTitle: string;
  priority?: Priority;
  dueDate?: string;
  dueTime?: string;
  scheduledDate?: string;
  estimatedMinutes?: number;
  tags: string[];
  projectHint?: string;
  energy?: EnergyLevel;
}
