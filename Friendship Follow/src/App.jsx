import React, { useState, useEffect } from 'react';
import { graphEngine } from './engine/relationshipEngine.js';
import { ProfileHeader } from './components/ProfileHeader.jsx';
import { TieredSocialFeed } from './components/TieredSocialFeed.jsx';
import { DiscoveryRadar } from './components/DiscoveryRadar.jsx';
import { SocialConnectionsDrawer } from './components/SocialConnectionsDrawer.jsx';
import { DirectMessageDrawer } from './components/DirectMessageDrawer.jsx';
import { PendingRequestsModal } from './components/PendingRequestsModal.jsx';
import { GraphArchitectureDrawer } from './components/GraphArchitectureDrawer.jsx';
import { ActiveUserSwitcher } from './components/ActiveUserSwitcher.jsx';
import { ToastContainer } from './components/ToastContainer.jsx';
import { 
  Database, 
  Sun, 
  Moon, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  AlertTriangle,
  Flame,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

export function App() {
  const [activeUser, setActiveUser] = useState(() => graphEngine.getActiveUser());
  const [selectedUser, setSelectedUser] = useState(() => {
    // Default to a user other than activeUser (e.g. Liam Torres or Alex Chen) to immediately showcase relationship interactions
    return graphEngine.getUserById('user_liam') || graphEngine.users[1];
  });

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [simulateError, setSimulateError] = useState(false);

  // Modals state
  const [connectionsDrawer, setConnectionsDrawer] = useState({ isOpen: false, tab: 'followers', user: null });
  const [directMessageUser, setDirectMessageUser] = useState(null);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [showDemoTour, setShowDemoTour] = useState(false);

  // Listen to engine updates
  useEffect(() => {
    const unsubscribe = graphEngine.subscribe(() => {
      setActiveUser(graphEngine.getActiveUser());
      if (selectedUser) {
        setSelectedUser(graphEngine.getUserById(selectedUser.id) || selectedUser);
      }
    });
    return unsubscribe;
  }, [selectedUser]);

  // Dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleToggleSimulation = () => {
    const nextVal = !simulateError;
    setSimulateError(nextVal);
    graphEngine.setSimulateNetworkError(nextVal);
  };

  const handleResetGraph = () => {
    graphEngine.resetToDefaults();
    setActiveUser(graphEngine.getActiveUser());
    setSelectedUser(graphEngine.getUserById('user_liam'));
  };

  const handleOpenConnections = (tab) => {
    setConnectionsDrawer({
      isOpen: true,
      tab,
      user: selectedUser,
    });
  };

  // Pending incoming requests count for active user
  const incomingRequestsCount = graphEngine.requests.filter(
    r => r.targetId === activeUser.id && r.status === 'pending'
  ).length;

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#0A0A0C] text-[#0F172A] dark:text-[#F8FAFC] transition-colors">
      {/* 1. Global Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-[#0A0A0C]/85 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#26292E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.3)]">
              {/* Linked twin rings glyph */}
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="8.5" cy="12" r="4.5" />
                <circle cx="15.5" cy="12" r="4.5" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold font-display tracking-tight text-base sm:text-lg bg-gradient-to-r from-violet-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  NEXUS
                </span>
                <span className="text-[10px] font-mono-num font-bold px-1.5 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-300 border border-pink-500/20">
                  MUTUAL GRAPH
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono-num hidden sm:block">
                Asymmetrical-to-Symmetrical Follow Engine
              </p>
            </div>
          </div>

          {/* Quick Simulation / Architecture Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Network Failure Simulation Toggle */}
            <button
              type="button"
              onClick={handleToggleSimulation}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                simulateError
                  ? 'bg-red-500/15 border-red-500 text-red-600 dark:text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.25)] animate-pulse'
                  : 'bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
              title="Toggle simulated network error to test instant optimistic rollback with shake animation"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Simulation:</span>
              <span className="font-mono-num">{simulateError ? 'Fail Rollback' : 'Healthy (0ms)'}</span>
            </button>

            {/* Architecture & SQL Schema Modal */}
            <button
              type="button"
              onClick={() => setIsArchitectureModalOpen(true)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-pink-300 border border-violet-500/30 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="View PostgreSQL Schema, Materialized View, and Triggers"
            >
              <Database className="w-3.5 h-3.5 text-pink-500" />
              <span className="hidden sm:inline">PostgreSQL Engine</span>
            </button>

            {/* Follow Requests Queue (for private accounts) */}
            <button
              type="button"
              onClick={() => setIsRequestsModalOpen(true)}
              className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-colors cursor-pointer"
              title="Pending follow authorization requests"
            >
              <Clock className="w-4 h-4" />
              {incomingRequestsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-zinc-900">
                  {incomingRequestsCount}
                </span>
              )}
            </button>

            {/* Dark / Light Mode Switch */}
            <button
              type="button"
              onClick={() => setIsDarkMode(prev => !prev)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-colors cursor-pointer"
              title="Toggle Dark / Light Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Active Identity Switcher */}
            <ActiveUserSwitcher
              onSwitchUser={(user) => {
                setActiveUser(user);
              }}
              simulateNetworkError={simulateError}
              onToggleNetworkSimulation={handleToggleSimulation}
              onResetGraph={handleResetGraph}
            />
          </div>
        </div>

        {/* Quick User Inspector Carousel Bar */}
        <div className="bg-slate-50/70 dark:bg-[#121316]/70 border-t border-slate-200/60 dark:border-zinc-800/60 px-4 sm:px-6 py-2 overflow-x-auto flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Profiles:
          </span>
          {graphEngine.users.map((u) => {
            const isSelected = selectedUser?.id === u.id;
            const isMutual = graphEngine.isMutual(activeUser.id, u.id);
            const theyFollowMe = graphEngine.hasEdge(u.id, activeUser.id);
            const isSelf = activeUser.id === u.id;

            return (
              <button
                key={u.id}
                type="button"
                onClick={() => setSelectedUser(u)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-semibold shadow-xs'
                    : 'bg-white dark:bg-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full p-[1px] ${isMutual ? 'animate-mutual-ring' : ''}`}>
                  <img src={u.avatarUrl} alt={u.displayName} className="w-full h-full rounded-full object-cover" />
                </div>
                <span>{u.displayName}</span>
                {isSelf ? (
                  <span className="text-[9px] opacity-60">(You)</span>
                ) : isMutual ? (
                  <span className="text-[10px] text-pink-500 font-bold">✨ Mutual</span>
                ) : theyFollowMe ? (
                  <span className="text-[10px] text-blue-500 font-medium">⮂ Follows You</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Profile Hero & Tiered Social Feed (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Selected User Profile Header with Friendship Reveal */}
            <ProfileHeader
              targetUser={selectedUser}
              onOpenConnections={handleOpenConnections}
              onOpenDirectMessage={(userId) => {
                const target = graphEngine.getUserById(userId);
                setDirectMessageUser(target);
              }}
            />

            {/* Interactive Tiered Social Feed */}
            <TieredSocialFeed
              onSelectUser={(user) => setSelectedUser(user)}
            />
          </div>

          {/* Right Column: Graph Discovery Radar & Interaction Guide (4 Cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Interactive Scenario Playbook Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-violet-500/10 via-pink-500/10 to-transparent border border-violet-500/25 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-xl bg-pink-500/20 text-pink-500">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-display text-slate-900 dark:text-zinc-100">
                    Interactive Test Scenarios
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Verify key relationship engine capabilities
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-300">
                {/* Scenario 1: Follow Back celebration */}
                <div className="p-3 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/60">
                  <div className="font-semibold text-slate-900 dark:text-zinc-100 flex items-center justify-between">
                    <span>1. "Follow Back" Mutual Spark</span>
                    <button
                      type="button"
                      onClick={() => {
                        graphEngine.setActiveUser('user_maya');
                        setSelectedUser(graphEngine.getUserById('user_liam'));
                      }}
                      className="text-[10px] text-pink-600 dark:text-pink-400 font-bold hover:underline cursor-pointer"
                    >
                      Test Now →
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    Maya is followed by Liam. Click <strong className="text-blue-600 dark:text-blue-400">Follow Back ⮂</strong> on Liam to trigger the celebratory confetti spark, spinning gradient ring, and unlocked contact gate!
                  </p>
                </div>

                {/* Scenario 2: Private Request Gate */}
                <div className="p-3 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/60">
                  <div className="font-semibold text-slate-900 dark:text-zinc-100 flex items-center justify-between">
                    <span>2. Private Follow Request Gate</span>
                    <button
                      type="button"
                      onClick={() => {
                        graphEngine.setActiveUser('user_maya');
                        setSelectedUser(graphEngine.getUserById('user_elena'));
                      }}
                      className="text-[10px] text-violet-600 dark:text-violet-400 font-bold hover:underline cursor-pointer"
                    >
                      Test Now →
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    Elena has a private account. Click <strong className="text-slate-800 dark:text-zinc-200">+ Follow</strong> → transitions to <strong className="text-amber-500">Requested ⏳</strong>. Switch active persona to Elena to confirm!
                  </p>
                </div>

                {/* Scenario 3: Soft Block & Mute */}
                <div className="p-3 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/60">
                  <div className="font-semibold text-slate-900 dark:text-zinc-100">
                    <span>3. Silent Soft-Block & Mute</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    On any <strong className="text-pink-600">Friends ✨</strong> button, click the chevron to test <em>Silent Uncouple ("Soft Block")</em> or <em>Mute Without Severing</em>.
                  </p>
                </div>

                {/* Scenario 4: Optimistic Rollback */}
                <div className="p-3 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/60">
                  <div className="font-semibold text-slate-900 dark:text-zinc-100 flex items-center justify-between">
                    <span>4. Optimistic UI Rollback</span>
                    <button
                      type="button"
                      onClick={handleToggleSimulation}
                      className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer"
                    >
                      {simulateError ? 'Deactivate' : 'Activate Fail'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    Toggle "Simulation: Fail Rollback" in header, then click any relationship button. The UI optimistically updates, then shakes and smoothly rolls back!
                  </p>
                </div>
              </div>
            </div>

            {/* Smart Suggestions Based on Graph Triangle Density */}
            <DiscoveryRadar
              onSelectUser={(user) => setSelectedUser(user)}
            />

            {/* Active User Memory & Metrics Card */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#121316] border border-[#E2E8F0] dark:border-[#26292E] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={activeUser.avatarUrl}
                  alt={activeUser.displayName}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-violet-500"
                />
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                    {activeUser.displayName}
                  </div>
                  <div className="text-xs text-slate-400 font-mono-num">
                    @{activeUser.username} (Active Persona)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center py-3 border-y border-slate-100 dark:border-zinc-800 font-mono-num">
                <div>
                  <div className="text-base font-bold text-slate-900 dark:text-zinc-100">
                    {graphEngine.getFollowing(activeUser.id).length}
                  </div>
                  <div className="text-[10px] text-slate-400">Following</div>
                </div>
                <div>
                  <div className="text-base font-bold text-slate-900 dark:text-zinc-100">
                    {graphEngine.getFollowers(activeUser.id).length}
                  </div>
                  <div className="text-[10px] text-slate-400">Followers</div>
                </div>
                <div>
                  <div className="text-base font-bold text-pink-600 dark:text-pink-400">
                    {graphEngine.getMutualFriends(activeUser.id).length}
                  </div>
                  <div className="text-[10px] text-slate-400">Mutuals ✨</div>
                </div>
              </div>

              <div className="mt-3 pt-1 text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                Tip: Switching between user personas lets you test reciprocal relationships from both sides of the graph.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Global Overlays & Modals */}
      <SocialConnectionsDrawer
        targetUser={connectionsDrawer.user}
        initialTab={connectionsDrawer.tab}
        isOpen={connectionsDrawer.isOpen}
        onClose={() => setConnectionsDrawer({ isOpen: false, tab: 'followers', user: null })}
        onSelectUser={(u) => setSelectedUser(u)}
      />

      <DirectMessageDrawer
        targetUser={directMessageUser}
        isOpen={!!directMessageUser}
        onClose={() => setDirectMessageUser(null)}
      />

      <PendingRequestsModal
        isOpen={isRequestsModalOpen}
        onClose={() => setIsRequestsModalOpen(false)}
        onSelectUser={(u) => setSelectedUser(u)}
      />

      <GraphArchitectureDrawer
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />

      {/* Real-time Event Toasts */}
      <ToastContainer />
    </div>
  );
}
