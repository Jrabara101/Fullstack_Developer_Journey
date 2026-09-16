import React from 'react';
import { PopupItem } from '../types';

interface FloatingPopupsProps {
  popups: PopupItem[];
}

export const FloatingPopups: React.FC<FloatingPopupsProps> = ({ popups }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      {popups.map((p) => (
        <div
          key={p.id}
          className={`absolute pointer-events-none font-['Righteous'] text-xl sm:text-2xl font-black tracking-wider transition-all duration-500 ease-out select-none ${p.colorClass}`}
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            animation: 'popupFloat 0.55s ease-out forwards',
          }}
        >
          {p.text}
        </div>
      ))}
      <style>{`
        @keyframes popupFloat {
          0% {
            transform: translate(-50%, -50%) scale(0.9);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -40px) scale(1.15);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -75px) scale(1.25);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
