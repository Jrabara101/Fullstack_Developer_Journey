import React, { useState, useEffect, useRef } from 'react';
import { graphEngine } from '../engine/relationshipEngine.js';
import { MutualBadge } from './MutualBadge.jsx';
import { X, Send, Lock, ShieldCheck } from 'lucide-react';

export function DirectMessageDrawer({
  targetUser,
  isOpen,
  onClose,
}) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const activeUser = graphEngine.getActiveUser();

  const isMutual = activeUser && targetUser
    ? graphEngine.isMutual(activeUser.id, targetUser.id)
    : false;

  useEffect(() => {
    if (!activeUser || !targetUser) return;

    const loadMessages = () => {
      const msgs = graphEngine.getDirectMessagesBetween(activeUser.id, targetUser.id);
      setMessages(msgs);
    };

    loadMessages();
    const unsubscribe = graphEngine.subscribe((event) => {
      if (event?.type === 'DIRECT_MESSAGE_SENT') {
        loadMessages();
      }
    });

    return unsubscribe;
  }, [activeUser, targetUser, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  if (!isOpen || !targetUser || !activeUser) return null;

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !isMutual) return;

    try {
      graphEngine.sendDirectMessage(activeUser.id, targetUser.id, inputValue.trim());
      setInputValue('');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#121316] border border-slate-200 dark:border-[#26292E] shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/60 dark:bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={targetUser.avatarUrl}
                alt={targetUser.displayName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-500/50"
              />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 ring-2 ring-white dark:ring-zinc-900" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-50">
                  {targetUser.displayName}
                </h3>
                <MutualBadge size="sm" />
              </div>
              <p className="text-[11px] text-slate-400 font-mono-num">
                @{targetUser.username} • End-to-End Encrypted Mutual Channel
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mutual Channel Banner */}
        <div className="px-4 py-2 bg-gradient-to-r from-violet-500/10 to-pink-500/10 border-b border-violet-500/20 text-[11px] text-violet-700 dark:text-pink-300 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-pink-500" />
            <span>Mutual friendship verified. Private direct communication is unlocked.</span>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No messages yet. Say hello to your new mutual friend! 👋
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === activeUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      isMine
                        ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-br-xs shadow-xs'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 rounded-bl-xs'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono-num">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#121316]">
          {isMutual ? (
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Message ${targetUser.displayName}...`}
                className="flex-1 text-xs px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-800/80 border border-transparent focus:border-violet-500 dark:focus:border-violet-400 text-slate-800 dark:text-zinc-100 outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-600 text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="text-center py-2 text-xs text-slate-400 flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Direct messages are locked until reciprocal friendship is established.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
