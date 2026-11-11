// Web Speech API Voice Recall & Keyword Diffing Engine

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

// Check if Speech Recognition is supported
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export class VoiceRecallService {
  private recognition: any = null;
  private isListening: boolean = false;
  private onResultCallback: ((transcript: string) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onStateChangeCallback: ((isListening: boolean) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (this.onResultCallback) {
            this.onResultCallback(currentTranscript);
          }
        };

        this.recognition.onerror = (event: any) => {
          this.isListening = false;
          if (this.onStateChangeCallback) this.onStateChangeCallback(false);
          if (this.onErrorCallback) this.onErrorCallback(event.error || 'Speech error');
        };

        this.recognition.onend = () => {
          this.isListening = false;
          if (this.onStateChangeCallback) this.onStateChangeCallback(false);
        };
      }
    }
  }

  startListening(
    onResult: (transcript: string) => void,
    onError?: (err: string) => void,
    onStateChange?: (listening: boolean) => void
  ) {
    if (!this.recognition) {
      if (onError) onError('Speech Recognition is not supported in this browser.');
      return;
    }

    this.onResultCallback = onResult;
    this.onErrorCallback = onError || null;
    this.onStateChangeCallback = onStateChange || null;

    try {
      this.recognition.start();
      this.isListening = true;
      if (this.onStateChangeCallback) this.onStateChangeCallback(true);
    } catch {
      // If already started, stop and restart
      try {
        this.recognition.stop();
        setTimeout(() => {
          this.recognition.start();
          this.isListening = true;
          if (this.onStateChangeCallback) this.onStateChangeCallback(true);
        }, 100);
      } catch {}
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
      if (this.onStateChangeCallback) this.onStateChangeCallback(false);
    }
  }

  getIsListening() {
    return this.isListening;
  }
}

export interface KeywordDiffResult {
  matchPercentage: number;
  highlightedExpected: Array<{ word: string; isMatched: boolean }>;
  highlightedUser: Array<{ word: string; isMatched: boolean }>;
  exactMatch: boolean;
}

// Compare user recall text with expected card answer
export function computeKeywordDiff(userText: string, expectedText: string): KeywordDiffResult {
  const clean = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim();

  const userWords = userText.split(/\s+/).filter(Boolean);
  const expectedWords = expectedText.split(/\s+/).filter(Boolean);

  const cleanUserWords = userWords.map(clean);
  const cleanExpectedWords = expectedWords.map(clean);

  // Stop words to not over-penalize (common filler words)
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'by', 'with', 'it', 'as']);

  let matchedSignificantCount = 0;
  let totalSignificantCount = 0;

  const highlightedExpected = expectedWords.map((word, idx) => {
    const cleaned = cleanExpectedWords[idx];
    const isStopWord = stopWords.has(cleaned);
    const isMatched = cleanUserWords.includes(cleaned);

    if (!isStopWord && cleaned.length > 1) {
      totalSignificantCount++;
      if (isMatched) matchedSignificantCount++;
    }

    return { word, isMatched };
  });

  const highlightedUser = userWords.map((word, idx) => {
    const cleaned = cleanUserWords[idx];
    const isMatched = cleanExpectedWords.includes(cleaned);
    return { word, isMatched };
  });

  const matchPercentage =
    totalSignificantCount > 0
      ? Math.round((matchedSignificantCount / totalSignificantCount) * 100)
      : clean(userText) === clean(expectedText)
      ? 100
      : 0;

  return {
    matchPercentage,
    highlightedExpected,
    highlightedUser,
    exactMatch: matchPercentage >= 85,
  };
}

export const voiceRecall = new VoiceRecallService();

