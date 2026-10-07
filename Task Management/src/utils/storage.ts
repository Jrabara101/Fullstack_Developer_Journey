import type { Task, Project, Tag } from '../types';

const STORAGE_KEYS = {
  TASKS: 'focusflow_tasks_v1',
  PROJECTS: 'focusflow_projects_v1',
  TAGS: 'focusflow_tags_v1',
  THEME: 'focusflow_theme_v1',
  CAPACITY: 'focusflow_daily_capacity_v1',
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    userId: 'user-default',
    name: 'Platform Engineering',
    color: '#3B82F6', // Blue
    icon: 'Layers',
    isFavorite: true,
    description: 'Core infrastructure, CI/CD pipelines, and microservices.',
  },
  {
    id: 'proj-2',
    userId: 'user-default',
    name: 'Product & Design',
    color: '#EC4899', // Pink
    icon: 'Sparkles',
    isFavorite: true,
    description: 'User experience, component library, and design tokens.',
  },
  {
    id: 'proj-3',
    userId: 'user-default',
    name: 'Q4 Strategy',
    color: '#F59E0B', // Amber
    icon: 'Compass',
    isFavorite: true,
    description: 'Roadmap planning, quarterly OKRs, and market analysis.',
  },
  {
    id: 'proj-4',
    userId: 'user-default',
    name: 'Personal & Health',
    color: '#10B981', // Emerald
    icon: 'Heart',
    isFavorite: false,
    description: 'Habits, wellness, readings, and personal growth.',
  },
];

export const INITIAL_TAGS: Tag[] = [
  { id: 'tag-1', name: 'strategy', color: '#8B5CF6' },
  { id: 'tag-2', name: 'frontend', color: '#3B82F6' },
  { id: 'tag-3', name: 'security', color: '#EF4444' },
  { id: 'tag-4', name: 'ux', color: '#EC4899' },
  { id: 'tag-5', name: 'ops', color: '#10B981' },
];

const todayISO = new Date().toISOString().split('T')[0];
const yesterdayDate = new Date();
yesterdayDate.setDate(yesterdayDate.getDate() - 2);
const overdueISO = yesterdayDate.toISOString().split('T')[0];

