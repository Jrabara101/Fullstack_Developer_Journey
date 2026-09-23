import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import type { WordDetail, TestStatus, PacerMode } from '../types/typing'
import { SlidingCaret } from './SlidingCaret'

interface TypingCanvasProps {
  words: WordDetail[]
  currentWordIndex: number
  currentInput: string
  status: TestStatus
  timeElapsed: number
  pacer: PacerMode
  personalBestWpm?: number
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onCanvasClick: () => void
}

export const TypingCanvas: React.FC<TypingCanvasProps> = ({
  words,
  currentWordIndex,
  currentInput,
  status,
  timeElapsed,
  pacer,
  personalBestWpm = 0,
  onKeyDown,
  onCanvasClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const wordsContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [caretPos, setCaretPos] = useState<{ top: number; left: number; height: number }>({
    top: 0,
    left: 0,
    height: 32,
  })

  const [ghostPos, setGhostPos] = useState<{ top: number; left: number; height: number; visible: boolean }>({
    top: 0,
    left: 0,
    height: 32,
    visible: false,
  })

  const [scrollOffset, setScrollOffset] = useState<number>(0)

  // Auto-focus input on mount and on clicks
  useEffect(() => {
    inputRef.current?.focus()
  }, [status])

  // Update Caret Position
  const updateCaret = useCallback(() => {
    if (!wordsContainerRef.current || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const activeWordEl = wordsContainerRef.current.querySelector<HTMLElement>(`[data-word-index="${currentWordIndex}"]`)

    if (!activeWordEl) return

    const activeWordRect = activeWordEl.getBoundingClientRect()

    // Determine vertical offset and auto-scroll
    const wordRelativeTop = activeWordEl.offsetTop
    const lineHeight = 44 // standard line height for 2xl font with relaxed leading

    // If active word moves down to line 2 or beyond, scroll smoothly
    if (wordRelativeTop > lineHeight) {
      setScrollOffset(wordRelativeTop - lineHeight)
    } else {
      setScrollOffset(0)
    }

    // Determine horizontal character position
    if (currentInput.length === 0) {
      // Position at start of active word
      const left = activeWordRect.left - containerRect.left
      const top = activeWordRect.top - containerRect.top
      setCaretPos({
        left: Math.max(0, left),
        top,
        height: activeWordRect.height > 0 ? activeWordRect.height * 0.8 : 32,
      })
    } else {
      // Find the character element at currentInput.length - 1
      const charEl = activeWordEl.querySelector<HTMLElement>(`[data-char-index="${currentInput.length - 1}"]`)
      if (charEl) {
        const charRect = charEl.getBoundingClientRect()
        const left = charRect.right - containerRect.left
        const top = charRect.top - containerRect.top
        setCaretPos({
          left: Math.max(0, left),
          top,
          height: charRect.height > 0 ? charRect.height * 0.8 : 32,
        })
      } else {
        // Extra characters beyond word boundary
        const left = activeWordRect.right - containerRect.left
        const top = activeWordRect.top - containerRect.top
        setCaretPos({
          left: Math.max(0, left),
          top,
          height: activeWordRect.height > 0 ? activeWordRect.height * 0.8 : 32,
        })
      }
    }
  }, [currentWordIndex, currentInput])

  useEffect(() => {
    updateCaret()
  }, [updateCaret, words])

  // Update on window resize
  useEffect(() => {
    const handleResize = () => updateCaret()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [updateCaret])

  // Ghost Pacer computation
  const targetPacerWpm = useMemo(() => {
    if (pacer === 'off') return 0
    if (pacer === 'pb') return personalBestWpm > 0 ? personalBestWpm : 60
    return Number(pacer) || 60
  }, [pacer, personalBestWpm])

  useEffect(() => {
    if (pacer === 'off' || status !== 'running' || !wordsContainerRef.current || !containerRef.current) {
      setGhostPos(prev => ({ ...prev, visible: false }))
      return
    }

    // Characters per second = (targetWpm * 5) / 60
    const charsPerSec = (targetPacerWpm * 5) / 60
    const ghostTotalChars = Math.floor(charsPerSec * timeElapsed)

    // Traverse words to find which character matches ghostTotalChars
    let accumulatedChars = 0
    let targetWordIdx = 0
    let targetCharIdx = 0

    for (let w = 0; w < words.length; w++) {
      const wLen = words[w].original.length + 1 // +1 for space
      if (accumulatedChars + wLen > ghostTotalChars) {
        targetWordIdx = w
        targetCharIdx = ghostTotalChars - accumulatedChars
        break
      }
      accumulatedChars += wLen
      targetWordIdx = w
      targetCharIdx = words[w].original.length
    }

    const containerRect = containerRef.current.getBoundingClientRect()
    const wordEl = wordsContainerRef.current.querySelector<HTMLElement>(`[data-word-index="${targetWordIdx}"]`)

    if (wordEl) {
      const charEl = wordEl.querySelector<HTMLElement>(`[data-char-index="${targetCharIdx}"]`)
      if (charEl) {
        const charRect = charEl.getBoundingClientRect()
        setGhostPos({
          left: charRect.left - containerRect.left,
          top: charRect.top - containerRect.top,
          height: charRect.height * 0.8,
          visible: true,
        })
      } else {
        const wordRect = wordEl.getBoundingClientRect()
        setGhostPos({
          left: wordRect.right - containerRect.left,
          top: wordRect.top - containerRect.top,
          height: wordRect.height * 0.8,
          visible: true,
        })
      }
    }
  }, [pacer, status, timeElapsed, targetPacerWpm, words])

  return (
    <div
      ref={containerRef}
      onClick={() => {
        inputRef.current?.focus()
        onCanvasClick()
      }}
      className="relative mx-auto my-auto w-full max-w-4xl cursor-text select-none px-4 py-8 focus:outline-none"
    >
      {/* Hidden input for full keyboard capture */}
      <input
        ref={inputRef}
        type="text"
        className="absolute -top-96 left-0 opacity-0 pointer-events-none"
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        onKeyDown={onKeyDown}
        value=""
        onChange={() => {}} // Controlled by onKeyDown
      />

      {/* Main Multi-Line Text Window */}
      <div className="relative h-[140px] overflow-hidden">
        {/* Smooth Sliding Caret */}
        <SlidingCaret
          left={caretPos.left}
          top={caretPos.top}
          height={caretPos.height}
          visible={status !== 'finished'}
        />

        {/* Ghost Pacer Caret */}
        <SlidingCaret
          left={ghostPos.left}
          top={ghostPos.top}
          height={ghostPos.height}
          visible={ghostPos.visible}
          isGhost
          label={`${targetPacerWpm} wpm`}
        />

        {/* Words flow with smooth line transition */}
        <div
          ref={wordsContainerRef}
          className="flex flex-wrap gap-x-3 gap-y-3 font-mono text-2xl tracking-normal leading-relaxed transition-transform duration-150 ease-out"
          style={{
            transform: `translate3d(0, -${scrollOffset}px, 0)`,
          }}
        >
          {words.map((word, wordIdx) => {
            const isCurrent = wordIdx === currentWordIndex
            const isPast = wordIdx < currentWordIndex

            return (
              <div
                key={wordIdx}
                data-word-index={wordIdx}
                className={`relative flex items-center transition-colors duration-100 ${
                  isCurrent
                    ? 'text-zinc-100 font-medium'
                    : isPast
                    ? word.hasError
                      ? 'border-b border-rose-500/50'
                      : ''
                    : 'text-zinc-600'
                }`}
              >
                {word.chars.map((charItem, charIdx) => {
                  let charClass = 'text-zinc-600'

                  if (isPast) {
                    if (charItem.status === 'correct') charClass = 'text-zinc-300'
                    else if (charItem.status === 'incorrect') charClass = 'text-rose-500 underline decoration-rose-500/70'
                    else if (charItem.status === 'extra') charClass = 'text-rose-400 opacity-80'
                  } else if (isCurrent) {
                    if (charItem.status === 'correct') {
                      charClass = 'text-zinc-100 font-semibold'
                    } else if (charItem.status === 'incorrect') {
                      charClass = 'text-rose-500 bg-rose-500/20 rounded-sm underline decoration-rose-500'
                    } else if (charItem.status === 'extra') {
                      charClass = 'text-rose-400 bg-rose-600/30 rounded-sm'
                    } else {
                      charClass = 'text-zinc-400'
                    }
                  }

                  return (
                    <span
                      key={charIdx}
                      data-char-index={charIdx}
                      className={`inline-block ${charClass} transition-colors duration-75`}
                    >
                      {charItem.char}
                    </span>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
