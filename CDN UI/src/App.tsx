import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { NetworkPersonaBar } from './components/NetworkPersonaBar';
import { AssetSelector } from './components/AssetSelector';
import { ImageLoupeStage } from './components/ImageStudio/ImageLoupeStage';
import { MultiRatioPreviewer } from './components/ImageStudio/MultiRatioPreviewer';
import { ProgressiveLoadSimulator } from './components/ImageStudio/ProgressiveLoadSimulator';
import { AudioDock } from './components/AudioStudio/AudioDock';
import { TransformationInspector } from './components/Inspector/TransformationInspector';
import { EconomicsReceiptModal } from './components/Modals/EconomicsReceiptModal';
import { CodeRecipeDrawer } from './components/Modals/CodeRecipeDrawer';
import { AssetSwapModal } from './components/Modals/AssetSwapModal';
import { HotlinkRadarModal } from './components/Modals/HotlinkRadarModal';
import { WaveformJsonModal } from './components/Modals/WaveformJsonModal';

import { 
  MediaAsset, 
  TransformationParams, 
  NetworkPersona, 
  CachePreset 
} from './types';
import { 
  MOCK_ASSETS, 
  NETWORK_PERSONAS, 
  CACHE_PRESETS,
  POP_REGIONS 
} from './data/mockAssets';
import { EdgeService } from './services/edgeService';

