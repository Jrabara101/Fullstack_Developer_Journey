import { useState } from 'react';
import type { FoodItem, FoodCategory } from '../types/pet';
import { X, Sparkles, Plus } from 'lucide-react';

interface FeedingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: FoodItem[];
  selectedFoodId: string | null;
  onSelectFood: (food: FoodItem) => void;
  onFeedItem: (foodId: string) => void;
}

export const FeedingDrawer: React.FC<FeedingDrawerProps> = ({
  isOpen,
  onClose,
  inventory,
  selectedFoodId,
  onSelectFood,
  onFeedItem,
}) => {
  const [activeCategory, setActiveCategory] = useState<FoodCategory | 'ALL'>('ALL');

  if (!isOpen) return null;

  const filteredFoods =
    activeCategory === 'ALL'
      ? inventory
      : inventory.filter((f) => f.category === activeCategory);

  return (
    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="glass-modal w-full max-w-xl rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col gap-4 border border-slate-700/60 max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧺</span>
            <div>
              <h2 className="text-base font-bold text-white">Nursery Pantry & Nutrition</h2>
              <p className="text-xs text-slate-400">Diet choices shape your companion's epigenetic evolution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(['ALL', 'FRUIT', 'MEAT', 'SWEET', 'MEDICINE'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Food Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-y-auto max-h-[50vh] pr-1">
          {filteredFoods.map((food) => {
            const isSelected = selectedFoodId === food.id;
            const isOutOfStock = food.quantity <= 0;

            return (
              <div
                key={food.id}
                onClick={() => {
                  if (!isOutOfStock) onSelectFood(food);
                }}
                className={`p-3 rounded-xl border transition flex flex-col justify-between gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-950/60 border-indigo-500/80 shadow-lg shadow-indigo-950/50'
                    : isOutOfStock
                    ? 'bg-slate-900/40 border-slate-800/50 opacity-50 cursor-not-allowed'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl p-1 bg-slate-800/80 rounded-lg">{food.icon}</span>
                    <div>
                      <h4 className="font-bold text-sm text-white">{food.name}</h4>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {food.category} • In Stock: <strong className="text-indigo-400">{food.quantity}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Feed Button */}
                  <button
                    disabled={isOutOfStock}
                    onClick={(e) => {
                      e.stopPropagation();
                      onFeedItem(food.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                      isOutOfStock
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Feed
                  </button>
                </div>

                <p className="text-xs text-slate-300">{food.description}</p>

                {/* Epigenetic & Nutrition Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-800/60 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                    +{food.hungerRestore}% Satiety
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    +{food.happinessRestore}% Joy
                  </span>
                  {food.epigeneticModifiers.proteinIntake && (
                    <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" />
                      +{food.epigeneticModifiers.proteinIntake} Protein (Drake)
                    </span>
                  )}
                  {food.epigeneticModifiers.sugarIntake && (
                    <span className="px-1.5 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" />
                      +{food.epigeneticModifiers.sugarIntake} Sugar (Wisp)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
