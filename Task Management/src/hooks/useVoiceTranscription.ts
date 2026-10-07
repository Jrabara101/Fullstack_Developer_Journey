import { useState, useEffect, useRef, useCallback } from 'react';

// Define SpeechRecognition interface for cross-browser support
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
}

export function useVoiceTranscription(onTranscriptComplete: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(false);
  const [simulatedMode, setSimulatedMode] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const SpeechRecognitionClass =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      setSupported(true);
      try {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setTranscript('');
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let current = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          setTranscript(current);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
          if (transcript.trim()) {
            onTranscriptComplete(transcript.trim());
          }
        };

        recognitionRef.current = recognition;
      } catch {
        setSupported(false);
      }
    }
  }, [onTranscriptComplete, transcript]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && supported) {
      try {
        setTranscript('');
        recognitionRef.current.start();
        return;
      } catch {
        // Fallback to simulated mode if mic fails
      }
    }

    // Fallback: Simulated Voice Dictation (demonstration mode)
    setSimulatedMode(true);
    setIsListening(true);
    setTranscript('');

    const demoPhrases = [
      'Draft Q3 product proposal tomorrow 3pm p1 #strategy ~45m @deepwork',
      'Ship landing page hero animation today 5pm p1 #frontend ~30m @quickhit',
      'Review cloud infrastructure billing friday p2 #ops ~20m @lowenergy',
      'Schedule quarterly investor check-in next monday 10am p2 #leadership ~60m',
    ];
    const chosenPhrase = demoPhrases[Math.floor(Math.random() * demoPhrases.length)];

    let charIndex = 0;
    const interval = setInterval(() => {
      charIndex += 3;
      if (charIndex <= chosenPhrase.length) {
        setTranscript(chosenPhrase.slice(0, charIndex));
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsListening(false);
          setSimulatedMode(false);
          onTranscriptComplete(chosenPhrase);
        }, 500);
      }
    }, 40);
  }, [supported, onTranscriptComplete]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening && !simulatedMode) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, [isListening, simulatedMode]);

  return {
    isListening,
    transcript,
    supported,
    simulatedMode,
    startListening,
    stopListening,
  };
}
