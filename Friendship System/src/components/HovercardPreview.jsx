import React, { useState, useRef, useEffect } from 'react';
import { useSocialGraph } from '../context/SocialGraphContext';
import { useRelationship } from '../hooks/useRelationship';
import { MutualBadge } from './MutualBadge';
import { RelationshipActionButton } from './RelationshipActionButton';
import { ContextualOverlapRadar } from './ContextualOverlapRadar';
import { Calendar, MapPin, Sparkles, Mail, Lock } from 'lucide-react';

export function HovercardPreview({ userId, children, align = 'left', onSelectUser = null }) {
  const { getUser, currentUserId } = useSocialGraph();
  const user = getUser(userId);
  const isMe = currentUserId === userId;

  const {
    state,
    mutualTenure,
    overlapRadar,
  } = useRelationship(userId);

  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 180); // Debounce to avoid jitter
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 220);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!user) return children;

  const isMutual = state === 'MUTUAL';

  return (
    <div 
      className="relative inline-block"
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger element */}
      <span 
        className="cursor-pointer"
        onClick={() => onSelectUser && onSelectUser(userId)}
      >
        {children}
      </span>

      {/* Floating Hovercard (Zero Layout Shift via fixed/absolute floating anchor) */}
      {isOpen && (
        <div 
          className={`absolute z-50 w-80 rounded-2xl glass-dropdown border border-slate-700/80 shadow-2xl p-4 text-left animate-in fade-in zoom-in-95 duration-150
            ${align === 'right' ? 'right-0' : 'left-0'} 
            top-full mt-2`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Cover & Avatar */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/30"
              />
              {user.isOnline && (
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" title="Online now" />
              )}
            </div>

            {/* Action button if not myself */}
            {!isMe && (
              <RelationshipActionButton targetUserId={userId} size="sm" />
            )}
          </div>

          {/* Names and Badges */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-sm text-white hover:text-indigo-400 transition-colors cursor-pointer" onClick={() => onSelectUser && onSelectUser(userId)}>
                {user.displayName}
              </span>
              {isMutual && <MutualBadge size="sm" />}
              {user.isPrivate && (
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                  Private
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400">
              @{user.username}
            </div>
          </div>

          {/* Bio snippet */}
          <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
            {user.bio}
          </p>

          {/* Mutual Milestone Chip (if mutual) */}
          {isMutual && mutualTenure && (
            <div className="mt-2.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center gap-1.5 text-[11px] text-amber-300 font-medium">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">{mutualTenure}</span>
            </div>
          )}

          {/* Metadata chips */}
          <div className="mt-2.5 flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
            {user.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span>{user.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>Joined {user.joinedDate}</span>
            </div>
          </div>

          {/* Contextual Overlap Radar */}
          {!isMe && (
            <div className="mt-3 pt-3 border-t border-slate-800/80">
              <ContextualOverlapRadar overlap={overlapRadar} />
            </div>
          )}

          {/* Intimate contact field status */}
          <div className="mt-2.5 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Contact visibility:</span>
            {isMutual || isMe ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {user.email}
              </span>
            ) : (
              <span className="text-slate-500 flex items-center gap-1 italic">
                <Lock className="w-3 h-3 text-slate-600" />
                Mutuals only
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
