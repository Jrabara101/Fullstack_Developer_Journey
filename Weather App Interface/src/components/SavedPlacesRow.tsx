import React, { useState } from 'react';
import { SavedPlaceSummary } from '../types/weather';

interface SavedPlacesRowProps {
  currentLocationId: string;
  onSelectPlace: (placeId: string) => void;
  onAddNewPlace: (name: string, label: string) => void;
}

export const SavedPlacesRow: React.FC<SavedPlacesRowProps> = ({
  currentLocationId,
  onSelectPlace,
  onAddNewPlace
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customLabel, setCustomLabel] = useState('');

  const places: SavedPlaceSummary[] = [
    {
      id: 'kyoto',
      name: 'Kyoto',
      customLabel: 'Home · Kyoto',
      temp: 21,
      conditionIcon: 'wb_sunny',
      conditionText: 'Golden twilight',
      skyState: 'golden-hour',
      sunHoursLeft: 5.8,
      isActive: currentLocationId === 'kyoto'
    },
    {
      id: 'osaka',
      name: 'Osaka',
      customLabel: "Parents' House · Osaka",
      temp: 22,
      conditionIcon: 'partly_cloudy_day',
      conditionText: 'Mild dusk',
      skyState: 'golden-hour',
      sunHoursLeft: 6.2,
      isActive: currentLocationId === 'osaka'
    },
    {
      id: 'hakuba',
      name: 'Hakuba',
      customLabel: 'Weekend Cabin · Hakuba',
      temp: 9,
      conditionIcon: 'air',
      conditionText: 'Alpine overcast',
      skyState: 'overcast',
      sunHoursLeft: 2.1,
      isActive: currentLocationId === 'hakuba'
    },
    {
      id: 'manila',
      name: 'Manila',
      customLabel: 'Manila',
      temp: 31,
      conditionIcon: 'sunny',
      conditionText: 'Tropical sun',
      skyState: 'clear-noon',
      sunHoursLeft: 7.5,
      isActive: currentLocationId === 'manila'
    }
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (customName) {
      onAddNewPlace(customName, customLabel || customName);
      setCustomName('');
      setCustomLabel('');
      setShowAddModal(false);
    }
  };

  return (
    <>
      <section className="w-full flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none [mask-image:linear-gradient(to_right,white_90%,transparent)]">
        {places.map((place) => {
          const isActive = place.isActive;
          return (
            <button
              key={place.id}
              type="button"
              onClick={() => onSelectPlace(place.id)}
              className={`h-9 px-3.5 rounded-full font-body-sm text-body-sm flex items-center gap-2 shrink-0 transition-all ${
                isActive
                  ? 'bg-white/20 dark:bg-surface-container-high/70 backdrop-blur-xl border border-white/30 text-on-surface shadow-[0_4px_16px_rgba(0,0,0,0.18)] scale-[1.02]'
                  : 'bg-white/10 dark:bg-surface-container-low/40 backdrop-blur-lg border border-white/15 hover:bg-white/15 text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse shrink-0"></span>
              )}
              <span className={`material-symbols-outlined text-[17px] ${isActive ? 'text-tertiary' : 'text-secondary'}`}>
                {place.conditionIcon}
              </span>
              <span className={isActive ? 'font-medium text-white' : ''}>
                {place.customLabel}
              </span>
              <span className={`font-metric-value text-metric-value tabular-nums ${isActive ? 'font-semibold text-white' : ''}`}>
                {place.temp}°
              </span>
            </button>
          );
        })}

        {/* Add custom place pill */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="h-9 px-3 rounded-full bg-white/5 hover:bg-white/15 border border-dashed border-white/20 text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm flex items-center gap-1 shrink-0 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Add</span>
        </button>
      </section>

      {/* Add Custom Place Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-surface-container-high p-6 border border-white/20 shadow-2xl flex flex-col gap-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">bookmark_add</span>
                Save Location
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-white/60 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-sm text-white/70">
              Save a destination to your quick-access bar with a personalized routine label.
            </p>

            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <div>
                <label className="text-xs uppercase tracking-wider text-white/60 block mb-1">
                  City or Landmark Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kyoto, Hakuba, London"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 outline-none focus:border-primary text-white text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-white/60 block mb-1">
                  Custom Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vacation Villa, Favorite Trail"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 outline-none focus:border-primary text-white text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full text-sm text-white/70 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-primary text-on-primary font-medium text-sm shadow-md hover:bg-primary/90 transition-colors"
                >
                  Save Place
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

