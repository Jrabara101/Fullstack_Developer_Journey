import React from 'react'

interface ShinyTextProps {
  children: React.ReactNode
  className?: string
  shimmerColor?: string
}

export const ShinyText: React.FC<ShinyTextProps> = ({
  children,
  className = '',
}) => {
  return (
    <span
      className={`inline-block bg-[length:250%_100%] bg-clip-text text-transparent animate-shine ${className}`}
      style={{
        backgroundImage: `linear-gradient(110deg, var(--color-text) 35%, var(--color-accent) 50%, var(--color-text) 65%)`,
      }}
    >
      {children}
    </span>
  )
}
