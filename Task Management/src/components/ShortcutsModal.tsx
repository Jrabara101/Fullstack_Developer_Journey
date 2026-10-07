import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      category: 'Navigation & Focus',
      items: [
        { keys: ['J', '↓'], desc: 'Navigate to next task' },
        { keys: ['K', '↑'], desc: 'Navigate to previous task' },
        { keys: ['Cmd', 'K'], desc: 'Open Intelligent Quick Capture modal' },
        { keys: ['C'], desc: 'Quick add task from anywhere' },
        { keys: ['F'], desc: 'Toggle Deep Work Pomodoro Focus Dock' },
        { keys: ['Esc'], desc: 'Dismiss active modal or drawer' },
      ],
    },
    {
      category: 'Task Execution & Prioritization',
      items: [
        { keys: ['Space'], desc: 'Toggle task complete with particle pop' },
        { keys: ['X'], desc: 'Alternative complete toggle' },
        { keys: ['1'], desc: 'Set task priority to P1 (Urgent & Crucial)' },
        { keys: ['2'], desc: 'Set task priority to P2 (High Priority)' },
        { keys: ['3'], desc: 'Set task priority to P3 (Medium Priority)' },
        { keys: ['4'], desc: 'Set task priority to P4 (Someday / Backlog)' },
        { keys: ['E'], desc: 'Archive selected task' },
      ],
    },
    {
      category: 'Rituals & Views',
      items: [
        { keys: ['T'], desc: 'Open 60-Second Inbox Zero Triage Ritual' },
        { keys: ['M'], desc: 'Toggle Eisenhower Decision Matrix View' },
        { keys: ['?'], desc: 'Show this keyboard shortcuts guide' },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md transition-all animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#1C1D21] border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl p-6 text-gray-900 dark:text-gray-100 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-blue-500" />
            <h2 className="text-base font-bold tracking-tight">Keyboard Ergonomics</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-5 max-h-[65vh] overflow-y-auto">
          {shortcutGroups.map((group) => (
            <div key={group.category} className="space-y-2">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {group.category}
              </h3>
              <div className="space-y-1.5">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-[#141517] text-xs transition-colors"
                  >
                    <span className="text-gray-600 dark:text-gray-300">{item.desc}</span>
                    <div className="flex items-center gap-1 font-mono">
                      {item.keys.map((k) => (
                        <kbd
                          key={k}
                          className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium text-[11px] shadow-xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 text-center">
          <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
            Engineered for high velocity keyboard navigation without touching the mouse.
          </span>
        </div>
      </div>
    </div>
  );
};
