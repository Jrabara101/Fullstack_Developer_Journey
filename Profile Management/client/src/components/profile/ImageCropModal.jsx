import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Check, Sparkles, AlertCircle } from 'lucide-react';
import { compressImageToWebP, formatBytes } from '../../services/imageCompressor';

export function ImageCropModal({
  isOpen,
  onClose,
  imageSrc,
  aspectRatio = 1, // 1 for avatar (circular), 3 for banner (3:1 panoramic)
  title = 'Adjust Profile Picture',
  initialAltText = '',
  onSave
}) {
  if (!isOpen || !imageSrc) return null;

  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [altText, setAltText] = useState(initialAltText);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionMetrics, setCompressionMetrics] = useState(null);

  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const isCircular = aspectRatio === 1;
  const stageWidth = 380;
  const stageHeight = aspectRatio === 1 ? 380 : Math.round(380 / aspectRatio);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      drawCanvas(1, 0, { x: 0, y: 0 }, img);
    };
  }, [imageSrc]);

  // Main canvas rendering function
  const drawCanvas = useCallback((currentZoom, currentRotation, currentOffset, img = imageRef.current) => {
    if (!canvasRef.current || !img) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = stageWidth;
    const height = stageHeight;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    // Save state
    ctx.save();

    // Center point translation
    ctx.translate(width / 2 + currentOffset.x, height / 2 + currentOffset.y);
    ctx.rotate((currentRotation * Math.PI) / 180);
    ctx.scale(currentZoom, currentZoom);

    // Calculate dimensions maintaining aspect ratio of image
    const imgAspect = img.width / img.height;
    const targetAspect = width / height;

    let renderWidth, renderHeight;
    if (imgAspect > targetAspect) {
      renderHeight = height;
      renderWidth = height * imgAspect;
    } else {
      renderWidth = width;
      renderHeight = width / imgAspect;
    }

    ctx.drawImage(img, -renderWidth / 2, -renderHeight / 2, renderWidth, renderHeight);

    ctx.restore();
  }, [stageWidth, stageHeight]);

  // Redraw when parameters change
  useEffect(() => {
    drawCanvas(zoom, rotation, offset);
  }, [zoom, rotation, offset, drawCanvas]);

  // Mouse / Touch Drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    // Bound constraints based on zoom
    const maxBound = 180 * zoom;
    setOffset({
      x: Math.max(-maxBound, Math.min(maxBound, newX)),
      y: Math.max(-maxBound, Math.min(maxBound, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom((prev) => Math.max(0.8, Math.min(3.5, prev + delta)));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleCommit = async () => {
    if (!canvasRef.current) return;
    setIsProcessing(true);

    try {
      // Export at high resolution 512x512 or 1536x512 for crisp display
      const exportCanvas = document.createElement('canvas');
      const exportWidth = aspectRatio === 1 ? 512 : 1200;
      const exportHeight = aspectRatio === 1 ? 512 : 400;
      exportCanvas.width = exportWidth;
      exportCanvas.height = exportHeight;

      const exportCtx = exportCanvas.getContext('2d');
      exportCtx.imageSmoothingEnabled = true;
      exportCtx.imageSmoothingQuality = 'high';

      // Draw proportionally scaled
      exportCtx.save();
      exportCtx.translate(exportWidth / 2 + (offset.x * (exportWidth / stageWidth)), exportHeight / 2 + (offset.y * (exportHeight / stageHeight)));
      exportCtx.rotate((rotation * Math.PI) / 180);
      exportCtx.scale(zoom * (exportWidth / stageWidth), zoom * (exportHeight / stageHeight));

      const img = imageRef.current;
      const imgAspect = img.width / img.height;
      const targetAspect = stageWidth / stageHeight;
      let rW, rH;
      if (imgAspect > targetAspect) {
        rH = stageHeight;
        rW = stageHeight * imgAspect;
      } else {
        rW = stageWidth;
        rH = stageWidth / imgAspect;
      }

      exportCtx.drawImage(img, -rW / 2, -rH / 2, rW, rH);
      exportCtx.restore();

      // Compress client-side to WebP with sub-500ms latency
      const compressionResult = await compressImageToWebP(exportCanvas, {
        quality: 0.90,
        maxWidth: exportWidth,
        maxHeight: exportHeight,
        format: 'image/webp'
      });

      setCompressionMetrics(compressionResult);

      // Brief delay to showcase the tactile sub-500ms metric
      setTimeout(() => {
        onSave({
          dataUrl: compressionResult.dataUrl,
          blob: compressionResult.blob,
          altText: altText.trim(),
          metrics: compressionResult
        });
        setIsProcessing(false);
        onClose();
      }, 250);
    } catch (err) {
      console.error('Failed to crop and compress image:', err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl shadow-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#181B22] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light dark:border-border-dark">
          <div>
            <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">{title}</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Pan, scale, and align your photo with crisp edge restraint
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Stage */}
        <div className="p-6 flex flex-col items-center select-none bg-slate-950/5 dark:bg-black/40 overflow-y-auto">
          <div
            ref={containerRef}
            style={{ width: `${stageWidth}px`, height: `${stageHeight}px` }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            className={`relative rounded-xl overflow-hidden cursor-grab active:cursor-grabbing shadow-inner border border-slate-700/30 ${
              isCircular ? 'rounded-full' : 'rounded-xl'
            }`}
          >
            {/* Underlying Canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

            {/* Subtle 3x3 Grid Overlay (visible during drag and interaction) */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-30 hover:opacity-50 transition-opacity">
              <div className="border-r border-b border-white/60"></div>
              <div className="border-r border-b border-white/60"></div>
              <div className="border-b border-white/60"></div>
              <div className="border-r border-b border-white/60"></div>
              <div className="border-r border-b border-white/60"></div>
              <div className="border-b border-white/60"></div>
              <div className="border-r border-white/60"></div>
              <div className="border-r border-white/60"></div>
              <div></div>
            </div>

            {/* Circular mask border glow if avatar mode */}
            {isCircular && (
              <div className="absolute inset-0 rounded-full border-2 border-white/40 pointer-events-none shadow-[0_0_0_999px_rgba(0,0,0,0.45)]" />
            )}
          </div>

          <p className="text-[11px] text-slate-400 mt-2 text-center">
            Click & drag to position • Scroll to zoom
          </p>

          {/* Tuning Controls Strip */}
          <div className="w-full mt-4 flex items-center justify-between gap-4 px-2 py-2 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 flex-1">
              <ZoomOut className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="range"
                min="0.8"
                max="3.0"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <ZoomIn className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-xs font-mono text-slate-500 w-10 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <button
              type="button"
              onClick={handleRotate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              title="Rotate 90 degrees clockwise"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>↺ 90°</span>
            </button>
          </div>

          {/* Accessibility & Alt-Text Bridge */}
          <div className="w-full mt-4">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Descriptive Alt-Text (Accessibility Bridge)
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="e.g. Alex smiling outdoors against soft architectural background"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121418] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Assists screen readers and low-bandwidth clients with tactile visual description.
            </p>
          </div>
        </div>

        {/* Modal Action Deck */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-900/20">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleCommit}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Compressing & Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save & Apply Photo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
