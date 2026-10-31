import React, { useState, useEffect } from 'react';
import { generatePackingChecklist } from '../services/weatherEngine';
import { TravelChecklistCategory } from '../types/weather';

interface TravelPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLocationId: string;
}

export const TravelPackModal: React.FC<TravelPackModalProps> = ({
  isOpen,
  onClose,
  initialLocationId
}) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocationId);
  const [tripDays, setTripDays] = useState(3);
  const [categories, setCategories] = useState<TravelChecklistCategory[]>([]);
  const [customItemName, setCustomItemName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCategories(generatePackingChecklist(selectedLocation, tripDays));
    }
  }, [isOpen, selectedLocation, tripDays]);

  if (!isOpen) return null;

  const toggleItem = (catIdx: number, itemId: string) => {
    setCategories(prev =>
      prev.map((cat, i) => {
        if (i !== catIdx) return cat;
        return {
          ...cat,
          items: cat.items.map(item =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          )
        };
      })
    );
  };

  const addCustomItem = (catIdx: number) => {
    if (!customItemName.trim()) return;
    setCategories(prev =>
      prev.map((cat, i) => {
        if (i !== catIdx) return cat;
        return {
          ...cat,
          items: [
            ...cat.items,
            {
              id: `custom-${Date.now()}`,
              name: customItemName.trim(),
              reason: 'Personal travel preference',
              checked: false
            }
          ]
        };
      })
    );
    setCustomItemName('');
  };

  const totalItems = categories.reduce((acc, cat) => acc + cat.items.length, 0);
  const packedItems = categories.reduce((acc, cat) => acc + cat.items.filter(i => i.checked).length, 0);
  const progressPercent = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-[24px] bg-[#141b2c] border border-white/25 shadow-[0_24px_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">luggage</span>
            </span>
            <div>
              <h2 className="text-xl font-semibold text-white">Travel / Trip Packing Mode</h2>
              <p className="text-xs text-white/60">
                Weather-synthesized smart packing checklist based on local forecasts & historical climate
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white/80"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Destination & Length Controls */}
        <div className="p-6 bg-surface-container-lowest/40 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs uppercase font-semibold text-white/60">Destination:</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm outline-none focus:border-primary"
            >
              <option value="kyoto" className="bg-[#141b2c]">Kyoto (Late Autumn 21° / Rain)</option>
              <option value="osaka" className="bg-[#141b2c]">Osaka (Bay Breeze 22°)</option>
              <option value="hakuba" className="bg-[#141b2c]">Hakuba (Alpine Cold 9° / Frost)</option>
              <option value="manila" className="bg-[#141b2c]">Manila (Tropical Sun 31°)</option>
              <option value="reykjavik" className="bg-[#141b2c]">Reykjavík (Sub-polar Gales 4° / Aurora)</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs uppercase font-semibold text-white/60">Trip Length:</label>
            <div className="flex items-center gap-1 bg-white/10 p-1 rounded-full border border-white/15">
              {[2, 3, 5, 7].map(days => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setTripDays(days)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    tripDays === days ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-6 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white/80">Packing Preparedness:</span>
            <span className="text-xs text-primary font-bold">{packedItems} of {totalItems} items packed</span>
          </div>
          <div className="flex items-center gap-2 w-48">
            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-[#34D399] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="text-xs font-metric-value text-white tabular-nums w-8 text-right">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Checklist Categories List */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          {categories.map((category, catIdx) => (
            <div key={catIdx} className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider">
                <span className="material-symbols-outlined text-[18px]">{category.icon}</span>
                <span>{category.title}</span>
              </div>

              <div className="flex flex-col gap-2">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(catIdx, item.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      item.checked
                        ? 'bg-white/15 border-primary/50 text-white'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          item.checked
                            ? 'bg-primary border-primary text-on-primary'
                            : 'border-white/40 bg-transparent'
                        }`}
                      >
                        {item.checked && (
                          <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm font-medium ${item.checked ? 'line-through text-white/60' : 'text-white'}`}>
                          {item.name}
                        </span>
                        <span className="text-xs text-white/50">{item.reason}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Quick custom item entry */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 mt-2">
            <span className="material-symbols-outlined text-white/50">add_task</span>
            <input
              type="text"
              placeholder="Add personal gear item (e.g. Travel adapter, Earplugs)..."
              value={customItemName}
              onChange={(e) => setCustomItemName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomItem(0)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-white/40"
            />
            <button
              type="button"
              onClick={() => addCustomItem(0)}
              className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-xs text-white font-medium"
            >
              Add Item
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-surface-container-lowest/60 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-white/50">
            Checklist saves automatically in your session.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-primary text-on-primary font-medium text-sm hover:bg-primary/90 transition-colors shadow-md"
          >
            Done Packing
          </button>
        </div>
      </div>
    </div>
  );
};

