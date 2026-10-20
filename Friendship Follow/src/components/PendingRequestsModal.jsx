import React, { useState, useEffect } from 'react';
import { graphEngine } from '../engine/relationshipEngine.js';
import { X, Check, Trash2, Clock, Sparkles } from 'lucide-react';

export function PendingRequestsModal({
  isOpen,
  onClose,
  onSelectUser,
}) {
  const activeUser = graphEngine.getActiveUser();
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = graphEngine.subscribe(() => {
      setTick(t => t + 1);
    });
    return unsubscribe;
  }, []);

  if (!isOpen || !activeUser) return null;

  // Requests where activeUser is the target
  const incomingRequests = graphEngine.requests.filter(
    r => r.targetId === activeUser.id && r.status === 'pending'
  );

  const handleApprove = (requesterId) => {
    graphEngine.approveRequest(activeUser.id, requesterId);
  };

  const handleReject = (requesterId) => {
    graphEngine.rejectRequest(activeUser.id, requesterId);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white dark:bg-[#121316] border border-slate-200 dark:border-[#26292E] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-slate-900 dark:text-zinc-50">
                Pending Follow Requests
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Private account authorization queue
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Requests */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {incomingRequests.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-zinc-500">
              No pending follow requests for @{activeUser.username}.
            </div>
          ) : (
            incomingRequests.map((req) => {
              const requester = graphEngine.getUserById(req.requesterId);
              if (!requester) return null;

              // Check if activeUser is already following requester
              const activeFollowsRequester = graphEngine.hasEdge(activeUser.id, requester.id);

              return (
                <div
                  key={req.requesterId}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-3"
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer min-w-0"
                    onClick={() => {
                      if (onSelectUser) onSelectUser(requester);
                      onClose();
                    }}
                  >
                    <img
                      src={requester.avatarUrl}
                      alt={requester.displayName}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-slate-900 dark:text-zinc-100 truncate hover:underline">
                        {requester.displayName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono-num truncate">
                        @{requester.username}
                      </div>
                      {activeFollowsRequester && (
                        <div className="text-[10px] text-pink-600 dark:text-pink-400 font-medium flex items-center gap-1 mt-0.5">
                          <Sparkles className="w-3 h-3" />
                          <span>You already follow them — Approving unlocks Mutual Friendship!</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleApprove(requester.id)}
                      className="px-3 py-1.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-90 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReject(requester.id)}
                      className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Decline"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
