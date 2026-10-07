import { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import type { Task, Project, Tag, ViewType, GroupingMode, Priority, EnergyLevel } from '../types';
import { Storage } from '../utils/storage';
import { playTactileClick, playTaskCompletedSound } from '../utils/sound';

export function useTaskManager() {
  const [tasks, setTasks] = useState<Task[]>(() => Storage.loadTasks());
  const [projects, setProjects] = useState<Project[]>(() => Storage.loadProjects());
  const [tags, setTags] = useState<Tag[]>(() => Storage.loadTags());
  const [dailyCapacityHours, setDailyCapacityHours] = useState<number>(() => Storage.loadDailyCapacityHours());

  const [activeView, setActiveView] = useState<ViewType>('today');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [groupingMode, setGroupingMode] = useState<GroupingMode>('priority');
  const [energyFilter, setEnergyFilter] = useState<EnergyLevel | 'all'>('all');

  // Modals & Panels state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isTriageOpen, setIsTriageOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isDatabaseOpen, setIsDatabaseOpen] = useState(false);
  const [isFocusDockOpen, setIsFocusDockOpen] = useState(false);
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);

  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'dark';
    }
    return 'dark';
  });

  // Sync state to local storage
  useEffect(() => {
    Storage.saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    Storage.saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    Storage.saveTags(tags);
  }, [tags]);

  useEffect(() => {
    Storage.saveDailyCapacityHours(dailyCapacityHours);
  }, [dailyCapacityHours]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    playTactileClick();
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Today ISO helper
  const todayISO = useMemo(() => new Date().toISOString().split('T')[0], []);

  // 1. Task Operations
  const addTask = useCallback((taskData: Partial<Task>): Task => {
    playTactileClick();
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: 'user-default',
      projectId: taskData.projectId || (activeView === 'project' && selectedProjectId ? selectedProjectId : undefined),
      title: taskData.title?.trim() || 'Untitled task',
      description: taskData.description || '',
      priority: taskData.priority || 'p3',
      status: taskData.status || 'todo',
      dueDate: taskData.dueDate,
      dueTime: taskData.dueTime,
      scheduledDate: taskData.scheduledDate || (activeView === 'today' ? todayISO : undefined),
      estimatedMinutes: taskData.estimatedMinutes ?? 30,
      energy: taskData.energy || 'deep_work',
      tags: taskData.tags || (selectedTag ? [selectedTag] : []),
      subtasks: taskData.subtasks || [],
      recurrence: taskData.recurrence || 'none',
      rescheduleCount: 0,
      sortOrder: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archived: false,
    };

    setTasks((prev) => [newTask, ...prev]);
    setSelectedTaskId(newTask.id);
    setFocusedTaskId(newTask.id);
    return newTask;
  }, [activeView, selectedProjectId, selectedTag, todayISO]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
    );
  }, []);

  const toggleTaskComplete = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isNowCompleted = t.status !== 'completed';
          if (isNowCompleted) {
            playTaskCompletedSound();
            // Fire celebratory confetti burst
            confetti({
              particleCount: 45,
              spread: 60,
              origin: { y: 0.8 },
              colors: ['#3B82F6', '#10B981', '#F59E0B', '#EC4899'],
              disableForReducedMotion: true,
            });
            return {
              ...t,
              status: 'completed',
              completedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          } else {
            playTactileClick();
            return {
              ...t,
              status: 'todo',
              completedAt: undefined,
              updatedAt: new Date().toISOString(),
            };
          }
        }
        return t;
      })
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    playTactileClick();
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTaskId === id) setSelectedTaskId(null);
    if (focusedTaskId === id) setFocusedTaskId(null);
    if (focusTaskId === id) {
      setFocusTaskId(null);
      setIsFocusDockOpen(false);
    }
  }, [selectedTaskId, focusedTaskId, focusTaskId]);

  const archiveTask = useCallback((id: string) => {
    playTactileClick();
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, archived: true, updatedAt: new Date().toISOString() } : t))
    );
    if (selectedTaskId === id) setSelectedTaskId(null);
  }, [selectedTaskId]);

  const rescheduleTask = useCallback((id: string, daysOffset: number, customDate?: string) => {
    playTactileClick();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          let newDate: string;
          if (customDate) {
            newDate = customDate;
          } else {
            const d = new Date();
            d.setDate(d.getDate() + daysOffset);
            newDate = d.toISOString().split('T')[0];
          }
          return {
            ...t,
            scheduledDate: newDate,
            dueDate: newDate,
            rescheduleCount: t.rescheduleCount + 1,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  }, []);

  const setTaskPriority = useCallback((id: string, priority: Priority) => {
    playTactileClick();
    updateTask(id, { priority });
  }, [updateTask]);

  // Subtask operations
  const addSubtask = useCallback((taskId: string, title: string) => {
    if (!title.trim()) return;
    playTactileClick();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newSubtask = {
            id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title: title.trim(),
            completed: false,
            order: t.subtasks.length,
          };
          return { ...t, subtasks: [...t.subtasks, newSubtask], updatedAt: new Date().toISOString() };
        }
        return t;
      })
    );
  }, []);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    playTactileClick();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          return { ...t, subtasks: updated, updatedAt: new Date().toISOString() };
        }
        return t;
      })
    );
  }, []);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    playTactileClick();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: t.subtasks.filter((st) => st.id !== subtaskId),
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  }, []);

  // Filtered Tasks according to View, Energy, and Search
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (task.archived) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        const matchesTags = task.tags.some((tg) => tg.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesTags) return false;
      }

      // Energy Filter
      if (energyFilter !== 'all') {
        if (task.energy !== energyFilter) return false;
      }

      // View Filters
      switch (activeView) {
        case 'inbox':
          return !task.projectId && !task.scheduledDate && task.status !== 'completed';
        case 'today':
          // Scheduled today or due today or overdue uncompleted
          return (
            task.scheduledDate === todayISO ||
            task.dueDate === todayISO ||
            (task.status !== 'completed' && task.dueDate && task.dueDate < todayISO)
          );
        case 'upcoming':
          return (
            (task.dueDate && task.dueDate > todayISO) ||
            (task.scheduledDate && task.scheduledDate > todayISO)
          );
        case 'anytime':
          return !task.scheduledDate && task.priority !== 'p4' && task.status !== 'completed';
        case 'someday':
          return task.priority === 'p4' || task.status === 'completed';
        case 'project':
          return selectedProjectId ? task.projectId === selectedProjectId : true;
        case 'tag':
          return selectedTag ? task.tags.includes(selectedTag) : true;
        case 'matrix':
          return task.status !== 'completed';
        default:
          return true;
      }
    });
  }, [tasks, activeView, selectedProjectId, selectedTag, energyFilter, searchQuery, todayISO]);

  // Anti-Overwhelm Analytics
  const todayTasks = useMemo(() => {
    return tasks.filter(
      (t) =>
        !t.archived &&
        (t.scheduledDate === todayISO ||
          t.dueDate === todayISO ||
          (t.status !== 'completed' && t.dueDate && t.dueDate < todayISO))
    );
  }, [tasks, todayISO]);

  const todayUncompleted = useMemo(() => {
    return todayTasks.filter((t) => t.status !== 'completed');
  }, [todayTasks]);

  const todayCompleted = useMemo(() => {
    return todayTasks.filter((t) => t.status === 'completed');
  }, [todayTasks]);

  const todayEstimatedMinutes = useMemo(() => {
    return todayUncompleted.reduce((acc, t) => acc + (t.estimatedMinutes || 30), 0);
  }, [todayUncompleted]);

  const isOverbooked = useMemo(() => {
    return todayEstimatedMinutes / 60 > dailyCapacityHours;
  }, [todayEstimatedMinutes, dailyCapacityHours]);

  const dailyBig3Count = useMemo(() => {
    return todayUncompleted.filter((t) => t.priority === 'p1').length;
  }, [todayUncompleted]);

  const overdueCount = useMemo(() => {
    return tasks.filter(
      (t) => !t.archived && t.status !== 'completed' && t.dueDate && t.dueDate < todayISO
    ).length;
  }, [tasks, todayISO]);

  const stagnantCount = useMemo(() => {
    return tasks.filter(
      (t) => !t.archived && t.status !== 'completed' && t.rescheduleCount >= 3
    ).length;
  }, [tasks]);

  const selectedTask = useMemo(() => {
    return tasks.find((t) => t.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  const focusTask = useMemo(() => {
    return tasks.find((t) => t.id === focusTaskId) || selectedTask || filteredTasks[0] || null;
  }, [tasks, focusTaskId, selectedTask, filteredTasks]);

  // Keyboard navigation helpers
  const selectNextTask = useCallback(() => {
    if (filteredTasks.length === 0) return;
    const currentIndex = filteredTasks.findIndex((t) => t.id === (focusedTaskId || selectedTaskId));
    const nextIndex = currentIndex < filteredTasks.length - 1 ? currentIndex + 1 : 0;
    const nextTask = filteredTasks[nextIndex];
    if (nextTask) {
      setFocusedTaskId(nextTask.id);
      setSelectedTaskId(nextTask.id);
    }
  }, [filteredTasks, focusedTaskId, selectedTaskId]);

  const selectPrevTask = useCallback(() => {
    if (filteredTasks.length === 0) return;
    const currentIndex = filteredTasks.findIndex((t) => t.id === (focusedTaskId || selectedTaskId));
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredTasks.length - 1;
    const prevTask = filteredTasks[prevIndex];
    if (prevTask) {
      setFocusedTaskId(prevTask.id);
      setSelectedTaskId(prevTask.id);
    }
  }, [filteredTasks, focusedTaskId, selectedTaskId]);

  return {
    tasks,
    projects,
    tags,
    activeView,
    setActiveView,
    selectedProjectId,
    setSelectedProjectId,
    selectedTag,
    setSelectedTag,
    selectedTaskId,
    setSelectedTaskId,
    focusedTaskId,
    setFocusedTaskId,
    selectedTask,
    focusTask,
    searchQuery,
    setSearchQuery,
    groupingMode,
    setGroupingMode,
    energyFilter,
    setEnergyFilter,
    dailyCapacityHours,
    setDailyCapacityHours,
    theme,
    toggleTheme,

    // Modals
    isQuickAddOpen,
    setIsQuickAddOpen,
    isTriageOpen,
    setIsTriageOpen,
    isShortcutsOpen,
    setIsShortcutsOpen,
    isDatabaseOpen,
    setIsDatabaseOpen,
    isFocusDockOpen,
    setIsFocusDockOpen,
    setFocusTaskId,

    // Tasks Actions
    addTask,
    updateTask,
    toggleTaskComplete,
    deleteTask,
    archiveTask,
    rescheduleTask,
    setTaskPriority,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    setTasks,
    setProjects,
    setTags,

    // Navigation
    selectNextTask,
    selectPrevTask,

    // Analytics
    filteredTasks,
    todayTasks,
    todayUncompleted,
    todayCompleted,
    todayEstimatedMinutes,
    isOverbooked,
    dailyBig3Count,
    overdueCount,
    stagnantCount,
  };
}
