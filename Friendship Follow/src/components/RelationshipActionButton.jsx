import React, { useState, useRef, useEffect } from 'react';
import { useRelationship } from '../hooks/useRelationship.js';
import { RelationshipState } from '../types/index.js';
import { triggerMutualSpark } from '../utils/confetti.js';
import { 
  UserPlus, 
  Repeat2, 
  Clock, 
  Check, 
  Sparkles, 
  UserMinus, 
  ChevronDown, 
  VolumeX, 
  Volume2, 
  UserX, 
  MessageSquare,
  ShieldAlert,
  Loader2
} from 'lucide-react';

export function RelationshipActionButton({
  targetUserId,
  size = 'md',
  onMutualUnlocked = null,
  onOpenDirectMessage = null,
  className = '',
}) {
  const {
    state,
    isPending,
    isShaking,
    isMuted,
    executeFollowAction,
    softBlock,
    toggleMute,
  } = useRelationship(targetUserId);

  const [isHovered, setIsHovered] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [isSpringPopping, setIsSpringPopping] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target)
      ) {
        setShowSettingsDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (state === 'SELF') {
    return (
      <span className="text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 font-medium">
        You (Active User)
      </span>
    );
  }

  const handleClick = async (e) => {
    e.stopPropagation();

    // If clicking from FOLLOW_BACK, it unlocks mutual friendship!
    const wasFollowBack = state === RelationshipState.FOLLOW_BACK;

    if (wasFollowBack) {
      setIsSpringPopping(true);
      setTimeout(() => setIsSpringPopping(false), 500);
      triggerMutualSpark(buttonRef.current);
    }

    try {
      const nextState = await executeFollowAction();
      if (wasFollowBack || nextState === RelationshipState.MUTUAL) {
        if (onMutualUnlocked) {
          onMutualUnlocked();
        }
      }
    } catch {
      // Handled by hook with shake animation
    }
  };

  const handleDropdownToggle = (e) => {
    e.stopPropagation();
    setShowSettingsDropdown(prev => !prev);
  };

  const handleMuteClick = (e) => {
    e.stopPropagation();
    toggleMute();
    setShowSettingsDropdown(false);
  };

  const handleSoftBlockClick = async (e) => {
    e.stopPropagation();
    setShowSettingsDropdown(false);
    try {
      await softBlock();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDmClick = (e) => {
    e.stopPropagation();
    setShowSettingsDropdown(false);
    if (onOpenDirectMessage) {
      onOpenDirectMessage(targetUserId);
    }
  };

  const sizeClasses = size === 'sm'
    ? 'text-xs px-3 py-1'
    : 'text-sm px-4 py-1.5';

  return (
    <div className={`relative inline-block ${className}`}>
      {/* 1. NOT FOLLOWING / STRANGER (+ Follow) */}
      {state === RelationshipState.NONE && (
        <button
          ref={buttonRef}
          type="button"
          onClick={handleClick}
          disabled={isPending}
          className={`${sizeClasses} bg-slate-900 text-white dark:bg-white dark:text-black font-medium rounded-full hover:opacity-90 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm cursor-pointer ${
            isShaking ? 'animate-shake border border-red-500' : ''
          }`}
          title="Follow this account to see public updates in your feed"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <UserPlus className="w-3.5 h-3.5" />
          )}
          <span>Follow</span>
        </button>
      )}

      {/* 2. FOLLOW BACK (Follow Back ⮂) */}
      {state === RelationshipState.FOLLOW_BACK && (
        <button
          ref={buttonRef}
          type="button"
          onClick={handleClick}
          disabled={isPending}
          className={`${sizeClasses} border border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 font-medium rounded-full transition-all active:scale-95 flex items-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer ${
            isSpringPopping ? 'animate-spring-pop' : ''
          } ${isShaking ? 'animate-shake border-red-500 text-red-500' : ''}`}
          title="They follow you! Click to unlock Mutual Friendship ✨"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Repeat2 className="w-3.5 h-3.5" />
          )}
          <span>Follow Back</span>
        </button>
      )}

      {/* 3. PENDING APPROVAL (Requested ⏳) */}
      {state === RelationshipState.REQUESTED && (
        <button
          ref={buttonRef}
          type="button"
          onClick={handleClick}
          disabled={isPending}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`${sizeClasses} bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 font-medium rounded-full transition-all flex items-center gap-1.5 cursor-pointer hover:border-red-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 ${
            isShaking ? 'animate-shake border-red-500' : ''
          }`}
          title="Private account request pending. Click to cancel."
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isHovered ? (
            <>
              <UserMinus className="w-3.5 h-3.5 text-red-500" />
              <span className="text-red-500">Cancel</span>
            </>
          ) : (
            <>
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Requested</span>
            </>
          )}
        </button>
      )}

      {/* 4. FOLLOWING ONE-WAY (Following -> Hover: Unfollow) */}
      {state === RelationshipState.FOLLOWING && (
        <button
          ref={buttonRef}
          type="button"
          onClick={handleClick}
          disabled={isPending}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`${sizeClasses} border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-medium rounded-full transition-colors duration-150 flex items-center gap-1.5 cursor-pointer hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 ${
            isShaking ? 'animate-shake border-red-500' : ''
          }`}
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isHovered ? (
            <>
              <UserMinus className="w-3.5 h-3.5" />
              <span>Unfollow</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
              <span>Following</span>
            </>
          )}
        </button>
      )}

      {/* 5. MUTUAL FRIENDS (Friends ✨ + Dropdown) */}
      {state === RelationshipState.MUTUAL && (
        <div className="inline-flex items-center rounded-full shadow-sm bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 border border-violet-500/30 text-violet-700 dark:text-pink-300">
          <button
            ref={buttonRef}
            type="button"
            onClick={handleClick}
            disabled={isPending}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`${sizeClasses} pr-2 font-medium transition-all flex items-center gap-1.5 cursor-pointer hover:text-red-600 dark:hover:text-red-400 ${
              isSpringPopping ? 'animate-spring-pop' : ''
            } ${isShaking ? 'animate-shake' : ''}`}
            title="Mutual Friendship active! Click to sever or use dropdown for settings"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isHovered ? (
              <>
                <UserMinus className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
                <span>Friends</span>
              </>
            )}
          </button>

          {/* Dropdown Chevron Trigger */}
          <button
            type="button"
            onClick={handleDropdownToggle}
            className="px-2 py-1.5 border-l border-violet-500/20 hover:bg-violet-500/15 rounded-r-full transition-colors cursor-pointer text-violet-600 dark:text-pink-300"
            title="Relationship Settings (Mute, Soft Remove, Message)"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Dropdown Menu for Mutual Friendship Settings */}
      {showSettingsDropdown && state === RelationshipState.MUTUAL && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-56 rounded-xl shadow-2xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md z-50 py-1.5 text-xs text-slate-700 dark:text-zinc-200"
        >
          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-zinc-800 text-[11px] font-medium text-slate-400 dark:text-zinc-400">
            Friendship Controls
          </div>

          {onOpenDirectMessage && (
            <button
              type="button"
              onClick={handleDmClick}
              className="w-full text-left px-3 py-2 hover:bg-violet-50 dark:hover:bg-violet-950/30 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-violet-500" />
              <div>
                <div className="font-medium text-slate-800 dark:text-zinc-100">Direct Message</div>
                <div className="text-[10px] text-slate-400">Unlocked for mutuals</div>
              </div>
            </button>
          )}

          <button
            type="button"
            onClick={handleMuteClick}
            className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer transition-colors"
          >
            {isMuted ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-500" />
                <div>
                  <div className="font-medium text-slate-800 dark:text-zinc-100">Unmute Posts</div>
                  <div className="text-[10px] text-slate-400">Restore posts in feed</div>
                </div>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-amber-500" />
                <div>
                  <div className="font-medium text-slate-800 dark:text-zinc-100">Mute Without Severing</div>
                  <div className="text-[10px] text-slate-400">Keep mutual badge, hide posts</div>
                </div>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSoftBlockClick}
            className="w-full text-left px-3 py-2 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <div>
              <div className="font-medium">Silent Uncouple ("Soft Block")</div>
              <div className="text-[10px] text-slate-400">Remove as follower silently</div>
            </div>
          </button>

          <div className="border-t border-slate-100 dark:border-zinc-800 my-1" />

          <button
            type="button"
            onClick={handleClick}
            className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <UserX className="w-4 h-4 text-red-500" />
            <div>
              <div className="font-medium">Unfriend (Sever Mutual)</div>
              <div className="text-[10px] text-slate-400">Drops back to one-way follow</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
