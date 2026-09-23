export type TestMode = 'time' | 'words' | 'code'

export type TimeLimit = 15 | 30 | 60 | 120

export type WordQuota = 10 | 25 | 50 | 100

export type SyntaxCategory = 'react' | 'typescript' | 'javascript' | 'python' | 'sql' | 'bash'

export type ErrorMode = 'confidence' | 'strict' | 'sudden-death'

export type PacerMode = 'off' | 'pb' | 60 | 80 | 100 | 120

export type SoundMode = 'off' | 'thock' | 'clicky' | 'typewriter'

export type ThemeName = 'obsidian' | 'cyberpunk' | 'tokyo' | 'matrix' | 'espresso'

export type TestStatus = 'idle' | 'running' | 'finished'

export type CharStatus = 'untyped' | 'correct' | 'incorrect' | 'extra'

export interface CharDetail {
  char: string
  status: CharStatus
}

export interface WordDetail {
  original: string
  chars: CharDetail[]
  isCurrent: boolean
  isComplete: boolean
  hasError: boolean
}

export interface MetricSnapshot {
  time: number
  wpm: number
  rawWpm: number
  errors: number
}

export interface TestMetrics {
  wpm: number
  rawWpm: number
  accuracy: number
  consistency: number
  timeElapsed: number
  correctChars: number
  incorrectChars: number
  extraChars: number
  missedChars: number
  totalChars: number
  history: MetricSnapshot[]
}

export interface PersonalBestRecord {
  wpm: number
  accuracy: number
  date: string
}

export interface AppSettings {
  theme: ThemeName
  sound: SoundMode
  volume: number
  errorMode: ErrorMode
  pacer: PacerMode
  smoothCaret: boolean
  blindMode: boolean
  quickRestart: boolean
}
