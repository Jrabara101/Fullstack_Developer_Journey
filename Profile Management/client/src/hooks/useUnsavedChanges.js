import { useEffect } from 'react';

/**
 * Hook for managing unsaved changes state, hotkey interception (Cmd+S / Ctrl+S),
 * and browser beforeunload protection.
 */
export function useUnsavedChanges({ isDirty, onSave, onRevert }) {
  // 1. Browser beforeunload listener
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // 2. Keyboard shortcut: Cmd+S / Ctrl+S to save, Esc to revert
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (isDirty && onSave) {
          onSave();
        }
      }
      if (e.key === 'Escape' && isDirty && onRevert) {
        // Option to revert
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDirty, onSave, onRevert]);
}
