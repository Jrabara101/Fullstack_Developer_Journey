// ----------------------------------------------------
// Alchemical Crucible: Rich SVG Relic Icons
// ----------------------------------------------------

import React from 'react';
import type { ItemCategory } from '../engine/types';

interface ItemIconProps {
  tier: number;
  category?: ItemCategory;
  className?: string;
}

export const ItemIcon: React.FC<ItemIconProps> = ({ tier, category, className = 'w-8 h-8' }) => {
  // Branching Special Icons
  if (category === 'branch_sun') {
    return (
      <svg viewBox="0 0 48 48" className={className} fill="none">
        <circle cx="24" cy="24" r="14" fill="#F59E0B" fillOpacity="0.25" stroke="#F59E0B" strokeWidth="2" />
        <path d="M24 6V12M24 36V42M6 24H12M36 24H42M11 11L16 16M32 32L37 37M11 37L16 32M32 16L37 11" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M24 16C20 20 20 28 24 32C28 28 28 20 24 16Z" fill="#F59E0B" />
      </svg>
    );
  }

  if (category === 'branch_void') {
    return (
      <svg viewBox="0 0 48 48" className={className} fill="none">
        <circle cx="24" cy="24" r="16" fill="#581C87" fillOpacity="0.4" stroke="#A855F7" strokeWidth="2" />
        <path d="M24 10C16 18 16 30 24 38C32 30 32 18 24 10Z" fill="#C084FC" fillOpacity="0.3" stroke="#C084FC" strokeWidth="2" />
        <circle cx="24" cy="24" r="4" fill="#E9D5FF" />
        <path d="M14 20C18 22 22 24 24 24M34 20C30 22 26 24 24 24" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (category === 'catalyst') {
    return (
      <svg viewBox="0 0 48 48" className={className} fill="none">
        <polygon points="24,4 40,24 24,44 8,24" fill="#FBBF24" fillOpacity="0.35" stroke="#F59E0B" strokeWidth="2.5" />
        <polygon points="24,12 34,24 24,36 14,24" fill="#FDE68A" />
        <circle cx="24" cy="24" r="3" fill="#FFFBEB" />
      </svg>
    );
  }

  // Linear Progression Tiers 1 to 12
  switch (tier) {
    case 1:
      // Sprout of First Dawn
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <ellipse cx="24" cy="38" rx="10" ry="4" fill="#78350F" fillOpacity="0.6" />
          <path d="M24 36V22" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
          <path d="M24 22C24 14 16 12 14 16C12 20 18 24 24 22Z" fill="#34D399" stroke="#059669" strokeWidth="1.5" />
          <path d="M24 22C24 14 32 12 34 16C36 20 30 24 24 22Z" fill="#10B981" stroke="#047857" strokeWidth="1.5" />
          <circle cx="24" cy="18" r="2" fill="#FBBF24" />
        </svg>
      );
    case 2:
      // Amber Sapling
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <path d="M24 40V24M24 28L16 18M24 26L32 16" stroke="#92400E" strokeWidth="3.5" strokeLinecap="round" />
          <polygon points="16,14 20,20 12,20" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
          <polygon points="32,12 36,18 28,18" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
          <circle cx="24" cy="16" r="6" fill="#FCD34D" fillOpacity="0.7" stroke="#F59E0B" strokeWidth="2" />
        </svg>
      );
    case 3:
      // Verdant Hearthstone
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <polygon points="24,6 40,16 36,38 12,38 8,16" fill="#1C1917" stroke="#B45309" strokeWidth="2.5" />
          <polygon points="24,12 34,20 30,34 18,34 14,20" fill="#D97706" fillOpacity="0.25" stroke="#F59E0B" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="5" fill="#10B981" />
        </svg>
      );
    case 4:
      // Crucible Shard
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <path d="M8 38L24 8L40 38H8Z" fill="#334155" stroke="#94A3B8" strokeWidth="2.5" />
          <path d="M16 34L24 18L32 34H16Z" fill="#64748B" fillOpacity="0.4" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M22 28L24 24L26 28H22Z" fill="#38BDF8" />
        </svg>
      );
    case 5:
      // Quicksilver Alembic
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <path d="M20 6H28V16L38 34C40 38 37 42 32 42H16C11 42 8 38 10 34L20 16V6Z" fill="#1E293B" stroke="#94A3B8" strokeWidth="2" />
          <ellipse cx="24" cy="34" rx="10" ry="5" fill="#38BDF8" fillOpacity="0.4" stroke="#0284C7" strokeWidth="1.5" />
          <circle cx="21" cy="30" r="2" fill="#E2E8F0" />
          <circle cx="27" cy="32" r="1.5" fill="#E2E8F0" />
        </svg>
      );
    case 6:
      // Astral Runesteel Blade
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <path d="M24 6L30 18L26 36L24 42L22 36L18 18L24 6Z" fill="#475569" stroke="#CBD5E1" strokeWidth="2" />
          <path d="M24 14V32" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          <circle cx="24" cy="22" r="2.5" fill="#38BDF8" />
          <path d="M14 36H34" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 7:
      // Aether Glow Crystal
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <polygon points="24,4 38,16 38,32 24,44 10,32 10,16" fill="#083344" stroke="#06B6D4" strokeWidth="2.5" />
          <polygon points="24,12 32,20 32,28 24,36 16,28 16,20" fill="#06B6D4" fillOpacity="0.4" stroke="#22D3EE" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="3.5" fill="#ECFEFF" />
        </svg>
      );
    case 8:
      // Resonant Conduit
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <circle cx="24" cy="24" r="18" stroke="#0891B2" strokeWidth="2" strokeDasharray="3 3" />
          <path d="M14 10V38M34 10V38" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round" />
          <path d="M14 24H34" stroke="#22D3EE" strokeWidth="3" />
          <circle cx="24" cy="24" r="6" fill="#06B6D4" fillOpacity="0.5" stroke="#67E8F9" strokeWidth="2" />
        </svg>
      );
    case 9:
      // Chrono Lapis Core
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <polygon points="12,8 36,8 24,24 36,40 12,40 24,24" fill="#0E7490" fillOpacity="0.3" stroke="#06B6D4" strokeWidth="2.5" />
          <circle cx="24" cy="24" r="5" fill="#67E8F9" />
          <path d="M24 14V18M24 30V34" stroke="#A5F3FC" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 10:
      // Voidweaver Talisman
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <circle cx="24" cy="24" r="18" fill="#3B0764" stroke="#A855F7" strokeWidth="2.5" />
          <path d="M10 24C16 14 32 14 38 24C32 34 16 34 10 24Z" fill="#581C87" stroke="#C084FC" strokeWidth="2" />
          <circle cx="24" cy="24" r="6" fill="#F3E8FF" />
          <circle cx="24" cy="24" r="2.5" fill="#2E1065" />
        </svg>
      );
    case 11:
      // Celestial Astrolabe
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <circle cx="24" cy="24" r="19" stroke="#9333EA" strokeWidth="2" />
          <circle cx="24" cy="24" r="14" stroke="#C084FC" strokeWidth="1.5" strokeDasharray="4 2" />
          <circle cx="24" cy="24" r="8" stroke="#E9D5FF" strokeWidth="2" />
          <line x1="24" y1="5" x2="24" y2="43" stroke="#F59E0B" strokeWidth="1.5" />
          <line x1="5" y1="24" x2="43" y2="24" stroke="#F59E0B" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="3" fill="#FCD34D" />
        </svg>
      );
    case 12:
    default:
      // Philosopher's Nova (Apex Tier 12)
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <circle cx="24" cy="24" r="19" fill="#B45309" fillOpacity="0.2" stroke="#F59E0B" strokeWidth="2" />
          <path d="M24 2L28 16L42 20L30 28L34 42L24 32L14 42L18 28L6 20L20 16L24 2Z" fill="#F59E0B" stroke="#FBBF24" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="7" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="3" fill="#FFFBEB" />
        </svg>
      );
  }
};
