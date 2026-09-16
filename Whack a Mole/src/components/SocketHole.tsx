import React, { useState } from 'react';
import { MoleInstance } from '../types';
import { MoleEntity } from './MoleEntity';

interface SocketHoleProps {
  slotIndex: number;
  mole: MoleInstance | null;
  onWhack: (slotIndex: number, clientX: number, clientY: number) => void;
  dimension: number;
}

export const SocketHole: React.FC<SocketHoleProps> = ({
  slotIndex,
  mole,
  onWhack,
  dimension,
}) => {
  const [showRipple, setShowRipple] = useState(false);

  const isCenterSlot = dimension === 3 && slotIndex === 4;
  const slotNumber = slotIndex + 1;
  const slotLabel = isCenterSlot
    ? 'CORE-VIP'
    : `DRIVE-${slotNumber < 10 ? '0' : ''}${slotNumber}`;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (!mole || mole.hit || Date.now() > mole.expiresAt) {
      setShowRipple(true);
      setTimeout(() => setShowRipple(false), 180);
    }

    // Call instantly (<5ms)
    onWhack(slotIndex, clientX, clientY);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      data-slot-index={slotIndex}
      className={`recessed-socket relative w-full h-full bg-[#05000c] border flex items-center justify-center overflow-hidden cursor-crosshair group shadow-[inset_0_8px_16px_#000000] select-none ${
        isCenterSlot ? 'border-cyan-900/80' : 'border-pink-900/60'
      }`}
    >
      {/* Background Slot Code Label */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <span
          className={`font-['VT323'] text-xs sm:text-sm font-bold tracking-widest ${
            isCenterSlot ? 'text-cyan-900/60' : 'text-fuchsia-900/60'
          }`}
        >
          {slotLabel}
        </span>
      </div>

      {/* Miss Ripple Flash Effect */}
      <div
        className={`miss-ripple absolute inset-0 pointer-events-none bg-red-600/40 transition-opacity duration-150 ${
          showRipple ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Mole Container */}
      <div className="mole-container absolute bottom-0 w-full h-full flex flex-col items-center justify-end pointer-events-none">
        {mole && (
          <MoleEntity type={mole.type} hit={mole.hit} />
        )}
      </div>
    </div>
  );
};