const tomorrowDate = new Date();
tomorrowDate.setDate(tomorrowDate.getDate() + 1);
const tomorrowISO = tomorrowDate.toISOString().split('T')[0];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    userId: 'user-default',
    projectId: 'proj-1',
    title: 'Migrate session tokens to HTTP-only cookie rotation',
    description: `### Security Hardening Objective
Ensure zero XSS vulnerabilities by migrating browser localStorage tokens to strict HTTP-only, secure, same-site cookies.

- [x] Configure server-side cookie flags
- [ ] Implement refresh token rotation middleware
- [ ] Update frontend API client interceptors`,
    priority: 'p1',
    status: 'todo',
    dueDate: todayISO,
    dueTime: '14:00',
    scheduledDate: todayISO,
    estimatedMinutes: 90,
    energy: 'deep_work',
    tags: ['security', 'ops'],
    subtasks: [
      { id: 'sub-1', title: 'Audit current JWT expiration policies', completed: true, order: 0 },
      { id: 'sub-2', title: 'Implement Redis blacklist for revoked refresh tokens', completed: false, order: 1 },
      { id: 'sub-3', title: 'End-to-end auth test in staging environment', completed: false, order: 2 },
    ],
    recurrence: 'none',
    rescheduleCount: 0,
    sortOrder: 1000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false,
  },
  {
    id: 'task-2',
    userId: 'user-default',
    projectId: 'proj-2',
    title: 'Finalize Linear-inspired keyboard shortcuts & focus ring',
    description: `Deliver smooth J/K keyboard navigation, X to complete, and 2px high-contrast focus rings throughout the task stream.`,
    priority: 'p1',
    status: 'todo',
    dueDate: todayISO,
    dueTime: '16:30',
    scheduledDate: todayISO,
    estimatedMinutes: 60,
    energy: 'deep_work',
    tags: ['ux', 'frontend'],
    subtasks: [
      { id: 'sub-4', title: 'Add active item keyboard listener hook', completed: true, order: 0 },
      { id: 'sub-5', title: 'Connect Esc modal dismissals', completed: true, order: 1 },
      { id: 'sub-6', title: 'Test screen reader announcements', completed: false, order: 2 },
    ],
    recurrence: 'none',
    rescheduleCount: 0,
    sortOrder: 2000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false,
  },
  {
    id: 'task-3',
    userId: 'user-default',
    projectId: 'proj-3',
    title: 'Draft Q3 Product Strategy & Resource Allocation Deck',
    description: `Synthesize user feedback interviews and prioritize the next 6-week engineering sprints. Include financial runway modeling.`,
    priority: 'p1',
    status: 'todo',
    dueDate: todayISO,
    dueTime: '17:00',
    scheduledDate: todayISO,
    estimatedMinutes: 75,
    energy: 'deep_work',
    tags: ['strategy'],
    subtasks: [
      { id: 'sub-7', title: 'Extract cohort retention charts', completed: true, order: 0 },
      { id: 'sub-8', title: 'Summarize executive stakeholder requests', completed: false, order: 1 },
    ],
    recurrence: 'none',
    rescheduleCount: 0,
    sortOrder: 3000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false,
  },
  {
    id: 'task-4',
    userId: 'user-default',
    projectId: 'proj-1',
    title: 'Resolve database connection pool exhaustion in worker nodes',
    description: `*Stagnant task warning!* This task was rescheduled across 3 sprint cycles.
Consider decomposing into smaller diagnostics or provisioning pgbouncer connection pooling.`,
    priority: 'p2',
    status: 'todo',
    dueDate: overdueISO,
    dueTime: '11:00',
    scheduledDate: overdueISO,
    estimatedMinutes: 45,
    energy: 'quick_hit',
    tags: ['ops'],
    subtasks: [
      { id: 'sub-9', title: 'Inspect active connection metrics in Grafana', completed: true, order: 0 },
      { id: 'sub-10', title: 'Tune pool timeout thresholds from 30s to 10s', completed: false, order: 1 },
    ],
    recurrence: 'none',
    rescheduleCount: 4, // Triggers Stagnancy Sentinel!
    sortOrder: 4000,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false,
  },
  {
    id: 'task-5',
    userId: 'user-default',
    projectId: 'proj-2',
    title: 'Audit Web Content Accessibility Guidelines (WCAG 2.1 AA)',
    description: 'Ensure color contrast ratios satisfy 4.5:1 on light/dark mode and aria labels are present on icon buttons.',
    priority: 'p2',
    status: 'todo',
    dueDate: tomorrowISO,
    dueTime: '15:00',
    scheduledDate: tomorrowISO,
    estimatedMinutes: 40,
    energy: 'low_energy',
    tags: ['ux'],
    subtasks: [],
    recurrence: 'none',
    rescheduleCount: 1,
    sortOrder: 5000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false,
  },
  {
    id: 'task-6',
    userId: 'user-default',
    projectId: 'proj-4',
    title: 'Daily Evening Wind-Down & 60-Second Inbox Sweep Ritual',
    description: 'Review lingering items, re-balance calendar horizons, and leave zero mental baggage before bedtime.',
    priority: 'p3',
    status: 'todo',
    dueDate: todayISO,
    dueTime: '21:00',
    scheduledDate: todayISO,
    estimatedMinutes: 15,
    energy: 'quick_hit',
    tags: ['ops'],
    subtasks: [],
    recurrence: 'weekdays',
    rescheduleCount: 0,
    sortOrder: 6000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false,
  },
  {
    id: 'task-7',
    userId: 'user-default',
    projectId: 'proj-3',
    title: 'Explore AI agent workflow integration for automated sprint triage',
    description: 'Evaluate autonomous subagent capabilities to summarize Github PR reviews and draft release notes.',
    priority: 'p4',
    status: 'todo',
    dueDate: undefined,
    scheduledDate: undefined,
    estimatedMinutes: 120,
    energy: 'deep_work',
    tags: ['strategy', 'frontend'],
    subtasks: [],
    recurrence: 'none',
    rescheduleCount: 0,
    sortOrder: 7000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false,
  },
  {
    id: 'task-8',
    userId: 'user-default',
    projectId: 'proj-1',
    title: 'Configure automated daily database backup verification script',
    description: 'Verified recovery snapshot integrity in isolated sandbox.',
    priority: 'p2',
    status: 'completed',
    dueDate: overdueISO,
    completedAt: new Date().toISOString(),
    estimatedMinutes: 30,
    energy: 'low_energy',
    tags: ['ops'],
    subtasks: [],
    recurrence: 'none',
    rescheduleCount: 0,
    sortOrder: 8000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false,
  },
];

export const Storage = {
  loadTasks(): Task[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
        return INITIAL_TASKS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_TASKS;
    }
  },

  saveTasks(tasks: Task[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (err) {
      console.error('Failed to save tasks', err);
    }
  },

  loadProjects(): Project[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
        return INITIAL_PROJECTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_PROJECTS;
    }
  },

  saveProjects(projects: Project[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (err) {
      console.error('Failed to save projects', err);
    }
  },

  loadTags(): Tag[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TAGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(INITIAL_TAGS));
        return INITIAL_TAGS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_TAGS;
    }
  },

  saveTags(tags: Tag[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
    } catch (err) {
      console.error('Failed to save tags', err);
    }
  },

  loadDailyCapacityHours(): number {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.CAPACITY);
      return val ? parseFloat(val) : 6.0; // Default 6 hours of focused daily capacity
    } catch {
      return 6.0;
    }
  },

  saveDailyCapacityHours(hours: number) {
    try {
      localStorage.setItem(STORAGE_KEYS.CAPACITY, hours.toString());
    } catch (err) {
      console.error('Failed to save capacity', err);
    }
  },

  exportData(): string {
    const exportPayload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      tasks: this.loadTasks(),
      projects: this.loadProjects(),
      tags: this.loadTags(),
      dailyCapacityHours: this.loadDailyCapacityHours(),
    };
    return JSON.stringify(exportPayload, null, 2);
  },

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.tasks)) this.saveTasks(data.tasks);
      if (Array.isArray(data.projects)) this.saveProjects(data.projects);
      if (Array.isArray(data.tags)) this.saveTags(data.tags);
      if (typeof data.dailyCapacityHours === 'number') this.saveDailyCapacityHours(data.dailyCapacityHours);
      return true;
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  },

  resetToDefault() {
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.TAGS);
    localStorage.removeItem(STORAGE_KEYS.CAPACITY);
    window.location.reload();
  },
};
