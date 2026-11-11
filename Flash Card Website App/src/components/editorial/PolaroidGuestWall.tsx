import React, { useState, useRef } from 'react';
import { Camera, Mic, MicOff, Play, Pause, Plus, Heart, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PolaroidPost } from '../../types/editorial';
import { sounds } from '../../services/soundEffects';

interface PolaroidGuestWallProps {
  initialPolaroids: PolaroidPost[];
}

export const PolaroidGuestWall: React.FC<PolaroidGuestWallProps> = ({
  initialPolaroids,
}) => {
  const [polaroids, setPolaroids] = useState<PolaroidPost[]>(initialPolaroids);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [authorName, setAuthorName] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80');

  // Audio Recording State for 15s Voice Toast
  const [isRecordingToast, setIsRecordingToast] = useState<boolean>(false);
  const [toastAudioUrl, setToastAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(15);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);

  // Audio Playback
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const startVoiceToastRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setToastAudioUrl(audioUrl);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecordingToast(true);
      setRecordingSeconds(15);
      sounds.playCardSnap();

      recordTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev <= 1) {
            stopVoiceToastRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      alert('Microphone permission required for voice toast.');
    }
  };

  const stopVoiceToastRecording = () => {
    if (mediaRecorderRef.current && isRecordingToast) {
      mediaRecorderRef.current.stop();
      setIsRecordingToast(false);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      sounds.playMasteredSound();
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !caption.trim()) return;

    const newPost: PolaroidPost = {
      id: `pol-${Date.now()}`,
      authorName: authorName.trim(),
      caption: caption.trim(),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
      timestamp: 'Just now',
      rotationDeg: (Math.random() - 0.5) * 8,
      hasAudioToast: !!toastAudioUrl,
      audioBlobUrl: toastAudioUrl || undefined,
    };

    setPolaroids([newPost, ...polaroids]);
    sounds.playEnvelopeOpen();
    confetti({ particleCount: 50, spread: 60 });
    setIsModalOpen(false);
    setAuthorName('');
    setCaption('');
    setToastAudioUrl(null);
  };

  const playToastAudio = (id: string, url?: string) => {
    if (!url) return;

    if (playingAudioId === id) {
      activeAudioRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (activeAudioRef.current) activeAudioRef.current.pause();
      const audio = new Audio(url);
      audio.onended = () => setPlayingAudioId(null);
      audio.play().catch(() => {});
      activeAudioRef.current = audio;
      setPlayingAudioId(id);
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-4 py-16 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber-700 font-bold block">
            LIVING MEMORY BOARD
          </span>
          <h2 className="text-3xl font-serif text-stone-900 mt-1">Guest Wall & Polaroid Scrapbook</h2>
          <p className="text-xs text-stone-500 mt-1 max-w-lg">
            Signed notes, keepsake snapshots, and 15-second audio toasts shared by celebration guests.
          </p>
        </div>

        <button
          onClick={() => {
            sounds.playCardSnap();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-stone-900 hover:bg-black text-white text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Camera className="w-4 h-4 text-amber-400" />
          <span>Add Polaroid & Voice Toast</span>
        </button>
      </div>

      {/* Tactile Polaroid Grid Canvas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 py-4">
        {polaroids.map((post) => (
          <div
            key={post.id}
            style={{ transform: `rotate(${post.rotationDeg}deg)` }}
            className="group bg-white p-4 rounded-xl shadow-md hover:shadow-2xl hover:scale-103 transition-all duration-300 border border-stone-200 flex flex-col justify-between select-none relative"
          >
            {/* Washi Tape Accent */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-amber-100/90 border border-amber-200/60 shadow-2xs rotate-1 pointer-events-none opacity-85" />

            <div>
              {/* Photo Frame */}
              <div className="relative aspect-4/3 w-full bg-stone-100 rounded-lg overflow-hidden border border-stone-200 shadow-inner">
                <img
                  src={post.imageUrl}
                  alt={post.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Voice Toast Player Button Overlay */}
                {post.hasAudioToast && (
                  <button
                    onClick={() => playToastAudio(post.id, post.audioBlobUrl)}
                    className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 hover:bg-black text-white text-[11px] font-mono font-bold shadow-lg backdrop-blur-xs transition-all cursor-pointer"
                  >
                    {playingAudioId === post.id ? (
                      <>
                        <Pause className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>Playing Toast</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>15s Toast</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Handwritten Note Area */}
              <div className="pt-4 pb-2">
                <p className="font-serif italic text-stone-800 text-sm leading-relaxed">
                  "{post.caption}"
                </p>
              </div>
            </div>

            {/* Polaroid Bottom Signature */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400 font-mono">
              <span className="font-bold text-stone-700">— {post.authorName}</span>
              <span>{post.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Polaroid & Voice Toast Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h3 className="text-base font-bold text-stone-900 font-serif">Leave a Memory & Voice Toast</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Your Name(s)</label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Sarah & Michael Smith"
                  className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Signed Note / Memory</label>
                <textarea
                  rows={3}
                  required
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Share a wish, congratulations, or special memory..."
                  className="w-full p-2.5 text-xs bg-stone-50 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800"
                />
              </div>

              {/* 15-Second Voice Toast Recorder */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
                  <span className="flex items-center gap-1.5">
                    <Mic className="w-4 h-4 text-amber-700" />
                    Record 15-Second Voice Toast (Optional)
                  </span>
                  {isRecordingToast && (
                    <span className="font-mono text-rose-600 font-bold animate-pulse">
                      {recordingSeconds}s remaining
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-1">
                  {!isRecordingToast ? (
                    <button
                      type="button"
                      onClick={startVoiceToastRecording}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{toastAudioUrl ? 'Re-record Toast' : 'Start Audio Toast'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopVoiceToastRecording}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer animate-pulse"
                    >
                      <MicOff className="w-3.5 h-3.5" />
                      <span>Stop Recording</span>
                    </button>
                  )}

                  {toastAudioUrl && (
                    <span className="text-xs text-emerald-700 font-semibold font-mono flex items-center gap-1">
                      ✓ Audio Toast Captured
                    </span>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-stone-900 hover:bg-black text-white rounded-xl shadow-md cursor-pointer active:scale-95"
                >
                  Post to Polaroid Wall
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

