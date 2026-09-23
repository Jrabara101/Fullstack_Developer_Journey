import React from 'react'

interface SlidingCaretProps {
  top: number
  left: number
  height: number
  visible: boolean
  isGhost?: boolean
  label?: string
}

export const SlidingCaret: React.FC<SlidingCaretProps> = ({
  top,
  left,
  height,
  visible,
  isGhost = false,
  label,
}) => {
  if (!visible) return null

  if (isGhost) {
    return (
      <div
        className="ghost-caret pointer-events-none absolute z-10 w-0.5 rounded-full"
        style={{
          transform: `translate3d(${left}px, ${top}px, 0)`,
          height: `${height}px`,
          backgroundColor: 'var(--color-ghost)',
          boxShadow: '0 0 6px var(--color-ghost)',
        }}
      >
        {label && (
          <span className="absolute -top-4 left-1 text-[9px] font-mono uppercase tracking-widest text-zinc-500/70 whitespace-nowrap">
            {label}
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      className="sliding-caret pointer-events-none absolute z-20 w-0.5 rounded-full"
      style={{
        transform: `translate3d(${left}px, ${top}px, 0)`,
        height: `${height}px`,
        backgroundColor: 'var(--color-caret)',
        boxShadow: `0 0 10px var(--color-caret-glow), 0 0 2px var(--color-caret)`,
      }}
    />
  )
}
