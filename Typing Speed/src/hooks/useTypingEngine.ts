import { useState, useEffect, useRef, useCallback } from 'react'
import type {
  TestMode,
  TimeLimit,
  WordQuota,
  SyntaxCategory,
  ErrorMode,
  TestStatus,
  WordDetail,
  TestMetrics,
  MetricSnapshot
} from '../types/typing'
import { getRandomWords } from '../data/words'
import { getRandomCodeSnippet } from '../data/codeSnippets'
import { calculateWpm, calculateRawWpm, calculateAccuracy, calculateConsistency } from '../lib/utils'

interface UseTypingEngineProps {
  mode: TestMode
  timeLimit: TimeLimit
  wordQuota: WordQuota
  syntaxCategory: SyntaxCategory
  errorMode: ErrorMode
  onKeyStroke?: (isSpace: boolean, isError: boolean) => void
  onTestComplete?: (metrics: TestMetrics) => void
}

export function useTypingEngine({
  mode,
  timeLimit,
  wordQuota,
  syntaxCategory,
  errorMode,
  onKeyStroke,
  onTestComplete,
}: UseTypingEngineProps) {
  const [status, setStatus] = useState<TestStatus>('idle')
  const [words, setWords] = useState<WordDetail[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0)
  const [currentInput, setCurrentInput] = useState<string>('')
  const [timeRemaining, setTimeRemaining] = useState<number>(timeLimit)
  const [timeElapsed, setTimeElapsed] = useState<number>(0)
  
  // Analytics tracking
  const [correctChars, setCorrectChars] = useState<number>(0)
  const [incorrectChars, setIncorrectChars] = useState<number>(0)
  const [extraChars, setExtraChars] = useState<number>(0)
  const [missedChars, setMissedChars] = useState<number>(0)
  const [totalKeystrokes, setTotalKeystrokes] = useState<number>(0)
  const [history, setHistory] = useState<MetricSnapshot[]>([])

  // Live subdued stats
  const [liveWpm, setLiveWpm] = useState<number>(0)
  const [liveAccuracy, setLiveAccuracy] = useState<number>(100)

  // References for mutable timing loop
  const timerRef = useRef<number | null>(null)
  const snapshotTimerRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const isFinishedRef = useRef<boolean>(false)
  const currentCodeSnippetRef = useRef<string>('')

  // Build word list based on mode
  const generateWordsList = useCallback((): WordDetail[] => {
    let rawWords: string[] = []

    if (mode === 'code') {
      const snippet = getRandomCodeSnippet(syntaxCategory)
      currentCodeSnippetRef.current = snippet.title
      rawWords = snippet.code.split(' ').filter(w => w.length > 0)
    } else if (mode === 'words') {
      rawWords = getRandomWords(wordQuota)
    } else {
      // time mode: generate enough words for 200+ WPM
      const wordCount = Math.max(100, Math.ceil((timeLimit * 220) / 60))
      rawWords = getRandomWords(wordCount)
    }

    return rawWords.map((word, idx) => ({
      original: word,
      chars: word.split('').map(char => ({ char, status: 'untyped' })),
      isCurrent: idx === 0,
      isComplete: false,
      hasError: false
    }))
  }, [mode, timeLimit, wordQuota, syntaxCategory])

  // Reset or initialize test
  const resetTest = useCallback((preserveWordset: boolean = false) => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (snapshotTimerRef.current) clearInterval(snapshotTimerRef.current)
    
    isFinishedRef.current = false
    setStatus('idle')
    setCurrentWordIndex(0)
    setCurrentInput('')
    setTimeRemaining(timeLimit)
    setTimeElapsed(0)
    setCorrectChars(0)
    setIncorrectChars(0)
    setExtraChars(0)
    setMissedChars(0)
    setTotalKeystrokes(0)
    setLiveWpm(0)
    setLiveAccuracy(100)
    setHistory([])
    startTimeRef.current = null

    if (!preserveWordset || words.length === 0) {
      setWords(generateWordsList())
    } else {
      // Reset status of existing words
      setWords(prev =>
        prev.map((w, idx) => ({
          ...w,
          chars: w.original.split('').map(char => ({ char, status: 'untyped' })),
          isCurrent: idx === 0,
          isComplete: false,
          hasError: false
        }))
      )
    }
  }, [timeLimit, generateWordsList, words.length])

  // Finish test and calculate final metrics
  const finishTest = useCallback(() => {
    if (isFinishedRef.current) return
    isFinishedRef.current = true

    if (timerRef.current) clearInterval(timerRef.current)
    if (snapshotTimerRef.current) clearInterval(snapshotTimerRef.current)

    setStatus('finished')

    const elapsed = Math.max(1, timeElapsed)
    const finalWpm = calculateWpm(correctChars, elapsed)
    const finalRawWpm = calculateRawWpm(totalKeystrokes, elapsed)
    const finalAccuracy = calculateAccuracy(correctChars, totalKeystrokes)
    const wpmSnapshots = history.map(h => h.wpm)
    const finalConsistency = calculateConsistency(wpmSnapshots.length > 0 ? wpmSnapshots : [finalWpm])

    const metrics: TestMetrics = {
      wpm: finalWpm,
      rawWpm: finalRawWpm,
      accuracy: finalAccuracy,
      consistency: finalConsistency,
      timeElapsed: elapsed,
      correctChars,
      incorrectChars,
      extraChars,
      missedChars,
      totalChars: totalKeystrokes,
      history: history.length > 0 ? history : [{ time: elapsed, wpm: finalWpm, rawWpm: finalRawWpm, errors: incorrectChars }]
    }

    onTestComplete?.(metrics)
  }, [timeElapsed, correctChars, totalKeystrokes, incorrectChars, extraChars, missedChars, history, onTestComplete])

  // Timer loop
  useEffect(() => {
    if (status === 'running') {
      startTimeRef.current = Date.now()

      timerRef.current = window.setInterval(() => {
        setTimeElapsed(prev => {
          const next = prev + 1

          if (mode === 'time') {
            setTimeRemaining(rem => {
              if (rem <= 1) {
                finishTest()
                return 0
              }
              return rem - 1
            })
          }

          // Update live metrics
          setCorrectChars(currCorrect => {
            setTotalKeystrokes(currTotal => {
              const liveCalculatedWpm = calculateWpm(currCorrect, next)
              const liveAcc = calculateAccuracy(currCorrect, currTotal)
              setLiveWpm(liveCalculatedWpm)
              setLiveAccuracy(liveAcc)

              // Record snapshot every second
              setHistory(h => [
                ...h,
                {
                  time: next,
                  wpm: liveCalculatedWpm,
                  rawWpm: calculateRawWpm(currTotal, next),
                  errors: incorrectChars
                }
              ])
              return currTotal
            })
            return currCorrect
          })

          return next
        })
      }, 1000)

      return () => {
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }
  }, [status, mode, incorrectChars, finishTest])

  // Initialize words on mount or config changes
  useEffect(() => {
    resetTest(false)
  }, [mode, timeLimit, wordQuota, syntaxCategory])

  // Handle character keystroke
  const handleKeyDown = useCallback((e: KeyboardEvent | React.KeyboardEvent) => {
    // Ignore meta/ctrl/alt key combinations (e.g. Cmd+K, Ctrl+C)
    if (e.ctrlKey || e.metaKey || e.altKey) return

    // Quick reset on Escape
    if (e.key === 'Escape') {
      e.preventDefault()
      resetTest(false)
      return
    }

    // Ignore tab unless tab+enter handled outside
    if (e.key === 'Tab') {
      e.preventDefault()
      return
    }

    if (status === 'finished') return

    // Start timer on first valid keypress
    if (status === 'idle') {
      if (e.key.length === 1 || e.key === 'Backspace') {
        setStatus('running')
      }
    }

    const currentWord = words[currentWordIndex]
    if (!currentWord) return

    // BACKSPACE HANDLER
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (currentInput.length > 0) {
        const newInput = currentInput.slice(0, -1)
        setCurrentInput(newInput)

        // Update word characters
        setWords(prev => {
          const updated = [...prev]
          const word = { ...updated[currentWordIndex] }
          const targetChars = word.original.split('')

          // Update chars array
          const chars = targetChars.map((char, i) => {
            if (i >= newInput.length) {
              return { char, status: 'untyped' as const }
            }
            return {
              char,
              status: newInput[i] === char ? ('correct' as const) : ('incorrect' as const)
            }
          })

          // Extra chars
          if (newInput.length > targetChars.length) {
            const extra = newInput.slice(targetChars.length).split('').map(char => ({
              char,
              status: 'extra' as const
            }))
            word.chars = [...chars, ...extra]
          } else {
            word.chars = chars
          }

          updated[currentWordIndex] = word
          return updated
        })

        onKeyStroke?.(false, false)
      } else if (currentWordIndex > 0 && errorMode === 'confidence') {
        // Option to jump back to previous incomplete/erroneous word
        const prevWord = words[currentWordIndex - 1]
        if (prevWord.hasError) {
          setCurrentWordIndex(currentWordIndex - 1)
          setCurrentInput(prevWord.original)
          setWords(prev => {
            const updated = [...prev]
            updated[currentWordIndex].isCurrent = false
            updated[currentWordIndex - 1].isCurrent = true
            return updated
          })
        }
      }
      return
    }

    // SPACEBAR HANDLER (Word Submission)
    if (e.key === ' ') {
      e.preventDefault()
      
      // Spacebar Ghost-Error Trap: ignore duplicate spaces on empty input
      if (currentInput.length === 0) {
        return
      }

      // If in Strict Mode, don't allow moving forward if current word has errors
      const targetWord = currentWord.original
      const isWordCorrect = currentInput === targetWord
      
      if (errorMode === 'strict' && !isWordCorrect) {
        onKeyStroke?.(true, true)
        return
      }

      // Calculate accuracy & errors for this completed word
      let wordCorrect = 0
      let wordIncorrect = 0
      let wordExtra = 0
      let wordMissed = 0

      for (let i = 0; i < targetWord.length; i++) {
        if (i < currentInput.length) {
          if (currentInput[i] === targetWord[i]) {
            wordCorrect++
          } else {
            wordIncorrect++
          }
        } else {
          wordMissed++
        }
      }

      if (currentInput.length > targetWord.length) {
        wordExtra += (currentInput.length - targetWord.length)
      }

      // Sudden death check
      if (errorMode === 'sudden-death' && (wordIncorrect > 0 || wordExtra > 0 || wordMissed > 0)) {
        onKeyStroke?.(true, true)
        finishTest()
        return
      }

      // Space adds 1 correct stroke if word matched
      if (isWordCorrect) {
        wordCorrect++ // for the space character
      }

      setCorrectChars(c => c + wordCorrect)
      setIncorrectChars(inc => inc + wordIncorrect)
      setExtraChars(ext => ext + wordExtra)
      setMissedChars(m => m + wordMissed)
      setTotalKeystrokes(t => t + currentInput.length + 1)

      // Mark current word complete
      setWords(prev => {
        const updated = [...prev]
        updated[currentWordIndex] = {
          ...updated[currentWordIndex],
          isCurrent: false,
          isComplete: true,
          hasError: !isWordCorrect
        }
        if (currentWordIndex + 1 < updated.length) {
          updated[currentWordIndex + 1].isCurrent = true
        }
        return updated
      })

      onKeyStroke?.(true, !isWordCorrect)

      // Check if finished (quota reached or last word in code snippet)
      if (
        (mode === 'words' && currentWordIndex + 1 >= wordQuota) ||
        currentWordIndex + 1 >= words.length
      ) {
        finishTest()
        return
      }

      setCurrentWordIndex(prev => prev + 1)
      setCurrentInput('')
      return
    }

    // REGULAR CHARACTER KEYPRESS
    if (e.key.length === 1) {
      e.preventDefault()
      const typedChar = e.key
      const nextInput = currentInput + typedChar
      const charIndex = currentInput.length
      const targetChar = currentWord.original[charIndex]
      const isCorrect = typedChar === targetChar

      // Strict mode: lock if wrong character
      if (errorMode === 'strict' && !isCorrect) {
        onKeyStroke?.(false, true)
        return
      }

      // Sudden death: end test immediately on typo
      if (errorMode === 'sudden-death' && !isCorrect) {
        onKeyStroke?.(false, true)
        setIncorrectChars(inc => inc + 1)
        setTotalKeystrokes(t => t + 1)
        finishTest()
        return
      }

      // Update character states
      setCurrentInput(nextInput)
      setTotalKeystrokes(t => t + 1)
      if (isCorrect) {
        setCorrectChars(c => c + 1)
      } else {
        setIncorrectChars(inc => inc + 1)
      }

      setWords(prev => {
        const updated = [...prev]
        const word = { ...updated[currentWordIndex] }
        const targetChars = word.original.split('')

        const chars = targetChars.map((char, i) => {
          if (i >= nextInput.length) {
            return { char, status: 'untyped' as const }
          }
          return {
            char,
            status: nextInput[i] === char ? ('correct' as const) : ('incorrect' as const)
          }
        })

        if (nextInput.length > targetChars.length) {
          const extra = nextInput.slice(targetChars.length).split('').map(char => ({
            char,
            status: 'extra' as const
          }))
          word.chars = [...chars, ...extra]
        } else {
          word.chars = chars
        }

        updated[currentWordIndex] = word
        return updated
      })

      onKeyStroke?.(false, !isCorrect)

      // If this was the final character of the final word in words/code mode
      const isLastWord = currentWordIndex === words.length - 1 || (mode === 'words' && currentWordIndex === wordQuota - 1)
      if (isLastWord && nextInput === currentWord.original) {
        finishTest()
      }
    }
  }, [
    status,
    words,
    currentWordIndex,
    currentInput,
    errorMode,
    mode,
    wordQuota,
    finishTest,
    resetTest,
    onKeyStroke
  ])

  return {
    status,
    words,
    currentWordIndex,
    currentInput,
    timeRemaining,
    timeElapsed,
    liveWpm,
    liveAccuracy,
    correctChars,
    incorrectChars,
    extraChars,
    missedChars,
    totalKeystrokes,
    history,
    codeTitle: currentCodeSnippetRef.current,
    resetTest,
    handleKeyDown,
    finishTest
  }
}
