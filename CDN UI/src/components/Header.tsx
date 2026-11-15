import React from 'react';
import { 
  Zap, 
  TrendingDown, 
  Sun, 
  Moon, 
  Activity,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenReceipt: () => void;
  onOpenAssetSwap: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleTheme,
  onOpenReceipt,
  onOpenAssetSwap,
}) => {
  return (
    <header className="border-b border-white/10 bg-edge-panel/90 backdrop-blur-xl sticky top-0 z-40 transition-colors">
      {/* Top Value Banner / Plain-Language Savings Receipt Bar */}
      <div className="bg-gradient-to-r from-edge-cyan/15 via-edge-emerald/15 to-edge-indigo/15 border-b border-white/5 py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <button 
            onClick={onOpenReceipt}
            className="flex items-center gap-2 group text-left hover:opacity-90 transition-opacity"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-edge-emerald/20 text-edge-emerald">
              <TrendingDown className="w-3.5 h-3.5" />
            </span>
            <span className="text-gray-300 font-medium">
              Edge Optimization saved <strong className="text-white font-semibold">1.84 TB</strong> of origin egress this month 
              <span className="text-edge-emerald font-semibold mx-1.5">(~$147.20 saved)</span> 
              and slashed mobile load latency by <strong className="text-edge-cyan font-semibold">1.9s</strong>.
            </span>
            <span className="inline-flex items-center gap-1 text-edge-cyan text-xs font-semibold px-2 py-0.5 rounded-full bg-edge-cyan/10 border border-edge-cyan/20 group-hover:bg-edge-cyan/20 transition-colors">
              <span>View Receipt</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-edge-emerald animate-pulse"></span>
              <span className="font-mono text-gray-300 font-medium">284 Global Edge PoPs</span>
              <span className="text-gray-500">•</span>
              <span className="text-edge-emerald font-semibold">99.4% Hit Ratio</span>
            </span>

            <button
              onClick={onOpenAssetSwap}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
              title="Zero-downtime Asset Swap & Version Pinning"
            >
              <Layers className="w-3.5 h-3.5 text-edge-indigo" />
              <span>Zero-Downtime Swap</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Mission Statement */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-edge-cyan to-edge-emerald p-[1px] shadow-lg shadow-edge-cyan/20">
            <div className="w-full h-full bg-edge-obsidian rounded-[11px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-edge-cyan fill-edge-cyan/20" />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-edge-emerald opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-edge-emerald"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                EdgeStream <span className="text-edge-cyan font-extrabold">Studio</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-mono font-bold bg-white/5 border border-white/10 text-gray-400 rounded-full">
                Media CDN v3.4
              </span>
            </div>
            <p className="text-xs text-gray-400 hidden sm:block">
              Human-Centric Edge Image & Audio Transformation Console
            </p>
          </div>
        </div>

        {/* Global Controls & Theme */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-edge-well border border-white/5 text-xs text-gray-400 font-mono">
            <Activity className="w-3.5 h-3.5 text-edge-emerald" />
            <span>Surrogate Key Routing:</span>
            <span className="text-edge-emerald font-semibold">Active</span>
          </div>

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors"
            title={isDarkMode ? "Switch to Daylight Lab Mode" : "Switch to Studio Obsidian Mode"}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-edge-amber" /> : <Moon className="w-4 h-4 text-edge-indigo" />}
          </button>

          <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-edge-cyan to-edge-indigo flex items-center justify-center text-xs font-bold text-white shadow-sm">
              ED
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-gray-200 leading-tight">Edge Ops</div>
              <div className="text-[10px] text-gray-400 leading-tight font-mono">production-ap</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

