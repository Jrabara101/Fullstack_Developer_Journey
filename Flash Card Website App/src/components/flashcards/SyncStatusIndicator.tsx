import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, CheckCircle2, RefreshCw } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

interface SyncStatusIndicatorProps {
  lastSavedAt: number;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  lastSavedAt,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleManualSync = () => {
    setIsSyncing(true);
    sounds.playCardSnap();
    setTimeout(() => {
      setIsSyncing(false);
      sounds.playMasteredSound();
    }, 500);
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-stone-200/80 shadow-2xs text-[11px] font-mono text-stone-600">
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      <span className="font-medium text-stone-700">Offline-First Synced</span>
      <span className="text-stone-300">|</span>
      {isOnline ? (
        <span className="flex items-center gap-1 text-emerald-700">
          <Wifi className="w-3 h-3 text-emerald-600" />
          <span>Cloud Ready</span>
        </span>
      ) : (
        <span className="flex items-center gap-1 text-amber-700">
          <WifiOff className="w-3 h-3 text-amber-600" />
          <span>Local Cache</span>
        </span>
      )}
      <button
        onClick={handleManualSync}
        className="p-1 hover:text-indigo-600 transition-colors cursor-pointer"
        title="Sync state"
      >
        <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-indigo-600' : ''}`} />
      </button>
    </div>
  );
};

