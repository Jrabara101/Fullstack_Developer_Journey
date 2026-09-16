import React, { useState, useRef, useCallback } from 'react';
import { useArcadeStore } from '../store/useArcadeStore';
import { SocketHole } from './SocketHole';
import { FloatingPopups } from './FloatingPopups';
import { PopupItem } from '../types';

export const GridArena: React.FC = () => {
  const moles = useArcadeStore((s) => s.moles);
  const gridDimension = useArcadeStore((s) => s.gridDimension);
  const screenShake = useArcadeStore((s) => s.screenShake);
  const screenFlash = useArcadeStore((s) => s.screenFlash);
  const whackMole = useArcadeStore((s) => s.whackMole);

  const [popups, setPopups] = useState<PopupItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const triggerPopup = useCallback((x: number, y: number, text: string, colorClass: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setPopups((prev) => [...prev, { id, x, y, text, colorClass }]);
    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== id));
    }, 550);
  }, []);

  const handleWhack = useCallback(
    (slotIndex: number, clientX: number, clientY: number) => {
      // Calculate coordinates relative to arena container
      let posX = 150;
      let posY = 150;
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        posX = clientX - rect.left;
        posY = clientY - rect.top;
      }

      const result = whackMole(slotIndex);

      if (result.hit && result.type) {
        if (result.type === 'normal') {
          triggerPopup(posX, posY, `+${result.points} MPH!`, 'text-pink-400 text-glow-pink');
        } else if (result.type === 'gold') {
          triggerPopup(posX, posY, `88 MPH TURBO +${result.points}!`, 'text-yellow-300 text-glow-gold');
        } else if (result.type === 'bomb') {
          triggerPopup(posX, posY, 'CRASH -100!', 'text-red-500 shadow-[0_0_12px_#ef4444]');
        }
      } else {
        triggerPopup(posX, posY, 'MISS', 'text-fuchsia-400/90');
      }
    },
    [whackMole, triggerPopup]
  );

  const totalSlots = gridDimension * gridDimension;
  const gridColsClass = gridDimension === 4 ? 'grid-cols-4 gap-2 sm:gap-2.5 p-2 sm:p-3' : 'grid-cols-3 gap-2.5 sm:gap-3 p-3 sm:p-4';

  return (
    <div
      ref={containerRef}
      className="w-full max-w-xl relative flex flex-col items-center select-none"
    >
      {/* Screen Flash Indicator for Hazard Bomb hit */}
      <div
        className={`absolute inset-0 pointer-events-none z-30 transition-colors duration-150 ${
          screenFlash ? 'bg-red-600/45' : 'bg-red-600/0'
        }`}
      />

      {/* Instant Hit Popups Canvas Layer */}
      <FloatingPopups popups={popups} />

      {/* Translucent Neon Arcade Cabinet Frame */}
      <div
        className={`w-full p-2 bg-gradient-to-b from-pink-500 via-purple-600 to-cyan-500 rounded-sm shadow-[0_0_35px_rgba(236,72,153,0.5)] transition-transform duration-75 ${
          screenShake ? 'animate-shake-hard' : ''
        }`}
      >
        <div
          className={`w-full aspect-square bg-[#0b031b]/95 backdrop-blur-md relative grid border-2 border-cyan-400 shadow-inner ${gridColsClass}`}
        >
          {/* Neon Corner Angle Brackets */}
          <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-pink-500 pointer-events-none" />
          <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-pink-500 pointer-events-none" />
          <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
          <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

          {/* Arcade Grid Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <span className="font-['Righteous'] text-7xl sm:text-8xl text-white font-black uppercase text-center leading-none tracking-tighter">
              OUT<br />RUN
            </span>
          </div>

          {/* Interactive Sockets */}
          {Array.from({ length: totalSlots }, (_, i) => (
            <SocketHole
              key={i}
              slotIndex={i}
              mole={moles[i] || null}
              onWhack={handleWhack}
              dimension={gridDimension}
            />
          ))}
        </div>
      </div>

      {/* Tactical Baseplate Sub-Chassis Indicator */}
      <div className="w-full mt-3 flex items-center justify-between bg-black/80 border border-fuchsia-900/80 px-3 sm:px-4 py-1.5 text-fuchsia-300 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-pink-500 animate-pulse" />
          <span className="font-['Righteous'] tracking-widest">CASSETTE DECK: ONLINE</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 font-['Righteous']">
          <span className="flex items-center gap-1 text-cyan-300">
            <span className="material-symbols-outlined text-xs">videogame_asset</span>
            TAP TAPE
          </span>
          <span className="flex items-center gap-1 text-red-400">
            <span className="material-symbols-outlined text-xs">skull</span>
            DODGE SKULLS
          </span>
        </div>
      </div>
    </div>
  );
};
