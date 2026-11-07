import React, { useState, useEffect } from 'react';
import { 
  Upload, CheckCircle, RefreshCw, Server, Cpu, HardDrive, 
  Camera, Film, Plus, Trash2, ArrowLeft, Play, Pause, Zap, Check, AlertCircle
} from 'lucide-react';
import { VideoChapter, VideoRendition } from '../../types/video';

interface CreatorUploadAndTranscodeStudioProps {
  onBackToCatalog: () => void;
  onPublishSuccess: () => void;
}

export const CreatorUploadAndTranscodeStudio: React.FC<CreatorUploadAndTranscodeStudioProps> = ({
  onBackToCatalog,
  onPublishSuccess
}) => {
  // Upload State
  const [file, setFile] = useState<{ name: string; size: string } | null>({
    name: 'system_architecture_master_prores.mov',
    size: '4.82 GB'
  });
  const [uploadPercent, setUploadPercent] = useState(100);
  const [uploadedChunks, setUploadedChunks] = useState(964);
  const [totalChunks] = useState(964);
  const [isUploading, setIsUploading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [uploadSpeed, setUploadSpeed] = useState('42.8 MB/s');
  const [sha256Verified, setSha256Verified] = useState(true);

  // Transcoding Ladder Stage Progress (Simulating Laravel Queue & Horizon Workers)
  const [renditions, setRenditions] = useState([
    {
      id: 'fast-720p',
      label: 'Fast-Start 720p Proxy (.m3u8)',
      bitrate: '3.2 Mbps',
      status: 'ready',
      progress: 100,
      note: 'Ready & Playable in 14s'
    },
    {
      id: 'storyboard',
      label: 'WebVTT Sprite Storyboard & Motion Preview',
      bitrate: 'Tiled JPEG',
      status: 'ready',
      progress: 100,
      note: 'Generated (180 Frames)'
    },
    {
      id: '1080p',
      label: '1080p Full HD Rendition',
      bitrate: '8.4 Mbps',
      status: 'ready',
      progress: 100,
      note: 'Ready ✓'
    },
    {
      id: '4k',
      label: '4K Ultra HD Rendition (2160p60)',
      bitrate: '18.4 Mbps',
      status: 'processing',
      progress: 84,
      note: 'Encoding via FFmpeg (Est. 28s left)'
    }
  ]);

  // Frame Picker State
  const [pickerTime, setPickerTime] = useState(148);
  const candidatePosters = [
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80'
  ];
  const [selectedPoster, setSelectedPoster] = useState(candidatePosters[0]);
  const [isGeneratingMotionPreview, setIsGeneratingMotionPreview] = useState(false);
  const [motionPreviewReady, setMotionPreviewReady] = useState(true);

  // Chapters Editor State
  const [chapters, setChapters] = useState([
    { id: '1', title: 'Platform Vision & Streaming Pitfalls', time: '00:00' },
    { id: '2', title: 'Resumable 5MB Chunked Multipart Ingestion', time: '02:22' },
    { id: '3', title: 'Designing the Adaptive Bitrate Ladder (ABR)', time: '06:20' },
    { id: '4', title: 'Fast-Start 720p Proxy & Dynamic Manifest Hot-Swap', time: '10:50' },
    { id: '5', title: 'Redis-Buffered Heartbeats & Heatmap Math', time: '16:20' }
  ]);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterTime, setNewChapterTime] = useState('21:00');

  // Subtitle / VTT language tabs
  const [activeCaptionLang, setActiveCaptionLang] = useState<'en' | 'es' | 'jp'>('en');

  // Simulate chunked upload progress if upload is triggered
  useEffect(() => {
    let interval: any;
    if (isUploading && !isPaused) {
      interval = setInterval(() => {
        setUploadedChunks((prev) => {
          if (prev >= totalChunks) {
            setIsUploading(false);
            setUploadPercent(100);
            return totalChunks;
          }
          const next = prev + 12;
          setUploadPercent(Math.min(100, Math.floor((next / totalChunks) * 100)));
          return Math.min(totalChunks, next);
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isUploading, isPaused, totalChunks]);

  // Simulate Wi-Fi drop & instant resume test
  const simulateWifiDropAndResume = () => {
    setIsUploading(true);
    setIsPaused(true);
    setUploadPercent(84);
    setUploadedChunks(810);
    setTimeout(() => {
      setIsPaused(false);
    }, 1500);
  };

  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterTitle.trim()) return;
    setChapters([
      ...chapters,
      { id: `${Date.now()}`, title: newChapterTitle.trim(), time: newChapterTime }
    ]);
    setNewChapterTitle('');
  };

  const handleGenerateMotionPreview = () => {
    setIsGeneratingMotionPreview(true);
    setTimeout(() => {
      setIsGeneratingMotionPreview(false);
      setMotionPreviewReady(true);
    }, 2000);
  };

  return (
    <div className="max-w-[1720px] mx-auto px-4 lg:px-8 py-6 space-y-6">
      {/* Top Header & Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCatalog}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold font-display text-white">Creator Transcoding Studio</h1>
            <p className="text-xs text-slate-400">Laravel Media API • FFmpeg Horizon Workers • Resumable Multipart Ingestion</p>
          </div>
        </div>

        {/* Telemetry Pills */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-[#101217] border border-white/10 flex items-center gap-2">
            <Cpu size={14} className="text-indigo-400" />
            <span className="text-slate-300">4 FFmpeg Workers Active</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#101217] border border-white/10 flex items-center gap-2">
            <HardDrive size={14} className="text-sky-400" />
            <span className="text-slate-300">Queue Latency: 1.2s</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#101217] border border-white/10 flex items-center gap-2">
            <Server size={14} className="text-emerald-400" />
            <span className="text-slate-300">S3 / CloudFront Edge Active</span>
          </div>
        </div>
      </div>

      {/* Main Split-Pane Ingestion & Transcoding Studio Card */}
      <div className="rounded-2xl border border-white/10 bg-[#101217] p-6 grid grid-cols-12 gap-8 shadow-2xl">
        
        {/* LEFT COLUMN: RESUMABLE MULTIPART UPLOAD & FFmpeg LADDER (5 Columns) */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          
          {/* 1. Resumable Multipart Upload Box */}
          <div className="p-5 rounded-xl bg-black/40 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload size={18} className="text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Chunked Multipart Ingestion</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-500/30">
                5MB Chunks
              </span>
            </div>

            {/* File info card */}
            <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-white truncate max-w-[200px]">{file?.name}</span>
                <span className="font-mono text-slate-400">{file?.size}</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${isPaused ? 'bg-amber-400' : 'bg-indigo-500'}`}
                  style={{ width: `${uploadPercent}%` }}
                />
              </div>

              {/* Stats & Checksum Row */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                <span>{uploadedChunks} / {totalChunks} Chunks Verified</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check size={12} />
                  <span>SHA-256 ✓</span>
                </span>
                <span>{uploadSpeed}</span>
              </div>
            </div>

            {/* Upload Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={simulateWifiDropAndResume}
                className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white flex items-center justify-center gap-1.5 transition"
              >
                <Zap size={14} className="text-amber-400" />
                <span>Simulate Wi-Fi Drop & Resume</span>
              </button>
            </div>
          </div>

          {/* 2. Multi-Rendition FFmpeg Transcoding Ladder (Laravel Echo Hook) */}
          <div className="p-5 rounded-xl bg-black/40 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu size={18} className="text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Live Multi-Rendition FFmpeg Ladder</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Laravel Horizon</span>
            </div>

            <div className="space-y-3">
              {renditions.map((ren, idx) => (
                <div 
                  key={ren.id}
                  className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white flex items-center gap-2">
                      <span className="font-mono text-slate-500">{idx + 1}.</span>
                      <span>{ren.label}</span>
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">{ren.bitrate}</span>
                  </div>

                  {/* Stage Progress Bar */}
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        ren.status === 'ready' ? 'bg-emerald-400' : 'bg-sky-400 animate-pulse'
                      }`}
                      style={{ width: `${ren.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className={`font-medium ${ren.status === 'ready' ? 'text-emerald-400' : 'text-sky-300'}`}>
                      {ren.note}
                    </span>
                    <span className="font-mono text-slate-500">{ren.progress}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Fast-Start Proxy Explainer Callout */}
            <div className="p-3 rounded-lg bg-sky-950/40 border border-sky-500/30 text-xs text-sky-200 flex items-start gap-2.5">
              <Zap size={16} className="text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Fast-Start 720p Proxy Architecture: </span>
                <span>Eliminates the "Video is processing, check back in an hour" dead end. Viewers can start watching the 720p HLS manifest within 15 seconds while 1080p and 4K ladders encode in the background and hot-swap seamlessly.</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FRAME-PICKER POSTER & CHAPTER STUDIO (7 Columns) */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          
          {/* 1. Interactive Frame-Picker Poster & Motion Teaser Generator */}
          <div className="p-5 rounded-xl bg-black/40 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera size={18} className="text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Interactive Frame-Picker Poster & Motion Preview</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Scrub & Capture</span>
            </div>

            {/* Current Poster Preview Frame */}
            <div className="aspect-video rounded-xl overflow-hidden bg-black border border-white/15 relative">
              <img 
                src={selectedPoster} 
                alt="Selected Poster Frame" 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <button
                  onClick={() => alert('Captured current frame as 4K Master Poster!')}
                  className="px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-medium flex items-center gap-1.5 hover:bg-white/20 transition shadow"
                >
                  <Camera size={13} />
                  <span>Capture Current Frame as Poster</span>
                </button>

                <button
                  onClick={handleGenerateMotionPreview}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/90 text-white text-xs font-medium flex items-center gap-1.5 hover:bg-indigo-500 transition shadow"
                >
                  <Film size={13} />
                  <span>{isGeneratingMotionPreview ? 'Rendering .webp...' : 'Generate 4s Motion Teaser'}</span>
                </button>
              </div>
            </div>

            {/* 6 AI / FFmpeg Candidate Keyframes Selector */}
            <div>
              <div className="text-xs font-semibold text-slate-300 mb-2">High-Contrast Keyframe Candidates</div>
              <div className="grid grid-cols-6 gap-2">
                {candidatePosters.map((url, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedPoster(url)}
                    className={`aspect-video rounded-lg overflow-hidden border cursor-pointer transition ${
                      selectedPoster === url ? 'ring-2 ring-indigo-500 border-transparent scale-105' : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Candidate ${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Interactive Chapter & Subtitle/VTT Studio */}
          <div className="p-5 rounded-xl bg-black/40 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Interactive Chapters & Subtitle Studio</h3>
              
              {/* Caption Language Tabs */}
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                {(['en', 'es', 'jp'] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setActiveCaptionLang(lang)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition ${
                      activeCaptionLang === lang ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Chapters Table */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {chapters.map((ch, idx) => (
                <div 
                  key={ch.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-indigo-400 font-bold text-[11px]">{ch.time}</span>
                    <span className="text-slate-200">{ch.title}</span>
                  </div>
                  <button
                    onClick={() => setChapters(chapters.filter(c => c.id !== ch.id))}
                    className="text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Chapter Input */}
            <form onSubmit={handleAddChapter} className="flex gap-2">
              <input
                type="text"
                placeholder="00:00"
                value={newChapterTime}
                onChange={(e) => setNewChapterTime(e.target.value)}
                className="w-20 bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
              />
              <input
                type="text"
                placeholder="Chapter title (e.g. Distributed Consensus & Raft)"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition"
              >
                Add Chapter
              </button>
            </form>
          </div>

          {/* Publish CTA Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              onClick={onBackToCatalog}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition"
            >
              Save as Draft
            </button>
            <button
              onClick={onPublishSuccess}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-xl transition active:scale-95 flex items-center gap-2"
            >
              <CheckCircle size={15} />
              <span>Publish Film to Master Catalog</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
