'use client';

import { useEffect, useState, useRef, useId } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaMoon, FaBed, FaSun } from 'react-icons/fa';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface SleepEntry {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  duration: number;
  quality: number;
}

export default function SleepTracker() {
  const [bedtime, setBedtime] = useState<string>('22:00');
  const [wakeTime, setWakeTime] = useState<string>('06:00');
  const [quality, setQuality] = useState<number>(5);
  const [sleepLog, setSleepLog] = useState<SleepEntry[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const idCounterRef = useRef<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const calculateDuration = (bed: string, wake: string): number => {
    const [bedHour, bedMin] = bed.split(':').map(Number);
    const [wakeHour, wakeMin] = wake.split(':').map(Number);
    
    let bedMinutes = bedHour * 60 + bedMin;
    let wakeMinutes = wakeHour * 60 + wakeMin;
    
    if (wakeMinutes < bedMinutes) {
      wakeMinutes += 24 * 60; // Next day
    }
    
    return (wakeMinutes - bedMinutes) / 60;
  };

  const addSleepEntry = () => {
    if (!mounted) return;
    
    const duration = calculateDuration(bedtime, wakeTime);
    idCounterRef.current += 1;
    const now = new Date();
    
    // Use consistent date formatting
    const dateStr = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    
    const newEntry: SleepEntry = {
      id: `sleep-${idCounterRef.current}-${now.getTime()}`,
      date: dateStr,
      bedtime,
      wakeTime,
      duration,
      quality,
    };
    setSleepLog([newEntry, ...sleepLog].slice(0, 7)); // Keep last 7 days
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 8) return 'text-green-600';
    if (quality >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityLabel = (quality: number) => {
    if (quality >= 8) return 'Excellent';
    if (quality >= 6) return 'Good';
    if (quality >= 4) return 'Fair';
    return 'Poor';
  };

  const averageDuration =
    sleepLog.length > 0
      ? sleepLog.reduce((sum, entry) => sum + entry.duration, 0) / sleepLog.length
      : 0;

  const averageQuality =
    sleepLog.length > 0
      ? sleepLog.reduce((sum, entry) => sum + entry.quality, 0) / sleepLog.length
      : 0;

  return (
    <section
      id="sleep"
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-purple-50 to-indigo-900 text-white min-h-screen"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
          <FaMoon className="inline mr-3" />
          Sleep Tracker
        </h2>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl p-5 md:p-6">
              <h3 className="text-xl md:text-2xl font-bold mb-6">Log Sleep</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 mb-2">
                    <FaBed /> Bedtime
                  </label>
                  <input
                    type="time"
                    value={bedtime}
                    onChange={(e) => setBedtime(e.target.value)}
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 mb-2">
                    <FaSun /> Wake Time
                  </label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block">Sleep Quality: {quality}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                  <div className="flex justify-between text-sm mt-1">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>

                <button
                  onClick={addSleepEntry}
                  className="w-full px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-100 transition-all transform hover:scale-105"
                >
                  Log Sleep
                </button>

                <div className="mt-4 p-4 bg-white/10 rounded-lg">
                  <p className="text-sm mb-1">Estimated Duration:</p>
                  <p className="text-2xl font-bold">
                    {calculateDuration(bedtime, wakeTime).toFixed(1)} hours
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl p-5 md:p-6">
              <h3 className="text-xl md:text-2xl font-bold mb-6">Sleep Statistics</h3>
              
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-white/10 rounded-lg">
                  <p className="text-sm mb-1">Average Duration (Last 7 Days)</p>
                  <p className="text-3xl font-bold">
                    {averageDuration > 0 ? averageDuration.toFixed(1) : '--'} hours
                  </p>
                </div>

                <div className="p-4 bg-white/10 rounded-lg">
                  <p className="text-sm mb-1">Average Quality</p>
                  <p className={`text-3xl font-bold ${getQualityColor(averageQuality)}`}>
                    {averageQuality > 0 ? averageQuality.toFixed(1) : '--'}/10
                  </p>
                  {averageQuality > 0 && (
                    <p className="text-sm mt-1">{getQualityLabel(averageQuality)}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Recent Sleep Log</h4>
                {sleepLog.length === 0 ? (
                  <p className="text-white/70 text-center py-4">
                    No sleep entries yet. Log your sleep to track patterns.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {sleepLog.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-3 bg-white/10 rounded-lg text-sm"
                      >
                        <div className="flex justify-between items-center">
                          <span>{entry.date}</span>
                          <span className="font-semibold">
                            {entry.duration.toFixed(1)}h
                          </span>
                        </div>
                        <div className="flex justify-between text-xs mt-1 text-white/80">
                          <span>{entry.bedtime} - {entry.wakeTime}</span>
                          <span className={getQualityColor(entry.quality)}>
                            Quality: {entry.quality}/10
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
