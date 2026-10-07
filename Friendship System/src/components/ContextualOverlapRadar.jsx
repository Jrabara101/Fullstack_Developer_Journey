import React from 'react';
import { Users } from 'lucide-react';

export function ContextualOverlapRadar({ overlap, className = '' }) {
  if (!overlap || overlap.count === 0) {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-slate-500 ${className}`}>
        <Users className="w-3.5 h-3.5" />
        <span>No shared connections</span>
      </div>
    );
  }

  const { count, previewUsers, text } = overlap;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Stacked Avatars */}
      {previewUsers && previewUsers.length > 0 && (
        <div className="flex -space-x-2 overflow-hidden py-0.5">
          {previewUsers.map((user) => (
            <img
              key={user.id}
              src={user.avatar}
              alt={user.displayName}
              title={`${user.displayName} (@${user.username})`}
              className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 object-cover"
            />
          ))}
        </div>
      )}

      {/* Social Proof Text */}
      <span className="text-xs text-slate-300 font-medium leading-tight">
        {text}
      </span>
    </div>
  );
}
