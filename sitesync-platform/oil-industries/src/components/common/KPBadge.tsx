import React from 'react';

interface KPBadgeProps {
  location: string;
  size?: 'sm' | 'md';
}

export const KPBadge: React.FC<KPBadgeProps> = ({ location, size = 'md' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-medium bg-graphite-850 text-amber-brand border border-graphite-700/60 rounded-md shadow-sm ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <span className="text-graphite-400 text-[10px]">LOC:</span>
      <span className="font-semibold">{location}</span>
    </span>
  );
};
