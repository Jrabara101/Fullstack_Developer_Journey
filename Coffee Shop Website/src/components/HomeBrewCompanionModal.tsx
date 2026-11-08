import React, { useState, useEffect } from 'react';
import { useCoffeeShop } from '../context/CoffeeShopContext';
import { X, Play, Pause, RotateCcw, Clock, Droplets, Thermometer, Scale } from 'lucide-react';
import type { BrewRecipe } from '../types';

export const HomeBrewCompanionModal: React.FC = () => {
  const { brewCompanionBean, setBrewCompanionBean } = useCoffeeShop();
  const [selectedMethod, setSelectedMethod] = useState<'v60' | 'aeropress' | 'frenchpress'>('v60');
  
  // Timer state
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  if (!brewCompanionBean) return null;

  const currentRecipe: BrewRecipe = brewCompanionBean.brewRecipes[selectedMethod];

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsElapsed(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-primary/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-surface-ceramic border border-linen-hairline rounded-hub max-w-xl w-full p-6 sm:p-8 shadow-warm-xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={() => {
            setBrewCompanionBean(null);
            resetTimer();
          }}
          className="absolute top-5 right-5 p-2 rounded-full text-cacao-secondary hover:text-espresso-primary hover:bg-canvas-parchment transition-colors"
          aria-label="Close Brew Companion"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-8 mb-5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-terracotta bg-terracotta-light px-2.5 py-0.5 rounded-full font-semibold">
              Roaster's Home Extraction Companion
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-espresso-primary">
            {brewCompanionBean.name}
          </h2>
          <p className="text-xs text-cacao-secondary">
            Dialed in by Head Roaster Maya Lin for optimum sweetness & origin clarity.
          </p>
        </div>

        {/* Brew Method Selector */}
        <div className="flex items-center gap-2 p-1.5 bg-canvas-parchment rounded-xl mb-6">
          {[
            { id: 'v60', label: 'V60 Pour-Over' },
            { id: 'aeropress', label: 'AeroPress' },
            { id: 'frenchpress', label: 'French Press' }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setSelectedMethod(m.id as any);
                resetTimer();
              }}
              className={`flex-1 py-2 text-xs font-mono font-semibold rounded-lg transition-all ${
                selectedMethod === m.id
                  ? 'bg-surface-ceramic text-espresso-primary shadow-sm'
                  : 'text-cacao-secondary hover:text-espresso-primary'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Extraction Parameters Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 bg-canvas-oat p-4 rounded-2xl border border-linen-hairline text-center font-mono">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-[11px] text-oat-muted">
              <Scale className="w-3.5 h-3.5 text-terracotta" />
              <span>Dose</span>
            </div>
            <div className="font-bold text-sm text-espresso-primary">
              {currentRecipe.doseGrams}g
            </div>
            <div className="text-[10px] text-cacao-secondary">{currentRecipe.ratio}</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-[11px] text-oat-muted">
              <Droplets className="w-3.5 h-3.5 text-amber-honey" />
              <span>Water</span>
            </div>
            <div className="font-bold text-sm text-espresso-primary">
              {currentRecipe.waterGrams}g
            </div>
            <div className="text-[10px] text-cacao-secondary">Filtered 150ppm</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-[11px] text-oat-muted">
              <Thermometer className="w-3.5 h-3.5 text-berry-origin" />
              <span>Temp</span>
            </div>
            <div className="font-bold text-sm text-espresso-primary">
              {currentRecipe.waterTempC}°C
            </div>
            <div className="text-[10px] text-cacao-secondary">{Math.round((currentRecipe.waterTempC * 9/5) + 32)}°F</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-[11px] text-oat-muted">
              <Clock className="w-3.5 h-3.5 text-matcha" />
              <span>Target Time</span>
            </div>
            <div className="font-bold text-sm text-espresso-primary">
              {formatTimer(currentRecipe.totalTimeSeconds)}
            </div>
            <div className="text-[10px] text-cacao-secondary">Bloom {currentRecipe.bloomSeconds}s</div>
          </div>
        </div>

        {/* Live Interactive Brew Timer Stage */}
        <div className="bg-surface-roast text-canvas-oat p-5 rounded-2xl mb-6 shadow-warm-lg flex flex-col items-center justify-center space-y-3">
          <div className="text-[11px] font-mono uppercase tracking-widest text-amber-300">
            Extraction Stop-Watch
          </div>

          <div className="font-mono text-5xl font-bold tracking-wider text-white">
            {formatTimer(secondsElapsed)}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-md ${
                isRunning 
                  ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                  : 'bg-terracotta hover:bg-terracotta-hover text-white'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'Pause Timer' : 'Start Brew'}</span>
            </button>

            <button
              onClick={resetTimer}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Reset Stopwatch"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step-by-Step Dial-In Timeline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-oat-muted uppercase font-bold">
            <span>Step-by-Step Dial-In Checklist</span>
            <span>Grind: {currentRecipe.grindSize}</span>
          </div>

          <div className="space-y-2.5">
            {currentRecipe.steps.map((step, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-3 bg-canvas-parchment/60 p-3 rounded-xl border border-linen-hairline text-xs"
              >
                <span className="font-mono font-bold text-terracotta bg-white px-2 py-0.5 rounded shadow-sm shrink-0">
                  {step.time}
                </span>

                <div className="flex-1 space-y-0.5">
                  <div className="font-semibold text-espresso-primary flex items-center justify-between">
                    <span>{step.action}</span>
                    <span className="font-mono text-oat-muted">{step.waterAmount}</span>
                  </div>
                  <p className="text-[11px] text-cacao-secondary">
                    {step.tip}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
