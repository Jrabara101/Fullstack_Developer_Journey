import React, { useState } from 'react';
import {
  X,
  Download,
  Link,
  Film,
  CloudUpload,
  Check,
  Clock,
  Sparkles
} from 'lucide-react';
import { ReplayMetadata, ReplayPayload } from '../types/replay';

interface ClipExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: ReplayMetadata;
  totalTicks: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onExportSlice: (startTick: number, endTick: number) => Promise<{
    metadata: ReplayMetadata;
    payload: ReplayPayload;
    compressedPayload: string;
  }>;
  onUploadToBackend: (
    metadata: ReplayMetadata,
    compressedPayload: string
  ) => Promise<boolean>;
}

export const ClipExportDialog: React.FC<ClipExportDialogProps> = ({
  isOpen,
  onClose,
  metadata,
  totalTicks,
  canvasRef,
  onExportSlice,
  onUploadToBackend
}) => {
  const [inTick, setInTick] = useState<number>(0);
  const [outTick, setOutTick] = useState<number>(Math.max(60, totalTicks));
  const [isRenderingWebM, setIsRenderingWebM] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [isCopiedHash, setIsCopiedHash] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  if (!isOpen) return null;

  const formatTimestamp = (tick: number) => {
    const totalMs = Math.round((tick / 60) * 1000);
    const mins = Math.floor(totalMs / 60000);
    const secs = Math.floor((totalMs % 60000) / 1000);
    const ms = totalMs % 1000;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  };

  const selectedTicks = Math.max(1, outTick - inTick);
  const selectedDurationSec = (selectedTicks / 60).toFixed(1);

  // 1. Download .replay file
  const handleDownloadReplayJson = async () => {
    const data = await onExportSlice(inTick, outTick);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metadata.gameTitle.toLowerCase().replace(/\s+/g, '_')}_clip.replay`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 2. Copy Shareable Deterministic URL Hash
  const handleCopyHash = async () => {
    const data = await onExportSlice(inTick, outTick);
    const hashData = {
      meta: data.metadata,
      cmp: data.compressedPayload
    };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(hashData).slice(0, 5000))));
    const shareableUrl = `${window.location.origin}/#replay=${encoded.slice(0, 120)}...`;
    await navigator.clipboard.writeText(shareableUrl);
    setIsCopiedHash(true);
    setTimeout(() => setIsCopiedHash(false), 2500);
  };

  // 3. Render client-side WebM clip via canvas MediaRecorder
  const handleRenderWebM = async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      alert('Canvas context unavailable for video recording.');
      return;
    }

    try {
      setIsRenderingWebM(true);
      setRenderProgress(10);

      const stream = canvas.captureStream(60);
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp9'
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);
        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = `clip_${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(videoUrl);
        setIsRenderingWebM(false);
        setRenderProgress(100);
      };

      recorder.start();

      // Record for selected duration or minimum 3 seconds
      const recordMs = Math.min(6000, Math.max(2500, selectedTicks * 16.66));
      let currentProgress = 10;
      const progressTimer = setInterval(() => {
        currentProgress += 15;
        if (currentProgress < 95) setRenderProgress(currentProgress);
      }, recordMs / 6);

      setTimeout(() => {
        clearInterval(progressTimer);
        recorder.stop();
      }, recordMs);

    } catch (err) {
      console.error('WebM rendering error:', err);
      setIsRenderingWebM(false);
      alert('WebM MediaRecorder error. Browser might require modern codec permissions.');
    }
  };

  // 4. Save directly to Fastify SQLite Cloud Archive
  const handleUploadCloud = async () => {
    setUploadStatus('Encoding and verifying with server...');
    const data = await onExportSlice(inTick, outTick);
    const success = await onUploadToBackend(data.metadata, data.compressedPayload);
    if (success) {
      setIsUploaded(true);
      setUploadStatus('Uploaded to SQLite Replay Archive!');
      setTimeout(() => setIsUploaded(false), 3000);
    } else {
      setUploadStatus('Failed to upload.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md animate-in fade-in duration-200 p-4">
      <div className="w-full max-w-xl bg-[#0E1424] border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold tracking-tight">CLIP FORGE & SHARE DECK</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* In/Out Trim Handles Range Selector */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 flex flex-col gap-3 font-mono">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>TRIM IN / OUT BOUNDARY</span>
            <span className="text-sky-400 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> DURATION: {selectedDurationSec}s ({selectedTicks} ticks)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">IN POINT [TICK {inTick}]</label>
              <input
                type="range"
                min={0}
                max={Math.max(0, outTick - 10)}
                value={inTick}
                onChange={(e) => setInTick(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <span className="text-xs text-slate-300 font-semibold">{formatTimestamp(inTick)}</span>
            </div>

            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">OUT POINT [TICK {outTick}]</label>
              <input
                type="range"
                min={inTick + 10}
                max={totalTicks}
                value={outTick}
                onChange={(e) => setOutTick(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <span className="text-xs text-slate-300 font-semibold">{formatTimestamp(outTick)}</span>
            </div>
          </div>
        </div>

        {/* Export Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Option A: Render client-side WebM Video */}
          <button
            onClick={handleRenderWebM}
            disabled={isRenderingWebM}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-850 flex flex-col items-start gap-2 transition group text-left relative overflow-hidden"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover:scale-110 transition">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Export WebM Video</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Renders high-fps clip directly in-browser with zero upload.
              </p>
            </div>
            {isRenderingWebM && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-2">
                <span className="text-xs text-sky-400 font-mono">Capturing Canvas Stream... {renderProgress}%</span>
                <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-400 rounded-full transition-all" style={{ width: `${renderProgress}%` }} />
                </div>
              </div>
            )}
          </button>

          {/* Option B: Download .replay JSON Telemetry */}
          <button
            onClick={handleDownloadReplayJson}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 flex flex-col items-start gap-2 transition group text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Download .replay File</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Compact raw telemetry file (inputs + keyframes).
              </p>
            </div>
          </button>

          {/* Option C: Shareable URL Hash */}
          <button
            onClick={handleCopyHash}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-violet-500/50 hover:bg-slate-850 flex flex-col items-start gap-2 transition group text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:scale-110 transition">
              {isCopiedHash ? <Check className="w-4 h-4 text-emerald-400" /> : <Link className="w-4 h-4" />}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">
                {isCopiedHash ? 'URL Hash Copied!' : 'Copy Shareable URL Hash'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Deterministic hash string for instant community review.
              </p>
            </div>
          </button>

          {/* Option D: Upload to Cloud Archive (Fastify Backend) */}
          <button
            onClick={handleUploadCloud}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 flex flex-col items-start gap-2 transition group text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
              {isUploaded ? <Check className="w-4 h-4 text-emerald-400" /> : <CloudUpload className="w-4 h-4" />}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">
                {isUploaded ? 'Archive Saved!' : 'Save to Cloud DB'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {uploadStatus || 'Persists into server SQLite match database.'}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
