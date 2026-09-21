import React, { useEffect, useState, useRef } from 'react'

interface DecryptedTextProps {
  text: string
  speed?: number
  maxIterations?: number
  characters?: string
  className?: string
  parentClassName?: string
  animateOn?: 'view' | 'hover' | 'mount' | 'change'
}

export const DecryptedText: React.FC<DecryptedTextProps> = ({
  text,
  speed = 40,
  maxIterations = 10,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~|}{[]:;?><',
  className = '',
  parentClassName = '',
}) => {
  const [displayText, setDisplayText] = useState(text)
  const isHovering = useRef(false)

  const triggerAnimation = () => {
    let iteration = 0
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' '
            if (index < iteration) {
              return text[index]
            }
            return characters[Math.floor(Math.random() * characters.length)]
          })
          .join('')
      )

      if (iteration >= text.length) {
        clearInterval(interval)
      }

      iteration += 1 / (maxIterations / text.length || 1)
    }, speed)

    return () => clearInterval(interval)
  }

  useEffect(() => {
    const cleanup = triggerAnimation()
    return () => cleanup && cleanup()
  }, [text])

  return (
    <span
      className={`inline-block whitespace-pre ${parentClassName}`}
      onMouseEnter={() => {
        if (!isHovering.current) {
          isHovering.current = true
          triggerAnimation()
        }
      }}
      onMouseLeave={() => {
        isHovering.current = false
      }}
    >
      <span className={className}>{displayText}</span>
    </span>
  )
}
