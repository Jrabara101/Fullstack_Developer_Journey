import React, { useState, useEffect } from 'react';
import { Mic, MicOff, CheckCircle2, AlertCircle, Keyboard, Sparkles } from 'lucide-react';
import { voiceRecall, isSpeechRecognitionSupported, computeKeywordDiff, KeywordDiffResult } from '../../services/speechRecognition';
import { sounds } from '../../services/soundEffects';

interface RecallInputProps {
  expectedAnswer: string;
  isFlipped: boolean;
  onRevealCard: () => void;
  activeMode: 'off' | 'type' | 'voice';
  setActiveMode: (mode: 'off' | 'type' | 'voice') => void;
}

export const RecallInput: React.FC<RecallInputProps> = ({
  expectedAnswer,
  isFlipped,
  onRevealCard,
  activeMode,
  setActiveMode,
}) => {
  const [typedText, setTypedText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [diffResult, setDiffResult] = useState<KeywordDiffResult | null>(null);

  // Reset answer when card changes
  useEffect(() => {
    setTypedText('');
    setDiffResult(null);
    setSpeechError(null);
    if (isRecording) {
      voiceRecall.stopListening();
      setIsRecording(false);
    }
  }, [expectedAnswer]);

  // When card is flipped, compute diff if user provided text
  useEffect(() => {
    if (isFlipped && typedText.trim().length > 0) {
      const result = computeKeywordDiff(typedText, expectedAnswer);
      setDiffResult(result);
    }
  }, [isFlipped, expectedAnswer, typedText]);

  const toggleRecording = () => {
    if (!isSpeechRecognitionSupported()) {
      setSpeechError('Speech recognition is not supported in this browser. Please use Typing mode.');
      return;
    }

    if (isRecording) {
      voiceRecall.stopListening();
      setIsRecording(false);
    } else {
      setSpeechError(null);
      sounds.playCardSnap();
      voiceRecall.startListening(
        (transcript) => {
          setTypedText(transcript);
        },
        (error) => {
          setSpeechError(error);
          setIsRecording(false);
        },
        (listening) => {
          setIsRecording(listening);
        }
      );
    }
  };

  const handleVerifyAndFlip = () => {
    if (isRecording) {
      voiceRecall.stopListening();
      setIsRecording(false);
    }
    const result = computeKeywordDiff(typedText, expectedAnswer);
    setDiffResult(result);
    if (result.exactMatch) {
      sounds.playMasteredSound();
    } else {
      sounds.playReviewSound();
    }
    onRevealCard();
  };

  if (activeMode === 'off') {
    return (
      <div className="flex items-center justify-between text-xs text-stone-500 pt-2 px-1">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          Active Recall Enhancement:
        </span>
        <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
          <button
            onClick={() => setActiveMode('type')}
            className="px-2 py-0.5 rounded-md hover:bg-white text-stone-700 font-medium transition-all text-[11px] cursor-pointer"
          >
            Type to Verify
          </button>
          <button
            onClick={() => setActiveMode('voice')}
            className="px-2 py-0.5 rounded-md hover:bg-white text-stone-700 font-medium transition-all text-[11px] cursor-pointer"
          >
            Voice Recall (Mic)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/90 shadow-2xs space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {activeMode === 'type' ? (
            <Keyboard className="w-4 h-4 text-indigo-600" />
          ) : (
            <Mic className="w-4 h-4 text-rose-600" />
          )}
          <span className="font-semibold text-stone-800">
            {activeMode === 'type' ? 'Type-to-Verify Mode' : 'Voice Recall Mode'}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-stone-200/70 p-0.5 rounded-lg text-[11px]">
          <button
            onClick={() => setActiveMode('type')}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              activeMode === 'type' ? 'bg-white shadow-2xs font-semibold text-indigo-700' : 'text-stone-600'
            }`}
          >
            Type
          </button>
          <button
            onClick={() => setActiveMode('voice')}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              activeMode === 'voice' ? 'bg-white shadow-2xs font-semibold text-rose-700' : 'text-stone-600'
            }`}
          >
            Voice
          </button>
          <button
            onClick={() => {
              setActiveMode('off');
              if (isRecording) voiceRecall.stopListening();
            }}
            className="px-2 py-0.5 rounded-md text-stone-500 hover:text-stone-800 cursor-pointer"
          >
            Off
          </button>
        </div>
      </div>

      {/* Input or Voice Recording Area before card flip */}
      {!isFlipped ? (
        <div className="space-y-2">
          {activeMode === 'voice' && (
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-dashed border-stone-300">
              <button
                type="button"
                onClick={toggleRecording}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-200'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600'
                }`}
              >
                {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              <div className="mt-2 text-xs font-medium text-stone-600">
                {isRecording ? 'Listening to your recall... Speak clearly' : 'Click to speak your answer aloud'}
              </div>
              {typedText && (
                <div className="mt-2 p-2 bg-stone-50 rounded-lg text-xs text-stone-700 italic border border-stone-200 max-w-md text-center">
                  "{typedText}"
                </div>
              )}
              {speechError && (
                <div className="mt-2 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {speechError}
                </div>
              )}
            </div>
          )}

          {activeMode === 'type' && (
            <div>
              <textarea
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (typedText.trim()) handleVerifyAndFlip();
                  }
                }}
                placeholder="Type your answer from memory before flipping..."
                rows={2}
                className="w-full p-2.5 text-xs bg-white rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-stone-800 placeholder:text-stone-400"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-stone-500 font-mono">
              Press <kbd className="text-[10px]">Enter</kbd> to verify & flip
            </span>
            <button
              onClick={handleVerifyAndFlip}
              disabled={!typedText.trim()}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                typedText.trim()
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              <span>Verify & Flip</span>
              <kbd className="bg-indigo-700/60 border-indigo-800 text-[9px] text-indigo-100">↵</kbd>
            </button>
          </div>
        </div>
      ) : (
        /* Diff Results View after Card Flip */
        <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-4 h-4 ${diffResult && diffResult.exactMatch ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span className="text-xs font-semibold text-stone-800">Recall Precision Analysis</span>
            </div>
            {diffResult && (
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
                  diffResult.matchPercentage >= 80
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : diffResult.matchPercentage >= 50
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}
              >
                {diffResult.matchPercentage}% Recall Match
              </span>
            )}
          </div>

          {/* User's attempt highlighted */}
          <div>
            <div className="text-[11px] uppercase tracking-wider text-stone-500 font-mono mb-1">Your Recalled Answer:</div>
            <div className="p-2.5 bg-stone-50 rounded-lg text-xs leading-relaxed border border-stone-200">
              {diffResult?.highlightedUser && diffResult.highlightedUser.length > 0 ? (
                diffResult.highlightedUser.map((item, idx) => (
                  <span
                    key={idx}
                    className={`inline-block mr-1 px-1 py-0.5 rounded ${
                      item.isMatched
                        ? 'bg-emerald-100 text-emerald-800 font-semibold'
                        : 'bg-stone-200 text-stone-600 line-through'
                    }`}
                  >
                    {item.word}
                  </span>
                ))
              ) : (
                <span className="italic text-stone-400">No answer provided before flip.</span>
              )}
            </div>
          </div>

          {/* Expected answer with missed keywords highlighted */}
          {diffResult && (
            <div>
              <div className="text-[11px] uppercase tracking-wider text-stone-500 font-mono mb-1">Target Answer Keywords:</div>
              <div className="p-2.5 bg-stone-50 rounded-lg text-xs leading-relaxed border border-stone-200">
                {diffResult.highlightedExpected.map((item, idx) => (
                  <span
                    key={idx}
                    className={`inline-block mr-1 px-1 py-0.5 rounded ${
                      item.isMatched
                        ? 'bg-emerald-100 text-emerald-800 font-semibold'
                        : 'bg-rose-100 text-rose-800 border border-rose-200 font-medium'
                    }`}
                  >
                    {item.word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

