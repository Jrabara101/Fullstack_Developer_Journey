import React from 'react';
import type { ThemeId } from '../../../../shared/types';

interface VectorStageProps {
  theme: ThemeId;
  strikes: number;
  maxStrikes?: number;
  status: 'IDLE' | 'PLAYING' | 'WON' | 'LOST';
}

export const VectorStage: React.FC<VectorStageProps> = ({
  theme,
  strikes,
  status,
}) => {
  const isCritical = strikes >= 5;
  const isOver = status === 'LOST';

  return (
    <div className="relative w-full aspect-square max-w-[360px] mx-auto flex items-center justify-center p-2">
      {/* Background coordinate grid */}
      <svg
        className={`w-full h-full drop-shadow-[0_0_25px_rgba(0,0,0,0.8)] transition-transform duration-300 ${
          isCritical && status === 'PLAYING' ? 'animate-tension-glitch' : ''
        }`}
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="tactical-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#2e2925" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="glow-danger" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffb4ab" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ffb4ab" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glow-success" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4edea3" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4edea3" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="400" height="400" fill="url(#tactical-grid)" />

        {/* Ambient status backdrop */}
        {status === 'WON' && <circle cx="200" cy="200" r="180" fill="url(#glow-success)" />}
        {status === 'LOST' && <circle cx="200" cy="200" r="180" fill="url(#glow-danger)" />}

        {/* THEME 1: DEEP-SEA DIVER */}
        {theme === 'deep_sea_diver' && (
          <g id="diver-stage">
            {/* Background Submarine / Trench Waters */}
            <path d="M 50 380 Q 200 370 350 380" stroke="#393430" strokeWidth="2" strokeDasharray="4 4" />
            <text x="60" y="390" fill="#86948a" fontSize="8" fontFamily="JetBrains Mono">TRENCH DEPTH: 1,420m</text>

            {/* Stage 1: Primary Winch Boom & Depth Cable */}
            <g className={`transition-all duration-700 ${strikes >= 1 ? 'opacity-100' : 'opacity-20'}`}>
              <line x1="80" y1="360" x2="80" y2="60" stroke="#eae1da" strokeWidth="3" />
              <line x1="80" y1="60" x2="260" y2="60" stroke="#eae1da" strokeWidth="3" />
              <line x1="80" y1="120" x2="140" y2="60" stroke="#4edea3" strokeWidth="2" />
              <circle cx="260" cy="60" r="10" stroke="#ffb95f" strokeWidth="2" fill="#1f1b17" />
              <line x1="260" y1="70" x2="260" y2="120" stroke="#ffb95f" strokeWidth="2.5" strokeDasharray="4 2" />
              <text x="90" y="75" fill="#86948a" fontSize="8" fontFamily="JetBrains Mono">HOIST_CABLE // T-9</text>
            </g>

            {/* Stage 2: Heavy Vintage Brass Helmet */}
            <g className={`transition-all duration-700 ${strikes >= 2 ? 'opacity-100' : 'opacity-20'}`}>
              <circle cx="260" cy="155" r="32" stroke="#ffb95f" strokeWidth="3" fill="#231f1b" />
              {/* Helmet Viewport Window */}
              <circle cx="260" cy="155" r="18" stroke="#4edea3" strokeWidth="2" fill="#12100e" />
              <circle cx="258" cy="152" r="12" fill={strikes >= 5 ? '#ffb4ab' : '#4edea3'} opacity="0.3" />
              {/* Brass rivet bolts */}
              <circle cx="242" cy="155" r="2.5" fill="#ffb95f" />
              <circle cx="278" cy="155" r="2.5" fill="#ffb95f" />
              <circle cx="260" cy="137" r="2.5" fill="#ffb95f" />
              <circle cx="260" cy="173" r="2.5" fill="#ffb95f" />
            </g>

            {/* Stage 3: Pressurized Torso & Weight Harness */}
            <g className={`transition-all duration-700 ${strikes >= 3 ? 'opacity-100' : 'opacity-20'}`}>
              <rect x="235" y="187" width="50" height="70" rx="6" stroke="#eae1da" strokeWidth="2.5" fill="#1f1b17" />
              <line x1="240" y1="205" x2="280" y2="205" stroke="#ffb95f" strokeWidth="2" />
              <line x1="240" y1="225" x2="280" y2="225" stroke="#ffb95f" strokeWidth="2" />
              {/* Pressure valve */}
              <circle cx="250" cy="242" r="5" stroke="#4edea3" strokeWidth="1.5" />
            </g>

            {/* Stage 4: Armatures & Brass Gauntlets */}
            <g className={`transition-all duration-700 ${strikes >= 4 ? 'opacity-100' : 'opacity-20'}`}>
              {/* Left arm */}
              <polyline points="235,195 200,225 190,250" stroke="#eae1da" strokeWidth="2.5" fill="none" />
              <circle cx="190" cy="250" r="5" fill="#ffb95f" />
              {/* Right arm */}
              <polyline points="285,195 320,225 330,250" stroke="#eae1da" strokeWidth="2.5" fill="none" />
              <circle cx="330" cy="250" r="5" fill="#ffb95f" />
            </g>

            {/* Stage 5: Weighted Lead Boots & Stanchions */}
            <g className={`transition-all duration-700 ${strikes >= 5 ? 'opacity-100' : 'opacity-20'}`}>
              {/* Left leg */}
              <polyline points="245,257 235,310 220,345" stroke="#eae1da" strokeWidth="2.5" fill="none" />
              <rect x="210" y="340" width="22" height="12" rx="2" fill="#ffb95f" />
              {/* Right leg */}
              <polyline points="275,257 285,310 300,345" stroke="#eae1da" strokeWidth="2.5" fill="none" />
              <rect x="288" y="340" width="22" height="12" rx="2" fill="#ffb95f" />
            </g>

            {/* Stage 6: Critical Breach: Viewport Shatters & Air Bubbles */}
            <g className={`transition-all duration-700 ${strikes >= 6 ? 'opacity-100' : 'opacity-0'}`}>
              {/* Viewport fissure cracks */}
              <path d="M 252 148 L 260 155 L 268 152 L 264 163" stroke="#ffb4ab" strokeWidth="2" strokeLinecap="round" />
              {/* Escaping decompression bubbles */}
              <circle cx="265" cy="130" r="4" stroke="#ffb4ab" strokeWidth="1.5" className="animate-bounce" />
              <circle cx="270" cy="115" r="3" stroke="#ffb4ab" strokeWidth="1.5" />
              <circle cx="262" cy="100" r="5" stroke="#ffb4ab" strokeWidth="1.5" />
              <text x="180" y="375" fill="#ffb4ab" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
                ⚠️ CRITICAL VIEWPORT RUPTURE
              </text>
            </g>
          </g>
        )}

        {/* THEME 2: CLOCKWORK AUTOMATON */}
        {theme === 'steampunk_automaton' && (
          <g id="automaton-stage">
            {/* Structural Assembly Base */}
            <line x1="70" y1="360" x2="330" y2="360" stroke="#393430" strokeWidth="3" />
            <polygon points="100,360 140,360 120,325" fill="#231f1b" stroke="#393430" strokeWidth="1.5" />

            {/* Stage 1: Iron Gantry & Main Suspension */}
            <g className={`transition-all duration-700 ${strikes >= 1 ? 'opacity-100' : 'opacity-20'}`}>
              <line x1="120" y1="360" x2="120" y2="60" stroke="#eae1da" strokeWidth="3.5" strokeDasharray="8 2" />
              <line x1="118" y1="60" x2="280" y2="60" stroke="#eae1da" strokeWidth="3.5" />
              <line x1="120" y1="120" x2="180" y2="60" stroke="#4edea3" strokeWidth="2" />
              <circle cx="260" cy="60" r="6" fill="#4edea3" />
              <line x1="260" y1="66" x2="260" y2="120" stroke="#ffb95f" strokeWidth="2" strokeDasharray="3 2" />
            </g>

            {/* Stage 2: Mechanical Cranium & Optical Gear */}
            <g className={`transition-all duration-700 ${strikes >= 2 ? 'opacity-100' : 'opacity-20'}`}>
              <rect x="238" y="120" width="44" height="42" rx="6" stroke="#eae1da" strokeWidth="2" fill="#1f1b17" />
              {/* Ocular optics */}
              <circle cx="250" cy="138" r="5" stroke="#4edea3" strokeWidth="2" fill="#12100e" />
              <circle cx="270" cy="138" r="5" stroke="#4edea3" strokeWidth="2" fill="#12100e" />
              {/* Antenna */}
              <line x1="260" y1="120" x2="260" y2="105" stroke="#ffb95f" strokeWidth="2" />
              <circle cx="260" cy="103" r="3" fill="#ffb95f" />
            </g>

            {/* Stage 3: Steam Boiler Chest & Exposed Cog */}
            <g className={`transition-all duration-700 ${strikes >= 3 ? 'opacity-100' : 'opacity-20'}`}>
              <polygon points="230,165 290,165 280,245 240,245" stroke="#eae1da" strokeWidth="2.5" fill="#231f1b" />
              {/* Brass Cogwheel inside chest */}
              <circle cx="260" cy="205" r="14" stroke="#ffb95f" strokeWidth="2" strokeDasharray="4 3" className="animate-spin" />
              <circle cx="260" cy="205" r="4" fill="#4edea3" />
            </g>

            {/* Stage 4: Articulated Piston Arms */}
            <g className={`transition-all duration-700 ${strikes >= 4 ? 'opacity-100' : 'opacity-20'}`}>
              {/* Left Piston */}
              <line x1="230" y1="175" x2="195" y2="210" stroke="#eae1da" strokeWidth="2.5" />
              <circle cx="195" cy="210" r="4" fill="#ffb95f" />
              <line x1="195" y1="210" x2="185" y2="245" stroke="#4edea3" strokeWidth="2" />
              {/* Right Piston */}
              <line x1="290" y1="175" x2="325" y2="210" stroke="#eae1da" strokeWidth="2.5" />
              <circle cx="325" cy="210" r="4" fill="#ffb95f" />
              <line x1="325" y1="210" x2="335" y2="245" stroke="#4edea3" strokeWidth="2" />
            </g>

            {/* Stage 5: Strut Servos & Hydraulic Legs */}
            <g className={`transition-all duration-700 ${strikes >= 5 ? 'opacity-100' : 'opacity-20'}`}>
              {/* Left leg */}
              <polyline points="245,245 235,295 225,345" stroke="#eae1da" strokeWidth="2.5" fill="none" />
              <rect x="215" y="345" width="20" height="8" rx="2" fill="#ffb95f" />
              {/* Right leg */}
              <polyline points="275,245 285,295 295,345" stroke="#eae1da" strokeWidth="2.5" fill="none" />
              <rect x="285" y="345" width="20" height="8" rx="2" fill="#ffb95f" />
            </g>

            {/* Stage 6: Catastrophic Mainspring Overdrive */}
            <g className={`transition-all duration-700 ${strikes >= 6 ? 'opacity-100' : 'opacity-0'}`}>
              <path d="M 260 205 Q 295 190 310 220 T 340 180" stroke="#ffb4ab" strokeWidth="2" fill="none" />
              <path d="M 260 205 Q 225 190 205 220 T 175 180" stroke="#ffb4ab" strokeWidth="2" fill="none" />
              <text x="175" y="375" fill="#ffb4ab" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
                ⚡ ROGUE MAINSPRING TRIPPED
              </text>
            </g>
          </g>
        )}

        {/* THEME 3: ORBITAL SPACEWALK */}
        {theme === 'orbital_astronaut' && (
          <g id="astronaut-stage">
            {/* Space capsule hatch rim */}
            <circle cx="70" cy="70" r="55" stroke="#393430" strokeWidth="3" fill="#1f1b17" />
            <circle cx="70" cy="70" r="42" stroke="#4edea3" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="45" y="75" fill="#86948a" fontSize="7" fontFamily="JetBrains Mono">AIRLOCK_A1</text>

            {/* Stage 1: Umbilical Tether Unspooling */}
            <g className={`transition-all duration-700 ${strikes >= 1 ? 'opacity-100' : 'opacity-20'}`}>
              <path
                d="M 120 85 C 160 100, 180 60, 220 110 S 240 140, 260 145"
                stroke="#ffb95f"
                strokeWidth="2.5"
                strokeDasharray={strikes >= 5 ? '4 4' : 'none'}
                fill="none"
              />
              <circle cx="120" cy="85" r="4" fill="#4edea3" />
              <text x="135" y="115" fill="#86948a" fontSize="8" fontFamily="JetBrains Mono">UMBILICAL_EVA</text>
            </g>

            {/* Stage 2: Gold Foil Helmet Visor */}
            <g className={`transition-all duration-700 ${strikes >= 2 ? 'opacity-100' : 'opacity-20'}`}>
              <circle cx="260" cy="150" r="28" stroke="#eae1da" strokeWidth="2.5" fill="#231f1b" />
              {/* Gold reflective visor */}
              <ellipse cx="264" cy="150" rx="18" ry="14" fill="#ffb95f" opacity="0.8" />
              <ellipse cx="262" cy="148" rx="12" ry="8" fill="#eae1da" opacity="0.3" />
            </g>

            {/* Stage 3: Life-Support Chest Pack & PLSS */}
            <g className={`transition-all duration-700 ${strikes >= 3 ? 'opacity-100' : 'opacity-20'}`}>
              {/* Backpack */}
              <rect x="230" y="175" width="60" height="75" rx="8" stroke="#eae1da" strokeWidth="2.5" fill="#1f1b17" />
              {/* O2 Display meter */}
              <rect x="245" y="190" width="30" height="15" rx="3" fill="#12100e" stroke="#4edea3" strokeWidth="1" />
              <text x="250" y="201" fill={strikes >= 5 ? '#ffb4ab' : '#4edea3'} fontSize="8" fontFamily="JetBrains Mono">
                {strikes >= 5 ? '12%' : '88%'}
              </text>
            </g>

            {/* Stage 4: Pressurized Arms & Thruster Gloves */}
            <g className={`transition-all duration-700 ${strikes >= 4 ? 'opacity-100' : 'opacity-20'}`}>
              {/* Left arm reaching */}
              <polyline points="230,190 190,215 175,230" stroke="#eae1da" strokeWidth="2.5" fill="none" />
              <circle cx="175" cy="230" r="5" fill="#4edea3" />
              {/* Right arm reaching for tether */}
              <polyline points="290,190 325,210 340,200" stroke="#eae1da" strokeWidth="2.5" fill="none" />
              <circle cx="340" cy="200" r="5" fill="#4edea3" />
            </g>

            {/* Stage 5: Zero-G Mobility Legs */}
            <g className={`transition-all duration-700 ${strikes >= 5 ? 'opacity-100' : 'opacity-20'}`}>
              <polyline points="245,250 230,300 215,340" stroke="#eae1da" strokeWidth="2.5" fill="none" />
              <polyline points="275,250 290,295 315,335" stroke="#eae1da" strokeWidth="2.5" fill="none" />
              <ellipse cx="215" cy="340" rx="8" ry="5" fill="#ffb95f" />
              <ellipse cx="315" cy="335" rx="8" ry="5" fill="#ffb95f" />
            </g>

            {/* Stage 6: Tether Snaps / Drifting Into The Void */}
            <g className={`transition-all duration-700 ${strikes >= 6 ? 'opacity-100' : 'opacity-0'}`}>
              <line x1="210" y1="105" x2="225" y2="115" stroke="#ffb4ab" strokeWidth="3" />
              <text x="165" y="375" fill="#ffb4ab" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
                ⚠️ TETHER SNAPPED // LOST IN ORBIT
              </text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};
