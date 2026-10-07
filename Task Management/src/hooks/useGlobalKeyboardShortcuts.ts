import { useEffect } from 'react';
import type { Priority } from '../types';

interface KeyboardShortcutsProps {
  onQuickAdd: () => void;
  onNextTask: () => void;
  onPrevTask: () => void;
  onToggleComplete: () => void;
  onSetPriority: (priority: Priority) => void;
  onArchive: () => void;
  onToggleFocusDock: () => void;
  onToggleMatrix: () => void;
  onOpenTriage: () => void;
  onOpenShortcuts: () => void;
  onDismiss: () => void;
  isModalOpen: boolean;
}

export function useGlobalKeyboardShortcuts({
  onQuickAdd,
  onNextTask,
  onPrevTask,
  onToggleComplete,
  onSetPriority,
  onArchive,
  onToggleFocusDock,
  onToggleMatrix,
  onOpenTriage,
  onOpenShortcuts,
  onDismiss,
  isModalOpen,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input or textarea
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.getAttribute('role') === 'textbox');

      // Esc always dismisses modals
      if (e.key === 'Escape') {
        onDismiss();
        return;
      }

      // Cmd+K or Ctrl+K opens quick add from anywhere
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onQuickAdd();
        return;
      }

      // If user is typing in an input, do not intercept single letter shortcuts
      if (isInputFocused || isModalOpen) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'c':
          e.preventDefault();
          onQuickAdd();
          break;
        case 'j':
        case 'arrowdown':
          e.preventDefault();
          onNextTask();
          break;
        case 'k':
        case 'arrowup':
          e.preventDefault();
          onPrevTask();
          break;
        case ' ':
        case 'x':
          e.preventDefault();
          onToggleComplete();
          break;
        case '1':
          e.preventDefault();
          onSetPriority('p1');
          break;
        case '2':
          e.preventDefault();
          onSetPriority('p2');
          break;
        case '3':
          e.preventDefault();
          onSetPriority('p3');
          break;
        case '4':
          e.preventDefault();
          onSetPriority('p4');
          break;
        case 'e':
          e.preventDefault();
          onArchive();
          break;
        case 'f':
          e.preventDefault();
          onToggleFocusDock();
          break;
        case 'm':
          e.preventDefault();
          onToggleMatrix();
          break;
        case 't':
          e.preventDefault();
          onOpenTriage();
          break;
        case '?':
          e.preventDefault();
          onOpenShortcuts();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onQuickAdd,
    onNextTask,
    onPrevTask,
    onToggleComplete,
    onSetPriority,
    onArchive,
    onToggleFocusDock,
    onToggleMatrix,
    onOpenTriage,
    onOpenShortcuts,
    onDismiss,
    isModalOpen,
  ]);
}
