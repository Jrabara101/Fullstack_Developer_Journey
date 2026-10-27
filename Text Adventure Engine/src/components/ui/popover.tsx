import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

export interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Popover({
  trigger,
  content,
  align = 'center',
  className,
  open: controlledOpen,
  onOpenChange,
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const containerRef = useRef<HTMLDivElement>(null);

  const setOpen = (openState: boolean) => {
    if (onOpenChange) onOpenChange(openState);
    else setUncontrolledOpen(openState);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const alignStyles = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      <div onClick={() => setOpen(!isOpen)} className="cursor-pointer inline-block">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-1 min-w-[140px] bg-panel border border-subtle-border rounded-lg p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150',
            alignStyles[align],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
