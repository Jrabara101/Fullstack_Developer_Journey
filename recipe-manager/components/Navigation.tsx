'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';
import { FaUtensils, FaCalculator, FaChartLine, FaMoon } from 'react-icons/fa';

export default function Navigation() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (navRef.current) {
      gsap.from(navRef.current.children, {
        opacity: 0,
        y: -20,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
      });
    }
  }, []);

  const handleHover = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  return (
    <nav
      ref={navRef}
      className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-lg z-50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
            onMouseEnter={handleHover}
            onMouseLeave={handleLeave}
          >
            <FaUtensils className="inline mr-2" />
            <span className="hidden sm:inline">Recipe Manager</span>
            <span className="sm:hidden">Recipes</span>
          </Link>
          <div className="flex gap-2 sm:gap-4 md:gap-6">
            <Link
              href="#recipes"
              className="flex items-center gap-1 sm:gap-2 text-gray-700 hover:text-purple-600 transition-colors text-sm sm:text-base"
              onMouseEnter={handleHover}
              onMouseLeave={handleLeave}
            >
              <FaUtensils /> <span className="hidden sm:inline">Recipes</span>
            </Link>
            <Link
              href="#bmi"
              className="flex items-center gap-1 sm:gap-2 text-gray-700 hover:text-purple-600 transition-colors text-sm sm:text-base"
              onMouseEnter={handleHover}
              onMouseLeave={handleLeave}
            >
              <FaCalculator /> <span className="hidden sm:inline">BMI</span>
            </Link>
            <Link
              href="#tracker"
              className="flex items-center gap-1 sm:gap-2 text-gray-700 hover:text-purple-600 transition-colors text-sm sm:text-base"
              onMouseEnter={handleHover}
              onMouseLeave={handleLeave}
            >
              <FaChartLine /> <span className="hidden sm:inline">Tracker</span>
            </Link>
            <Link
              href="#sleep"
              className="flex items-center gap-1 sm:gap-2 text-gray-700 hover:text-purple-600 transition-colors text-sm sm:text-base"
              onMouseEnter={handleHover}
              onMouseLeave={handleLeave}
            >
              <FaMoon /> <span className="hidden sm:inline">Sleep</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

