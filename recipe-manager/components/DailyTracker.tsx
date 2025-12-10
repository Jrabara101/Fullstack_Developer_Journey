'use client';

import { useEffect, useState, useRef, useId } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaUtensils, FaSearch, FaPlus, FaTrash } from 'react-icons/fa';
import axios from 'axios';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  quantity: number;
}

export default function DailyTracker() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [foodLog, setFoodLog] = useState<FoodItem[]>([]);
  const [totals, setTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>('');
  const sectionRef = useRef<HTMLElement>(null);
  const idCounterRef = useRef<number>(0);

  useEffect(() => {
    if (sectionRef.current) {
      gsap.from(sectionRef.current, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
      });
    }
  }, []);

  useEffect(() => {
    const newTotals = foodLog.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories * item.quantity,
        protein: acc.protein + item.protein * item.quantity,
        carbs: acc.carbs + item.carbs * item.quantity,
        fats: acc.fats + item.fats * item.quantity,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
    setTotals(newTotals);
  }, [foodLog]);

  const searchFood = async () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter a food name');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setSearchResults([]);

    try {
      // Call our Next.js API route which handles the Edamam API
      const response = await axios.get(`/api/food-search?q=${encodeURIComponent(searchQuery)}`);
      
      if (response.data.foods && response.data.foods.length > 0) {
        setSearchResults(response.data.foods);
      } else {
        setSearchError('No foods found. Try a different search term.');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      setSearchError(
        error.response?.data?.error || 
        'Failed to search foods. Please try again.'
      );
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addFood = async (food: any) => {
    try {
      // Get detailed nutrition info for the selected food
      // Edamam provides nutrients per 100g, so we'll use that as base
      const nutrients = food.nutrients || {};
      
      // Extract nutrition values (Edamam uses different keys)
      const calories = nutrients.ENERC_KCAL || nutrients['ENERC_KCAL'] || 0;
      const protein = nutrients.PROCNT || nutrients['PROCNT'] || 0;
      const carbs = nutrients.CHOCDF || nutrients['CHOCDF'] || 0;
      const fats = nutrients.FAT || nutrients['FAT'] || 0;

      idCounterRef.current += 1;
      const newFood: FoodItem = {
        id: `food-${idCounterRef.current}-${food.foodId || 'item'}`,
        name: food.label,
        calories: calories || 0,
        protein: protein || 0,
        carbs: carbs || 0,
        fats: fats || 0,
        quantity: 1,
      };
      
      setFoodLog([...foodLog, newFood]);
      setSearchResults([]);
      setSearchQuery('');
      setSearchError('');
    } catch (error) {
      console.error('Error adding food:', error);
      setSearchError('Failed to add food. Please try again.');
    }
  };

  const removeFood = (id: string) => {
    setFoodLog(foodLog.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setFoodLog(
      foodLog.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  return (
    <section
      id="tracker"
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-purple-50 to-white min-h-screen"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-800">
          <FaUtensils className="inline mr-3 text-purple-600" />
          Daily Food Tracker
        </h2>

        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 mb-8">
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchError('');
                }}
                onKeyPress={(e) => e.key === 'Enter' && !isSearching && searchFood()}
                placeholder="Search for food (e.g., chicken breast, apple, rice)..."
                disabled={isSearching}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={searchFood}
                disabled={isSearching}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <FaSearch className="inline mr-2" />
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {searchError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {searchError}
              </div>
            )}

            {isSearching && (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 text-gray-600">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                  <span>Searching for foods...</span>
                </div>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <p className="text-sm text-gray-600 mb-2">
                  Found {searchResults.length} result(s). Click to add to your log.
                </p>
                {searchResults.map((food) => {
                  const nutrients = food.nutrients || {};
                  const calories = nutrients.ENERC_KCAL || nutrients['ENERC_KCAL'] || 0;
                  const protein = nutrients.PROCNT || nutrients['PROCNT'] || 0;
                  
                  return (
                    <div
                      key={food.foodId}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors"
                      onClick={() => addFood(food)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <span className="font-semibold text-gray-800">{food.label}</span>
                          {food.category && (
                            <span className="ml-2 text-xs text-gray-500">({food.category})</span>
                          )}
                        </div>
                        <FaPlus className="text-purple-600 ml-2" />
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {calories > 0 ? `${Math.round(calories)} cal` : 'Calories: N/A'} |{' '}
                        {protein > 0 ? `${Math.round(protein)}g protein` : 'Protein: N/A'}
                        {food.foodContentsLabel && (
                          <span className="block text-xs text-gray-500 mt-1">
                            {food.foodContentsLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-white rounded-xl shadow-xl p-5 md:p-6">
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">
                Food Log
              </h3>
              {foodLog.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No foods logged yet. Search and add foods to track your intake.
                </p>
              ) : (
                <div className="space-y-3">
                  {foodLog.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{item.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">{(item.calories * item.quantity).toFixed(0)} cal</span> |{' '}
                            <span className="text-blue-600 font-medium">{(item.protein * item.quantity).toFixed(1)}g</span> protein |{' '}
                            <span className="text-green-600">{(item.carbs * item.quantity).toFixed(1)}g</span> carbs |{' '}
                            <span className="text-orange-600">{(item.fats * item.quantity).toFixed(1)}g</span> fats
                          </p>
                        </div>
                        <button
                          onClick={() => removeFood(item.id)}
                          className="text-red-500 hover:text-red-700 ml-2 p-1 hover:bg-red-50 rounded transition-colors"
                          title="Remove food"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="px-2 py-1 bg-gray-200 rounded"
                        >
                          -
                        </button>
                        <span className="px-3">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="px-2 py-1 bg-gray-200 rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-xl p-5 md:p-6 text-white">
              <h3 className="text-xl md:text-2xl font-bold mb-4">Daily Totals</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Calories</span>
                    <span className="font-bold">{totals.calories.toFixed(0)}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white rounded-full h-2"
                      style={{
                        width: `${Math.min((totals.calories / 2000) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Protein</span>
                    <span className="font-bold">{totals.protein.toFixed(1)}g</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white rounded-full h-2"
                      style={{
                        width: `${Math.min((totals.protein / 150) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Carbs</span>
                    <span className="font-bold">{totals.carbs.toFixed(1)}g</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white rounded-full h-2"
                      style={{
                        width: `${Math.min((totals.carbs / 250) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Fats</span>
                    <span className="font-bold">{totals.fats.toFixed(1)}g</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white rounded-full h-2"
                      style={{
                        width: `${Math.min((totals.fats / 65) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
