import React, { useState, useEffect } from 'react';
import { graphEngine } from '../engine/relationshipEngine.js';
import { Sparkles, AlertCircle, CheckCircle2, UserMinus, ShieldAlert, VolumeX, X } from 'lucide-react';

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = graphEngine.subscribe((event) => {
      if (!event || !event.type) return;

      let toast = null;
      const id = Date.now() + Math.random();

      if (event.type === 'FRIENDSHIP_CONFIRMED') {
        const target = event.targetUser || graphEngine.getUserById(event.targetUserId);
        toast = {
          id,
          type: 'mutual',
          title: 'Mutual Friendship Unlocked! ✨',
          message: `You and ${target?.displayName || 'user'} are now Mutual Friends. Private contact info & mutual feeds are unlocked.`,
          icon: Sparkles,
        };
      } else if (event.type === 'ROLLBACK_TRIGGERED') {
        toast = {
          id,
          type: 'error',
          title: 'Network Timeout / Rollback ⚠️',
          message: event.error || 'Connection failed. Action rolled back gracefully.',
          icon: AlertCircle,
        };
      } else if (event.type === 'MUTUAL_SEVERED') {
        const target = graphEngine.getUserById(event.targetUserId);
        toast = {
          id,
          type: 'neutral',
          title: 'Friendship Severed',
          message: `Connection with ${target?.displayName || 'user'} dropped from Mutual to one-way follow.`,
          icon: UserMinus,
        };
      } else if (event.type === 'SOFT_BLOCKED') {
        const follower = graphEngine.getUserById(event.followerId);
        toast = {
          id,
          type: 'neutral',
          title: 'Silent Uncoupling ("Soft Block")',
          message: `Removed ${follower?.displayName || 'follower'} as your follower without notifying them.`,
          icon: ShieldAlert,
        };
      } else if (event.type === 'MUTE_TOGGLED') {
        toast = {
          id,
          type: 'neutral',
          title: event.isMuted ? 'Account Muted' : 'Account Unmuted',
          message: event.isMuted
            ? 'Their posts are hidden while preserving public mutual status.'
            : 'Their posts are restored in your feed.',
          icon: VolumeX,
        };
      }

      if (toast) {
        setToasts((prev) => [...prev.slice(-4), toast]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
      }
    });

    return unsubscribe;
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const Icon = toast.icon;
        const isMutual = toast.type === 'mutual';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border transition-all duration-300 backdrop-blur-md flex items-start gap-3 animate-in slide-in-from-bottom-5 ${
              isMutual
                ? 'bg-gradient-to-r from-violet-950/90 to-pink-950/90 border-violet-500/40 text-white shadow-[0_0_20px_rgba(236,72,153,0.3)]'
                : isError
                ? 'bg-red-950/90 border-red-500/40 text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                : 'bg-white/95 dark:bg-zinc-900/95 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-100'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl shrink-0 ${
                isMutual
                  ? 'bg-pink-500/20 text-pink-300'
                  : isError
                  ? 'bg-red-500/20 text-red-300'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs leading-tight">
                {toast.title}
              </div>
              <div className="text-[11px] opacity-90 mt-0.5 leading-snug">
                {toast.message}
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
