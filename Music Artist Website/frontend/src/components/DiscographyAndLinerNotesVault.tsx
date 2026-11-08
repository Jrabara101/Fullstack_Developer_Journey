import React, { useState } from 'react';
import {
  Disc,
  Play,
  Pause,
  SlidersHorizontal,
  FileText,
  Volume2,
  VolumeX,
  Download,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useAudioEngine } from '../context/AudioEngineContext';
import { useEraTheme } from '../context/EraThemeContext';
import { Album, Track, StemMixerState } from '../types';

interface DiscographyProps {
  albums: Album[];
  tracks: Track[];
  onOpenVaultDownload: (album: Album) => void;
}

export const DiscographyAndLinerNotesVault: React.FC<DiscographyProps> = ({
  albums,
  tracks,
  onOpenVaultDownload
}) => {
  const { currentTrack, isPlaying, playTrack, togglePlay, currentTime, seek, stemState, stemLevels, toggleStemMute, toggleStemSolo } = useAudioEngine();
  const { setEra } = useEraTheme();

  const [activeFilter, setActiveFilter] = useState<'all' | 'lp' | 'ep' | 'live'>('all');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>(albums[0]?.id || 'alb-nocturne-2026');
  const [rightPaneTab, setRightPaneTab] = useState<'lyrics' | 'gear' | 'vinyl'>('lyrics');
  const [viewMode, setViewMode] = useState<'vault' | 'grid'>('vault');

  const selectedAlbum = albums.find(a => a.id === selectedAlbumId) || albums[0];
  const albumTracks = tracks.filter(t => t.album_id === selectedAlbum?.id);

  const handleSelectAlbum = (album: Album) => {
    setSelectedAlbumId(album.id);
    setEra(album.era_key);
  };

  const currentMs = currentTime * 1000;
  const activeLyrics = currentTrack?.synced_lyrics_lrc || [];

  return (
    <section id="music" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Section Header & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-white/10">
        <div>
          <div className="text-xs font-mono text-[var(--era-accent)] uppercase tracking-widest mb-2 flex items-center gap-2">
            <span>01 // Complete Archival Catalog</span>
            <span className="w-1.5 h-1.5 rounded-full bg-signal-emerald animate-pulse" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold uppercase text-white tracking-tight">
            Discography & 4-Stem Vault
          </h2>
          <p className="mt-2 text-zinc-400 font-editorial italic text-base sm:text-lg">
            Direct access to analog master tapes, isolated stem tracks, and interactive studio telemetry.
          </p>
        </div>

        {/* View mode toggle & Era filter */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="flex p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeFilter === 'all' ? 'bg-white/15 text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All ({albums.length})
            </button>
            <button
              onClick={() => setActiveFilter('lp')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeFilter === 'lp' ? 'bg-white/15 text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Studio LPs (2)
            </button>
            <button
              onClick={() => setActiveFilter('ep')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeFilter === 'ep' ? 'bg-white/15 text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              EPs (1)
            </button>
          </div>

          <div className="flex p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={() => setViewMode('vault')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'vault' ? 'bg-[var(--era-accent)] text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Interactive Vault View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-[var(--era-accent)] text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Catalog Grid
            </button>
          </div>
        </div>
      </div>

      {/* Album Selector Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {albums.map(album => {
          const isSelected = album.id === selectedAlbumId;
          return (
            <button
              key={album.id}
              onClick={() => handleSelectAlbum(album)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-left transition-all whitespace-nowrap flex-shrink-0 ${
                isSelected
                  ? 'border-[var(--era-accent)] bg-white/[0.08] shadow-lg shadow-[var(--era-accent)]/15 text-white'
                  : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: album.era_theme_json.accent }}
              />
              <div>
                <div className="font-display font-bold text-xs uppercase tracking-wide">{album.title}</div>
                <div className="text-[10px] font-mono text-zinc-400">
                  {album.catalog_number} • {album.release_date.slice(0, 4)} {album.release_type.toUpperCase()}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Split-Pane Inspector or Grid View */}
      {viewMode === 'vault' ? (
        <div className="rounded-3xl border border-white/15 bg-[#101216] overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-2xl">
          {/* Left Pane: Tracklist, Stems Console & Controls (7 Cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Album Header bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                  <div className="text-[11px] font-mono text-[var(--era-accent)] uppercase tracking-wider">
                    {selectedAlbum.catalog_number} • RELEASED {selectedAlbum.release_date}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-display font-extrabold uppercase text-white tracking-tight mt-1">
                    {selectedAlbum.title}
                  </h3>
                </div>

                <button
                  onClick={() => onOpenVaultDownload(selectedAlbum)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-zinc-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[var(--era-secondary)]" />
                  <span>Download Lossless Press Pack</span>
                </button>
              </div>

              {/* Tactile 4-Channel Stem Isolator Strip */}
              <div className="rounded-2xl bg-black/60 border border-white/15 p-4 my-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--era-accent)]" />
                    <span>Live 4-Track Stem Isolator (Mute / Solo Channels)</span>
                  </div>
                  <span className="text-[10px] font-mono text-signal-emerald">● 60 FPS ACTIVE</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(['vocals', 'synths', 'drums', 'bass'] as (keyof StemMixerState)[]).map(ch => {
                    const st = stemState[ch];
                    const lvl = stemLevels[ch];
                    const names: Record<string, string> = {
                      vocals: 'Vocals',
                      synths: 'Synths',
                      drums: 'Drums',
                      bass: 'Bass'
                    };
                    return (
                      <div
                        key={ch}
                        className={`p-2.5 rounded-xl border transition-all ${
                          st.solo
                            ? 'border-[var(--era-accent)] bg-[var(--era-accent)]/10 text-white'
                            : st.muted
                            ? 'border-white/5 opacity-50 bg-black/40'
                            : 'border-white/10 bg-white/[0.03]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-1.5">
                          <span>{names[ch]}</span>
                          <span className="text-[10px] tabular-nums text-zinc-400">{lvl}%</span>
                        </div>
                        {/* Mini LED bar */}
                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-2">
                          <div
                            className="h-full rounded-full transition-all duration-75"
                            style={{
                              width: `${lvl}%`,
                              backgroundColor:
                                ch === 'vocals'
                                  ? '#10B981'
                                  : ch === 'synths'
                                  ? '#00F0FF'
                                  : ch === 'drums'
                                  ? '#FF6B00'
                                  : '#FF3366'
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono font-bold uppercase">
                          <button
                            onClick={() => toggleStemSolo(ch)}
                            className={`py-1 rounded text-center ${
                              st.solo
                                ? 'bg-[var(--era-accent)] text-white'
                                : 'bg-white/5 hover:bg-white/10 text-zinc-400'
                            }`}
                          >
                            Solo
                          </button>
                          <button
                            onClick={() => toggleStemMute(ch)}
                            className={`py-1 rounded text-center ${
                              st.muted
                                ? 'bg-signal-crimson text-white'
                                : 'bg-white/5 hover:bg-white/10 text-zinc-400'
                            }`}
                          >
                            {st.muted ? 'Muted' : 'Mute'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tracklist Table */}
              <div className="divide-y divide-white/5 font-mono text-sm">
                {albumTracks.map(track => {
                  const isCurrent = currentTrack?.id === track.id;
                  const isThisPlaying = isCurrent && isPlaying;

                  return (
                    <div
                      key={track.id}
                      onClick={() => (isCurrent ? togglePlay() : playTrack(track))}
                      className={`py-3.5 px-3 rounded-xl hover:bg-white/5 flex items-center justify-between cursor-pointer transition-colors ${
                        isCurrent ? 'bg-white/[0.06] text-white' : 'text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                        {/* Equalizer animation or track number */}
                        <div className="w-7 text-center font-mono text-xs flex-shrink-0">
                          {isThisPlaying ? (
                            <div className="flex items-end justify-center gap-0.5 h-4">
                              <span className="w-1 bg-[var(--era-accent)] animate-pulse h-3" />
                              <span className="w-1 bg-[var(--era-accent)] animate-pulse h-4" />
                              <span className="w-1 bg-[var(--era-accent)] animate-pulse h-2" />
                            </div>
                          ) : (
                            <span className="text-zinc-400">{track.track_number < 10 ? `0${track.track_number}` : track.track_number}</span>
                          )}
                        </div>

                        <div className="overflow-hidden">
                          <div className="font-sans font-bold text-sm sm:text-base truncate flex items-center gap-2">
                            <span>{track.title}</span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[var(--era-accent)]/20 text-[var(--era-accent)] border border-[var(--era-accent)]/30">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-2 mt-0.5">
                            <span>{track.bpm} BPM</span>
                            <span>•</span>
                            <span>{track.musical_key}</span>
                            {track.credits_json.collaborators.length > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-zinc-300">{track.credits_json.collaborators[0]}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0 text-xs text-zinc-400 font-mono">
                        <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px]">
                          4 Stems Ready
                        </span>
                        <span className="tabular-nums">
                          {Math.floor(track.duration_seconds / 60)}:
                          {(track.duration_seconds % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Pane: Segmented Liner Notes & Lyrics Reader (5 Cols) */}
          <div className="lg:col-span-5 bg-black/40 border-t lg:border-t-0 lg:border-l border-white/10 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Segmented Top Tabs */}
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-white/5 border border-white/10 mb-6 font-mono text-xs">
                <button
                  onClick={() => setRightPaneTab('lyrics')}
                  className={`py-2 px-1 rounded-lg text-center transition-colors text-[11px] truncate ${
                    rightPaneTab === 'lyrics'
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  📜 Lyrics
                </button>
                <button
                  onClick={() => setRightPaneTab('gear')}
                  className={`py-2 px-1 rounded-lg text-center transition-colors text-[11px] truncate ${
                    rightPaneTab === 'gear'
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  🎹 Studio Gear
                </button>
                <button
                  onClick={() => setRightPaneTab('vinyl')}
                  className={`py-2 px-1 rounded-lg text-center transition-colors text-[11px] truncate ${
                    rightPaneTab === 'vinyl'
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  💿 Pressing
                </button>
              </div>

              {/* Tab 1: Time-Synced Lyrics */}
              {rightPaneTab === 'lyrics' && (
                <div className="space-y-4 max-h-[440px] overflow-y-auto pr-2">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest pb-2 border-b border-white/5">
                    Click line to jump playback • Track: {currentTrack?.title}
                  </div>
                  {activeLyrics.length === 0 ? (
                    <div className="py-12 text-center text-zinc-400 font-mono text-xs">
                      No timestamped lyric lines recorded for this track.
                    </div>
                  ) : (
                    activeLyrics.map((line, idx) => {
                      const isLineActive =
                        currentMs >= line.time_ms &&
                        (idx === activeLyrics.length - 1 || currentMs < activeLyrics[idx + 1].time_ms);
                      return (
                        <div
                          key={idx}
                          onClick={() => seek(line.time_ms / 1000)}
                          className={`p-2.5 rounded-lg cursor-pointer transition-all ${
                            isLineActive
                              ? 'bg-white/10 border-l-2 border-[var(--era-accent)] text-white'
                              : 'hover:bg-white/5 text-zinc-400'
                          }`}
                        >
                          <div className="text-[9px] font-mono text-zinc-400 mb-0.5">
                            {(line.time_ms / 1000).toFixed(1)}s
                          </div>
                          <div className={`font-editorial text-base sm:text-lg leading-relaxed ${isLineActive ? 'font-semibold italic text-white' : ''}`}>
                            {line.text}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Tab 2: Studio Hardware Gear & Provenance */}
              {rightPaneTab === 'gear' && (
                <div className="space-y-4 text-xs font-mono">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-widest pb-2 border-b border-white/5">
                    Physical Studio Hardware Chain
                  </div>

                  <div className="space-y-2">
                    <div className="text-zinc-300 font-bold text-xs uppercase tracking-wider text-[var(--era-accent)]">
                      Master Hardware on {currentTrack?.title}:
                    </div>
                    {currentTrack?.credits_json.studio_gear.map((gear, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center gap-2 text-zinc-300"
                      >
                        <Cpu className="w-3.5 h-3.5 text-signal-cyan flex-shrink-0" />
                        <span>{gear}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <div className="text-zinc-400 font-bold mb-1">Mixing & Tape Engine:</div>
                    <div className="text-zinc-300 font-sans leading-relaxed text-xs">
                      {currentTrack?.credits_json.mix_engineer || "Hansa Tonstudio, Berlin"}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-[11px] font-editorial italic text-zinc-300">
                    "{selectedAlbum.liner_notes_md}"
                  </div>
                </div>
              )}

              {/* Tab 3: Vinyl Pressing Specs */}
              {rightPaneTab === 'vinyl' && (
                <div className="space-y-4 text-xs font-mono">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-widest pb-2 border-b border-white/5">
                    Master Audiophile Specification
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                      <CheckCircle2 className="w-4 h-4 text-signal-emerald flex-shrink-0" />
                      <span>180-Gram High-Density Virgin Vinyl Formulation</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                      <CheckCircle2 className="w-4 h-4 text-signal-emerald flex-shrink-0" />
                      <span>425GSM Unbleached Reverse-Board Gatefold Jacket</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                      <CheckCircle2 className="w-4 h-4 text-signal-emerald flex-shrink-0" />
                      <span>Direct-to-Metal Mastering & Lacquer Cut by Sterling Sound</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                      <CheckCircle2 className="w-4 h-4 text-signal-emerald flex-shrink-0" />
                      <span>24-Page Full Color Archival Lyric & Synth Patch Book</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--era-accent)]/10 border border-[var(--era-accent)]/30 text-white">
                    <div className="font-bold mb-1">Digital Vault Guarantee:</div>
                    <div className="text-[11px] text-zinc-300 font-sans">
                      Every physical copy includes instant midnight 24-bit/96kHz WAV, FLAC, and 320kbps MP3 vault downloads.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Studio Provenance Footer */}
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>Tape: 2-Inch 16-Track Ampex</span>
              <span className="text-[var(--era-accent)]">Voltage Controlled</span>
            </div>
          </div>
        </div>
      ) : (
        /* Catalog Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map(album => (
            <div
              key={album.id}
              onClick={() => handleSelectAlbum(album)}
              className="rounded-2xl border border-white/15 bg-[#101216] p-5 cursor-pointer hover:border-[var(--era-accent)] transition-all group"
            >
              <div className="aspect-square rounded-xl overflow-hidden mb-4 relative bg-black">
                <img
                  src={album.cover_art_url}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono border border-white/20 text-white">
                  {album.release_type.toUpperCase()}
                </div>
              </div>
              <div className="text-[10px] font-mono text-[var(--era-accent)] uppercase">{album.catalog_number}</div>
              <h4 className="text-xl font-display font-extrabold text-white uppercase mt-0.5">{album.title}</h4>
              <p className="text-xs text-zinc-400 font-editorial italic mt-2 line-clamp-2">
                "{album.liner_notes_md}"
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

