import React from 'react';
import { MoleType } from '../types';

interface MoleEntityProps {
  type: MoleType;
  hit: boolean;
}

export const MoleEntity: React.FC<MoleEntityProps> = ({ type, hit }) => {
  if (type === 'gold') {
    // DeLorean Boost Icon
    return (
      <div
        className={`mole-entity relative w-full h-full flex flex-col items-center justify-end group transition-all duration-100 ${
          hit ? 'scale-75 opacity-40 translate-y-4' : 'mole-spring-enter'
        }`}
      >
        {/* Golden Neon Horizon Glow */}
        <div className="absolute -top-3 w-16 h-16 bg-yellow-400/30 rounded-full blur-md pointer-events-none" />
        
        {/* DeLorean Gullwing Antenna */}
        <div className="flex items-center gap-1 -mb-1 pointer-events-none">
          <span className="material-symbols-outlined text-yellow-300 text-lg animate-bounce">
            electric_bolt
          </span>
        </div>

        {/* DeLorean Body Structure */}
        <div className="w-20 h-16 sm:w-26 sm:h-20 bg-gradient-to-b from-yellow-300 via-amber-500 to-yellow-600 border-2 border-yellow-200 relative flex flex-col items-center justify-center shadow-[0_0_20px_#facc15]">
          <div className="flex items-center justify-between w-4/5 bg-black/80 px-2 py-0.5 border border-yellow-200/50">
            <span className="text-[9px] font-['Righteous'] text-yellow-300 tracking-widest font-black">
              88 MPH
            </span>
            <span className="material-symbols-outlined text-yellow-300 text-xs animate-spin">
              cyclone
            </span>
          </div>

          {/* Dual Exhaust Boosters */}
          <div className="mt-1 flex items-center justify-center gap-3">
            <div className="w-3 h-2 bg-cyan-400 rounded-none shadow-[0_0_8px_#00f0ff] animate-pulse" />
            <div className="w-3 h-2 bg-cyan-400 rounded-none shadow-[0_0_8px_#00f0ff] animate-pulse" />
          </div>

          <span className="font-['Righteous'] text-[8px] sm:text-[9px] text-black font-black tracking-widest uppercase mt-0.5 bg-yellow-200 px-1">
            DELOREAN BOOST
          </span>
        </div>
      </div>
    );
  }

  if (type === 'bomb') {
    // Chrome Cyber Skull Hazard
    return (
      <div
        className={`mole-entity relative w-full h-full flex flex-col items-center justify-end group transition-all duration-100 ${
          hit ? 'scale-75 opacity-30 translate-y-4' : 'mole-spring-enter'
        }`}
      >
        <div className="w-1.5 h-3 bg-red-500 flex items-start justify-center pointer-events-none">
          <div className="w-3 h-3 bg-red-400 -mt-1.5 animate-ping" />
        </div>

        {/* Cyber Skull Body */}
        <div className="w-20 h-16 sm:w-26 sm:h-20 bg-gradient-to-b from-red-950 via-black to-red-900 border-2 border-red-500 relative flex flex-col items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.7)]">
          <span className="material-symbols-outlined text-red-500 text-2xl sm:text-3xl animate-pulse">
            skull
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="w-2 h-0.5 bg-red-400" />
            <span className="font-['Righteous'] text-[8px] sm:text-[9px] text-red-400 font-black tracking-widest uppercase">
              CRASH HAZARD
            </span>
            <span className="w-2 h-0.5 bg-red-400" />
          </div>
        </div>
      </div>
    );
  }

  // Retro 80s Cassette Tape (Normal Mole)
  return (
    <div
      className={`mole-entity relative w-full h-full flex flex-col items-center justify-end group transition-all duration-100 ${
        hit ? 'scale-75 opacity-40 translate-y-4' : 'mole-spring-enter'
      }`}
    >
      {/* Tape Top Header */}
      <div className="w-14 sm:w-16 h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 pointer-events-none" />

      {/* Cassette Shell */}
      <div className="w-20 h-16 sm:w-26 sm:h-20 bg-gradient-to-b from-[#1c0733] to-[#0c0217] border-2 border-pink-500 relative flex flex-col items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.6)]">
        {/* Cassette Sticker Area */}
        <div className="w-5/6 bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 p-1 border border-pink-300">
          <div className="flex items-center justify-between px-1 text-[7px] sm:text-[8px] font-['Righteous'] text-white">
            <span>A // 1984</span>
            <span className="text-yellow-200">MIAMI MIX</span>
          </div>

          {/* Dual Spinning Reels */}
          <div className="mt-0.5 sm:mt-1 flex items-center justify-around bg-black/80 py-0.5">
            <div
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-cyan-400 flex items-center justify-center animate-spin"
              style={{ animationDuration: '2s' }}
            >
              <span className="w-1 h-1 bg-cyan-200 rounded-full" />
            </div>
            <div className="w-4 sm:w-6 h-1 sm:h-1.5 bg-neutral-700" />
            <div
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-cyan-400 flex items-center justify-center animate-spin"
              style={{ animationDuration: '2s' }}
            >
              <span className="w-1 h-1 bg-cyan-200 rounded-full" />
            </div>
          </div>
        </div>

        <span className="font-['Righteous'] text-[7px] sm:text-[8px] text-cyan-300 tracking-widest mt-0.5 uppercase">
          SYNTH CASSETTE
        </span>
      </div>
    </div>
  );
};
