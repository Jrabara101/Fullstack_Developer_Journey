import React, { useState } from 'react';
import { 
  Sparkles, 
  Network, 
  Database, 
  Users, 
  Bell, 
  ChevronDown, 
  Shield, 
  Radio,
  UserCheck
} from 'lucide-react';
import { useSocialGraph } from '../context/SocialGraphContext';
import { getUserMutuals } from '../utils/graphAlgorithms';

export function Navbar({ 
  onOpenConnections, 
  onOpenArchitecture, 
  currentView, 
  setCurrentView,
  onOpenProfile,
}) {
  const { 
    currentUser, 
    users, 
    relationships, 
    requests, 
    currentUserId, 
    setCurrentUserId,
    approveRequest,
    rejectRequest,
  } = useSocialGraph();

  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
  const [requestsMenuOpen, setRequestsMenuOpen] = useState(false);

  const mutuals = getUserMutuals(relationships, users, currentUserId);

  // Incoming pending requests for current user (if current user is private)
  const incomingRequests = requests.filter(r => r.targetId === currentUserId && r.status === 'pending');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#090a0f]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Navigation View Links */}
        <div className="flex items-center gap-6">
          <div 
            onClick={() => setCurrentView('feed')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                  NexusGraph
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold">
                  MUTUAL ENGINE
                </span>
              </div>
            </div>
          </div>

          {/* View Mode Switcher Pills */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setCurrentView('feed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentView === 'feed'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Social Feed
            </button>

            <button
              onClick={() => setCurrentView('topology')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                currentView === 'topology'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Graph Topology</span>
            </button>
          </nav>
        </div>

        {/* Right Actions: Schema Modal, Connections Drawer, Requests Bell, Persona Switcher */}
        <div className="flex items-center gap-2.5">
          {/* PostgreSQL Architecture Modal Trigger */}
          <button
            onClick={onOpenArchitecture}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Inspect PostgreSQL DDL & RLS Policies"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>SQL Schema</span>
          </button>

          {/* Connections Drawer Button */}
          <button
            onClick={() => onOpenConnections('mutuals')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors shadow-sm"
            title="Open Social Connections Drawer"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Mutuals</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold">
              {mutuals.length}
            </span>
          </button>

          {/* Pending Requests Bell (for private accounts) */}
          <div className="relative">
            <button
              onClick={() => setRequestsMenuOpen(prev => !prev)}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
              title="Pending follow requests"
            >
              <Bell className="w-4 h-4" />
              {incomingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-bounce">
                  {incomingRequests.length}
                </span>
              )}
            </button>

            {/* Requests Dropdown */}
            {requestsMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl glass-dropdown border border-slate-700/80 shadow-2xl p-3 z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
                  <span className="text-xs font-bold text-white">Pending Requests</span>
                  <span className="text-[10px] text-slate-400">{incomingRequests.length} pending</span>
                </div>

                {incomingRequests.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    No pending follow requests.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {incomingRequests.map(req => {
                      const requester = users.find(u => u.id === req.requesterId);
                      return (
                        <div key={req.id} className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={requester?.avatar}
                              alt={requester?.displayName}
                              className="w-7 h-7 rounded-full object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-white truncate">
                                {requester?.displayName}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                @{requester?.username}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => approveRequest(req.id)}
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => rejectRequest(req.id)}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px]"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active Persona Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPersonaMenuOpen(prev => !prev)}
              className="flex items-center gap-2 p-1.5 pl-2 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
            >
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.displayName}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/40"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-slate-900" />
              </div>

              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-white leading-none">
                  {currentUser.displayName.split(' ')[0]}
                </div>
                <div className="text-[10px] text-slate-400 leading-none mt-0.5">
                  @{currentUser.username}
                </div>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Persona Menu */}
            {personaMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-dropdown border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in duration-150">
                <div className="px-3 py-2 border-b border-slate-800/80">
                  <div className="text-xs font-semibold text-white">Active Account</div>
                  <div className="text-[11px] text-slate-400">
                    Switch perspective to test reciprocation live
                  </div>
                </div>

                <div className="py-1 max-h-60 overflow-y-auto space-y-1">
                  {users.map(u => {
                    const isSelected = u.id === currentUserId;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          setCurrentUserId(u.id);
                          setPersonaMenuOpen(false);
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs flex items-center justify-between transition-colors ${
                          isSelected 
                            ? 'bg-indigo-600/20 text-indigo-300 font-semibold' 
                            : 'text-slate-300 hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <img
                            src={u.avatar}
                            alt={u.displayName}
                            className="w-6 h-6 rounded-full object-cover shrink-0"
                          />
                          <div className="truncate">
                            <div className="truncate">{u.displayName}</div>
                            <div className="text-[10px] text-slate-400 truncate">@{u.username}</div>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold shrink-0">
                            Active
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-800/80 px-2">
                  <button
                    onClick={() => {
                      onOpenProfile(currentUserId);
                      setPersonaMenuOpen(false);
                    }}
                    className="w-full py-1.5 rounded-lg text-center text-xs font-semibold text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                  >
                    View My Profile Card
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
