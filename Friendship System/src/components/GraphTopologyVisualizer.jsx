import React, { useState, useMemo } from 'react';
import { Network, Sparkles, UserCheck, UserPlus, Info, Check, RefreshCw } from 'lucide-react';
import { useSocialGraph } from '../context/SocialGraphContext';
import { isFollowing, isMutual, getMutualTenure } from '../utils/graphAlgorithms';
import { MutualBadge } from './MutualBadge';
import { RelationshipActionButton } from './RelationshipActionButton';

export function GraphTopologyVisualizer({ onSelectUser }) {
  const { users, relationships, currentUserId, setCurrentUserId } = useSocialGraph();
  const [selectedNodeId, setSelectedNodeId] = useState(currentUserId);

  // Layout node coordinates around a circular SVG canvas (width: 600, height: 440)
  const nodeCoordinates = useMemo(() => {
    const coords = {};
    const centerX = 300;
    const centerY = 220;
    const radiusX = 230;
    const radiusY = 160;

    users.forEach((user, index) => {
      const angle = (index / users.length) * 2 * Math.PI - Math.PI / 2;
      coords[user.id] = {
        x: centerX + radiusX * Math.cos(angle),
        y: centerY + radiusY * Math.sin(angle),
        user,
      };
    });
    return coords;
  }, [users]);

  // Edges separation: Mutual pairs vs Directed one-way
  const { mutualEdges, directedEdges } = useMemo(() => {
    const mutualPairs = [];
    const directed = [];
    const processedPairs = new Set();

    relationships.forEach(rel => {
      const a = rel.followerId;
      const b = rel.followingId;
      const pairKey = [a, b].sort().join('::');

      if (processedPairs.has(pairKey)) return;

      if (isMutual(relationships, a, b)) {
        mutualPairs.push({ userA: a, userB: b });
        processedPairs.add(pairKey);
      } else {
        directed.push({ from: a, to: b });
      }
    });

    return { mutualEdges: mutualPairs, directedEdges: directed };
  }, [relationships]);

  const selectedNode = users.find(u => u.id === selectedNodeId) || users[0];
  const isSelectedMe = selectedNodeId === currentUserId;
  const isMutualWithMe = isMutual(relationships, currentUserId, selectedNodeId);

  return (
    <div className="rounded-3xl glass-panel border border-slate-800 p-6 shadow-2xl">
      {/* Header & Graph Legend */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-800/80 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Real-Time Graph Topology Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive visualization of directional subscriptions and symmetrical mutual friendships.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1 rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            <span className="text-amber-300 font-medium">Mutual Friendship (✨ Symmetrical)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1 rounded-full bg-indigo-400" />
            <span className="text-indigo-300 font-medium">Follows (Directed Edge)</span>
          </div>
        </div>
      </div>

      {/* SVG Network Canvas */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-[#08090e] border border-slate-800/60 p-2">
        <svg 
          viewBox="0 0 600 440" 
          className="w-full h-auto max-h-[480px] select-none"
        >
          <defs>
            {/* Arrow marker for one-way directed edges */}
            <marker
              id="arrow-directed"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#6366f1" />
            </marker>

            {/* Glowing filter for mutual lines */}
            <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Render Directed One-Way Edges */}
          {directedEdges.map(({ from, to }) => {
            const p1 = nodeCoordinates[from];
            const p2 = nodeCoordinates[to];
            if (!p1 || !p2) return null;

            const isRelatedToSelected = from === selectedNodeId || to === selectedNodeId;

            return (
              <line
                key={`directed-${from}-${to}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={isRelatedToSelected ? '#818cf8' : 'rgba(99, 102, 241, 0.25)'}
                strokeWidth={isRelatedToSelected ? 2.5 : 1.2}
                strokeDasharray={isRelatedToSelected ? 'none' : '3 3'}
                markerEnd="url(#arrow-directed)"
                className="transition-all duration-300"
              />
            );
          })}

          {/* 2. Render Mutual Edges (Symmetrical, Highlighting with Glow) */}
          {mutualEdges.map(({ userA, userB }) => {
            const p1 = nodeCoordinates[userA];
            const p2 = nodeCoordinates[userB];
            if (!p1 || !p2) return null;

            const isRelatedToSelected = userA === selectedNodeId || userB === selectedNodeId;

            return (
              <g key={`mutual-${userA}-${userB}`}>
                {/* Ambient glow stroke */}
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={isRelatedToSelected ? '#fbbf24' : '#f59e0b'}
                  strokeWidth={isRelatedToSelected ? 5 : 3}
                  strokeOpacity={isRelatedToSelected ? 0.9 : 0.6}
                  filter="url(#glow-gold)"
                />
                {/* Foreground line */}
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="#fef08a"
                  strokeWidth={isRelatedToSelected ? 2.5 : 1.5}
                />
              </g>
            );
          })}

          {/* 3. Render Nodes */}
          {Object.entries(nodeCoordinates).map(([id, { x, y, user }]) => {
            const isSelected = id === selectedNodeId;
            const isViewer = id === currentUserId;
            const isMutualWithViewer = isMutual(relationships, currentUserId, id);

            return (
              <g 
                key={id} 
                className="cursor-pointer transition-transform duration-200"
                onClick={() => setSelectedNodeId(id)}
              >
                {/* Ambient pulsing selection halo */}
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r="28"
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="3"
                    className="animate-pulse"
                  />
                )}

                {/* Mutual Gold Halo if mutual with viewer */}
                {isMutualWithViewer && !isViewer && (
                  <circle
                    cx={x}
                    cy={y}
                    r="25"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    className="animate-spin-slow"
                  />
                )}

                {/* Node Outer Circle */}
                <circle
                  cx={x}
                  cy={y}
                  r="21"
                  fill="#0f172a"
                  stroke={
                    isViewer 
                      ? '#6366f1' 
                      : isMutualWithViewer 
                        ? '#eab308' 
                        : '#334155'
                  }
                  strokeWidth={isViewer ? 3 : 2}
                  className="hover:stroke-indigo-400 transition-colors"
                />

                {/* Avatar Clip Path */}
                <clipPath id={`clip-${id}`}>
                  <circle cx={x} cy={y} r="18" />
                </clipPath>

                <image
                  href={user.avatar}
                  x={x - 18}
                  y={y - 18}
                  width="36"
                  height="36"
                  clipPath={`url(#clip-${id})`}
                  preserveAspectRatio="xMidYMid slice"
                />

                {/* Online indicator dot */}
                {user.isOnline && (
                  <circle
                    cx={x + 13}
                    cy={y + 13}
                    r="4"
                    fill="#10b981"
                    stroke="#090a0f"
                    strokeWidth="1.5"
                  />
                )}

                {/* Node Label Text */}
                <text
                  x={x}
                  y={y + 34}
                  textAnchor="middle"
                  fill={isSelected ? '#ffffff' : '#94a3b8'}
                  fontSize="11"
                  fontWeight={isSelected || isViewer ? '700' : '500'}
                  className="select-none pointer-events-none drop-shadow"
                >
                  {user.displayName.split(' ')[0]} {isViewer ? '(You)' : ''}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Node Details Bar */}
      <div className="mt-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <img
            src={selectedNode.avatar}
            alt={selectedNode.displayName}
            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/30"
          />

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">
                {selectedNode.displayName}
              </span>
              <span className="text-xs text-slate-400">@{selectedNode.username}</span>
              {isMutualWithMe && !isSelectedMe && <MutualBadge size="sm" />}
              {isSelectedMe && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
                  Current Viewer (Perspective)
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
              {selectedNode.bio}
            </p>
          </div>
        </div>

        {/* Action Controls for Selected Node */}
        <div className="flex items-center gap-2">
          {!isSelectedMe ? (
            <>
              <RelationshipActionButton targetUserId={selectedNode.id} size="md" />

              <button
                onClick={() => setCurrentUserId(selectedNode.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                title="Switch active user to view graph from this perspective"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Switch to @{selectedNode.username}</span>
              </button>
            </>
          ) : (
            <div className="text-xs text-slate-400 font-medium">
              You are currently viewing the social graph through this account.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
