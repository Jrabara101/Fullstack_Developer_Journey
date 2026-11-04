import React from 'react';

interface AmbientGlowProps {
  dominantColor: string;
}

export const AmbientGlow: React.FC<AmbientGlowProps> = ({ dominantColor }) => {
  return (
    <div
      className="ambient-glow"
      style={{
        background: `radial-gradient(circle 800px at 50% 15%, ${dominantColor} 0%, rgba(11, 12, 14, 0) 70%)`
      }}
      aria-hidden="true"
    />
  );
};

