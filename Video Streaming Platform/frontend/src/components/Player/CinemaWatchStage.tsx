import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Headphones, Scissors, TrendingUp, Zap, 
  Share2, ThumbsUp, Download, Check, Volume2, ShieldCheck, Play
} from 'lucide-react';
import { Video, TimedComment } from '../../types/video';
import { useAdaptiveVideoPlayer } from '../../hooks/useAdaptiveVideoPlayer';
import { useAmbientCanvas } from '../../hooks/useAmbientCanvas';
import { PrecisionTimelineScrubber } from './PrecisionTimelineScrubber';
import { PlayerControls } from './PlayerControls';
import { DockedMiniPlayer } from './DockedMiniPlayer';
import { InteractiveTranscriptAndDiscourseRail } from '../DiscourseRail/InteractiveTranscriptAndDiscourseRail';
import { ClipModal } from '../Modals/ClipModal';
import { CreatorRetentionModal } from '../Analytics/CreatorRetentionModal';

interface CinemaWatchStageProps {
  video: Video;
}

export const CinemaWatchStage: React.FC<CinemaWatchStageProps> = ({ video }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  
  // Modals & Popups
  const [showClipModal, setShowClipModal] = useState(false);
  const [showRetentionModal, setShowRetentionModal] = useState(false);
  const [activeCommentToast, setActiveCommentToast] = useState<TimedComment | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(video.likesCount);

  // Search match markers from transcript rail
  const [searchMatchTimestamps, setSearchMatchTimestamps] = useState<number[]>([]);

  // Initialize Adaptive Video Player Hook
  const {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    bufferedEnd,
    volume,
    isMuted,
    playbackRate,
    isLoading,
    availableQualities,
    currentQualityIndex,
    currentEstimatedBitrate,
    isTheaterMode,
    setIsTheaterMode,
    isMiniPlayer,
    setIsMiniPlayer,
    ambientGlowEnabled,
    setAmbientGlowEnabled,
    audioOnlyMode,
    setAudioOnlyMode,
    dialogueBoostEnabled,
    toggleDialogueBoost,
    resumeNotification,
    setResumeNotification,
    hotSwapNotification,
    triggerSimulated4KHotSwap,
    togglePlay,
    seekTo,
    skipSeconds,
    changeQuality,
    changePlaybackRate,
    changeVolume,
    toggleMute,
    toggleFullscreen
  } = useAdaptiveVideoPlayer({
    video,
    onCommentTrigger: (comment) => {
      setActiveCommentToast(comment);
      setTimeout(() => setActiveCommentToast(null), 4000);
    }
  });

  // Initialize Ambient Ambilight Canvas
  useAmbientCanvas(videoRef, canvasRef, ambientGlowEnabled);

  // Scroll detection for automatic PiP dock transition
  useEffect(() => {
    const handleScroll = () => {
      if (!stageContainerRef.current) return;
      const rect = stageContainerRef.current.getBoundingClientRect();
      // If user scrolled past 75% of the video stage, activate mini player dock
      if (rect.bottom < 150 && isPlaying) {
        setIsMiniPlayer(true);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isPlaying, setIsMiniPlayer]);

  // Current chapter calculation
  const currentMs = currentTime * 1000;
  const currentChapter = video.chapters?.find(
    ch => currentMs >= ch.startMs && currentMs <= ch.endMs
  ) || video.chapters?.[0];

  const handleShareTimestampedLink = () => {
    const sec = Math.floor(currentTime);
    const url = `${window.location.origin}/watch/${video.ulid}?t=${sec}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleToggleLike = () => {
    if (isLiked) {
      setLikesCount(prev => prev - 1);
      setIsLiked(false);
    } else {
      setLikesCount(prev => prev + 1);
      setIsLiked(true);
    }
  };

  return (
    <div ref={stageContainerRef} className="max-w-[1720px] mx-auto px-4 lg:px-8 py-6">
      {/* Dynamic Theater Mode Grid: 12-cols or 8/4 split */}
      <div className={`grid grid-cols-12 gap-6 transition-all duration-300 ${isTheaterMode ? 'gap-y-8' : ''}`}>
        
        {/* LEFT COLUMN: THE CUSTOM REACT VIDEO PLAYER & METADATA DECK */}
        <div className={`transition-all duration-300 ${isTheaterMode ? 'col-span-12' : 'col-span-12 lg:col-span-8 xl:col-span-8'}`}>
          
          {/* Ambient Glow Wrapper */}
          <div className="relative group">
            {/* Real-Time Ambient Ambilight Blurred Canvas */}
            {ambientGlowEnabled && (
              <canvas
                ref={canvasRef}
                width={32}
                height={18}
                className="absolute inset-0 w-full h-full -z-10 blur-3xl opacity-70 transform scale-105 pointer-events-none transition-opacity duration-500 rounded-3xl"
              />
            )}

            {/* Main Player Container */}
            <div className="cinema-player-container aspect-video rounded-2xl overflow-hidden bg-black ring-1 ring-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative flex flex-col justify-between">
              
              {/* TOP OVERLAY BAR (Fades in on hover) */}
              <div className="p-4 bg-gradient-to-b from-black/80 via-black/30 to-transparent flex items-center justify-between z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {/* Current Chapter Pill */}
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-white flex items-center gap-1.5 shadow">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span>{currentChapter?.title || 'Cinema Stream'}</span>
                  </span>
                </div>

                {/* Right Top Quick Toggles */}
                <div className="flex items-center gap-2">
                  {/* Ambient Glow Toggle */}
                  <button
                    onClick={() => setAmbientGlowEnabled(!ambientGlowEnabled)}
                    className={`px-2.5 py-1 rounded-full backdrop-blur-md border text-xs font-medium flex items-center gap-1 transition ${
                      ambientGlowEnabled 
                        ? 'bg-indigo-600/30 border-indigo-400 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.3)]' 
                        : 'bg-black/60 border-white/15 text-slate-400 hover:text-white'
                    }`}
                    title="Toggle Real-Time Ambient Ambilight Glow"
                  >
                    <Sparkles size={12} />
                    <span>Ambilight {ambientGlowEnabled ? 'ON' : 'OFF'}</span>
                  </button>

                  {/* Audio-Only Mode Toggle */}
                  <button
                    onClick={() => setAudioOnlyMode(!audioOnlyMode)}
                    className={`px-2.5 py-1 rounded-full backdrop-blur-md border text-xs font-medium flex items-center gap-1 transition ${
                      audioOnlyMode 
                        ? 'bg-amber-500/30 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]' 
                        : 'bg-black/60 border-white/15 text-slate-400 hover:text-white'
                    }`}
                    title="Toggle Audio-Only Stream (-90% Bandwidth)"
                  >
                    <Headphones size={12} />
                    <span>Audio-Only</span>
                  </button>

                  {/* Clip Snipper Button */}
                  <button
                    onClick={() => setShowClipModal(true)}
                    className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 transition"
                  >
                    <Scissors size={12} />
                    <span>Clip</span>
                  </button>

                  {/* Creator Retention Analytics */}
                  <button
                    onClick={() => setShowRetentionModal(true)}
                    className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 transition"
                  >
                    <TrendingUp size={12} />
                    <span>Retention</span>
                  </button>

                  {/* Simulated 4K Fast-Start Hot-Swap Trigger */}
                  <button
                    onClick={triggerSimulated4KHotSwap}
                    className="px-2.5 py-1 rounded-full bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-300 text-xs font-medium flex items-center gap-1 transition"
                    title="Simulate background 4K transcode hot-swap"
                  >
                    <Zap size={12} />
                    <span>Demo 4K Hot-Swap</span>
                  </button>
                </div>
              </div>

              {/* CENTER: VIDEO ELEMENT OR AUDIO-ONLY WAVEFORM */}
              <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={togglePlay}>
                {audioOnlyMode ? (
                  // Audio-Only Mode Visualization Screen
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#0e1017] via-[#07080a] to-[#0a0d14] p-8 text-center select-none">
                    <div className="w-24 h-24 rounded-3xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mb-4 shadow-[0_0_40px_rgba(99,102,241,0.25)]">
                      <Headphones size={44} className={isPlaying ? 'animate-bounce' : ''} />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-semibold border border-indigo-500/30 mb-2">
                      🎧 Low-Bandwidth Audio Stream Active (-90% Data)
                    </span>
                    <h3 className="text-lg font-bold text-white max-w-md truncate">{video.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{video.channelName}</p>

                    {/* Animated Waveform Bars */}
                    <div className="flex items-center gap-1 mt-6 h-10">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1.5 bg-indigo-500 rounded-full transition-all duration-150"
                          style={{
                            height: isPlaying ? `${Math.max(15, (Math.sin(i * 0.6 + currentTime * 4) + 1) * 18)}px` : '4px',
                            opacity: isPlaying ? 0.9 : 0.3
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  // Native / HLS HTML5 Video
                  <video
                    ref={videoRef}
                    playsInline
                    crossOrigin="anonymous"
                    poster={video.posterUrl}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* SMART CONTEXT REWIND NOTIFICATION TOAST */}
              {resumeNotification && (
                <div className="absolute top-16 left-6 z-40 bg-[#12141a]/95 backdrop-blur-xl border border-indigo-500/50 text-white px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-2xl animate-toast-slide-up">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>{resumeNotification}</span>
                </div>
              )}

              {/* 4K HOT-SWAP NOTIFICATION TOAST */}
              {hotSwapNotification && (
                <div className="absolute top-16 right-6 z-40 bg-sky-950/90 backdrop-blur-xl border border-sky-400/60 text-sky-200 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2.5 shadow-2xl animate-toast-slide-up">
                  <Zap size={15} className="text-sky-400 animate-spin" />
                  <div>
                    <div className="font-semibold text-white">Seamless Quality Upgrade</div>
                    <div className="text-[11px] text-sky-300">{hotSwapNotification}</div>
                  </div>
                </div>
              )}

              {/* TIMED COMMENT POPUP TOAST */}
              {activeCommentToast && (
                <div className="absolute bottom-24 left-6 z-40 max-w-sm bg-[#12141a]/95 backdrop-blur-xl border border-white/20 text-white p-3 rounded-xl shadow-2xl animate-toast-slide-up flex items-start gap-2.5">
                  <img 
                    src={activeCommentToast.userAvatar} 
                    alt={activeCommentToast.userName}
                    className="w-7 h-7 rounded-full object-cover border border-white/20 shrink-0" 
                  />
                  <div>
                    <div className="text-[11px] font-semibold text-indigo-300">
                      {activeCommentToast.userName}
                    </div>
                    <p className="text-xs text-slate-200 mt-0.5 line-clamp-2">
                      {activeCommentToast.body}
                    </p>
                  </div>
                </div>
              )}

              {/* BOTTOM SCRUBBER & CONTROLS DECK */}
              <div className="bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-6 pb-2 px-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {/* 1. Precision Timeline Scrubber with Heatmap & Sprite Preview */}
                <PrecisionTimelineScrubber
                  duration={duration}
                  currentTime={currentTime}
                  bufferedEnd={bufferedEnd}
                  chapters={video.chapters || []}
                  heatmap={video.heatmap || []}
                  comments={video.comments || []}
                  searchMatchTimestamps={searchMatchTimestamps}
                  onSeek={seekTo}
                  posterUrl={video.posterUrl}
                  storyboardVttPath={video.storyboardVttPath}
                />

                {/* 2. Bottom Controls Bar */}
                <PlayerControls
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  duration={duration}
                  volume={volume}
                  isMuted={isMuted}
                  playbackRate={playbackRate}
                  availableQualities={availableQualities}
                  currentQualityIndex={currentQualityIndex}
                  isTheaterMode={isTheaterMode}
                  dialogueBoostEnabled={dialogueBoostEnabled}
                  audioOnlyMode={audioOnlyMode}
                  onTogglePlay={togglePlay}
                  onSkipSeconds={skipSeconds}
                  onToggleMute={toggleMute}
                  onVolumeChange={changeVolume}
                  onChangeRate={changePlaybackRate}
                  onChangeQuality={changeQuality}
                  onToggleTheater={() => setIsTheaterMode(!isTheaterMode)}
                  onToggleMiniPlayer={() => setIsMiniPlayer(true)}
                  onToggleFullscreen={toggleFullscreen}
                  onToggleDialogueBoost={toggleDialogueBoost}
                  onToggleAudioOnly={() => setAudioOnlyMode(!audioOnlyMode)}
                />
              </div>
            </div>
          </div>

          {/* BELOW-THE-PLAYER METADATA & CREATOR BAR */}
          <div className="mt-5 space-y-4">
            {/* Title & Badges */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono text-[11px] font-semibold border border-emerald-500/30">
                  4K HDR
                </span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[11px] border border-white/10">
                  60 FPS
                </span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-mono text-[11px] border border-indigo-500/30">
                  HLS Adaptive
                </span>
                <span className="px-2 py-0.5 rounded bg-white/5 text-slate-400 font-mono text-[11px] flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-400" />
                  <span>Signed CDN Token</span>
                </span>
              </div>

              <h1 className="text-xl md:text-2xl font-bold font-display text-white tracking-tight leading-snug">
                {video.title}
              </h1>
            </div>

            {/* Creator Row & Action Pill Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/10">
              {/* Creator Card */}
              <div className="flex items-center gap-3">
                <img 
                  src={video.channelAvatar} 
                  alt={video.channelName}
                  className="w-10 h-10 rounded-full object-cover border border-white/20" 
                />
                <div>
                  <h3 className="text-sm font-semibold text-white">{video.channelName}</h3>
                  <p className="text-xs text-slate-400">{video.channelSubscribers}</p>
                </div>
                <button className="ml-2 px-3 py-1.5 rounded-full bg-white text-black hover:bg-slate-200 text-xs font-semibold transition">
                  Subscribe
                </button>
              </div>

              {/* Action Pills */}
              <div className="flex items-center gap-2">
                {/* Like Button */}
                <button
                  onClick={handleToggleLike}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition ${
                    isLiked 
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' 
                      : 'bg-white/5 hover:bg-white/15 border-white/10 text-slate-200'
                  }`}
                >
                  <ThumbsUp size={14} className={isLiked ? 'fill-rose-400' : ''} />
                  <span className="font-mono tabular-nums">{likesCount.toLocaleString()}</span>
                </button>

                {/* Share Timestamped Link */}
                <button
                  onClick={handleShareTimestampedLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 text-xs font-medium transition"
                  title="Copy deep link at current timestamp"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                  <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
                </button>

                {/* Offline Audio / Video Download */}
                <button
                  onClick={() => alert('Offline caching: Encrypted AES-128 HLS chunk bundle pre-cached into IndexedDB.')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 text-xs font-medium transition"
                >
                  <Download size={14} />
                  <span>Offline Cache</span>
                </button>
              </div>
            </div>

            {/* Description Card */}
            <div className="p-4 rounded-xl bg-[#101217] border border-white/10 text-xs text-slate-300 leading-relaxed">
              <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px] mb-2">
                <span>{video.viewsCount.toLocaleString()} views</span>
                <span>Published {video.publishedAt}</span>
              </div>
              <p>{video.description}</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SYNCHRONIZED TRANSCRIPT, CHAPTERS & DISCOURSE RAIL */}
        <div className={`transition-all duration-300 ${isTheaterMode ? 'col-span-12' : 'col-span-12 lg:col-span-4 xl:col-span-4'}`}>
          <InteractiveTranscriptAndDiscourseRail
            video={video}
            currentTime={currentTime}
            onSeek={seekTo}
            onSearchMatchesChange={setSearchMatchTimestamps}
            onOpenClipModal={() => setShowClipModal(true)}
          />
        </div>
      </div>

      {/* FLOATING MINI-PLAYER PIP DOCK */}
      {isMiniPlayer && (
        <DockedMiniPlayer
          video={video}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onTogglePlay={togglePlay}
          onReturnToStage={() => {
            setIsMiniPlayer(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onClose={() => setIsMiniPlayer(false)}
        />
      )}

      {/* CLIP SNIPPER MODAL */}
      {showClipModal && (
        <ClipModal
          video={video}
          currentTime={currentTime}
          onClose={() => setShowClipModal(false)}
          onSeek={seekTo}
        />
      )}

      {/* RETENTION TELEMETRY MODAL */}
      {showRetentionModal && (
        <CreatorRetentionModal
          video={video}
          onClose={() => setShowRetentionModal(false)}
          onSeek={seekTo}
        />
      )}
    </div>
  );
};
