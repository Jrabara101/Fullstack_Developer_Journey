'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Recipe } from '@/lib/recipes';
import { FaClock, FaFire, FaDrumstickBite } from 'react-icons/fa';

interface RecipeCardProps {
  recipe: Recipe;
  index?: number;
}

export default function RecipeCard({ recipe, index = 0 }: RecipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(
    recipe.image || `https://images.unsplash.com/photo-${1546069901 + index}-ba9599a7e63c?w=400&h=300&fit=crop&q=80`
  );
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Generate unique image URL based on recipe
    const imageId = 1546069901 + (index % 20);
    setImageUrl(
      recipe.image || `https://images.unsplash.com/photo-${imageId}-ba9599a7e63c?w=400&h=300&fit=crop&q=80`
    );
  }, [recipe.name, recipe.image, index]);

  useEffect(() => {
    // Initial animation
    if (cardRef.current) {
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 50,
        scale: 0.9,
        duration: 0.6,
        delay: index * 0.05,
        ease: 'back.out(1.2)',
      });
    }
  }, [index]);

  const handleMouseEnter = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        y: -10,
        scale: 1.02,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Prevent event bubbling
    
    setIsExpanded(!isExpanded);
    if (cardRef.current) {
      // Only animate this specific card
      gsap.to(cardRef.current, {
        scale: 0.98,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      });
      
      // Animate expand/collapse for this card only
      const expandContent = cardRef.current.querySelector('.expand-content');
      if (expandContent && !isExpanded) {
        gsap.from(expandContent, {
          height: 0,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.out',
        });
      } else if (expandContent && isExpanded) {
        gsap.to(expandContent, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
        });
      }
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transition-all flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden flex-shrink-0 group">
        <img
          ref={imageRef}
          src={imageUrl}
          alt={recipe.name}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-blue-200 animate-pulse"></div>
        )}
        <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg transform transition-transform hover:scale-110">
          {recipe.protein}g Protein
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold mb-3 text-gray-800 line-clamp-2 min-h-[3rem]">{recipe.name}</h3>
        
        <div className="flex items-center gap-3 mb-3 text-sm text-gray-600 flex-wrap">
          <div className="flex items-center gap-1.5">
            <FaClock className="text-purple-600" /> 
            <span>{recipe.prepTime + recipe.cookTime} min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FaFire className="text-orange-500" /> 
            <span>{recipe.calories} cal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FaDrumstickBite className="text-blue-600" /> 
            <span>{recipe.protein}g</span>
          </div>
        </div>

        <div className="flex gap-2 mb-3 flex-wrap">
          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
            {recipe.carbs}g Carbs
          </span>
          <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium">
            {recipe.fats}g Fats
          </span>
        </div>

        {isExpanded && (
          <div className="expand-content mt-auto pt-4 space-y-3 border-t border-gray-200">
            <div>
              <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-2">
                <span className="text-purple-600">📋</span> Ingredients:
              </h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="hover:text-purple-600 transition-colors">{ing}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-2">
                <span className="text-purple-600">👨‍🍳</span> Instructions:
              </h4>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                {recipe.instructions.map((inst, idx) => (
                  <li key={idx} className="hover:text-purple-600 transition-colors">{inst}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

