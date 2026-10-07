import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  PetEntity,
  FoodItem,
  VirtualPetGameState,
  SyncResponse,
  LifeStage,
} from '../types/pet';
import { INITIAL_FOODS } from '../lib/speciesData';
import { sound } from '../lib/sound';

export function usePetEngine() {
  const [pet, setPet] = useState<PetEntity | null>(null);
  const [inventory, setInventory] = useState<FoodItem[]>(INITIAL_FOODS);
  const [coins, setCoins] = useState<number>(150);
  const [activeTool, setActiveTool] = useState<VirtualPetGameState['activeTool']>('HAND');
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>('sun_berry');
  const [dayNightPhase, setDayNightPhase] = useState<'DAWN' | 'DAY' | 'DUSK' | 'NIGHT'>('DAY');
  const [offlineReport, setOfflineReport] = useState<SyncResponse['offlineReport'] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [isEvolutionOpen, setIsEvolutionOpen] = useState(false);
  const [isPlaydateOpen, setIsPlaydateOpen] = useState(false);
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [isFeedingDrawerOpen, setIsFeedingDrawerOpen] = useState(false);
  const [isIncubatorOpen, setIsIncubatorOpen] = useState(false);
  const [evolutionCandidate, setEvolutionCandidate] = useState<{
    canEvolve: boolean;
    nextSpeciesId: string | null;
    nextStage: LifeStage | null;
    explanation: string;
  } | null>(null);

  const petRef = useRef<PetEntity | null>(null);
  petRef.current = pet;

  // Resolve Day/Night phase from local system hour
  const updateDayNight = useCallback(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 8) setDayNightPhase('DAWN');
    else if (hour >= 8 && hour < 17) setDayNightPhase('DAY');
    else if (hour >= 17 && hour < 20) setDayNightPhase('DUSK');
    else setDayNightPhase('NIGHT');
  }, []);

  // Sync pet state with authoritative backend
  const syncWithBackend = useCallback(async (silent = false) => {
    try {
      const currentId = petRef.current?.id || 'pet_main';
      const res = await fetch(`/api/pet/${currentId}/sync`);
      if (res.ok) {
        const data: SyncResponse = await res.json();
        setPet(data.pet);
        if (!silent && data.offlineReport && data.offlineReport.hoursAway > 0.05) {
          setOfflineReport(data.offlineReport);
        }
      }
    } catch (e) {
      console.warn('[Sync] Offline fallback active:', e);
    }
  }, []);

  // Fetch foods inventory
  const fetchInventory = useCallback(async () => {
    try {
      const res = await fetch('/api/foods');
      if (res.ok) {
        const data = await res.json();
        if (data.inventory && data.inventory.length > 0) {
          setInventory(data.inventory);
        }
      }
    } catch {
      // Keep initial foods
    }
  }, []);

  // Initial load
  useEffect(() => {
    updateDayNight();
    const initPet = async () => {
      try {
        const res = await fetch('/api/pet/current');
        if (res.ok) {
          const data = await res.json();
          setPet(data.pet);
          if (data.pet.stage === 'EGG') {
            setIsIncubatorOpen(true);
          }
          await syncWithBackend(false);
        }
      } catch (err) {
        console.error('Failed to init pet:', err);
      } finally {
        await fetchInventory();
        setLoading(false);
      }
    };

    initPet();
  }, [syncWithBackend, fetchInventory, updateDayNight]);

  // Periodic authoritative sync every 20 seconds & on browser tab focus
  useEffect(() => {
    const interval = setInterval(() => {
      syncWithBackend(true);
      updateDayNight();
    }, 20000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncWithBackend(false);
        updateDayNight();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [syncWithBackend, updateDayNight]);

  // Dispatch game action with server authoritative verification
  const dispatchAction = useCallback(
    async (
      action: 'HATCH' | 'FEED' | 'CLEAN' | 'PET' | 'PLAY' | 'SLEEP_TOGGLE' | 'MEDICINE',
      foodId?: string
    ) => {
      if (!petRef.current) return;

      try {
        const res = await fetch('/api/pet/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            petId: petRef.current.id,
            action,
            foodId,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setPet(data.pet);
          if (data.inventory) {
            setInventory(data.inventory);
          }
          if (data.evolutionStatus) {
            setEvolutionCandidate({
              canEvolve: data.evolutionStatus.canEvolve,
              nextSpeciesId: data.evolutionStatus.nextSpeciesId,
              nextStage: data.evolutionStatus.nextStage,
              explanation: data.evolutionStatus.prerequisiteExplanation,
            });
          }

          // Sound and tactile responses
          if (action === 'PET') {
            sound.playPurr();
            sound.playChirp(true);
          } else if (action === 'CLEAN') {
            sound.playBubbleScrub();
          } else if (action === 'PLAY') {
            sound.playBallBounce(1.2);
            sound.playChirp(true);
            setCoins((c) => c + 15);
          } else if (action === 'SLEEP_TOGGLE') {
            sound.playChirp(!data.pet.isSleeping);
          }
        }
      } catch (err) {
        console.error('Action failed:', err);
      }
    },
    []
  );

  // Trigger Evolution Mutation
  const triggerEvolution = useCallback(async () => {
    if (!petRef.current) return;
    try {
      const res = await fetch('/api/pet/evolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petId: petRef.current.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setPet(data.pet);
        setEvolutionCandidate(null);
        sound.playEvolutionFanfare();
        return data;
      }
    } catch (err) {
      console.error('Evolution error:', err);
    }
  }, []);

  // Rename pet
  const renamePet = useCallback(async (newName: string) => {
    if (!petRef.current) return;
    try {
      const res = await fetch('/api/pet/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petId: petRef.current.id, name: newName }),
      });
      if (res.ok) {
        setPet((prev) => (prev ? { ...prev, name: newName } : null));
      }
    } catch (err) {
      console.error('Rename error:', err);
    }
  }, []);

  // Keyboard hotkeys: 1-5 tool selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.key) {
        case '1':
          setActiveTool('HAND');
          sound.playChirp(true);
          break;
        case '2':
          setActiveTool('SPONGE');
          sound.playBubbleScrub();
          break;
        case '3':
          setActiveTool('FOOD_DROPPER');
          setIsFeedingDrawerOpen((prev) => !prev);
          break;
        case '4':
          setActiveTool('BALL');
          dispatchAction('PLAY');
          break;
        case '5':
          dispatchAction('SLEEP_TOGGLE');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatchAction]);

  return {
    pet,
    setPet,
    inventory,
    coins,
    setCoins,
    activeTool,
    setActiveTool,
    selectedFoodId,
    setSelectedFoodId,
    dayNightPhase,
    offlineReport,
    setOfflineReport,
    loading,
    dispatchAction,
    triggerEvolution,
    renamePet,
    evolutionCandidate,
    // Modals
    isEvolutionOpen,
    setIsEvolutionOpen,
    isPlaydateOpen,
    setIsPlaydateOpen,
    isPassportOpen,
    setIsPassportOpen,
    isFeedingDrawerOpen,
    setIsFeedingDrawerOpen,
    isIncubatorOpen,
    setIsIncubatorOpen,
  };
}
