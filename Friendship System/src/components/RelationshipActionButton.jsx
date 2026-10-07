import React, { useState, useRef, useEffect } from 'react';
import { 
  UserPlus, 
  UserCheck, 
  UserMinus, 
  UserX, 
  Clock, 
  Sparkles, 
  ChevronDown, 
  MessageSquare, 
  VolumeX, 
  Volume2, 
  ShieldAlert, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useRelationship } from '../hooks/useRelationship';

export function RelationshipActionButton({ 
  targetUserId, 
  size = 'md', 
  className = '',
  onOpenMessage = null,
}) {
  const {
    state,
    isPending,
    isMuted,
    lastError,
    handleFollow,
    handleUnfollow,
    handleFollowBack,
    handleSoftBlock,
    handleToggleMute,
    clearError,
  } = useRelationship(targetUserId);

  const [isHovered, setIsHovered] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Size styling tokens
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-1.5 text-xs font-semibold gap-2',
    lg: 'px-5 py-2.5 text-sm font-semibold gap-2.5',
  }[size] || 'px-3.5 py-1.5 text-xs font-semibold gap-2';

  // Spinner for pending optimistic action
  if (isPending) {
    return (
      <button
        disabled
        className={`inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 bg-slate-800/80 text-slate-400 border border-slate-700/60 cursor-wait ${sizeClasses} ${className}`}
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
        <span>Updating...</span>
      </button>
    );
  }

  // --------------------------------------------------------------------------
  // STATE 1: NONE -> "+ Follow"
  // --------------------------------------------------------------------------
  if (state === 'NONE') {
    return (
      <div className="relative inline-block">
        <button
          onClick={handleFollow}
          className={`group inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 
            bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 
            text-white shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-500/30 
            active:scale-[0.98] ${sizeClasses} ${className}`}
        >
          <UserPlus className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
          <span>Follow</span>
        </button>
        {lastError && (
          <div className="absolute top-full left-0 mt-1.5 z-30 p-2 text-[11px] rounded-lg bg-rose-950/90 text-rose-300 border border-rose-800/60 shadow-xl flex items-center gap-1.5 whitespace-nowrap">
            <AlertCircle className="w-3 h-3 text-rose-400" />
            <span>{lastError}</span>
            <button onClick={clearError} className="ml-1 text-slate-400 hover:text-white">✕</button>
          </div>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STATE 2: REQUESTED -> "Requested" (Clock icon, cancel on click)
  // --------------------------------------------------------------------------
  if (state === 'REQUESTED') {
    return (
      <div className="relative inline-block">
        <button
          onClick={handleUnfollow}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 
            ${isHovered 
              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/40 hover:bg-rose-500/25' 
              : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'}
            ${sizeClasses} ${className}`}
          title="Click to cancel follow request"
        >
          {isHovered ? (
            <>
              <UserX className="w-3.5 h-3.5 text-rose-400" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              <span>Requested</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STATE 3: FOLLOWING -> Morph to "Unfollow" (Red) on hover
  // --------------------------------------------------------------------------
  if (state === 'FOLLOWING') {
    return (
      <div className="relative inline-block">
        <button
          onClick={handleUnfollow}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 
            ${isHovered 
              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/40 hover:bg-rose-500/25 hover:shadow-[0_0_12px_rgba(244,63,94,0.2)]' 
              : 'bg-slate-800/80 text-slate-200 border border-slate-700 hover:border-slate-600'}
            ${sizeClasses} ${className}`}
        >
          {isHovered ? (
            <>
              <UserMinus className="w-3.5 h-3.5 text-rose-400 transition-transform scale-110" />
              <span>Unfollow</span>
            </>
          ) : (
            <>
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Following</span>
            </>
          )}
        </button>
        {lastError && (
          <div className="absolute top-full left-0 mt-1.5 z-30 p-2 text-[11px] rounded-lg bg-rose-950/90 text-rose-300 border border-rose-800/60 shadow-xl flex items-center gap-1.5 whitespace-nowrap">
            <AlertCircle className="w-3 h-3 text-rose-400" />
            <span>{lastError}</span>
            <button onClick={clearError} className="ml-1 text-slate-400 hover:text-white">✕</button>
          </div>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STATE 4: FOLLOW_BACK -> Reciprocal Closure (Pulsing Gradient & Micro-interaction)
  // --------------------------------------------------------------------------
  if (state === 'FOLLOW_BACK') {
    return (
      <div className="relative inline-block">
        <button
          onClick={handleFollowBack}
          className={`group relative inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 
            bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 
            text-white shadow-lg shadow-emerald-900/30 hover:shadow-emerald-500/30 
            active:scale-[0.98] ${sizeClasses} ${className}`}
          title="This user follows you! Click to complete the mutual friendship loop."
        >
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
          </span>
          <Sparkles className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
          <span>Follow Back</span>
        </button>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STATE 5: MUTUAL -> "Friends ✨" with Dropdown Settings Menu
  // --------------------------------------------------------------------------
  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(prev => !prev)}
        className={`inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 
          bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-amber-500/15 
          hover:from-amber-500/25 hover:to-emerald-500/25
          text-amber-300 border border-amber-500/40 hover:border-amber-400/70 
          shadow-[0_0_15px_rgba(234,179,8,0.15)] hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]
          ${sizeClasses} ${className}`}
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30 animate-pulse" />
        <span>Friends</span>
        <ChevronDown className={`w-3.5 h-3.5 text-amber-400/80 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Intimacy & Privacy Controls Dropdown */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-dropdown z-50 py-2 border border-slate-700/80 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3.5 py-2 border-b border-slate-800/80">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>Mutual Friendship</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Unlocked private channel & intimate feed visibility.
            </p>
          </div>

          <div className="py-1">
            {/* Direct Message (Mutual perk) */}
            <button
              onClick={() => {
                setDropdownOpen(false);
                if (onOpenMessage) onOpenMessage();
                else alert('Encrypted mutual messaging channel unlocked! Ready for direct communications.');
              }}
              className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 flex items-center gap-2.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>Send Direct Message</span>
            </button>

            {/* Mute Without Severing */}
            <button
              onClick={() => {
                handleToggleMute();
                setDropdownOpen(false);
              }}
              className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-amber-300 flex items-center gap-2.5 transition-colors"
            >
              {isMuted ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Unmute Updates</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mute Posts (Keep Mutual Badge)</span>
                </>
              )}
            </button>

            {/* Soft-Block / Remove Follower */}
            <button
              onClick={() => {
                handleSoftBlock();
                setDropdownOpen(false);
              }}
              className="w-full px-3.5 py-2 text-left text-xs font-medium text-rose-300 hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors"
              title="Silently removes them as a follower without sending any notification."
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Remove Follower (Silent Uncouple)</span>
            </button>

            {/* Unfollow */}
            <button
              onClick={() => {
                handleUnfollow();
                setDropdownOpen(false);
              }}
              className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 flex items-center gap-2.5 transition-colors border-t border-slate-800/80 mt-1"
            >
              <UserMinus className="w-3.5 h-3.5 text-slate-400" />
              <span>Unfollow (Drop to Follows You)</span>
            </button>
          </div>
        </div>
      )}

      {lastError && (
        <div className="absolute top-full right-0 mt-1.5 z-30 p-2 text-[11px] rounded-lg bg-rose-950/90 text-rose-300 border border-rose-800/60 shadow-xl flex items-center gap-1.5 whitespace-nowrap">
          <AlertCircle className="w-3 h-3 text-rose-400" />
          <span>{lastError}</span>
          <button onClick={clearError} className="ml-1 text-slate-400 hover:text-white">✕</button>
        </div>
      )}
    </div>
  );
}
