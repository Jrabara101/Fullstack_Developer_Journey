export type MemoryStatus = 'fresh' | 'fading' | 'lapsed';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  deckId: string;
  tags?: string[];
  // Spaced Repetition parameters
  intervalDays: number; // current interval in days
  easeFactor: number; // starting around 2.5
  repetitionCount: number;
  lapseCount: number;
  lastReviewedAt: number | null; // timestamp
  nextReviewAt: number; // timestamp
  lastResponseSpeedMs?: number;
  history?: Array<{
    date: number;
    grade: 1 | 2 | 3 | 4;
    speedMs: number;
  }>;
  // Image Occlusion data (optional)
  occlusionData?: {
    imageUrl: string;
    imageTitle?: string;
    masks: Array<{
      id: string;
      x: number; // percentage 0-100
      y: number; // percentage 0-100
      width: number; // percentage 0-100
      height: number; // percentage 0-100
      label: string;
      revealed?: boolean;
    }>;
  };
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  category: string;
  cardCount: number;
  lastStudiedAt: number | null;
  cards: Flashcard[];
  color: string;
  iconName: string;
  isForked?: boolean;
  forkedFrom?: string;
}

export interface StudySessionStats {
  cardsReviewed: number;
  masteredCount: number;
  reviewSoonCount: number;
  hardCount: number;
  averageSpeedMs: number;
  startTime: number;
  endTime?: number;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // intensity for heatmap
}

export interface CrunchRoomParticipant {
  id: string;
  name: string;
  avatar: string;
  score: number;
  streak: number;
  lastAnswerCorrect?: boolean;
  isCurrentUser?: boolean;
  status: 'answering' | 'ready' | 'streak_fire';
}

