import React, { useState } from 'react';
import { Users, Search, MapPin, Sparkles, Utensils, Check } from 'lucide-react';
import { TableSeating } from '../../types/editorial';
import { sounds } from '../../services/soundEffects';

interface SeatingExplorerProps {
  tables: TableSeating[];
  initialGuestName?: string;
}

export const SeatingExplorer: React.FC<SeatingExplorerProps> = ({
  tables,
  initialGuestName = '',
}) => {
  const [searchName, setSearchName] = useState<string>(initialGuestName);
  const [selectedTableId, setSelectedTableId] = useState<string>(tables[1]?.id || tables[0]?.id);

  // Find table where matching guest is seated
  const matchingTable = tables.find((t) =>
    t.guests.some((g) => g.name.toLowerCase().includes(searchName.toLowerCase()))
  );

  const activeTable = matchingTable || tables.find((t) => t.id === selectedTableId) || tables[0];

  const handleSelectTable = (tblId: string) => {
    setSelectedTableId(tblId);
    sounds.playCardSnap();
  };

  return (
    <section className="max-w-5xl mx-auto px-4 py-16 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber-700 font-bold block">
            FLOORPLAN & TABLEMATES
          </span>
          <h2 className="text-3xl font-serif text-stone-900 mt-1">Interactive Seating Explorer</h2>
          <p className="text-xs text-stone-500 mt-1 max-w-lg">
            Type your name to locate your reserved table or explore assigned seating and breakout sessions.
          </p>
        </div>

        {/* Guest Name Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Type your name (e.g. Sarah Smith)..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-white rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs text-stone-800"
          />
        </div>
      </div>

      {/* Seating Explorer Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Floorplan Layout Canvas (5 Columns) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#FAF6F0] border border-[#E8DFC8] shadow-sm space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-mono font-bold uppercase text-[10px] tracking-wider text-amber-800">
              ORANGERIE BANQUET FLOORPLAN
            </span>
            <span className="text-[10px] font-mono">Stage / Head Table ▲</span>
          </div>

          {/* Interactive Table Pods */}
          <div className="grid grid-cols-2 gap-4 py-4">
            {tables.map((t) => {
              const isSelected = activeTable.id === t.id;
              const hasMatchingSearch =
                searchName.trim() &&
                t.guests.some((g) => g.name.toLowerCase().includes(searchName.toLowerCase()));

              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTable(t.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer select-none text-center flex flex-col items-center justify-center min-h-[130px] ${
                    isSelected || hasMatchingSearch
                      ? 'bg-white border-amber-600 shadow-lg ring-4 ring-amber-500/20 scale-103'
                      : 'bg-white/80 border-[#DECDB3] hover:border-amber-300'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-serif text-sm font-bold mb-2 ${
                      isSelected || hasMatchingSearch
                        ? 'bg-amber-600 text-white border-amber-700'
                        : 'bg-stone-100 text-stone-700 border-stone-300'
                    }`}
                  >
                    {t.name.split(':')[0].replace('Table ', 'T')}
                  </div>

                  <span className="text-xs font-serif font-bold text-stone-900 block truncate max-w-full">
                    {t.name.split(':')[1]?.trim() || t.name}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {t.guests.length} / {t.capacity} Seated
                  </span>

                  {hasMatchingSearch && (
                    <span className="mt-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold font-mono">
                      Your Table ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-stone-400 text-center font-serif italic pt-2 border-t border-[#E8DFC8]">
            Click any table pod to inspect seated guests & arrangements
          </div>
        </div>

        {/* Selected Table Detail View (7 Columns) */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-amber-700 uppercase">
                {activeTable.category}
              </span>
              <h3 className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
                {activeTable.name}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-bold self-start sm:self-auto">
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span>{activeTable.guests.length} Confirmed Guests</span>
            </div>
          </div>

          {/* Tablemates List */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 font-mono">
              Seated Companions:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeTable.guests.map((guest, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-stone-50 border border-stone-100 flex items-center gap-3"
                >
                  <img
                    src={guest.avatar}
                    alt={guest.name}
                    className="w-10 h-10 rounded-full object-cover border border-stone-200"
                  />
                  <div>
                    <div className="text-xs font-bold text-stone-900 font-serif">{guest.name}</div>
                    <div className="text-[11px] text-stone-500">{guest.relation}</div>
                    {guest.dietary && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-medium mt-0.5">
                        <Utensils className="w-2.5 h-2.5" /> {guest.dietary}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Table Atmosphere Icebreaker */}
          <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8DFC8] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#8C6239]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Table Icebreaker & Story Prompt:</span>
            </div>
            <p className="text-xs text-stone-700 italic font-serif leading-relaxed">
              "What is your most adventurous memory with Elena or Julian over the past decade?"
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

