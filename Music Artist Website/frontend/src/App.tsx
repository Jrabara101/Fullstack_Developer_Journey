import React, { useState, useEffect } from 'react';
import { EraThemeProvider } from './context/EraThemeContext';
import { AudioEngineProvider } from './context/AudioEngineContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { EraHeroAndLatestReleaseStage } from './components/EraHeroAndLatestReleaseStage';
import { PersistentHardwareAudioDock } from './components/PersistentHardwareAudioDock';
import { StemMixerDrawer } from './components/StemMixerDrawer';
import { SyncedLyricsModal } from './components/SyncedLyricsModal';
import { DiscographyAndLinerNotesVault } from './components/DiscographyAndLinerNotesVault';
import { GeoTourDatesAndSetlistHub } from './components/GeoTourDatesAndSetlistHub';
import { MerchAndVinylBoutique } from './components/MerchAndVinylBoutique';
import { OmniMediaTheaterGrid } from './components/OmniMediaTheaterGrid';
import { UnifiedCartAndBundleDrawer } from './components/UnifiedCartAndBundleDrawer';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { BackstagePresaleModal } from './components/BackstagePresaleModal';
import { LinerNotesDeepDiveModal } from './components/LinerNotesDeepDiveModal';
import { Footer } from './components/Footer';

import {
  INITIAL_ALBUMS,
  INITIAL_TRACKS,
  INITIAL_TOUR_DATES,
  INITIAL_PAST_SHOWS,
  INITIAL_MERCH,
  INITIAL_MEDIA,
  INITIAL_LEADERBOARD
} from './data/mockData';
import { Album, Track, TourDate, PastShow, MerchProduct, MediaSession, CityDemandLeader } from './types';

export const AppContent: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>(INITIAL_ALBUMS);
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [tourDates, setTourDates] = useState<TourDate[]>(INITIAL_TOUR_DATES);
  const [pastShows, setPastShows] = useState<PastShow[]>(INITIAL_PAST_SHOWS);
  const [merch, setMerch] = useState<MerchProduct[]>(INITIAL_MERCH);
  const [media, setMedia] = useState<MediaSession[]>(INITIAL_MEDIA);
  const [leaderboard, setLeaderboard] = useState<CityDemandLeader[]>(INITIAL_LEADERBOARD);

  // Modals state
  const [backstageModalOpen, setBackstageModalOpen] = useState(false);
  const [linerNotesModalOpen, setLinerNotesModalOpen] = useState(false);
  const [selectedLinerAlbum, setSelectedLinerAlbum] = useState<Album>(INITIAL_ALBUMS[0]);

  // Try fetching live data from backend
  useEffect(() => {
    fetch('http://localhost:4000/api/v1/albums')
      .then(res => res.json())
      .then(data => {
        if (data.albums) setAlbums(data.albums);
      })
      .catch(() => {});

    fetch('http://localhost:4000/api/v1/tracks')
      .then(res => res.json())
      .then(data => {
        if (data.tracks) setTracks(data.tracks);
      })
      .catch(() => {});

    fetch('http://localhost:4000/api/v1/tour/dates')
      .then(res => res.json())
      .then(data => {
        if (data.tour_dates) setTourDates(data.tour_dates);
      })
      .catch(() => {});

    fetch('http://localhost:4000/api/v1/merch/products')
      .then(res => res.json())
      .then(data => {
        if (data.products) setMerch(data.products);
      })
      .catch(() => {});
  }, []);

  const featuredTrack = tracks[0] || INITIAL_TRACKS[0];
  const featuredVinylProduct = merch.find(m => m.category === 'vinyl') || merch[0] || INITIAL_MERCH[0];

  const handleOpenLinerNotes = (album?: Album) => {
    setSelectedLinerAlbum(album || albums[0]);
    setLinerNotesModalOpen(true);
  };

  const handleOpenVaultDownload = (album: Album) => {
    setSelectedLinerAlbum(album);
    setLinerNotesModalOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[var(--era-bg,#07080A)] text-white film-grain selection:bg-[var(--era-accent)]/30 selection:text-white transition-colors duration-700">
      {/* Sticky Studio Top Navigation Bar */}
      <Navbar onOpenBackstage={() => setBackstageModalOpen(true)} />

      {/* Main Content Blueprint */}
      <main className="relative z-10 pb-28">
        {/* A. Era Hero Stage & Latest Release */}
        <EraHeroAndLatestReleaseStage
          featuredTrack={featuredTrack}
          featuredVinylProduct={featuredVinylProduct}
          onOpenLinerNotes={() => handleOpenLinerNotes(albums[0])}
        />

        {/* B. Interactive Discography, 4-Stem Mixer & Liner-Notes Vault */}
        <DiscographyAndLinerNotesVault
          albums={albums}
          tracks={tracks}
          onOpenVaultDownload={handleOpenVaultDownload}
        />

        {/* C. Geo-Targeted Tour Dates, Nearest Spotlight & Setlist Archive */}
        <GeoTourDatesAndSetlistHub
          upcomingDates={tourDates}
          pastShows={pastShows}
          leaderboard={leaderboard}
        />

        {/* D. Direct-to-Fan Vinyl Pressing Matrix & Merch Atelier */}
        <MerchAndVinylBoutique products={merch} />

        {/* E. Omni-Platform Cinema Media Theater */}
        <OmniMediaTheaterGrid sessions={media} />

        {/* Master Footer */}
        <Footer />
      </main>

      {/* Persistent Bottom Hardware Audio Dock */}
      <PersistentHardwareAudioDock />

      {/* Slide-Up 4-Track Stem Console */}
      <StemMixerDrawer />

      {/* Interactive Time-Synced Karaoke Lyrics */}
      <SyncedLyricsModal />

      {/* Slide-Over Bag & Unified Checkout */}
      <UnifiedCartAndBundleDrawer upcomingDates={tourDates} />

      {/* Order Confirmed / Cryptographic Pass & Vault Token Modal */}
      <OrderSuccessModal />

      {/* Backstage SMS & Presale Fan Modal */}
      <BackstagePresaleModal
        isOpen={backstageModalOpen}
        onClose={() => setBackstageModalOpen(false)}
      />

      {/* Fullscreen Technical Liner Notes Dossier */}
      <LinerNotesDeepDiveModal
        album={selectedLinerAlbum}
        isOpen={linerNotesModalOpen}
        onClose={() => setLinerNotesModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <EraThemeProvider>
      <AudioEngineProvider initialTracks={INITIAL_TRACKS}>
        <CartProvider defaultTourDate={INITIAL_TOUR_DATES[0]}>
          <AppContent />
        </CartProvider>
      </AudioEngineProvider>
    </EraThemeProvider>
  );
}
