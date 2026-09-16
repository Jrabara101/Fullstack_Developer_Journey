import React from 'react';

export const BackgroundScene: React.FC = () => {
  return (
    <>
      {/* CRT Scanline Screen Overlay */}
      <div className="fixed inset-0 crt-scanline z-50 pointer-events-none opacity-50" />

      {/* Retro Synthwave Horizon & Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex flex-col justify-end">
        {/* Sunset Sky Gradient & Stars */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060012] via-[#21023d] to-[#45055b]" />

        {/* Synthwave Glowing Striped Sun */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-64 h-64 sm:w-80 sm:h-80 rounded-full sunset-sun opacity-90" />

        {/* Retro Wireframe Mountain Silhouette */}
        <svg
          className="absolute top-44 sm:top-40 left-0 w-full h-44 text-[#1a052b]/80 opacity-90 fill-current preserve-3d"
          preserveAspectRatio="none"
          viewBox="0 0 1200 200"
        >
          <polygon points="0,200 90,140 180,180 320,80 440,160 560,95 680,170 820,60 940,150 1080,90 1200,200" />
        </svg>

        {/* Outrun 80s Palm Trees Silhouettes Left */}
        <div className="absolute top-48 left-4 md:left-16 w-32 md:w-44 h-48 opacity-80 z-10">
          <svg className="w-full h-full fill-[#05000c]" viewBox="0 0 100 120">
            <path d="M45,120 Q48,70 35,30 Q33,26 30,22 Q15,10 0,35 Q18,18 30,22 Q10,38 8,62 Q22,40 32,24 Q30,10 50,0 Q40,15 36,25 Q55,15 65,30 Q46,28 35,27 Q48,50 48,120 Z" />
          </svg>
        </div>

        {/* Outrun 80s Palm Trees Silhouettes Right */}
        <div className="absolute top-44 right-4 md:right-16 w-36 md:w-48 h-52 opacity-80 z-10 scale-x-[-1]">
          <svg className="w-full h-full fill-[#05000c]" viewBox="0 0 100 120">
            <path d="M45,120 Q48,70 35,30 Q33,26 30,22 Q15,10 0,35 Q18,18 30,22 Q10,38 8,62 Q22,40 32,24 Q30,10 50,0 Q40,15 36,25 Q55,15 65,30 Q46,28 35,27 Q48,50 48,120 Z" />
          </svg>
        </div>

        {/* Horizon Glowing Laser Line */}
        <div className="absolute top-64 w-full h-[3px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent shadow-[0_0_20px_#00f0ff] z-10" />

        {/* 3D Perspective Moving Neon Wireframe Grid */}
        <div className="synth-grid-container w-full h-[65vh] relative overflow-hidden">
          <div className="synth-grid-plane absolute -top-[50%] -left-[50%] w-[200%] h-[200%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-[#21023d]/90" />
        </div>
      </div>
    </>
  );
};
