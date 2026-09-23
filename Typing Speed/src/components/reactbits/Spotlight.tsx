import React, { useEffect, useRef } from 'react'

interface SpotlightProps {
  className?: string
  fill?: string
}

export const Spotlight: React.FC<SpotlightProps> = ({
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const { clientX, clientY } = e
      containerRef.current.style.setProperty('--mouse-x', `${clientX}px`)
      containerRef.current.style.setProperty('--mouse-y', `${clientY}px`)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden transition-opacity duration-300 ${className}`}
      style={{
        // default position centered
        ['--mouse-x' as string]: '50vw',
        ['--mouse-y' as string]: '35vh',
      }}
    >
      {/* Dynamic Cursor Spotlight */}
      <div
        className="absolute inset-0 opacity-40 transition-transform duration-75"
        style={{
          background: `radial-gradient(650px circle at var(--mouse-x) var(--mouse-y), var(--color-caret-glow), transparent 60%)`,
        }}
      />
      {/* Subtle Grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  )
}
