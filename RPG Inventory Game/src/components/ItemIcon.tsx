import React from 'react';
import { 
  Sword, 
  Shield, 
  Crown, 
  Shirt, 
  Footprints, 
  Crosshair, 
  Sparkles, 
  Scroll, 
  FlaskConical, 
  CircleDot, 
  Axe, 
  Flame,
  Zap,
  Hand
} from 'lucide-react';
import { ItemRarity } from '../types/inventory';

interface ItemIconProps {
  iconType: string;
  rarity: ItemRarity;
  className?: string;
}

export const ItemIcon: React.FC<ItemIconProps> = ({ iconType, rarity, className = 'w-7 h-7' }) => {
  const getIconColor = () => {
    switch (rarity) {
      case 'legendary':
        return 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]';
      case 'epic':
        return 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]';
      case 'rare':
        return 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]';
      case 'uncommon':
        return 'text-emerald-400 drop-shadow-[0_0_6px_rgba(34,197,94,0.4)]';
      case 'common':
      default:
        return 'text-slate-300';
    }
  };

  const colorClass = getIconColor();

  switch (iconType) {
    case 'greatsword':
      return <Sword className={`${className} ${colorClass} rotate-45 stroke-[2.2]`} />;
    case 'sword':
      return <Sword className={`${className} ${colorClass} rotate-45`} />;
    case 'shield':
      return <Shield className={`${className} ${colorClass} stroke-[2.2]`} />;
    case 'helmet':
      return <Crown className={`${className} ${colorClass}`} />;
    case 'chestplate':
      return <Shirt className={`${className} ${colorClass}`} />;
    case 'boots':
      return <Footprints className={`${className} ${colorClass}`} />;
    case 'bow':
      return <Crosshair className={`${className} ${colorClass}`} />;
    case 'legs':
      return <Shield className={`${className} ${colorClass} rotate-180`} />;
    case 'gauntlets':
      return <Hand className={`${className} ${colorClass}`} />;
    case 'amulet':
      return <Sparkles className={`${className} ${colorClass}`} />;
    case 'ring':
      return <CircleDot className={`${className} ${colorClass}`} />;
    case 'potion_red':
      return <FlaskConical className={`${className} text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]`} />;
    case 'potion_blue':
      return <FlaskConical className={`${className} text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]`} />;
    case 'book':
      return <Scroll className={`${className} ${colorClass}`} />;
    case 'axe':
      return <Axe className={`${className} ${colorClass}`} />;
    default:
      return <Sparkles className={`${className} ${colorClass}`} />;
  }
};
