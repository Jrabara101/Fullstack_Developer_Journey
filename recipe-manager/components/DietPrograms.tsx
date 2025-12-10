'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaApple, FaClock, FaFire } from 'react-icons/fa';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const dietPrograms = [
  {
    id: 1,
    name: 'High Protein Diet',
    description: 'Focus on lean proteins, vegetables, and complex carbs. Aim for 1.6-2.2g protein per kg body weight.',
    benefits: ['Muscle growth', 'Fat loss', 'Improved satiety', 'Better recovery'],
    dailyCalories: '1800-2500',
    proteinTarget: '120-180g',
  },
  {
    id: 2,
    name: 'Intermittent Fasting - 16:8',
    description: 'Fast for 16 hours, eat within an 8-hour window. Most popular: 12 PM - 8 PM eating window.',
    benefits: ['Weight loss', 'Improved insulin sensitivity', 'Cellular repair', 'Mental clarity'],
    dailyCalories: '1800-2500',
    fastingWindow: '16 hours',
  },
  {
    id: 3,
    name: 'Intermittent Fasting - 18:6',
    description: 'Fast for 18 hours, eat within a 6-hour window. More restrictive but potentially more effective.',
    benefits: ['Enhanced fat burning', 'Autophagy', 'Better focus', 'Metabolic health'],
    dailyCalories: '1800-2500',
    fastingWindow: '18 hours',
  },
  {
    id: 4,
    name: 'Intermittent Fasting - 20:4',
    description: 'Fast for 20 hours, eat within a 4-hour window. Also known as the Warrior Diet.',
    benefits: ['Maximum fat loss', 'Increased growth hormone', 'Improved digestion', 'Time efficiency'],
    dailyCalories: '1800-2500',
    fastingWindow: '20 hours',
  },
  {
    id: 5,
    name: 'Keto Diet',
    description: 'Very low carb (20-50g), high fat, moderate protein. Forces body into ketosis.',
    benefits: ['Rapid weight loss', 'Reduced appetite', 'Better blood sugar control', 'Mental clarity'],
    dailyCalories: '1500-2200',
    carbLimit: '20-50g',
  },
  {
    id: 6,
    name: 'Mediterranean Diet',
    description: 'Rich in vegetables, fruits, whole grains, fish, and olive oil. Heart-healthy approach.',
    benefits: ['Heart health', 'Longevity', 'Brain health', 'Reduced inflammation'],
    dailyCalories: '2000-2500',
    focus: 'Whole foods',
  },
];

export default function DietPrograms() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (sectionRef.current) {
      const title = sectionRef.current.querySelector('h2');
      if (title) {
        // Set initial state
        gsap.set(title, { opacity: 1, y: 0 });
        
        gsap.from(title, {
          opacity: 0,
          y: -30,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!cardsRef.current) return;
    
    const cards = cardsRef.current.children;
    if (cards.length === 0) return;
    
    // Set initial visible state as fallback
    gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
    
    // Check if section is already in viewport
    const rect = cardsRef.current.getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (isInViewport) {
      // If already in view, just ensure visibility
      gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
    } else {
      // Animate from hidden state when scrolling into view
      gsap.from(cards, {
        opacity: 0,
        y: 50,
        scale: 0.9,
        duration: 0.8,
        stagger: {
          amount: 0.6,
          from: 'start',
        },
        ease: 'back.out(1.2)',
        scrollTrigger: {
          trigger: cardsRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
          onEnter: () => {
            gsap.to(cards, { opacity: 1, y: 0, scale: 1, duration: 0.8 });
          },
          onEnterBack: () => {
            gsap.to(cards, { opacity: 1, y: 0, scale: 1, duration: 0.8 });
          },
        },
      });
    }
    
    return () => {
      // Cleanup ScrollTriggers for this component
      if (typeof window !== 'undefined' && ScrollTrigger) {
        ScrollTrigger.getAll().forEach(trigger => {
          if (trigger.vars?.trigger === cardsRef.current) {
            trigger.kill();
          }
        });
      }
    };
  }, []);

  return (
    <section
      id="diet-programs"
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-white to-purple-50 min-h-screen"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-800">
          <FaApple className="inline mr-3 text-purple-600" />
          Diet Programs & Intermittent Fasting
        </h2>

        <div
          ref={cardsRef}
          className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {dietPrograms.map((program) => (
            <div
              key={program.id}
              className="bg-white rounded-xl shadow-lg p-5 md:p-6 hover:shadow-xl transition-all transform hover:scale-105 flex flex-col h-full opacity-100"
            >
              <div className="flex items-center gap-3 mb-4">
                {program.name.includes('Fasting') ? (
                  <FaClock className="text-2xl md:text-3xl text-purple-600 flex-shrink-0" />
                ) : (
                  <FaApple className="text-2xl md:text-3xl text-purple-600 flex-shrink-0" />
                )}
                <h3 className="text-lg md:text-xl font-bold text-gray-800">
                  {program.name}
                </h3>
              </div>
              
              <p className="text-gray-600 mb-4 text-sm md:text-base flex-grow">{program.description}</p>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-gray-700 text-sm md:text-base">Benefits:</h4>
                <ul className="list-disc list-inside text-xs md:text-sm text-gray-600 space-y-1">
                  {program.benefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
              </div>
              
              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 mt-auto pt-4 border-t border-gray-200">
                <FaFire className="text-purple-600 flex-shrink-0" />
                <span className="break-words">
                  {program.dailyCalories} cal/day
                  {program.proteinTarget && ` • ${program.proteinTarget} protein`}
                  {program.fastingWindow && ` • ${program.fastingWindow} fast`}
                  {program.carbLimit && ` • ${program.carbLimit} carbs`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
