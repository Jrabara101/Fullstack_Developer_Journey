import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Music, 
  Search, 
  UploadCloud, 
  Sparkles, 
  Check, 
  FileAudio, 
  AlertCircle,
  FileCheck2,
  HardDrive
} from 'lucide-react';
import { MediaAsset, MediaType } from '../types';
import { EdgeService } from '../services/edgeService';

interface AssetSelectorProps {
  assets: MediaAsset[];
  selectedAsset: MediaAsset;
  onSelectAsset: (asset: MediaAsset) => void;
  onUploadMock: () => void;
}

export const AssetSelector: React.FC<AssetSelectorProps> = ({
  assets,
  selectedAsset,
  onSelectAsset,
  onUploadMock,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'image' | 'audio' | 'needs-opt'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssets = assets.filter(asset => {
    if (filterType === 'image' && asset.type !== 'image') return false;
    if (filterType === 'audio' && asset.type !== 'audio') return false;
    if (filterType === 'needs-opt' && asset.originBytes < 5000000 && !asset.filename.includes('.wav')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return asset.title.toLowerCase().includes(q) || asset.filename.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="bg-edge-panel border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-edge-well border border-white/5 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filterType === 'all' ? 'bg-white/10 text-white font-semibold' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            All Media ({assets.length})
          </button>
          <button
            onClick={() => setFilterType('image')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filterType === 'image' ? 'bg-edge-cyan/20 text-edge-cyan font-semibold border border-edge-cyan/30' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Images ({assets.filter(a => a.type === 'image').length})</span>
          </button>
          <button
            onClick={() => setFilterType('audio')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filterType === 'audio' ? 'bg-edge-amber/20 text-edge-amber font-semibold border border-edge-amber/30' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Audio & Podcasts ({assets.filter(a => a.type === 'audio').length})</span>
          </button>
          <button
            onClick={() => setFilterType('needs-opt')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filterType === 'needs-opt' ? 'bg-edge-rose/20 text-edge-rose font-semibold border border-edge-rose/30' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Heavy Files</span>
          </button>
        </div>

        {/* Search & Upload Action */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-edge-well border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-edge-cyan transition-colors"
            />
          </div>

          <button
            onClick={onUploadMock}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-200 hover:text-white transition-colors shrink-0"
            title="Upload new RAW origin media"
          >
            <UploadCloud className="w-3.5 h-3.5 text-edge-cyan" />
            <span>Upload Master</span>
          </button>
        </div>
      </div>

      {/* Asset Grid / Horizontal Carousel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {filteredAssets.map((asset) => {
          const isSelected = selectedAsset.id === asset.id;
          const isAudio = asset.type === 'audio';

          return (
            <div
              key={asset.id}
              onClick={() => onSelectAsset(asset)}
              className={`group relative rounded-xl border p-2.5 cursor-pointer transition-all ${
                isSelected
                  ? 'bg-edge-well border-edge-cyan ring-1 ring-edge-cyan shadow-lg shadow-edge-cyan/15'
                  : 'bg-white/[0.03] border-white/5 hover:border-white/20 hover:bg-white/[0.06]'
              }`}
            >
              {/* Top media preview box */}
              <div className="relative h-28 rounded-lg overflow-hidden bg-edge-obsidian flex items-center justify-center border border-white/5 mb-2.5">
                {isAudio ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-edge-amber/20 via-edge-panel to-edge-obsidian p-3">
                    <div className="w-10 h-10 rounded-full bg-edge-amber/20 flex items-center justify-center mb-1 text-edge-amber">
                      <FileAudio className="w-5 h-5" />
                    </div>
                    {/* Mini Waveform preview */}
                    <div className="flex items-end gap-[2px] h-6 w-full max-w-[120px] justify-center mt-1">
                      {asset.waveform?.slice(0, 24).map((h, i) => (
                        <div
                          key={i}
                          className="w-1 bg-edge-amber/60 rounded-full"
                          style={{ height: `${Math.max(15, h * 100)}%` }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <img
                      src={asset.originUrl}
                      alt={asset.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-edge-obsidian/80 via-transparent to-transparent"></div>
                  </>
                )}

                {/* Floating Badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded backdrop-blur-md border ${
                    isAudio 
                      ? 'bg-edge-amber/20 text-edge-amber border-edge-amber/30' 
                      : 'bg-edge-cyan/20 text-edge-cyan border-edge-cyan/30'
                  }`}>
                    {isAudio ? 'Audio Master' : 'Image Master'}
                  </span>
                </div>

                <div className="absolute bottom-2 right-2">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-gray-300 border border-white/10">
                    {EdgeService.formatBytes(asset.originBytes)}
                  </span>
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-edge-cyan text-edge-obsidian flex items-center justify-center shadow-md">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Title & Edge Status */}
              <div>
                <h4 className="text-xs font-semibold text-gray-200 truncate group-hover:text-white" title={asset.title}>
                  {asset.title}
                </h4>
                <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1 font-mono">
                  <span className="truncate">{asset.filename}</span>
                  <span className="text-edge-emerald font-semibold">{asset.edgeHitRatio}% Hit</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

