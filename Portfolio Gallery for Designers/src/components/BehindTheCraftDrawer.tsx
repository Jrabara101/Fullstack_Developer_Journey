import React, { useEffect, useState } from 'react';
import { BookOpen, Check, Copy, Download, Mic, Pause, Play, Sparkles, Wrench, Zap } from 'lucide-react';
import type { ComputedArtifactMeta } from '../types/portfolio';
import { studioAudio } from '../engine/audioEngine';

interface BehindTheCraftDrawerProps {
  meta: ComputedArtifactMeta;
  onClose: () => void;
}

type StoryTab = 'snapshot' | 'specs' | 'voice';
type CaseDepth = 'summary' | 'essay';

export const BehindTheCraftDrawer: React.FC<BehindTheCraftDrawerProps> = ({ meta, onClose }) => {
  const { artifact, maxPrint300Dpi } = meta;
  const [activeTab, setActiveTab] = useState<StoryTab>('snapshot');
  const [caseDepth, setCaseDepth] = useState<CaseDepth>('summary');
  const [specimenInput, setSpecimenInput] = useState(
    artifact.designManifest?.fontFamilies[0]?.sampleHeadline ?? artifact.title
  );
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioSec, setAudioSec] = useState(0);

  useEffect(() => {
    setSpecimenInput(artifact.designManifest?.fontFamilies[0]?.sampleHeadline ?? artifact.title);
    setAudioPlaying(false);
    setAudioSec(0);
    studioAudio.stop();
  }, [artifact.id, artifact.title, artifact.designManifest]);

  useEffect(() => {
    return () => {
      studioAudio.stop();
    };
  }, []);

  useEffect(() => {
    if (!audioPlaying) return;
    const duration = artifact.story.voiceNote.durationSec;
    const id = window.setInterval(() => {
      setAudioSec((prev) => {
        if (prev + 1 >= duration) {
          studioAudio.stop();
          setAudioPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [audioPlaying, artifact.story.voiceNote.durationSec]);

  const toggleVoiceNote = () => {
    if (audioPlaying) {
      studioAudio.stop();
      setAudioPlaying(false);
    } else {
      studioAudio.start(artifact.story.voiceNote.ambientProfile);
      setAudioPlaying(true);
    }
  };

  const handleCopyToken = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedToken(text);
    window.setTimeout(() => setCopiedToken(null), 1600);
  };

  const handleDownloadTokens = () => {
    if (!artifact.designManifest) return;
    const blob = new Blob([JSON.stringify(artifact.designManifest, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.id}-design-tokens.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const duration = artifact.story.voiceNote.durationSec;
  const readingTimeLabel = caseDepth === 'summary' ? '30 sec visual skim' : '2 min full process essay';

  return (
    <div
      className="w-full max-w-[920px] mx-auto rounded-[14px] glass-darkroom border border-white/14 text-[#F4F4F2] p-5 sm:p-7 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Row: 3-Depth Story Tabs + Adaptive Depth Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('snapshot')}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'snapshot'
                ? 'bg-[#F4F4F2] text-[#0D0E10]'
                : 'bg-white/8 text-white/75 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>15s Snapshot</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'specs'
                ? 'bg-[#F4F4F2] text-[#0D0E10]'
                : 'bg-white/8 text-white/75 hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Craft &amp; System Specs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('voice')}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'voice'
                ? 'bg-[#F4F4F2] text-[#0D0E10]'
                : 'bg-white/8 text-white/75 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>20s Studio Voice Note</span>
            {audioPlaying && <span className="w-1.5 h-1.5 rounded-full bg-[#D93829]" />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono-catalog text-[10px] uppercase tracking-[0.08em] text-white/50">
            {readingTimeLabel}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 rounded-full border border-white/15 font-mono-catalog text-[10px] uppercase tracking-[0.06em] text-white/70 hover:text-white cursor-pointer"
          >
            Hide Story
          </button>
        </div>
      </div>

      {/* Tab 1: 15-Sec Snapshot + Adaptive Depth (30s Summary vs Full Essay) */}
      {activeTab === 'snapshot' && (
        <div className="pt-5">
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div className="inline-flex p-0.5 rounded-full border border-white/15 bg-white/5">
              <button
                type="button"
                onClick={() => setCaseDepth('summary')}
                className={`px-3 py-1 rounded-full font-mono-catalog text-[10px] uppercase tracking-[0.06em] inline-flex items-center gap-1.5 cursor-pointer ${
                  caseDepth === 'summary' ? 'bg-white text-[#0D0E10]' : 'text-white/70'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>30-Sec Visual Summary</span>
              </button>
              <button
                type="button"
                onClick={() => setCaseDepth('essay')}
                className={`px-3 py-1 rounded-full font-mono-catalog text-[10px] uppercase tracking-[0.06em] inline-flex items-center gap-1.5 cursor-pointer ${
                  caseDepth === 'essay' ? 'bg-white text-[#0D0E10]' : 'text-white/70'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>Full Process Essay</span>
              </button>
            </div>

            {/* Impact Metrics */}
            <div className="flex flex-wrap items-center gap-4">
              {artifact.story.impactMetrics.map((m) => (
                <div key={m.label} className="text-right">
                  <div className="font-mono-catalog text-[12px] text-white font-medium">
                    {m.value}
                  </div>
                  <div className="font-mono-catalog text-[9px] uppercase tracking-[0.06em] text-white/50">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {caseDepth === 'summary' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-[10px] bg-white/[0.04] border border-white/10">
                <div className="font-mono-catalog text-[10px] uppercase tracking-[0.08em] text-white/45 mb-1.5">
                  01 / The Brief
                </div>
                <p className="text-[13.5px] leading-[1.6] text-white/88">
                  {artifact.story.snapshot.brief}
                </p>
              </div>
              <div className="p-4 rounded-[10px] bg-white/[0.04] border border-white/10">
                <div className="font-mono-catalog text-[10px] uppercase tracking-[0.08em] text-white/45 mb-1.5">
                  02 / The Creative Friction
                </div>
                <p className="text-[13.5px] leading-[1.6] text-white/88">
                  {artifact.story.snapshot.friction}
                </p>
              </div>
              <div className="p-4 rounded-[10px] bg-white/[0.04] border border-white/10">
                <div className="font-mono-catalog text-[10px] uppercase tracking-[0.08em] text-white/45 mb-1.5">
                  03 / The Outcome
                </div>
                <p className="text-[13.5px] leading-[1.6] text-white/88">
                  {artifact.story.snapshot.outcome}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5 max-w-[68ch]">
              {artifact.story.fullEssayParagraphs.map((para, i) => (
                <p key={i} className="text-[14.5px] leading-[1.7] text-white/85">
                  {para}
                </p>
              ))}
              <div className="pt-2 flex flex-wrap gap-2">
                {artifact.story.keyFrames.map((kf, idx) => (
                  <span
                    key={idx}
                    className="font-mono-catalog text-[10px] px-2.5 py-1 rounded bg-white/8 border border-white/10 text-white/75"
                  >
                    KEYFRAME 0{idx + 1}: {kf}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Craft & System Specs (Live Typography + Copyable Hex/OKLCH or Humanized Light Notes) */}
      {activeTab === 'specs' && (
        <div className="pt-5">
          {artifact.designManifest ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Live Typography Specimen Tester */}
              <div className="lg:col-span-7 p-4 rounded-[10px] bg-white/[0.04] border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono-catalog text-[10px] uppercase tracking-[0.08em] text-white/50">
                    Live Typography Specimen (Type to Test)
                  </span>
                  <span className="font-mono-catalog text-[10px] text-white/55">
                    {artifact.designManifest.fontFamilies[0]?.name}
                  </span>
                </div>
                <input
                  type="text"
                  value={specimenInput}
                  onChange={(e) => setSpecimenInput(e.target.value)}
                  className="w-full bg-transparent border-b border-white/15 pb-2 text-[22px] sm:text-[26px] text-white focus:outline-none focus:border-white/50"
                  style={{
                    fontFamily: artifact.designManifest.fontFamilies[0]?.cssFamily,
                  }}
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono-catalog text-[10px] text-white/50">
                  <span>SCALE: {artifact.designManifest.spacingScale}</span>
                  <button
                    type="button"
                    onClick={handleDownloadTokens}
                    className="inline-flex items-center gap-1 text-white/80 hover:text-white cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download Token JSON</span>
                  </button>
                </div>
              </div>

              {/* Click-to-Copy Brand Color Pills (Hex + OKLCH) */}
              <div className="lg:col-span-5 space-y-2">
                <div className="font-mono-catalog text-[10px] uppercase tracking-[0.08em] text-white/50 mb-1">
                  Click Color Token to Copy Hex / OKLCH
                </div>
                {artifact.designManifest.colorTokens.map((token) => (
                  <div
                    key={token.name}
                    className="flex items-center justify-between gap-2 p-2 rounded-[8px] bg-white/[0.04] border border-white/10"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-6 h-6 rounded border border-white/20 shrink-0"
                        style={{ backgroundColor: token.hex }}
                      />
                      <div className="min-w-0">
                        <div className="text-[12px] font-medium truncate">{token.name}</div>
                        <div className="font-mono-catalog text-[9px] text-white/45 truncate">
                          {token.role}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyToken(token.hex)}
                        className="px-2 py-1 rounded bg-white/8 hover:bg-white/16 font-mono-catalog text-[10px] inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedToken === token.hex ? (
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-2.5 h-2.5 opacity-60" />
                        )}
                        <span>{token.hex}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyToken(token.oklch)}
                        className="hidden sm:inline-flex px-2 py-1 rounded bg-white/8 hover:bg-white/16 font-mono-catalog text-[10px] items-center gap-1 cursor-pointer text-white/75"
                      >
                        {copiedToken === token.oklch ? (
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                        ) : (
                          <span>OKLCH</span>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Photography Humanized Light & Lens Perspective Notes + 300 DPI Archival Print Calculator */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-[10px] bg-white/[0.04] border border-white/10">
                <div className="font-mono-catalog text-[10px] uppercase tracking-[0.08em] text-white/45 mb-1.5">
                  Moment &amp; Perspective
                </div>
                <p className="text-[13.5px] leading-[1.6] text-white/88">
                  {artifact.photoSpec?.humanizedNote}
                </p>
              </div>
              <div className="p-4 rounded-[10px] bg-white/[0.04] border border-white/10">
                <div className="font-mono-catalog text-[10px] uppercase tracking-[0.08em] text-white/45 mb-1.5">
                  Light &amp; Optical Character
                </div>
                <p className="text-[13.5px] leading-[1.6] text-white/88">
                  {artifact.photoSpec?.lightingSummary}
                </p>
                <p className="font-mono-catalog text-[10px] text-white/50 mt-2">
                  {artifact.photoSpec?.lensCharacter}
                </p>
              </div>
              <div className="p-4 rounded-[10px] bg-white/[0.04] border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="font-mono-catalog text-[10px] uppercase tracking-[0.08em] text-white/45 mb-1.5">
                    300 DPI Archival Print Ceiling
                  </div>
                  <div className="font-serif-display text-[28px] text-white">
                    {maxPrint300Dpi?.formattedIn ?? '24 × 16 IN'}
                  </div>
                  <div className="font-mono-catalog text-[11px] text-white/60">
                    {maxPrint300Dpi?.formattedCm} • {artifact.photoSpec?.sourceResolutionPx.width}×
                    {artifact.photoSpec?.sourceResolutionPx.height}px
                  </div>
                </div>
                <div className="font-mono-catalog text-[10px] text-white/45 mt-3">
                  Paper: {artifact.photoSpec?.archivePaper}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: 20-Sec Studio Voice Note & Location Ambient Waveform */}
      {activeTab === 'voice' && (
        <div className="pt-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          <div className="md:col-span-5 p-4 rounded-[10px] bg-white/[0.04] border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono-catalog text-[10px] uppercase tracking-[0.08em] text-white/55">
                {artifact.story.voiceNote.ambientProfile.replace('-', ' ')} // AMBIENT NOTE
              </span>
              <span className="font-mono-catalog text-[11px] text-white/75">
                00:{String(audioSec).padStart(2, '0')} / 00:{String(duration).padStart(2, '0')}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleVoiceNote}
                className="w-10 h-10 rounded-full bg-[#F4F4F2] text-[#0D0E10] flex items-center justify-center shrink-0 cursor-pointer hover:opacity-90"
                aria-label={audioPlaying ? 'Pause voice note' : 'Play voice note'}
              >
                {audioPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              {/* Animated Waveform Bars */}
              <div className="flex-1 flex items-center gap-[3px] h-10">
                {Array.from({ length: 28 }).map((_, idx) => {
                  const pct = (idx / 28) * 100;
                  const playedPct = (audioSec / duration) * 100;
                  const barHeight = 24 + ((idx * 17) % 62);
                  const activeWave = audioPlaying
                    ? Math.max(18, Math.min(95, barHeight + ((audioSec * 13 + idx * 7) % 24) - 12))
                    : barHeight;
                  return (
                    <div
                      key={idx}
                      className="flex-1 rounded-full transition-all duration-300"
                      style={{
                        height: `${activeWave}%`,
                        backgroundColor:
                          pct <= playedPct ? '#D93829' : 'rgba(255, 255, 255, 0.28)',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="font-mono-catalog text-[10px] uppercase tracking-[0.08em] text-white/50 mb-1.5">
              {artifact.story.voiceNote.title}
            </div>
            <p className="case-study-lead text-[18px] sm:text-[20px] text-white/92">
              {artifact.story.voiceNote.transcript}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

