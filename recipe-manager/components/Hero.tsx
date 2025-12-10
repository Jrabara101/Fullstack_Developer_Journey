'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

// Separate component for particles to avoid hydration mismatch
function Particles() {
  const [particles, setParticles] = useState<Array<{ left: number; top: number; duration: number; delay: number }>>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Generate particles only on client
    setParticles(
      Array.from({ length: 20 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 2,
      }))
    );
  }, []);

  if (!mounted || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white/30 rounded-full"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animation: `float ${particle.duration}s infinite ease-in-out`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (heroRef.current) {
      const tl = gsap.timeline();
      
      if (titleRef.current) {
        tl.from(titleRef.current, {
          opacity: 0,
          y: 50,
          duration: 1,
          ease: 'power3.out',
        });
      }
      
      if (subtitleRef.current) {
        tl.from(subtitleRef.current, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: 'power2.out',
        }, '-=0.5');
      }
      
      if (buttonRef.current) {
        tl.from(buttonRef.current, {
          opacity: 0,
          scale: 0.8,
          duration: 0.6,
          ease: 'back.out(1.7)',
        }, '-=0.3');
      }

      // Animated background
      gsap.to(heroRef.current, {
        backgroundPosition: '100% 50%',
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: 'none',
      });
    }
  }, []);

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
    });
    
    document.getElementById('recipes')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={heroRef}
      className="min-h-screen flex items-center justify-center text-white pt-20 px-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        backgroundSize: '200% 200%',
      }}
    >
      {/* Animated background particles */}
      <Particles />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-5xl relative z-10">
        <h1
          ref={titleRef}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          <span className="inline-block">High Protein</span>
          <br />
          <span className="inline-block bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
            Recipe Manager
          </span>
        </h1>
        <p
          ref={subtitleRef}
          className="text-lg sm:text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto"
        >
          Track your nutrition, manage recipes, and achieve your fitness goals
        </p>
        <button
          ref={buttonRef}
          onClick={handleButtonClick}
          className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-purple-600 rounded-full font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95 relative overflow-hidden group"
        >
          <span className="relative z-10">Explore Recipes</span>
          <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            Explore Recipes
          </span>
        </button>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}

