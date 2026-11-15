import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  Eye,
  Frame,
  Grid3X3,
  Layers,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import type { ComputedArtifactMeta } from '../types/portfolio';
import { XRayLayerOverlay } from './XRayLayerOverlay';
import { BehindTheCraftDrawer } from './BehindTheCraftDrawer';
import { InteractivePrototypeStage } from './InteractivePrototypeStage';

interface InspectionStageModalProps {
  meta: ComputedArtifactMeta;
  allMetas: ComputedArtifactMeta[];
  isPinned: boolean;
  onTogglePin: (id: string) => void;
  onSelectArtifact: (id: string) => void;
  onClose: () => void;
  onOpenBriefcaseInquiry: (id: string) => void;
}

type ContextMode = 'pure' | 'wall' | 'mockup';
type WallFrameMaterial = 'oak' | 'black';
type WallPrintScale = '16x24' | '24x36';

export const InspectionStageModal: React.FC<InspectionStageModalProps> = ({
  meta,
  allMetas,
  isPinned,
  onTogglePin,
  onSelectArtifact,
  onClose,
  onOpenBriefcaseInquiry,
}) => {
  const { artifact, ambientMattingHex, maxPrint300Dpi } = meta;

  const [contextMode, setContextMode] = useState<ContextMode>('pure');
  const [xrayActive, setXrayActive] = useState(false);
  const [xrayHoldKey, setXrayHoldKey] = useState(false);
  const [splitPct, setSplitPct] = useState(50);
  const [isDraggingCurtain, setIsDraggingCurtain] = useState(false);

  const [gridOverlay, setGridOverlay] = useState(false);
  const [loupeLocked, setLoupeLocked] = useState(false);
  const [loupeHolding, setLoupeHolding] = useState(false);
  const [loupePos, setLoupePos] = useState<{
    x: number;
    y: number;
    pctX: number;
    pctY: number;
    rectW: number;
    rectH: number;
  } | null>(null);

  const [storyOpen, setStoryOpen] = useState(false);
  const [chromeIdle, setChromeIdle] = useState(false);
  const [wallFrame, setWallFrame] = useState<WallFrameMaterial>('oak');
  const [wallScale, setWallScale] = useState<WallPrintScale>('24x36');

  const frameRef = useRef<HTMLDivElement | null>(null);
  const idleTimerRef = useRef<number | null>(null);

  const currentIdx = allMetas.findIndex((m) => m.artifact.id === artifact.id);
  const prevMeta = currentIdx > 0 ? allMetas[currentIdx - 1] : allMetas[allMetas.length - 1];
  const nextMeta = currentIdx < allMetas.length - 1 ? allMetas[currentIdx + 1] : allMetas[0];

  const wakeChrome = useCallback(() => {
    setChromeIdle(false);
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => {
      setChromeIdle(true);
    }, 2000);
  }, []);

  useEffect(() => {
    wakeChrome();
    return () => {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    };
  }, [wakeChrome, artifact.id]);

  // Reset per-artifact toggles gently when stepping
  useEffect(() => {
    setContextMode('pure');
    setLoupeHolding(false);
    setLoupePos(null);
  }, [artifact.id]);

  // Keyboard shortcuts: Esc, G (Grid), X (Hold X-Ray), Z (Loupe), Arrows
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      wakeChrome();

      if (e.key === 'Escape') {
        e.preventDefault();
        if (storyOpen) {
          setStoryOpen(false);
        } else {
          onClose();
        }
      } else if (e.key.toLowerCase() === 'x') {
        setXrayHoldKey(true);
      } else if (e.key.toLowerCase() === 'g') {
        e.preventDefault();
        setGridOverlay((v) => !v);
      } else if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        setLoupeLocked((v) => !v);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onSelectArtifact(nextMeta.artifact.id);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onSelectArtifact(prevMeta.artifact.id);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'x') {
        setXrayHoldKey(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [nextMeta.artifact.id, onClose, onSelectArtifact, prevMeta.artifact.id, storyOpen, wakeChrome]);

  // Drag handler for Before/After X-Ray Curtain
  useEffect(() => {
    if (!isDraggingCurtain) return;

    const handleMove = (clientX: number) => {
      const el = frameRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const rawPct = ((clientX - rect.left) / rect.width) * 100;
      setSplitPct(Math.max(2, Math.min(98, rawPct)));
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX);
    };
    const onUp = () => setIsDraggingCurtain(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDraggingCurtain]);

  const effectiveSplitPct = xrayHoldKey ? 100 : xrayActive ? splitPct : 0;
  const showXRayLayer = xrayHoldKey || xrayActive;
  const loupeActive = (loupeLocked || loupeHolding) && contextMode === 'pure' && !isDraggingCurtain;

  const updateLoupePointer = (clientX: number, clientY: number) => {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
    setLoupePos({
      x,
      y,
      pctX: (x / rect.width) * 100,
      pctY: (y / rect.height) * 100,
      rectW: rect.width,
      rectH: rect.height,
    });
  };

  const shouldHideChrome =
    chromeIdle && !storyOpen && !isDraggingCurtain && !loupeHolding && contextMode === 'pure';

  const zoomFactor = 2.6;
  const loupeSize = 176;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between text-[#F4F4F2] overflow-hidden transition-colors duration-700"
      style={{ backgroundColor: ambientMattingHex || '#0D0E10' }}
      onMouseMove={wakeChrome}
      onTouchStart={wakeChrome}
    >
      {/* Top Whisper Chrome (Fades after 2s idle) */}
      <header
        className={`relative z-30 px-5 sm:px-10 pt-5 pb-3 flex items-center justify-between gap-4 transition-opacity duration-500 ${
          shouldHideChrome ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="min-w-0 flex items-center gap-3">
          <span className="font-mono-catalog text-[11px] uppercase tracking-[0.08em] text-white/60">
            PLATE {artifact.catalogNumber} / {String(allMetas.length).padStart(2, '0')}
          </span>
          <span className="text-white/25">•</span>
          <h2 className="font-serif-display text-[22px] sm:text-[26px] leading-none text-white truncate">
            {artifact.title}
          </h2>
          <span className="hidden md:inline font-mono-catalog text-[11px] text-white/50">
            {artifact.client} ({artifact.year})
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Keyboard Legend */}
          <span className="hidden xl:inline font-mono-catalog text-[10px] uppercase tracking-[0.07em] text-white/40 mr-2">
            HOLD X: X-RAY • G: GRID • HOLD CLICK / Z: LOUPE • ←/→: STEP
          </span>

          <button
            type="button"
            onClick={() => onTogglePin(artifact.id)}
            className={`px-3.5 py-1.5 rounded-full border font-mono-catalog text-[11px] uppercase tracking-[0.06em] inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
              isPinned
                ? 'bg-white text-[#0D0E10] border-transparent'
                : 'border-white/20 bg-white/8 hover:bg-white/15 text-white'
            }`}
          >
            {isPinned ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D93829]" />
                <Check className="w-3.5 h-3.5" />
                <span>In Briefcase</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span>+ Briefcase</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Close inspection stage"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Center Stage (Occupies up to 82vh in Zero-Chrome Silence) */}
      <div className="relative flex-1 flex items-center justify-center px-4 sm:px-14 min-h-0">
        {/* Previous / Next Plate Arrows */}
        <button
          type="button"
          onClick={() => onSelectArtifact(prevMeta.artifact.id)}
          aria-label="Previous plate"
          className={`hidden md:flex absolute left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/8 hover:bg-white/18 border border-white/12 items-center justify-center cursor-pointer transition-opacity duration-500 ${
            shouldHideChrome ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onSelectArtifact(nextMeta.artifact.id)}
          aria-label="Next plate"
          className={`hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/8 hover:bg-white/18 border border-white/12 items-center justify-center cursor-pointer transition-opacity duration-500 ${
            shouldHideChrome ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* MODE 1: PURE FRAME (Supports Process X-Ray Curtain, Modular Grid G, & Optical 100% Loupe) */}
        {contextMode === 'pure' && (
          <div className="relative flex items-center justify-center max-h-full max-w-full">
            <div
              ref={frameRef}
              className={`relative select-none overflow-hidden shadow-[0_28px_80px_rgba(0,0,0,0.65)] ${
                artifact.kind === 'design'
                  ? 'rounded-[12px] border border-white/15'
                  : 'rounded-none'
              } ${loupeActive ? 'cursor-crosshair' : 'cursor-zoom-in'}`}
              style={{
                aspectRatio: `${artifact.nativeWidth} / ${artifact.nativeHeight}`,
                maxHeight: storyOpen ? '48vh' : '78vh',
                maxWidth: '88vw',
                height: 'auto',
                width: 'auto',
                borderColor: meta.ambientMattingBorder,
              }}
              onMouseDown={(e) => {
                if (isDraggingCurtain) return;
                setLoupeHolding(true);
                updateLoupePointer(e.clientX, e.clientY);
              }}
              onMouseMove={(e) => {
                if (loupeLocked || loupeHolding) {
                  updateLoupePointer(e.clientX, e.clientY);
                }
              }}
              onMouseUp={() => setLoupeHolding(false)}
              onMouseLeave={() => setLoupeHolding(false)}
            >
              {/* After / Final Polished Plate */}
              <img
                src={artifact.imageUrl}
                alt={artifact.title}
                draggable={false}
                className="w-full h-full object-contain block"
                style={{
                  maxHeight: storyOpen ? '48vh' : '78vh',
                  maxWidth: '88vw',
                }}
              />

              {/* Before / Process X-Ray Clipped Curtain Layer */}
              {showXRayLayer && (
                <div
                  className="absolute inset-0 z-10 pointer-events-none"
                  style={{
                    clipPath: `inset(0 ${100 - effectiveSplitPct}% 0 0)`,
                  }}
                >
                  <XRayLayerOverlay artifact={artifact} showFullLabels={true} />
                </div>
              )}

              {/* Grid & Geometry Overlay (G key) */}
              {gridOverlay && !showXRayLayer && (
                <div className="absolute inset-0 z-15 pointer-events-none">
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                    <rect
                      x={artifact.gridSpec.swissMarginsPct}
                      y={artifact.gridSpec.swissMarginsPct}
                      width={100 - artifact.gridSpec.swissMarginsPct * 2}
                      height={100 - artifact.gridSpec.swissMarginsPct * 2}
                      fill="none"
                      stroke="rgba(37, 99, 235, 0.55)"
                      strokeWidth="0.28"
                      strokeDasharray="1.2 1.2"
                    />
                    {Array.from({ length: artifact.gridSpec.gridColumns - 1 }).map((_, idx) => {
                      const x =
                        artifact.gridSpec.swissMarginsPct +
                        ((100 - artifact.gridSpec.swissMarginsPct * 2) * (idx + 1)) /
                          artifact.gridSpec.gridColumns;
                      return (
                        <line
                          key={idx}
                          x1={x}
                          y1={artifact.gridSpec.swissMarginsPct}
                          x2={x}
                          y2={100 - artifact.gridSpec.swissMarginsPct}
                          stroke="rgba(59, 130, 246, 0.4)"
                          strokeWidth="0.22"
                          strokeDasharray="0.9 1.1"
                        />
                      );
                    })}
                    {/* Rule of thirds */}
                    <line x1="33.33" y1="0" x2="33.33" y2="100" stroke="rgba(255,255,255,0.22)" strokeWidth="0.18" />
                    <line x1="66.66" y1="0" x2="66.66" y2="100" stroke="rgba(255,255,255,0.22)" strokeWidth="0.18" />
                    <line x1="0" y1="33.33" x2="100" y2="33.33" stroke="rgba(255,255,255,0.22)" strokeWidth="0.18" />
                    <line x1="0" y1="66.66" x2="100" y2="66.66" stroke="rgba(255,255,255,0.22)" strokeWidth="0.18" />
                    <circle
                      cx={artifact.gridSpec.focalPointXY[0]}
                      cy={artifact.gridSpec.focalPointXY[1]}
                      r="2.4"
                      fill="none"
                      stroke="#60A5FA"
                      strokeWidth="0.35"
                    />
                  </svg>
                  {artifact.gridSpec.annotations.map((ann, idx) => (
                    <div
                      key={idx}
                      className="absolute -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-black/75 border border-blue-400/50 text-blue-100 font-mono-catalog text-[9px] tracking-[0.06em] uppercase whitespace-nowrap"
                      style={{ left: `${ann.xPct}%`, top: `${ann.yPct}%` }}
                    >
                      {ann.label}
                    </div>
                  ))}
                </div>
              )}

              {/* Tactile Draggable Process X-Ray Divider Handle */}
              {showXRayLayer && (
                <div
                  className="absolute top-0 bottom-0 z-20 w-[1px] bg-white/85 shadow-[0_0_12px_rgba(0,0,0,0.6)] cursor-ew-resize"
                  style={{ left: `${effectiveSplitPct}%` }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsDraggingCurtain(true);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    setIsDraggingCurtain(true);
                  }}
                >
                  <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-[36px] h-[36px] rounded-full glass-darkroom border border-white/40 flex items-center justify-center shadow-lg">
                    <span className="font-mono-catalog text-[10px] text-white">⇄</span>
                  </div>
                </div>
              )}

              {/* Optical 100% Magnifying Loupe Lens (Hold Click or Z toggle) */}
              {loupeActive && loupePos && (
                <div
                  className="absolute z-30 pointer-events-none rounded-full border-2 border-white/80 shadow-[0_14px_40px_rgba(0,0,0,0.65)] overflow-hidden"
                  style={{
                    width: `${loupeSize}px`,
                    height: `${loupeSize}px`,
                    left: `${loupePos.x - loupeSize / 2}px`,
                    top: `${loupePos.y - loupeSize / 2}px`,
                    backgroundImage: `url(${artifact.imageUrl})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: `${loupePos.rectW * zoomFactor}px ${loupePos.rectH * zoomFactor}px`,
                    backgroundPosition: `${-(loupePos.x * zoomFactor - loupeSize / 2)}px ${-(
                      loupePos.y * zoomFactor -
                      loupeSize / 2
                    )}px`,
                  }}
                >
                  {/* Precision reticle crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-[1px] bg-white/60" />
                    <div className="h-3 w-[1px] bg-white/60 absolute" />
                  </div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/80 font-mono-catalog text-[9px] text-white/90 whitespace-nowrap">
                    {zoomFactor.toFixed(1)}× • {Math.round(loupePos.pctX)}%,{Math.round(loupePos.pctY)}%
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODE 2: SEE ON WALL / ARCHITECTURAL GALLERY ELEVATION */}
        {contextMode === 'wall' && (
          <div className="w-full max-w-[920px] mx-auto flex flex-col items-center exhibition-flip-enter">
            {/* Gallery Wall & Bench Elevation */}
            <div
              className="w-full rounded-[12px] overflow-hidden border border-white/12 shadow-2xl flex flex-col items-center justify-between pt-8 sm:pt-12"
              style={{ backgroundColor: '#ECE8DF' }}
            >
              {/* Framed Artwork hanging on museum wall */}
              <div className="flex flex-col items-center px-6">
                <div
                  className="transition-all duration-500 shadow-[0_22px_48px_rgba(24,24,22,0.28)]"
                  style={{
                    padding: wallScale === '24x36' ? '14px' : '10px',
                    backgroundColor: wallFrame === 'oak' ? '#C8A97E' : '#181816',
                  }}
                >
                  {/* Acid-free museum window mat */}
                  <div className="bg-[#FAF8F4] p-4 sm:p-6 shadow-inner">
                    <img
                      src={artifact.imageUrl}
                      alt={artifact.title}
                      className="block object-contain transition-all duration-500"
                      style={{
                        maxHeight: wallScale === '24x36' ? '34vh' : '26vh',
                        maxWidth: '58vw',
                      }}
                    />
                  </div>
                </div>

                {/* Museum Wall Placard beside artwork */}
                <div className="mt-4 flex items-center gap-3 text-[#5C5A55] font-mono-catalog text-[10px] uppercase tracking-[0.08em]">
                  <span>
                    {wallFrame === 'oak' ? 'Raw European Oak Frame' : 'Matte Anodized Black Frame'}
                  </span>
                  <span>•</span>
                  <span>
                    {wallScale === '24x36' ? 'Edition Scale 24 × 36 IN' : 'Edition Scale 16 × 24 IN'}
                  </span>
                  {maxPrint300Dpi && (
                    <>
                      <span>•</span>
                      <span>300 DPI Ceiling: {maxPrint300Dpi.formattedIn}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Architectural Gallery Bench & Floor Horizon */}
              <div className="w-full mt-8 flex flex-col items-center">
                <div className="w-[46%] max-w-[340px] h-3.5 bg-[#D4CEC2] border-t border-black/10 shadow-md" />
                <div className="w-[38%] max-w-[280px] flex justify-between px-4">
                  <div className="w-3 h-5 bg-[#474540]" />
                  <div className="w-3 h-5 bg-[#474540]" />
                </div>
                <div className="w-full h-5 bg-[#DDD7CB] border-t border-black/10" />
              </div>
            </div>

            {/* Wall Frame & Print Size Controls */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex p-1 rounded-full glass-darkroom border border-white/15">
                <button
                  type="button"
                  onClick={() => setWallFrame('oak')}
                  className={`px-3 py-1 rounded-full font-mono-catalog text-[11px] uppercase cursor-pointer inline-flex items-center gap-1.5 ${
                    wallFrame === 'oak' ? 'bg-white text-[#0D0E10]' : 'text-white/75'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C8A97E]" />
                  <span>Raw Oak</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWallFrame('black')}
                  className={`px-3 py-1 rounded-full font-mono-catalog text-[11px] uppercase cursor-pointer inline-flex items-center gap-1.5 ${
                    wallFrame === 'black' ? 'bg-white text-[#0D0E10]' : 'text-white/75'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#181816] border border-white/40" />
                  <span>Matte Black</span>
                </button>
              </div>

              <div className="inline-flex p-1 rounded-full glass-darkroom border border-white/15">
                <button
                  type="button"
                  onClick={() => setWallScale('16x24')}
                  className={`px-3 py-1 rounded-full font-mono-catalog text-[11px] uppercase cursor-pointer ${
                    wallScale === '16x24' ? 'bg-white text-[#0D0E10]' : 'text-white/75'
                  }`}
                >
                  16 × 24&quot;
                </button>
                <button
                  type="button"
                  onClick={() => setWallScale('24x36')}
                  className={`px-3 py-1 rounded-full font-mono-catalog text-[11px] uppercase cursor-pointer ${
                    wallScale === '24x36' ? 'bg-white text-[#0D0E10]' : 'text-white/75'
                  }`}
                >
                  24 × 36&quot;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODE 3: TACTILE MOCKUP / LIVE INTERACTIVE PROTOTYPE */}
        {contextMode === 'mockup' && (
          <div className="w-full exhibition-flip-enter">
            <InteractivePrototypeStage meta={meta} />
          </div>
        )}
      </div>

      {/* Expandable Behind-The-Craft Story Drawer */}
      {storyOpen && (
        <div className="relative z-30 px-4 sm:px-10 pb-2">
          <BehindTheCraftDrawer meta={meta} onClose={() => setStoryOpen(false)} />
        </div>
      )}

      {/* Bottom Whisper Dock (Auto-fades after 2s idle when pure) */}
      <footer
        className={`relative z-30 px-4 sm:px-10 pb-5 pt-2 transition-opacity duration-500 ${
          shouldHideChrome ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="max-w-[1160px] mx-auto rounded-full glass-darkroom border border-white/15 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shadow-2xl">
          {/* Inspector Tools (Process X-Ray, Grid G, Loupe Z) */}
          <div className="flex flex-wrap items-center gap-1.5">
            {contextMode === 'pure' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setXrayActive((v) => !v);
                    if (!xrayActive) setSplitPct(50);
                  }}
                  className={`px-3 py-1.5 rounded-full font-mono-catalog text-[11px] uppercase tracking-[0.05em] inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                    showXRayLayer
                      ? 'bg-[#D93829] text-white'
                      : 'bg-white/8 hover:bg-white/16 text-white/85'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{showXRayLayer ? 'X-Ray Active (Drag ⇄)' : 'Process X-Ray (Hold X)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGridOverlay((v) => !v)}
                  className={`px-3 py-1.5 rounded-full font-mono-catalog text-[11px] uppercase tracking-[0.05em] inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                    gridOverlay
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/8 hover:bg-white/16 text-white/85'
                  }`}
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                  <span>Grid (G)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLoupeLocked((v) => !v)}
                  className={`px-3 py-1.5 rounded-full font-mono-catalog text-[11px] uppercase tracking-[0.05em] inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                    loupeLocked
                      ? 'bg-white text-[#0D0E10]'
                      : 'bg-white/8 hover:bg-white/16 text-white/85'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Loupe (Z)</span>
                </button>
              </>
            )}
          </div>

          {/* See It in the Wild Context Switcher */}
          <div className="inline-flex p-1 rounded-full bg-white/6 border border-white/10">
            <button
              type="button"
              onClick={() => setContextMode('pure')}
              className={`px-3 py-1 rounded-full text-[11px] font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                contextMode === 'pure' ? 'bg-white text-[#0D0E10]' : 'text-white/75 hover:text-white'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Pure Frame</span>
            </button>
            <button
              type="button"
              onClick={() => setContextMode('wall')}
              className={`px-3 py-1 rounded-full text-[11px] font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                contextMode === 'wall' ? 'bg-white text-[#0D0E10]' : 'text-white/75 hover:text-white'
              }`}
            >
              <Frame className="w-3 h-3" />
              <span>See on Wall</span>
            </button>
            <button
              type="button"
              onClick={() => setContextMode('mockup')}
              className={`px-3 py-1 rounded-full text-[11px] font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                contextMode === 'mockup' ? 'bg-white text-[#0D0E10]' : 'text-white/75 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>
                {artifact.designManifest?.interactivePrototypeType
                  ? 'Interactive Prototype'
                  : 'Monograph Spread'}
              </span>
            </button>
          </div>

          {/* Story Toggle & Primary Commission Action */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setStoryOpen((v) => !v)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                storyOpen
                  ? 'bg-white text-[#0D0E10]'
                  : 'bg-white/12 hover:bg-white/20 text-white border border-white/15'
              }`}
            >
              <span>{storyOpen ? 'Close Story' : 'Behind the Craft'}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenBriefcaseInquiry(artifact.id)}
              className="px-3.5 py-1.5 rounded-full bg-[#F4F4F2] text-[#0D0E10] hover:opacity-90 font-mono-catalog text-[11px] uppercase tracking-[0.05em] font-medium cursor-pointer"
            >
              Inquire / Collect
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

