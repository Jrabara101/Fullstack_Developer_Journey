import React from 'react'

interface ScanlineOverlayProps {
  active: boolean
}

export const ScanlineOverlay: React.FC<ScanlineOverlayProps> = ({ active }) => {
  if (!active) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none">
      {/* Horizontal scanline stripes */}
      <div className="absolute inset-0 crt-scanlines opacity-40 mix-blend-overlay" />
      {/* Traveling CRT cathode ray beam */}
      <div className="crt-beam" />
      {/* Subtle CRT screen corner vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.7)]" />
    </div>
  )
}
