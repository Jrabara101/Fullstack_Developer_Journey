import React, { useState, useRef, useEffect } from 'react';
import { Globe, Users, Lock, ChevronDown, Check } from 'lucide-react';

const SCOPES = [
  {
    id: 'public',
    label: 'Public',
    icon: Globe,
    description: 'Visible to anyone on the web and search crawlers',
    badgeClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40'
  },
  {
    id: 'team',
    label: 'Team Only',
    icon: Users,
    description: 'Visible exclusively to verified colleagues & teammates',
    badgeClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/40'
  },
  {
    id: 'private',
    label: 'Only You',
    icon: Lock,
    description: 'Completely concealed from everyone except your account',
    badgeClass: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50'
  }
];

export function PrivacyScopeSelector({ value = 'public', onChange, label = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeScope = SCOPES.find(s => s.id === value) || SCOPES[0];
  const Icon = activeScope.icon;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border transition-all hover:scale-105 active:scale-95 shadow-sm ${activeScope.badgeClass}`}
        title={`Privacy: ${activeScope.label}. Click to adjust.`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{activeScope.label}</span>
        <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#181B22] py-1.5 z-30 animate-fade-in divide-y divide-slate-100 dark:divide-slate-800/50">
          <div className="px-3 py-1.5">
            <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              {label ? `${label} Audience Scope` : 'Visibility Scope'}
            </p>
          </div>
          <div className="py-1">
            {SCOPES.map((scope) => {
              const ScopeIcon = scope.icon;
              const isSelected = scope.id === value;
              return (
                <button
                  key={scope.id}
                  type="button"
                  onClick={() => {
                    onChange(scope.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-2.5 px-3 py-2 text-left text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                    isSelected ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                  }`}
                >
                  <ScopeIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    scope.id === 'public' ? 'text-emerald-500' :
                    scope.id === 'team' ? 'text-indigo-500' : 'text-slate-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {scope.label}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      {scope.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
