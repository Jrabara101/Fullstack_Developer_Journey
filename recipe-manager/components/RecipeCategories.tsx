'use client';

import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import axios from 'axios';
import { Recipe, recipes as staticRecipes } from '@/lib/recipes';
import RecipeCard from './RecipeCard';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const categories = [
  { id: 'breakfast', name: 'Breakfast', icon: '🌅' },
  { id: 'lunch', name: 'Lunch', icon: '🍽️' },
  { id: 'dinner', name: 'Dinner', icon: '🌙' },
  { id: 'dessert', name: 'Desserts', icon: '🍰' },
  { id: 'pre-workout', name: 'Pre-Workout', icon: '💪' },
  { id: 'post-workout', name: 'Post-Workout', icon: '🏋️' },
];

export default function RecipeCategories() {
  const [selectedCategory, setSelectedCategory] = useState<string>('breakfast');
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  // Fetch recipes from API with fallback to static recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/recipes?category=${selectedCategory}&limit=20`);
        if (response.data.recipes && response.data.recipes.length > 0) {
          // Remove duplicates by ID
          const uniqueRecipes = Array.from(
            new Map(response.data.recipes.map((recipe: Recipe) => [recipe.id, recipe])).values()
          );
          setFilteredRecipes(uniqueRecipes);
        } else {
          // Fallback to static recipes
          const categoryRecipes = staticRecipes.filter(
            (r) => r.category === selectedCategory
          );
          // Remove duplicates by ID
          const uniqueRecipes = Array.from(
            new Map(categoryRecipes.map((recipe) => [recipe.id, recipe])).values()
          );
          setFilteredRecipes(uniqueRecipes.slice(0, 20));
        }
      } catch (error) {
        console.error('Error fetching recipes:', error);
        // Fallback to static recipes from lib/recipes.ts
        const categoryRecipes = staticRecipes.filter(
          (r) => r.category === selectedCategory
        );
        // Remove duplicates by ID
        const uniqueRecipes = Array.from(
          new Map(categoryRecipes.map((recipe) => [recipe.id, recipe])).values()
        );
        setFilteredRecipes(uniqueRecipes.slice(0, 20));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, [selectedCategory]);

  // Animate section on scroll
  useEffect(() => {
    if (sectionRef.current && titleRef.current) {
      gsap.from(titleRef.current, {
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

      if (buttonsRef.current) {
        gsap.from(buttonsRef.current.children, {
          opacity: 0,
          scale: 0.8,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
      }
    }
  }, []);

  // Animate cards when they change
  useEffect(() => {
    if (cardsRef.current && !isLoading) {
      const cards = cardsRef.current.children;
      
      // Reset and animate
      gsap.set(cards, { opacity: 0, y: 50, scale: 0.9 });
      
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: {
          amount: 0.6,
          from: 'random',
        },
        ease: 'back.out(1.2)',
        scrollTrigger: {
          trigger: cardsRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }
  }, [filteredRecipes, isLoading]);

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === selectedCategory) return;
    
    // Animate category change
    if (cardsRef.current) {
      gsap.to(cardsRef.current.children, {
        opacity: 0,
        scale: 0.8,
        y: -20,
        duration: 0.3,
        stagger: 0.02,
        ease: 'power2.in',
        onComplete: () => {
          setSelectedCategory(categoryId);
        },
      });
    } else {
      setSelectedCategory(categoryId);
    }
  };

  return (
    <section
      id="recipes"
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-purple-50 via-white to-purple-50 min-h-screen relative overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <h2 
          ref={titleRef}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4 text-gray-800"
        >
          Recipe Categories
        </h2>
        <p className="text-center text-gray-600 mb-12 text-lg">
          Discover high-protein recipes for every meal
        </p>
        
        <div 
          ref={buttonsRef}
          className="flex flex-wrap justify-center gap-3 mb-12 px-4"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`px-5 py-2.5 rounded-full font-semibold text-sm md:text-base transition-all transform hover:scale-110 active:scale-95 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 shadow-md hover:shadow-lg hover:bg-purple-50'
              }`}
            >
              <span className="mr-2 text-lg">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
          </div>
        ) : (
          <div
            ref={cardsRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredRecipes.map((recipe, index) => (
              <RecipeCard key={recipe.id} recipe={recipe} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
