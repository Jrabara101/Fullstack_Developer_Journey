import React, { useState } from 'react';
import { 
  SocialGraphProvider, 
  useSocialGraph 
} from './context/SocialGraphContext';
import { Navbar } from './components/Navbar';
import { FeedView } from './components/FeedView';
import { ProfileView } from './components/ProfileView';
import { GraphTopologyVisualizer } from './components/GraphTopologyVisualizer';
import { SmartSuggestions } from './components/SmartSuggestions';
import { PersonaSwitcher } from './components/PersonaSwitcher';
import { EventLogTicker } from './components/EventLogTicker';
import { SocialConnectionsDrawer } from './components/SocialConnectionsDrawer';
import { MutualCelebrationModal } from './components/MutualCelebrationModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { MutualBadge } from './components/MutualBadge';
import { RelationshipActionButton } from './components/RelationshipActionButton';
import { HovercardPreview } from './components/HovercardPreview';
import { 
  Sparkles, 
  Users, 
  Network, 
  Database, 
  ShieldCheck, 
  Compass, 
  Activity,
  ArrowRight,
  Zap,
  Lock
} from 'lucide-react';
import { getUserMutuals, getUserFollowers, getUserFollowing } from './utils/graphAlgorithms';

function MainDashboard() {
  const { 
    currentUser, 
    users, 
    relationships, 
    currentUserId,
    setCurrentUserId,
    getUser 
  } = useSocialGraph();

  // Navigation and Modal State
  const [currentView, setCurrentView] = useState('feed'); // 'feed' | 'topology' | 'profile'
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [connectionsDrawerOpen, setConnectionsDrawerOpen] = useState(false);
  const [connectionsDrawerTarget, setConnectionsDrawerTarget] = useState(null);
  const [connectionsDrawerTab, setConnectionsDrawerTab] = useState('mutuals');
  const [architectureModalOpen, setArchitectureModalOpen] = useState(false);

  const mutuals = getUserMutuals(relationships, users, currentUserId);
  const followers = getUserFollowers(relationships, users, currentUserId);
  const following = getUserFollowing(relationships, users, currentUserId);

  const handleOpenProfile = (userId) => {
    setSelectedProfileId(userId);
    setCurrentView('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenConnections = (tab = 'mutuals', targetId = null) => {
    setConnectionsDrawerTab(tab);
    setConnectionsDrawerTarget(targetId || currentUserId);
    setConnectionsDrawerOpen(true);
  };

  // Other users to discover in the sidebar
  const discoveryUsers = users
    .filter(u => u.id !== currentUserId)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenConnections={handleOpenConnections}
        onOpenArchitecture={() => setArchitectureModalOpen(true)}
        onOpenProfile={handleOpenProfile}
      />

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ================================================================ */}
          {/* LEFT SIDEBAR (Col 1-3): Identity, Intimacy Privileges & Radar    */}
          {/* ================================================================ */}
          <div className="lg:col-span-3 space-y-6">
            {/* Current Active Persona Card */}
            <div className="rounded-3xl glass-panel border border-slate-800 p-5 shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.displayName}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/40"
                  />
                  {currentUser.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                    <span>{currentUser.displayName}</span>
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    @{currentUser.username}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {currentUser.bio}
              </p>

              {/* Connections Stat Bar */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-1 text-center">
                <button
                  onClick={() => handleOpenConnections('mutuals')}
                  className="p-1 rounded-xl hover:bg-slate-800/60 transition-colors"
                >
                  <div className="text-xs font-bold text-amber-400 flex items-center justify-center gap-0.5">
                    <span>{mutuals.length}</span>
                    <Sparkles className="w-2.5 h-2.5" />
                  </div>
                  <div className="text-[10px] text-slate-400">Mutuals</div>
                </button>

                <button
                  onClick={() => handleOpenConnections('following')}
                  className="p-1 rounded-xl hover:bg-slate-800/60 transition-colors"
                >
                  <div className="text-xs font-bold text-white">{following.length}</div>
                  <div className="text-[10px] text-slate-400">Following</div>
                </button>

                <button
                  onClick={() => handleOpenConnections('followers')}
                  className="p-1 rounded-xl hover:bg-slate-800/60 transition-colors"
                >
                  <div className="text-xs font-bold text-white">{followers.length}</div>
                  <div className="text-[10px] text-slate-400">Followers</div>
                </button>
              </div>

              <button
                onClick={() => handleOpenProfile(currentUserId)}
                className="mt-4 w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-indigo-300 border border-slate-700/60 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View Full Profile</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Asymmetrical to Symmetrical Feature Callout */}
            <div className="rounded-2xl glass-panel p-4 border border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-transparent">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Asymmetrical ➔ Symmetrical</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                One-way subscriptions allow friction-free discovery. When both parties reciprocate, the system triggers <strong className="text-amber-300">FRIENDSHIP_CONFIRMED</strong>, instantly unlocking private channels & mutual stories.
              </p>
            </div>

            {/* Smart Suggestions (Graph Triangle Completions) */}
            <SmartSuggestions onSelectUser={handleOpenProfile} />
          </div>

          {/* ================================================================ */}
          {/* CENTER STAGE (Col 4-8): Active Feed, Topology or Profile Card     */}
          {/* ================================================================ */}
          <div className="lg:col-span-6 space-y-6">
            {/* View Selector Tabs for Mobile / Tablet */}
            <div className="md:hidden flex items-center gap-2 bg-slate-900/60 p-1 rounded-2xl border border-slate-800">
              <button
                onClick={() => setCurrentView('feed')}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                  currentView === 'feed'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400'
                }`}
              >
                Social Feed
              </button>
              <button
                onClick={() => setCurrentView('topology')}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  currentView === 'topology'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Topology</span>
              </button>
            </div>

            {/* View 1: Social Feed */}
            {currentView === 'feed' && (
              <FeedView onSelectUser={handleOpenProfile} />
            )}

            {/* View 2: Graph Topology Visualizer */}
            {currentView === 'topology' && (
              <GraphTopologyVisualizer onSelectUser={handleOpenProfile} />
            )}

            {/* View 3: Profile Detail Card */}
            {currentView === 'profile' && (
              <ProfileView
                userId={selectedProfileId || currentUserId}
                onOpenConnections={handleOpenConnections}
                onBackToFeed={() => setCurrentView('feed')}
                onSelectUser={handleOpenProfile}
              />
            )}
          </div>

          {/* ================================================================ */}
          {/* RIGHT SIDEBAR (Col 9-12): Personas, Realtime Broker, Discovery   */}
          {/* ================================================================ */}
          <div className="lg:col-span-3 space-y-6">
            {/* Persona Switcher Box (Test Multi-Perspective) */}
            <PersonaSwitcher />

            {/* Real-time Event Log Ticker & Failure Simulation */}
            <EventLogTicker />

            {/* Discovery Radar Widget */}
            <div className="rounded-2xl glass-panel p-4 border border-slate-800 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Discovery Radar
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400">People</span>
              </div>

              <div className="space-y-3">
                {discoveryUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <HovercardPreview userId={user.id} onSelectUser={handleOpenProfile}>
                        <img
                          src={user.avatar}
                          alt={user.displayName}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-800 cursor-pointer"
                        />
                      </HovercardPreview>

                      <div className="min-w-0">
                        <HovercardPreview userId={user.id} onSelectUser={handleOpenProfile}>
                          <span 
                            onClick={() => handleOpenProfile(user.id)}
                            className="text-xs font-semibold text-white hover:text-indigo-400 transition-colors cursor-pointer block truncate"
                          >
                            {user.displayName}
                          </span>
                        </HovercardPreview>
                        <span className="text-[10px] text-slate-400 block truncate">
                          @{user.username}
                        </span>
                      </div>
                    </div>

                    <RelationshipActionButton targetUserId={user.id} size="sm" />
                  </div>
                ))}
              </div>
            </div>

            {/* PostgreSQL Deliverables Quick Card */}
            <div className="rounded-2xl glass-panel p-4 border border-indigo-500/20 bg-indigo-950/20">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 mb-2">
                <Database className="w-4 h-4 text-indigo-400" />
                <span>Backend Architecture</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                PostgreSQL schema, Materialized View DDL, triggers for real-time WebSocket dispatch, and Row-Level Security policies.
              </p>
              <button
                onClick={() => setArchitectureModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Open PostgreSQL Architecture</span>
              </button>
            </div>

          </div>

        </div>
      </main>

      {/* Global Modals */}
      <MutualCelebrationModal />

      <SocialConnectionsDrawer
        isOpen={connectionsDrawerOpen}
        onClose={() => setConnectionsDrawerOpen(false)}
        targetUserId={connectionsDrawerTarget}
        initialTab={connectionsDrawerTab}
        onSelectUser={handleOpenProfile}
      />

      <ArchitectureModal
        isOpen={architectureModalOpen}
        onClose={() => setArchitectureModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <SocialGraphProvider>
      <MainDashboard />
    </SocialGraphProvider>
  );
}