export function App() {
  // Theme state: Calibrated Studio Slate (Dark Default) vs Daylight Lab
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Asset & Transformation States
  const [assets, setAssets] = useState<MediaAsset[]>(MOCK_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset>(MOCK_ASSETS[0]);
  const [selectedPersona, setSelectedPersona] = useState<NetworkPersona>(NETWORK_PERSONAS[0]);
  const [selectedCachePreset, setSelectedCachePreset] = useState<CachePreset>(CACHE_PRESETS[0]);

  // Transformation parameters state
  const [params, setParams] = useState<TransformationParams>({
    format: 'auto',
    quality: 80,
    saveData: false,
    width: 1200,
    cropMode: 'focal',
    focalPoint: selectedAsset.focalPoint || { x: 0.5, y: 0.5 },
    aspectRatio: '16:9',
    audioBitrate: '96k',
    normalizeLufs: true,
    targetLufs: -16,
    trimStart: 12,
    trimEnd: selectedAsset.duration ? Math.min(60, selectedAsset.duration) : 60,
  });

  // Purge Worldwide propagation animation state
  const [isPurging, setIsPurging] = useState<boolean>(false);
  const [purgeStep, setPurgeStep] = useState<number>(0);

  // Modal open states
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [isCodeDrawerOpen, setIsCodeDrawerOpen] = useState<boolean>(false);
  const [isAssetSwapOpen, setIsAssetSwapOpen] = useState<boolean>(false);
  const [isHotlinkModalOpen, setIsHotlinkModalOpen] = useState<boolean>(false);
  const [isWaveformJsonOpen, setIsWaveformJsonOpen] = useState<boolean>(false);

  // Sync focal point & durations when asset changes
  useEffect(() => {
    setParams(prev => ({
      ...prev,
      focalPoint: selectedAsset.focalPoint || { x: 0.5, y: 0.5 },
      trimStart: 0,
      trimEnd: selectedAsset.duration ? Math.min(60, selectedAsset.duration) : 60,
    }));
  }, [selectedAsset.id]);

  // Handle parameters update
  const handleUpdateParams = (newParams: Partial<TransformationParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  };

  // Handle Focal Point pin drop on image
  const handleUpdateFocalPoint = (point: { x: number; y: number }) => {
    setParams(prev => ({ ...prev, focalPoint: point }));
  };

  // Toggle Save-Data Empathy
  const handleToggleSaveData = () => {
    setParams(prev => ({ ...prev, saveData: !prev.saveData }));
  };

  // Trigger Tactile Purge Worldwide
  const handleTriggerPurge = () => {
    if (isPurging) return;
    setIsPurging(true);
    setPurgeStep(0);

    const stepInterval = setInterval(() => {
      setPurgeStep(prev => {
        if (prev >= 4) {
          clearInterval(stepInterval);
          setIsPurging(false);
          // Update asset lastUpdated timestamp
          setSelectedAsset(curr => ({ ...curr, lastUpdated: 'Just now', originWakeupsToday: 0 }));
          return 4;
        }
        return prev + 1;
      });
    }, 700);
  };

  // Mock Upload Master action
  const handleUploadMock = () => {
    const isAudioUpload = Math.random() > 0.5;
    const newId = `asset-custom-${Date.now()}`;
    const newAsset: MediaAsset = isAudioUpload ? {
      id: newId,
      title: 'Studio Vocals Stem Master (WAV)',
      filename: `vocal-stem-take-${Math.floor(Math.random() * 90 + 10)}.wav`,
      type: 'audio',
      originUrl: '',
      originFormat: 'WAV (24-bit 96kHz Lossless)',
      originBytes: 52400000,
      duration: 160,
      waveform: Array.from({ length: 120 }, () => Number((Math.random() * 0.8 + 0.1).toFixed(2))),
      originalLufs: -21.8,
      surrogateKey: `sk_aud_${newId}`,
      etag: `"${Math.random().toString(16).slice(2, 10)}"`,
      version: 1,
      lastUpdated: 'Just now',
      edgeHitRatio: 99.1,
      originWakeupsToday: 0,
      totalRequestsMonth: 42000,
    } : {
      id: newId,
      title: 'Architectural Lookbook Cover Shot',
      filename: `architectural-facade-${Math.floor(Math.random() * 90 + 10)}.png`,
      type: 'image',
      originUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2400&q=100',
      originFormat: 'PNG (RAW ProPhoto RGB)',
      originBytes: 6800000,
      width: 2400,
      height: 1600,
      blurHash: 'L6PZfSjE00ay~qj[00ay00j[4nay',
      dominantColors: ['#1E293B', '#38BDF8', '#64748B', '#F1F5F9'],
      focalPoint: { x: 0.5, y: 0.4 },
      surrogateKey: `sk_img_${newId}`,
      etag: `"${Math.random().toString(16).slice(2, 10)}"`,
      version: 1,
      lastUpdated: 'Just now',
      edgeHitRatio: 99.5,
      originWakeupsToday: 0,
      totalRequestsMonth: 65000,
    };

    setAssets(prev => [newAsset, ...prev]);
    setSelectedAsset(newAsset);
  };

  // Compute live delivery metrics
  const metrics = EdgeService.computeDeliveryMetrics(selectedAsset, params, selectedPersona);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-edge-obsidian text-gray-100' : 'bg-[#F6F7F9] text-gray-900'} transition-colors duration-200`}>
      {/* 1. App Header & Value Receipt Banner */}
      <Header
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onOpenReceipt={() => setIsReceiptOpen(true)}
        onOpenAssetSwap={() => setIsAssetSwapOpen(true)}
      />

      {/* Main Workspace Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* 2. Top Telemetry & Network Persona Simulator Bar */}
        <NetworkPersonaBar
          personas={NETWORK_PERSONAS}
          selectedPersona={selectedPersona}
          onSelectPersona={setSelectedPersona}
          saveDataEnabled={params.saveData}
          onToggleSaveData={handleToggleSaveData}
          onTriggerPurge={handleTriggerPurge}
          isPurging={isPurging}
          purgeStep={purgeStep}
        />

        {/* 3. Media Catalog Carousel & Filterable Asset Selector */}
        <AssetSelector
          assets={assets}
          selectedAsset={selectedAsset}
          onSelectAsset={setSelectedAsset}
          onUploadMock={handleUploadMock}
        />

        {/* 4. Split Studio Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left / Center: Live Optimization Stage (Cols 1-8) */}
          <div className="lg:col-span-8 space-y-6">
            {selectedAsset.type === 'image' ? (
              <>
                {/* Image Before/After Curtain & Smart Focal-Point Pin Stage */}
                <ImageLoupeStage
                  asset={selectedAsset}
                  params={params}
                  metrics={metrics}
                  network={selectedPersona}
                  onUpdateFocalPoint={handleUpdateFocalPoint}
                />

                {/* Multi-Ratio Responsive Crop Derivatives Strip */}
                <MultiRatioPreviewer
                  asset={selectedAsset}
                  params={params}
                  onSelectRatio={(ratio) => handleUpdateParams({ aspectRatio: ratio })}
                />

                {/* Progressive Load & Placeholder Choreography (First 200ms) */}
                <ProgressiveLoadSimulator
                  asset={selectedAsset}
                  network={selectedPersona}
                  metrics={metrics}
                />
              </>
            ) : (
              /* Audio Edge Mastering & Bitrate Audition Dock */
              <AudioDock
                asset={selectedAsset}
                params={params}
                onUpdateParams={handleUpdateParams}
                onOpenWaveformJson={() => setIsWaveformJsonOpen(true)}
              />
            )}
          </div>

          {/* Right Rail: Tactile Transformation & Cache Inspector (Cols 9-12, sticky) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <TransformationInspector
              asset={selectedAsset}
              params={params}
              metrics={metrics}
              onUpdateParams={handleUpdateParams}
              selectedCachePreset={selectedCachePreset}
              onSelectCachePreset={setSelectedCachePreset}
              onOpenCodeDrawer={() => setIsCodeDrawerOpen(true)}
              onOpenHotlinkModal={() => setIsHotlinkModalOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Floating Audio Dock if image is selected but user wants to audition audio */}
      {selectedAsset.type === 'image' && (
        <div className="fixed bottom-3 right-4 z-30 hidden sm:flex items-center gap-2 px-3 py-2 rounded-full glass-panel border border-white/10 shadow-2xl">
          <span className="w-2 h-2 rounded-full bg-edge-emerald animate-pulse"></span>
          <span className="text-xs font-mono text-gray-300">
            {selectedPersona.name} ({selectedPersona.latencyMs}ms)
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-xs text-edge-cyan font-bold font-mono">
            {metrics.perceptualBadge.split(' ')[0]}
          </span>
        </div>
      )}

      {/* Modals & Drawers */}
      <EconomicsReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        activeAsset={selectedAsset}
      />

      <CodeRecipeDrawer
        isOpen={isCodeDrawerOpen}
        onClose={() => setIsCodeDrawerOpen(false)}
        asset={selectedAsset}
        params={params}
      />

      <AssetSwapModal
        isOpen={isAssetSwapOpen}
        onClose={() => setIsAssetSwapOpen(false)}
        asset={selectedAsset}
        onSwapCompleted={(ver) => {
          setSelectedAsset(prev => ({ ...prev, version: ver, lastUpdated: 'Just now' }));
        }}
      />

      <HotlinkRadarModal
        isOpen={isHotlinkModalOpen}
        onClose={() => setIsHotlinkModalOpen(false)}
        asset={selectedAsset}
      />

      <WaveformJsonModal
        isOpen={isWaveformJsonOpen}
        onClose={() => setIsWaveformJsonOpen(false)}
        asset={selectedAsset}
      />
    </div>
  );
}
export default App;
