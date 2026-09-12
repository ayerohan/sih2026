import React from 'react';

interface ConfidenceMeterProps {
  confidence: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  confidence,
  showLabel = true,
  size = 'md',
}) => {
  const isHigh = confidence >= 85;
  const isMedium = confidence >= 65 && confidence < 85;

  const color = isHigh ? 'text-emerald-700' : isMedium ? 'text-amber-800' : 'text-rose-700';
  const barBg = isHigh ? 'bg-emerald-600' : isMedium ? 'bg-amber-brand' : 'bg-rose-600';
  const badgeBg = isHigh ? 'bg-emerald-50 border-emerald-200' : isMedium ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200';
  const labelText = isHigh ? 'HIGH CONFIDENCE' : isMedium ? 'MEDIUM CONFIDENCE' : 'LOW CONFIDENCE · REVIEW';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-1.5 font-mono">
          <span className={`font-bold ${size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-sm'} ${color}`}>
            {confidence}%
          </span>
          {showLabel && (
            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-semibold tracking-wider ${badgeBg} ${color}`}>
              {labelText}
            </span>
          )}
        </div>
      </div>
      <div className="w-full bg-graphite-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barBg}`}
          style={{ width: `${confidence}%` }}
        />
      </div>
    </div>
  );
};
