import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  maxHeight?: string;
}

export function ScrollArea({
  className,
  children,
  maxHeight = '280px',
  ...props
}: ScrollAreaProps) {
  return (
    <div
      className={cn('overflow-y-auto pr-1 cyber-scroll', className)}
      style={{ maxHeight }}
      {...props}
    >
      {children}
    </div>
  );
}
