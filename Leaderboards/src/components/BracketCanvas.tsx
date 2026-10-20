import React, { useState, useRef, useEffect, useMemo } from 'react';
import { BracketNode, TeamEntity, TournamentState } from '../types/tournament';
import { MatchCard } from './MatchCard';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair, ChevronDown, Trophy, ShieldAlert, Sparkles, Filter } from 'lucide-react';

interface BracketCanvasProps {
  tournament: TournamentState;
  hoveredTeamId: string | null;
  selectedTeamId: string | null;
  onSelectMatch: (match: BracketNode) => void;
  onHoverTeam: (teamId: string | null) => void;
  onSelectTeam: (teamId: string | null) => void;
}

interface NodeLayout {
  node: BracketNode;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const BracketCanvas: React.FC<BracketCanvasProps> = ({
  tournament,
  hoveredTeamId,
  selectedTeamId,
  onSelectMatch,
  onHoverTeam,
  onSelectTeam
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan and Zoom transform state
  const [scale, setScale] = useState(0.85);
  const [pan, setPan] = useState({ x: 40, y: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Bracket view filter
  const [bracketFilter, setBracketFilter] = useState<'ALL' | 'UPPER' | 'LOWER' | 'FINALS'>('ALL');

  const activeHighlightedTeam = hoveredTeamId || selectedTeamId;

  // Calculate coordinates for all nodes
  const CARD_WIDTH = 240;
  const CARD_HEIGHT = 86;
  const COL_GUTTER = 70;

  const nodeLayouts = useMemo(() => {
    const map = new Map<string, NodeLayout>();

    // Upper Bracket
    // Stage 0: Upper R1 (8 matches)
    const ubR1 = tournament.bracketNodes.filter(n => n.stageName === 'Upper Round 1');
    ubR1.forEach((node, idx) => {
      map.set(node.id, {
        node,
        x: 60,
        y: 80 + idx * 115,
        width: CARD_WIDTH,
        height: CARD_HEIGHT
      });
    });

    // Stage 1: Upper QF (4 matches)
    const ubQf = tournament.bracketNodes.filter(n => n.stageName === 'Upper Quarterfinal');
    ubQf.forEach((node, idx) => {
      map.set(node.id, {
        node,
        x: 60 + (CARD_WIDTH + COL_GUTTER) * 1,
        y: 135 + idx * 230,
        width: CARD_WIDTH,
        height: CARD_HEIGHT
      });
    });

    // Stage 2: Upper SF (2 matches)
    const ubSf = tournament.bracketNodes.filter(n => n.stageName === 'Upper Semifinal');
    ubSf.forEach((node, idx) => {
      map.set(node.id, {
        node,
        x: 60 + (CARD_WIDTH + COL_GUTTER) * 2,
        y: 250 + idx * 460,
        width: CARD_WIDTH,
        height: CARD_HEIGHT
      });
    });

    // Stage 3: Upper Final (1 match)
    const ubFinal = tournament.bracketNodes.find(n => n.stageName === 'Upper Final');
    if (ubFinal) {
      map.set(ubFinal.id, {
        node: ubFinal,
        x: 60 + (CARD_WIDTH + COL_GUTTER) * 3,
        y: 480,
        width: CARD_WIDTH,
        height: CARD_HEIGHT
      });
    }

    // Lower Bracket
    const LOWER_OFFSET_Y = 1080;

    // Stage 0: Lower R1 (4 matches)
    const lbR1 = tournament.bracketNodes.filter(n => n.stageName === 'Lower Round 1');
    lbR1.forEach((node, idx) => {
      map.set(node.id, {
        node,
        x: 60,
        y: LOWER_OFFSET_Y + idx * 140,
        width: CARD_WIDTH,
        height: CARD_HEIGHT
      });
    });

    // Stage 1: Lower R2 (4 matches)
    const lbR2 = tournament.bracketNodes.filter(n => n.stageName === 'Lower Round 2');
    lbR2.forEach((node, idx) => {
      map.set(node.id, {
        node,
        x: 60 + (CARD_WIDTH + COL_GUTTER) * 1,
        y: LOWER_OFFSET_Y + idx * 140,
        width: CARD_WIDTH,
        height: CARD_HEIGHT
      });
    });

    // Stage 2: Lower QF (2 matches)
    const lbQf = tournament.bracketNodes.filter(n => n.stageName === 'Lower Quarterfinal');
    lbQf.forEach((node, idx) => {
      map.set(node.id, {
        node,
        x: 60 + (CARD_WIDTH + COL_GUTTER) * 2,
        y: LOWER_OFFSET_Y + 70 + idx * 280,
        width: CARD_WIDTH,
        height: CARD_HEIGHT
      });
    });

    // Stage 3: Lower SF (1 match)
    const lbSf = tournament.bracketNodes.find(n => n.stageName === 'Lower Semifinal');
    if (lbSf) {
      map.set(lbSf.id, {
        node: lbSf,
        x: 60 + (CARD_WIDTH + COL_GUTTER) * 3,
        y: LOWER_OFFSET_Y + 210,
        width: CARD_WIDTH,
        height: CARD_HEIGHT
      });
    }

    // Stage 4: Lower Final (1 match)
    const lbFinal = tournament.bracketNodes.find(n => n.stageName === 'Lower Final');
    if (lbFinal) {
      map.set(lbFinal.id, {
        node: lbFinal,
        x: 60 + (CARD_WIDTH + COL_GUTTER) * 4,
        y: LOWER_OFFSET_Y + 210,
        width: CARD_WIDTH,
        height: CARD_HEIGHT
      });
    }

    // Grand Final (1 match)
    const gf = tournament.bracketNodes.find(n => n.stageName === 'Grand Final');
    if (gf) {
      map.set(gf.id, {
        node: gf,
        x: 60 + (CARD_WIDTH + COL_GUTTER) * 4,
        y: 480,
        width: CARD_WIDTH,
        height: CARD_HEIGHT
      });
    }

    return map;
  }, [tournament.bracketNodes]);

  // Set of match IDs traversed by the highlighted team
  const trajectoryMatchIds = useMemo(() => {
    if (!activeHighlightedTeam) return new Set<string>();
    const matchIds = new Set<string>();

    tournament.bracketNodes.forEach(m => {
      if (m.team1.team?.id === activeHighlightedTeam || m.team2.team?.id === activeHighlightedTeam) {
        matchIds.add(m.id);
      }
    });

    return matchIds;
  }, [tournament.bracketNodes, activeHighlightedTeam]);

  // Generate SVG connector paths
  const connectorPaths = useMemo(() => {
    const paths: {
      key: string;
      d: string;
      isHighlighted: boolean;
      isVictory: boolean;
      isLive: boolean;
    }[] = [];

    tournament.bracketNodes.forEach(source => {
      const sourceLayout = nodeLayouts.get(source.id);
      if (!sourceLayout) return;

      // Check nextMatchId
      if (source.nextMatchId) {
        const targetLayout = nodeLayouts.get(source.nextMatchId);
        if (targetLayout) {
          const x1 = sourceLayout.x + sourceLayout.width;
          const y1 = sourceLayout.y + sourceLayout.height / 2;

          const x2 = targetLayout.x;
          // Determine slot y
          const targetNode = targetLayout.node;
          const isSlot1 = targetNode.team1.team?.id === source.winnerId;
          const isSlot2 = targetNode.team2.team?.id === source.winnerId;
          const slotY = isSlot1
            ? targetLayout.y + 35
            : isSlot2
            ? targetLayout.y + 65
            : targetLayout.y + targetLayout.height / 2;

          const dx = x2 - x1;
          const pathD = `M ${x1} ${y1} C ${x1 + dx * 0.45} ${y1}, ${x1 + dx * 0.55} ${slotY}, ${x2} ${slotY}`;

          const isHighlighted =
            !!activeHighlightedTeam &&
            (trajectoryMatchIds.has(source.id) && trajectoryMatchIds.has(source.nextMatchId));

          const isVictory = source.status === 'COMPLETED' && !!source.winnerId;
          const isLive = source.status === 'LIVE';

          paths.push({
            key: `${source.id}->${source.nextMatchId}`,
            d: pathD,
            isHighlighted,
            isVictory,
            isLive
          });
        }
      }

      // Check loserMatchId (for lower bracket drop down)
      if (source.loserMatchId) {
        const loserTargetLayout = nodeLayouts.get(source.loserMatchId);
        if (loserTargetLayout) {
          const x1 = sourceLayout.x + sourceLayout.width;
          const y1 = sourceLayout.y + sourceLayout.height / 2;

          const x2 = loserTargetLayout.x;
          const y2 = loserTargetLayout.y + loserTargetLayout.height / 2;

          const dx = x2 - x1;
          const pathD = `M ${x1} ${y1} C ${x1 + dx * 0.5} ${y1}, ${x1 + dx * 0.5} ${y2}, ${x2} ${y2}`;

          const isHighlighted =
            !!activeHighlightedTeam &&
            trajectoryMatchIds.has(source.id) &&
            trajectoryMatchIds.has(source.loserMatchId);

          paths.push({
            key: `loser-${source.id}->${source.loserMatchId}`,
            d: pathD,
            isHighlighted,
            isVictory: false,
            isLive: false
          });
        }
      }
    });

    return paths;
  }, [tournament.bracketNodes, nodeLayouts, activeHighlightedTeam, trajectoryMatchIds]);

  // Pan & Zoom event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.cursor-pointer')) {
      return; // Clicking on a match card or button
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newScale = Math.min(Math.max(scale * zoomFactor, 0.4), 1.6);
    setScale(newScale);
  };

  // Center / Reset View
  const handleResetView = () => {
    setScale(0.85);
    setPan({ x: 40, y: 30 });
  };

  const handleZoomIn = () => {
    setScale(s => Math.min(s * 1.15, 1.6));
  };

  const handleZoomOut = () => {
    setScale(s => Math.max(s * 0.85, 0.4));
  };

  // Find My Team navigation
  const handleFindTeam = (teamId: string) => {
    onSelectTeam(teamId === selectedTeamId ? null : teamId);
    if (!teamId) return;

    // Find the latest active match for this team
    const teamMatches = tournament.bracketNodes.filter(
      m => m.team1.team?.id === teamId || m.team2.team?.id === teamId
    );
    const activeMatch = teamMatches.find(m => m.status === 'LIVE' || m.status === 'READY') || teamMatches[teamMatches.length - 1];

    if (activeMatch) {
      const layout = nodeLayouts.get(activeMatch.id);
      if (layout && containerRef.current) {
        const bounds = containerRef.current.getBoundingClientRect();
        setPan({
          x: bounds.width / 2 - (layout.x + CARD_WIDTH / 2) * scale,
          y: bounds.height / 2 - (layout.y + CARD_HEIGHT / 2) * scale
        });
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className="relative w-full h-[calc(100vh-190px)] min-h-[580px] bg-[#07090E] arena-grid-bg overflow-hidden border border-[#1E283D] cursor-grab active:cursor-grabbing select-none"
    >
      {/* Stage Header Overlay Bar */}
      <div className="absolute top-3 left-4 z-20 flex flex-wrap items-center gap-3 bg-[#0C101A]/90 backdrop-blur-md px-3.5 py-2 rounded-lg border border-[#1E283D] text-xs font-mono shadow-xl">
        <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          BRACKET SECTION:
        </span>

        <div className="flex items-center gap-1 bg-[#131926] p-0.5 rounded border border-[#1E283D]">
          <button
            onClick={() => setBracketFilter('ALL')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              bracketFilter === 'ALL' ? 'bg-[#38BDF8] text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            FULL DOUBLE ELIM
          </button>
          <button
            onClick={() => {
              setBracketFilter('UPPER');
              setPan({ x: 40, y: 30 });
            }}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              bracketFilter === 'UPPER' ? 'bg-[#38BDF8] text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            UPPER BRACKET
          </button>
          <button
            onClick={() => {
              setBracketFilter('LOWER');
              setPan({ x: 40, y: -750 * scale });
            }}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              bracketFilter === 'LOWER' ? 'bg-[#38BDF8] text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            LOWER BRACKET
          </button>
          <button
            onClick={() => {
              setBracketFilter('FINALS');
              setPan({ x: -1100 * scale, y: -300 * scale });
            }}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              bracketFilter === 'FINALS' ? 'bg-[#38BDF8] text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            GRAND FINALS
          </button>
        </div>

        {activeHighlightedTeam && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
            <span className="text-cyan-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              TRACKING: {tournament.teams.find(t => t.id === activeHighlightedTeam)?.name}
            </span>
            <button
              onClick={() => onSelectTeam(null)}
              className="text-[10px] text-slate-400 hover:text-white underline"
            >
              CLEAR
            </button>
          </div>
        )}
      </div>

      {/* Main Infinite Canvas Viewport */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          width: '2400px',
          height: '1900px',
        }}
        className="relative pointer-events-auto"
      >
        {/* UPPER BRACKET SECTION TITLE */}
        <div className="absolute left-[60px] top-[24px] z-10 flex items-center gap-3">
          <div className="w-2 h-6 bg-cyan-400 rounded-sm"></div>
          <div>
            <h2 className="text-lg font-extrabold font-display uppercase tracking-widest text-slate-200">
              UPPER BRACKET // CHAMPIONSHIP TRACK
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Winners advance directly to Grand Final • Losers drop to Lower Bracket
            </p>
          </div>
        </div>

        {/* LOWER BRACKET SECTION TITLE */}
        <div className="absolute left-[60px] top-[1020px] z-10 flex items-center gap-3">
          <div className="w-2 h-6 bg-amber-500 rounded-sm"></div>
          <div>
            <h2 className="text-lg font-extrabold font-display uppercase tracking-widest text-slate-200">
              LOWER BRACKET // ELIMINATION GAUNTLET
            </h2>
            <p className="text-xs font-mono text-slate-400">
              One loss eliminates team from the tournament
            </p>
          </div>
        </div>

        {/* GRAND FINALS TROPHY WATERMARK */}
        <div className="absolute left-[1340px] top-[370px] z-0 flex flex-col items-center justify-center opacity-30 pointer-events-none select-none">
          <Trophy className="w-28 h-28 text-amber-400/40" />
          <span className="font-display font-black text-3xl tracking-widest text-amber-300/40 mt-2">
            CHAMPIONSHIP DECK
          </span>
          <span className="font-mono text-xs text-amber-500/50">
            $1,000,000 USD • BEST OF 5
          </span>
        </div>

        {/* SVG Connecting Lines Layer */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
            <linearGradient id="victoryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
          </defs>

          {connectorPaths.map(path => {
            return (
              <path
                key={path.key}
                d={path.d}
                fill="none"
                stroke={
                  path.isHighlighted
                    ? 'url(#highlightGradient)'
                    : path.isVictory
                    ? '#10B981'
                    : '#334155'
                }
                strokeWidth={path.isHighlighted ? 3.5 : path.isVictory ? 2 : 1.5}
                strokeDasharray={path.isLive ? '6 4' : undefined}
                className={
                  path.isHighlighted
                    ? 'connector-highlight'
                    : path.isVictory
                    ? 'connector-victory'
                    : path.isLive
                    ? 'connector-pulse-live'
                    : 'transition-all duration-300'
                }
                opacity={activeHighlightedTeam ? (path.isHighlighted ? 1 : 0.25) : 0.8}
              />
            );
          })}
        </svg>

        {/* Match Cards Layer */}
        {Array.from(nodeLayouts.values()).map(({ node, x, y }) => {
          const isNodeHighlighted =
            !!activeHighlightedTeam &&
            (node.team1.team?.id === activeHighlightedTeam ||
              node.team2.team?.id === activeHighlightedTeam);

          const isNodeDimmed =
            !!activeHighlightedTeam && !isNodeHighlighted;

          return (
            <div
              key={node.id}
              style={{
                position: 'absolute',
                left: `${x}px`,
                top: `${y}px`,
                zIndex: isNodeHighlighted ? 15 : 5
              }}
            >
              <MatchCard
                match={node}
                isHovered={isNodeHighlighted}
                isDimmed={isNodeDimmed}
                highlightedTeamId={activeHighlightedTeam}
                onSelect={onSelectMatch}
                onHoverTeam={onHoverTeam}
              />
            </div>
          );
        })}
      </div>

      {/* Floating Canvas Controls (bottom-right) */}
      <div className="absolute bottom-5 right-5 z-30 flex items-center gap-2 bg-[#0C101A]/95 backdrop-blur-md p-2 rounded-xl border border-[#1E283D] shadow-2xl">
        {/* Find My Team Dropdown */}
        <div className="relative group">
          <select
            value={selectedTeamId || ''}
            onChange={(e) => handleFindTeam(e.target.value)}
            className="h-8 px-2.5 rounded bg-[#131926] hover:bg-[#1C2436] border border-[#1E283D] hover:border-[#38BDF8] text-xs font-mono text-slate-200 outline-none cursor-pointer appearance-none pr-8 transition-colors"
          >
            <option value="">FIND MY TEAM...</option>
            {tournament.teams.map(team => (
              <option key={team.id} value={team.id}>
                #{team.seed} {team.name} ({team.tag})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>

        <div className="h-5 w-px bg-slate-800" />

        <button
          onClick={handleZoomIn}
          className="w-8 h-8 flex items-center justify-center rounded bg-[#131926] hover:bg-[#1C2436] border border-[#1E283D] text-slate-200 hover:text-white transition-colors"
          title="Zoom in (+)"
        >
          <ZoomIn className="w-4 h-4 text-cyan-400" />
        </button>

        <button
          onClick={handleZoomOut}
          className="w-8 h-8 flex items-center justify-center rounded bg-[#131926] hover:bg-[#1C2436] border border-[#1E283D] text-slate-200 hover:text-white transition-colors"
          title="Zoom out (-)"
        >
          <ZoomOut className="w-4 h-4 text-cyan-400" />
        </button>

        <button
          onClick={handleResetView}
          className="w-8 h-8 flex items-center justify-center rounded bg-[#131926] hover:bg-[#1C2436] border border-[#1E283D] text-slate-200 hover:text-white transition-colors"
          title="Reset canvas view"
        >
          <RotateCcw className="w-4 h-4 text-slate-300" />
        </button>
      </div>
    </div>
  );
};
