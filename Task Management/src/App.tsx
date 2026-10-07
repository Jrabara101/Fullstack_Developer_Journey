import { useTaskManager } from './hooks/useTaskManager';
import { useGlobalKeyboardShortcuts } from './hooks/useGlobalKeyboardShortcuts';
import { Sidebar } from './components/Sidebar';
import { TaskStream } from './components/TaskStream';
import { TaskInspector } from './components/TaskInspector';
import { QuickAddModal } from './components/QuickAddModal';
import { EisenhowerMatrix } from './components/EisenhowerMatrix';
import { TriageSweepModal } from './components/TriageSweepModal';
import { FocusDock } from './components/FocusDock';
import { ShortcutsModal } from './components/ShortcutsModal';
import { DatabaseModal } from './components/DatabaseModal';

export function App() {
  const {
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
    groupingMode,
    setGroupingMode,
    energyFilter,
    setEnergyFilter,
    dailyCapacityHours,
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

    // Actions
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

    // Navigation
    selectNextTask,
    selectPrevTask,

    // Analytics
    filteredTasks,
    todayEstimatedMinutes,
    isOverbooked,
    dailyBig3Count,
    todayCompleted,
    todayTasks,
    overdueCount,
    stagnantCount,
  } = useTaskManager();

  // Active project definition if activeView is project
  const currentProject = projects.find((p) => p.id === selectedProjectId);

  // Setup global keyboard shortcuts
  useGlobalKeyboardShortcuts({
    onQuickAdd: () => setIsQuickAddOpen(true),
    onNextTask: selectNextTask,
    onPrevTask: selectPrevTask,
    onToggleComplete: () => {
      const activeId = focusedTaskId || selectedTaskId;
      if (activeId) toggleTaskComplete(activeId);
    },
    onSetPriority: (p) => {
      const activeId = focusedTaskId || selectedTaskId;
      if (activeId) setTaskPriority(activeId, p);
    },
    onArchive: () => {
      const activeId = focusedTaskId || selectedTaskId;
      if (activeId) archiveTask(activeId);
    },
    onToggleFocusDock: () => {
      const activeId = focusedTaskId || selectedTaskId;
      if (activeId) {
        setFocusTaskId(activeId);
        setIsFocusDockOpen(true);
      } else if (focusTask) {
        setIsFocusDockOpen(!isFocusDockOpen);
      }
    },
    onToggleMatrix: () => {
      setActiveView(activeView === 'matrix' ? 'today' : 'matrix');
    },
    onOpenTriage: () => setIsTriageOpen(true),
    onOpenShortcuts: () => setIsShortcutsOpen(true),
    onDismiss: () => {
      if (isQuickAddOpen) setIsQuickAddOpen(false);
      else if (isTriageOpen) setIsTriageOpen(false);
      else if (isShortcutsOpen) setIsShortcutsOpen(false);
      else if (isDatabaseOpen) setIsDatabaseOpen(false);
      else if (selectedTaskId) setSelectedTaskId(null);
    },
    isModalOpen: isQuickAddOpen || isTriageOpen || isShortcutsOpen || isDatabaseOpen,
  });

  // Calculate unread / counts for sidebar
  const counts = {
    inbox: tasks.filter((t) => !t.projectId && !t.scheduledDate && t.status !== 'completed' && !t.archived).length,
    today: todayTasks.filter((t) => t.status !== 'completed').length,
    upcoming: tasks.filter((t) => !t.archived && t.status !== 'completed' && t.dueDate && t.dueDate > new Date().toISOString().split('T')[0]).length,
    someday: tasks.filter((t) => !t.archived && (t.priority === 'p4' || t.status === 'completed')).length,
    overdue: overdueCount,
    stagnant: stagnantCount,
  };

  // Stale or inbox items for Triage Sweep Ritual
  const tasksToTriage = tasks.filter(
    (t) =>
      !t.archived &&
      t.status !== 'completed' &&
      (!t.scheduledDate || (t.dueDate && t.dueDate < new Date().toISOString().split('T')[0]) || t.rescheduleCount >= 2)
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0C0D0E] font-sans antialiased text-gray-900 dark:text-gray-100">
      {/* 1. Left Navigation Rail */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        projects={projects}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
        tags={tags}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        counts={counts}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenTriage={() => setIsTriageOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenDatabase={() => setIsDatabaseOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* 2. Center Stage: Task Stream or Eisenhower Matrix */}
      <main className="flex-1 h-full flex flex-col min-w-0 overflow-hidden relative">
        {activeView === 'matrix' ? (
          <EisenhowerMatrix
            tasks={tasks.filter((t) => !t.archived)}
            onSelectTask={(id) => {
              setSelectedTaskId(id);
              setFocusedTaskId(id);
            }}
            onToggleComplete={toggleTaskComplete}
            onSetPriority={setTaskPriority}
            onAddTask={addTask}
          />
        ) : (
          <TaskStream
            tasks={filteredTasks}
            projects={projects}
            activeView={activeView}
            selectedProject={currentProject}
            selectedTag={selectedTag}
            selectedTaskId={selectedTaskId}
            focusedTaskId={focusedTaskId}
            groupingMode={groupingMode}
            setGroupingMode={setGroupingMode}
            energyFilter={energyFilter}
            setEnergyFilter={setEnergyFilter}
            dailyCapacityHours={dailyCapacityHours}
            todayEstimatedMinutes={todayEstimatedMinutes}
            isOverbooked={isOverbooked}
            dailyBig3Count={dailyBig3Count}
            todayCompletedCount={todayCompleted.length}
            todayTotalCount={todayTasks.length}
            onSelectTask={(id) => {
              setSelectedTaskId(id);
              setFocusedTaskId(id);
            }}
            onToggleComplete={toggleTaskComplete}
            onReschedule={(id, days) => rescheduleTask(id, days)}
            onSetPriority={(id, p) => setTaskPriority(id, p)}
            onArchive={archiveTask}
            onDelete={deleteTask}
            onStartFocus={(id) => {
              setFocusTaskId(id);
              setSelectedTaskId(id);
              setIsFocusDockOpen(true);
            }}
            onAddTask={addTask}
          />
        )}
      </main>

      {/* 3. Right Task Inspector Drawer */}
      {selectedTask && (
        <TaskInspector
          task={selectedTask}
          projects={projects}
          onClose={() => setSelectedTaskId(null)}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          onArchiveTask={archiveTask}
          onAddSubtask={addSubtask}
          onToggleSubtask={toggleSubtask}
          onDeleteSubtask={deleteSubtask}
          onStartFocus={(id) => {
            setFocusTaskId(id);
            setIsFocusDockOpen(true);
          }}
        />
      )}

      {/* 4. Single-Task Deep Focus Dock & Pomodoro Zen Mode */}
      <FocusDock
        task={focusTask}
        isOpen={isFocusDockOpen}
        onClose={() => setIsFocusDockOpen(false)}
        onCompleteTask={(id) => toggleTaskComplete(id)}
      />

      {/* 5. Intelligent Quick-Add Modal (Cmd+K) */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddTask={addTask}
        projects={projects}
      />

      {/* 6. Morning & Evening Triage Sweep Ritual Modal */}
      <TriageSweepModal
        isOpen={isTriageOpen}
        onClose={() => setIsTriageOpen(false)}
        tasksToTriage={tasksToTriage}
        onUpdateTask={updateTask}
        onArchiveTask={archiveTask}
      />

      {/* 7. Keyboard Shortcuts Cheat Sheet Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* 8. PostgreSQL & Supabase Engine Modal */}
      <DatabaseModal
        isOpen={isDatabaseOpen}
        onClose={() => setIsDatabaseOpen(false)}
      />
    </div>
  );
}

export default App;
