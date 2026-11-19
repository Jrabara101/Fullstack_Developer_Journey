import React from 'react';
import { BoundingBox } from '../../types/index.ts';

interface BoundingBoxOverlayProps {
  boundingBoxes: BoundingBox[];
  activeFieldKey?: string | null;
  onSelectField?: (fieldKey: string) => void;
  isRedacted?: boolean;
}

export const BoundingBoxOverlay: React.FC<BoundingBoxOverlayProps> = ({
  boundingBoxes,
  activeFieldKey,
  onSelectField,
  isRedacted = false
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {boundingBoxes.map(box => {
        const isActive = activeFieldKey === box.fieldKey;
        // In blind screening redacted mode, redact graduation years, demographic headers, or photos
        const shouldRedact = isRedacted && (box.fieldKey.includes('education') || box.fieldKey.includes('photo'));

        return (
          <div
            key={box.id}
            onClick={() => onSelectField && onSelectField(box.fieldKey)}
            style={{
              left: `${box.x}%`,
              top: `${box.y}%`,
              width: `${box.width}%`,
              height: `${box.height}%`
            }}
            className={`absolute pointer-events-auto cursor-pointer rounded-xs transition-all duration-200 group ${
              shouldRedact
                ? 'bg-slate-900/90 dark:bg-slate-800/90 border border-slate-700'
                : isActive
                ? 'border-2 border-indigo-600 bg-indigo-500/15 shadow-[0_0_12px_rgba(79,70,229,0.35)] ring-2 ring-indigo-400/40'
                : 'border border-indigo-500/30 bg-indigo-500/5 hover:border-indigo-500 hover:bg-indigo-500/10'
            }`}
            title={shouldRedact ? 'Redacted for Blind Screening' : `${box.label}: click to view/edit form field`}
          >
            {shouldRedact ? (
              <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-slate-300">
                [REDACTED FOR UNBIASED REVIEW]
              </div>
            ) : (
              <div
                className={`absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[10px] font-mono whitespace-nowrap transition-opacity shadow-xs pointer-events-none ${
                  isActive
                    ? 'opacity-100 bg-indigo-600 text-white z-20'
                    : 'opacity-0 group-hover:opacity-100 bg-slate-800 text-slate-100 z-10'
                }`}
              >
                {box.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
