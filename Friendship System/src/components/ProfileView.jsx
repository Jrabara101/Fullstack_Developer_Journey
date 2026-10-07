import React, { useMemo } from 'react';
import { 
  MapPin, 
  Link as LinkIcon, 
  Calendar, 
  Sparkles, 
  Mail, 
  Phone, 
  Lock, 
  ShieldCheck, 
  Users, 
  Activity,
  ArrowLeft
} from 'lucide-react';
import { useSocialGraph } from '../context/SocialGraphContext';
import { useRelationship } from '../hooks/useRelationship';
import { 
  getUserFollowers, 
  getUserFollowing, 
  getUserMutuals 
} from '../utils/graphAlgorithms';
import { MutualBadge } from './MutualBadge';
import { RelationshipActionButton } from './RelationshipActionButton';
import { ContextualOverlapRadar } from './ContextualOverlapRadar';

export function ProfileView({ userId, onOpenConnections, onBackToFeed, onSelectUser }) {
  const { users, relationships, currentUserId, currentUser, getUser } = useSocialGraph();
  const profileUser = getUser(userId) || currentUser;
  const isMe = currentUserId === userId;

  const {
    state,
    mutualTenure,
    sharedConnections,
    overlapRadar,
    isMuted,
  } = useRelationship(userId);

  // Compute followers, following, mutual counts
  const followers = useMemo(() => getUserFollowers(relationships, users, userId), [relationships, users, userId]);
  const following = useMemo(() => getUserFollowing(relationships, users, userId), [relationships, users, userId]);
  const mutuals = useMemo(() => getUserMutuals(relationships, users, userId), [relationships, users, userId]);

  const isMutual = state === 'MUTUAL';
  const isFollowingUser = state === 'FOLLOWING' || state === 'MUTUAL';
  const hasAccessToPrivate = !profileUser.isPrivate || isFollowingUser || isMe;

  return (
    <div className="rounded-3xl overflow-hidden glass-panel border border-slate-800 shadow-xl">
      {/* Cover Image */}
      <div className="relative h-48 w-full bg-slate-800 overflow-hidden">
        {profileUser.coverImage ? (
          <img
            src={profileUser.coverImage}
            alt="Profile Cover"
            className="w-full h-full object-cover brightness-[0.7]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900" />
        )}

        {/* Back navigation button if viewing another profile */}
        {!isMe && (
          <button
            onClick={onBackToFeed}
            className="absolute top-4 left-4 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Feed</span>
          </button>
        )}

        {/* Real-time Presence Badge */}
        {profileUser.isOnline && (
          <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1.5 text-[11px] text-emerald-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active now</span>
          </div>
        )}
      </div>

      {/* Main Profile Info Header */}
      <div className="px-6 pb-6 pt-0 relative">
        {/* Avatar + Main Action Button Row */}
        <div className="flex items-end justify-between -mt-16 mb-4 flex-wrap gap-4">
          <div className="relative">
            <img
              src={profileUser.avatar}
              alt={profileUser.displayName}
              className="w-28 h-28 rounded-3xl object-cover ring-4 ring-[#090a0f] shadow-2xl bg-slate-900"
            />
            {profileUser.isPrivate && (
              <div 
                className="absolute bottom-0 right-0 p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 shadow-md"
                title="Protected account: Follow request approval required"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {!isMe ? (
              <RelationshipActionButton targetUserId={userId} size="lg" />
            ) : (
              <div className="px-3 py-1.5 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                👤 Active Perspective (You)
              </div>
            )}
          </div>
        </div>

        {/* Names, Handles & Badges */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-black text-white tracking-tight">
              {profileUser.displayName}
            </h1>
            {isMutual && <MutualBadge size="md" />}
            {isMuted && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-amber-400 border border-amber-500/30">
                Muted by you
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>@{profileUser.username}</span>
            {profileUser.pronouns && (
              <>
                <span>•</span>
                <span className="text-slate-500">{profileUser.pronouns}</span>
              </>
            )}
          </div>
        </div>

        {/* Bio */}
        <p className="mt-3 text-sm text-slate-200 leading-relaxed max-w-2xl">
          {profileUser.bio}
        </p>

        {/* Mutual Milestone Chip (Requirement: "Relationship Timeline Milestone: Contextual profile memory chip displaying mutual tenure") */}
        {isMutual && mutualTenure && (
          <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-300 shadow-sm animate-float-subtle">
            <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            <span>{mutualTenure}</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-300 font-medium">
              {sharedConnections.length} Shared Connections
            </span>
          </div>
        )}

        {/* Contextual Overlap Radar */}
        {!isMe && (
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Social Proof Overlap
            </div>
            <ContextualOverlapRadar overlap={overlapRadar} />
          </div>
        )}

        {/* Metadata Details Row */}
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-400 flex-wrap">
          {profileUser.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{profileUser.location}</span>
            </div>
          )}
          {profileUser.website && (
            <div className="flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
              <a 
                href={profileUser.website} 
                target="_blank" 
                rel="noreferrer" 
                className="text-indigo-400 hover:underline"
              >
                {profileUser.website.replace('https://', '')}
              </a>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Joined {profileUser.joinedDate}</span>
          </div>
          {profileUser.activityStatus && (
            <div className="flex items-center gap-1.5 text-slate-300">
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              <span>{profileUser.activityStatus}</span>
            </div>
          )}
        </div>

        {/* Stats Row (Clicking any opens Connections Drawer) */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-6">
          <button 
            onClick={() => onOpenConnections('mutuals')}
            className="group text-left"
          >
            <div className="text-lg font-bold text-amber-400 group-hover:text-amber-300 transition-colors flex items-center gap-1">
              <span>{mutuals.length}</span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </div>
            <div className="text-xs text-slate-400 group-hover:text-slate-300">
              Mutuals
            </div>
          </button>

          <button 
            onClick={() => onOpenConnections('following')}
            className="group text-left"
          >
            <div className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
              {following.length}
            </div>
            <div className="text-xs text-slate-400 group-hover:text-slate-300">
              Following
            </div>
          </button>

          <button 
            onClick={() => onOpenConnections('followers')}
            className="group text-left"
          >
            <div className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
              {followers.length}
            </div>
            <div className="text-xs text-slate-400 group-hover:text-slate-300">
              Followers
            </div>
          </button>
        </div>

        {/* Tiered Contact Info Gating (PostgreSQL RLS showcase) */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Intimate Direct Contact (PostgreSQL RLS Protected)</span>
            </div>
            {isMutual || isMe ? (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Unlocked (Mutual Intimacy)
              </span>
            ) : (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                Restricted to Mutual Friends
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-2">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500">Email Address</div>
                <div className="font-mono text-slate-200">
                  {isMutual || isMe ? profileUser.email : '••••••••••••@••••.dev (Mutuals only)'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500">Direct Signal / Phone</div>
                <div className="font-mono text-slate-200">
                  {isMutual || isMe ? profileUser.phone : '+1 (•••) •••-•••• (Mutuals only)'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interests & Tags */}
        {profileUser.interests && profileUser.interests.length > 0 && (
          <div className="mt-4 flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-500 mr-1">Interests:</span>
            {profileUser.interests.map(interest => (
              <span
                key={interest}
                className="px-2.5 py-0.5 rounded-lg text-xs bg-slate-800/60 text-slate-300 border border-slate-700/60"
              >
                #{interest}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
