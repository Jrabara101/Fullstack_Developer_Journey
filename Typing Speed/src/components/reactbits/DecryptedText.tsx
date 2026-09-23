import React, { useState, useEffect } from 'react'

interface DecryptedTextProps {
  text: string
  speed?: number
  maxIterations?: number
  className?: string
  encryptedClassName?: string
  sequential?: boolean
}

const GLYPHS = '01#_*/&%<>[]{}~=+?!@'

export const DecryptedText: React.FC<DecryptedTextProps> = ({
  text,
  speed = 40,
  maxIterations = 10,
  className = '',
  encryptedClassName = 'text-amber-400/80',
  sequential = true,
}) => {
  const [displayText, setDisplayText] = useState(text)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    let iteration = 0
    const interval = setInterval(() => {
      setDisplayText(() =>
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' '
            if (sequential) {
              if (index < iteration) {
                return text[index]
              }
            } else {
              if (iteration >= maxIterations) {
                return text[index]
              }
            }
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          })
          .join('')
      )

      iteration += 1 / 2

      if (iteration >= text.length + 2) {
        clearInterval(interval)
        setDisplayText(text)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed, maxIterations, sequential, isHovered])

  return (
    <span
      className={`inline-block font-mono select-none tracking-wider ${className}`}
      onMouseEnter={() => setIsHovered(prev => !prev)}
    >
      {displayText.split('').map((char, i) => {
        const isOriginal = char === text[i]
        return (
          <span
            key={i}
            className={isOriginal ? '' : encryptedClassName}
          >
            {char}
          </span>
        )
      })}
    </span>
  )
}
