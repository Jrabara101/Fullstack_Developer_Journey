import React, { useState, useEffect } from 'react';
import { SAMPLE_VIDEOS, getVideoByUlid } from './data/sampleVideos';
import { Video } from './types/video';
import { Header } from './components/Header';
import { StreamingCatalogHome } from './components/Catalog/StreamingCatalogHome';
import { CinemaWatchStage } from './components/Player/CinemaWatchStage';
import { CreatorUploadAndTranscodeStudio } from './components/Studio/CreatorUploadAndTranscodeStudio';

export function App() {
  const [currentView, setCurrentView] = useState<'catalog' | 'watch' | 'studio'>('watch');
  const [selectedUlid, setSelectedUlid] = useState<string>(SAMPLE_VIDEOS[0].ulid);
  const [searchFilter, setSearchFilter] = useState('');
  const [publishToast, setPublishToast] = useState<string | null>(null);

  // Check URL parameters for direct deep-linking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const videoParam = params.get('v') || params.get('watch');
    if (videoParam) {
      setSelectedUlid(videoParam);
      setCurrentView('watch');
    }
  }, []);

  const activeVideo = getVideoByUlid(selectedUlid);

  const handleSelectVideo = (ulid: string) => {
    setSelectedUlid(ulid);
    setCurrentView('watch');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePublishSuccess = () => {
    setCurrentView('catalog');
    setPublishToast('🎉 Your video was published to the master catalog with 720p Fast-Start active!');
    setTimeout(() => setPublishToast(null), 5000);
  };

  // Filtered catalog videos if search is entered in header
  const displayedVideos = searchFilter.trim()
    ? SAMPLE_VIDEOS.filter(
        (v) =>
          v.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
          v.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
          v.channelName.toLowerCase().includes(searchFilter.toLowerCase())
      )
    : SAMPLE_VIDEOS;

  return (
    <div className="min-h-screen bg-[#07080A] text-[#F8FAFC] flex flex-col antialiased">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onNavigateCatalog={() => setCurrentView('catalog')}
        onNavigateStudio={() => setCurrentView('studio')}
        onSearchSubmit={(query) => {
          setSearchFilter(query);
          setCurrentView('catalog');
        }}
      />

      {/* Global Success Notification Toast */}
      {publishToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-950/95 border border-emerald-400 text-emerald-200 px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-toast-slide-up">
          <span>{publishToast}</span>
        </div>
      )}

      {/* Main Viewport Content */}
      <main className="flex-1">
        {currentView === 'catalog' && (
          <StreamingCatalogHome
            videos={displayedVideos}
            onSelectVideo={handleSelectVideo}
            onOpenUploadStudio={() => setCurrentView('studio')}
          />
        )}

        {currentView === 'watch' && (
          <CinemaWatchStage video={activeVideo} />
        )}

        {currentView === 'studio' && (
          <CreatorUploadAndTranscodeStudio
            onBackToCatalog={() => setCurrentView('catalog')}
            onPublishSuccess={handlePublishSuccess}
          />
        )}
      </main>

      {/* Cinema Footer */}
      <footer className="border-t border-white/10 py-8 px-6 text-center text-xs text-slate-500 font-mono">
        <div className="flex flex-wrap items-center justify-center gap-6 mb-2 text-slate-400">
          <button onClick={() => setCurrentView('catalog')} className="hover:text-white transition">Catalog Home</button>
          <button onClick={() => setCurrentView('studio')} className="hover:text-white transition">Creator Transcode Studio</button>
          <button onClick={() => setCurrentView('watch')} className="hover:text-white transition">Watch Cinema Player</button>
        </div>
        <p>© 2026 CINESTREAM Media Architecture • High-Bitrate HLS ABR & Resumable Multipart Platform</p>
      </footer>
    </div>
  );
}

export default App;
