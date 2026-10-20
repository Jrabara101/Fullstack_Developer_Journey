import { useState, useEffect, useRef, useCallback } from 'react';
import { TournamentState, BracketNode, WsMessage, CaptainReport, MatchStatus } from '../types/tournament';
import confetti from 'canvas-confetti';

export function useTournament() {
  const [tournament, setTournament] = useState<TournamentState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<BracketNode | null>(null);
  const [hoveredTeamId, setHoveredTeamId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bracket' | 'schedule' | 'teams' | 'admin'>('bracket');
  const [isRosterDrawerOpen, setIsRosterDrawerOpen] = useState(false);
  const [selectedRosterTeamId, setSelectedRosterTeamId] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  // Fetch initial state via REST
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/tournament');
      if (res.ok) {
        const data: TournamentState = await res.json();
        setTournament(data);
      }
    } catch (err) {
      console.warn('Initial REST fetch failed, relying on WebSocket / retry', err);
    }
  }, []);

  // Setup WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (socketRef.current) {
      try {
        socketRef.current.close();
      } catch {}
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    console.log('Connecting to WebSocket at:', wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('⚡ WebSocket connected to Tournament Hub');
      setIsConnected(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data);
        if (msg.type === 'INIT' || msg.type === 'TOURNAMENT_UPDATED' || msg.type === 'SCORE_UPDATED' || msg.type === 'MATCH_STATUS_CHANGED' || msg.type === 'DISPUTE_RAISED' || msg.type === 'WINNER_ADVANCED' || msg.type === 'CAPTAIN_REPORTED') {
          setTournament(msg.data);

          // If Grand Final was won, fire championship confetti!
          const gf = msg.data.bracketNodes.find(m => m.id === 'm-gf');
          if (gf && gf.status === 'COMPLETED' && gf.winnerId) {
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.6 },
              colors: ['#38BDF8', '#10B981', '#F59E0B', '#EF4444']
            });
          }

          // Keep selectedMatch updated if open
          setSelectedMatch((prev) => {
            if (!prev) return null;
            return msg.data.bracketNodes.find(m => m.id === prev.id) || prev;
          });
        }
      } catch (err) {
        console.error('Error parsing WS message:', err);
      }
    };

    ws.onclose = () => {
      console.warn('WebSocket disconnected. Retrying in 2.5s...');
      setIsConnected(false);
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 2500);
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      ws.close();
    };

    socketRef.current = ws;
  }, []);

  useEffect(() => {
    fetchState();
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) socketRef.current.close();
    };
  }, [fetchState, connectWebSocket]);

  // Actions
  const incrementScore = async (matchId: string, teamSlot: 1 | 2, points: number = 1) => {
    // Optimistic / WS dispatch
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        action: 'SCORE_INCREMENT',
        matchId,
        teamSlot,
        points
      }));
    } else {
      await fetch(`/api/matches/${matchId}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamSlot, points })
      });
      fetchState();
    }
  };

  const submitCaptainReport = async (matchId: string, report: CaptainReport) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        action: 'CAPTAIN_REPORT',
        matchId,
        report
      }));
    } else {
      await fetch(`/api/matches/${matchId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });
      fetchState();
    }
  };

  const resolveDispute = async (matchId: string, winnerId: string, score1: number, score2: number, adminNotes?: string) => {
    const res = await fetch(`/api/matches/${matchId}/resolve-dispute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winnerId, score1, score2, adminNotes })
    });
    if (res.ok) {
      fetchState();
    }
  };

  const setMatchStatus = async (matchId: string, status: MatchStatus) => {
    const res = await fetch(`/api/matches/${matchId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      fetchState();
    }
  };

  const simulateTick = async () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ action: 'SIMULATE' }));
    } else {
      await fetch('/api/tournament/simulate-next', { method: 'POST' });
      fetchState();
    }
  };

  const resetTournament = async () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ action: 'RESET' }));
    } else {
      await fetch('/api/tournament/reset', { method: 'POST' });
      fetchState();
    }
  };

  const openTeamRoster = (teamId: string) => {
    setSelectedRosterTeamId(teamId);
    setIsRosterDrawerOpen(true);
  };

  return {
    tournament,
    isConnected,
    selectedMatch,
    setSelectedMatch,
    hoveredTeamId,
    setHoveredTeamId,
    selectedTeamId,
    setSelectedTeamId,
    activeTab,
    setActiveTab,
    isRosterDrawerOpen,
    setIsRosterDrawerOpen,
    selectedRosterTeamId,
    openTeamRoster,
    incrementScore,
    submitCaptainReport,
    resolveDispute,
    setMatchStatus,
    simulateTick,
    resetTournament
  };
}
