import { useState } from 'react';
import { useEngineStore } from './store/engineStore';
import { StudioTopBar } from './components/topbar/StudioTopBar';
import { GodModeDrawer } from './components/topbar/GodModeDrawer';
import { PlayTerminal } from './components/play/PlayTerminal';
import { CommandBar } from './components/play/CommandBar';
import { AutoMapRadar } from './components/play/AutoMapRadar';
import { SatchelHUD } from './components/play/SatchelHUD';
import { CreatorStudio } from './components/creator/CreatorStudio';
import { CartridgeModal } from './components/modals/CartridgeModal';
import { EntityModal } from './components/modals/EntityModal';
import { Map, Backpack, X } from 'lucide-react';

export function App() {
  const { mode, inventoryIds } = useEngineStore();
  const [isMobileTelemetryOpen, setIsMobileTelemetryOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex flex-col bg-void overflow-hidden text-prose-main select-none font-sans">
      {/* 1. Global Top Studio Bar */}
      <StudioTopBar />

      {/* 2. Main Viewport Area: Play Mode or Creator Studio */}
      <main className="flex-1 flex overflow-hidden relative">
        {mode === 'PLAY' ? (
          <div className="flex-1 flex h-full overflow-hidden animate-in fade-in duration-200">
            {/* Center Narrative Terminal + Bottom Command Dock */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative md:border-r border-subtle-border">
              {/* Reading Log Terminal */}
              <PlayTerminal />

              {/* Bottom Hybrid Command Bar */}
              <div className="shrink-0 bg-void/90 backdrop-blur-md border-t border-subtle-border/80 pt-3 relative">
                {/* Mobile Telemetry Toggle Trigger */}
                <div className="md:hidden flex justify-end px-4 pb-1">
                  <button
                    onClick={() => setIsMobileTelemetryOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-elevated border border-subtle-border text-xs text-amber-300 font-sans shadow-lg"
                  >
                    <Map className="w-3.5 h-3.5 text-amber-400" />
                    <span>Map & Satchel ({inventoryIds.length})</span>
                  </button>
                </div>

                <CommandBar />
              </div>
            </div>

            {/* Right Telemetry HUD (Desktop): Auto-Map Radar + Satchel Grid */}
            <aside className="w-80 lg:w-96 h-full flex flex-col p-3 gap-3 bg-panel/40 shrink-0 overflow-hidden hidden md:flex">
              {/* Top Half: Auto-Cartographer Mini-Map Radar */}
              <div className="h-56 shrink-0">
                <AutoMapRadar />
              </div>

              {/* Bottom Half: Satchel & Codex HUD */}
              <div className="flex-1 min-h-0">
                <SatchelHUD />
              </div>
            </aside>

            {/* Mobile Telemetry Slide-Up Drawer */}
            {isMobileTelemetryOpen && (
              <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-void/80 backdrop-blur-sm animate-in fade-in duration-150">
                <div className="h-[75vh] w-full bg-panel border-t border-subtle-border rounded-t-2xl p-3 flex flex-col shadow-2xl">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-subtle-border">
                    <span className="font-sans font-bold text-xs uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <Map className="w-3.5 h-3.5" />
                      <span>Cartography & Satchel</span>
                    </span>
                    <button
                      onClick={() => setIsMobileTelemetryOpen(false)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-elevated"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="h-44 shrink-0 mb-3">
                    <AutoMapRadar />
                  </div>

                  <div className="flex-1 min-h-0">
                    <SatchelHUD />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex h-full overflow-hidden animate-in fade-in duration-200">
            {/* Creator Mode: "The Loom" 2D Node Canvas & Authoring Suite */}
            <CreatorStudio />
          </div>
        )}
      </main>

      {/* 3. Floating Drawers & Modals */}
      <GodModeDrawer />
      <CartridgeModal />
      <EntityModal />
    </div>
  );
}

export default App;
