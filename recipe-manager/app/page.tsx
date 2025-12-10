'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import RecipeCategories from '@/components/RecipeCategories';
import BMICalculator from '@/components/BMICalculator';
import DailyTracker from '@/components/DailyTracker';
import DietPrograms from '@/components/DietPrograms';
import SleepTracker from '@/components/SleepTracker';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    // Initial page fade in
    gsap.from('body', {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
    });

    // Smooth scroll progress indicator
    const sections = document.querySelectorAll('section');
    
    sections.forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => {
          gsap.to(section, {
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
          });
        },
      });
    });

    // Parallax effect on scroll
    gsap.utils.toArray<HTMLElement>('section').forEach((section, i) => {
      if (i > 0) {
        gsap.to(section, {
          y: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'top 20%',
            scrub: 1,
          },
        });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <main ref={mainRef} className="min-h-screen relative overflow-x-hidden">
      <Navigation />
      <Hero />
      <RecipeCategories />
      <BMICalculator />
      <DailyTracker />
      <DietPrograms />
      <SleepTracker />
    </main>
  );
}
