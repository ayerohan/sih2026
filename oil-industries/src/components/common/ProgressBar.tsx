import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface ProgressBarProps {
  actual: number;
  planned?: number;
  variance?: number;
  showNumbers?: boolean;
  height?: 'sm' | 'md' | 'lg';
  status?: 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'COMPLETE' | string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  actual,
  planned,
  variance,
  showNumbers = true,
  height = 'md',
  status,
}) => {
  const { language } = useLanguage();
  const actualClamped = Math.min(100, Math.max(0, actual));
  const plannedClamped = planned !== undefined ? Math.min(100, Math.max(0, planned)) : undefined;

  let actualBarColor = 'bg-amber-brand';
  if (actual >= 100) {
    actualBarColor = 'bg-emerald-600';
  } else if (status === 'DELAYED' || (variance !== undefined && variance < -15)) {
    actualBarColor = 'bg-rose-600';
  } else if (status === 'AT_RISK' || (variance !== undefined && variance < -5)) {
    actualBarColor = 'bg-amber-brand';
  } else if (status === 'ON_TRACK' || (variance !== undefined && variance >= -5)) {
    actualBarColor = 'bg-emerald-600';
  }

  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const calculatedVariance = variance !== undefined ? variance : (planned !== undefined ? actual - planned : 0);

  return (
    <div className="w-full space-y-1.5">
      {showNumbers && (
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-graphite-900">
              {actual}% <span className="text-graphite-500 font-normal">{language === 'hi' ? 'वास्तविक' : 'actual'}</span>
            </span>
            {planned !== undefined && (
              <span className="text-graphite-500">
                / {planned}% <span className="text-graphite-400">{language === 'hi' ? 'नियोजित' : 'planned'}</span>
              </span>
            )}
          </div>
          {planned !== undefined && (
            <span
              className={`font-semibold px-1.5 py-0.5 rounded text-[11px] ${
                calculatedVariance < -10
                  ? 'bg-rose-100 text-rose-800'
                  : calculatedVariance < -3
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {calculatedVariance > 0 ? `+${calculatedVariance}%` : `${calculatedVariance}%`}
            </span>
          )}
        </div>
      )}

      {/* Bar container */}
      <div className={`w-full bg-graphite-200/80 rounded-full overflow-hidden relative ${heightClasses[height]} shadow-inner`}>
        {/* Planned marker line if planned is higher */}
        {plannedClamped !== undefined && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-graphite-600 z-10 opacity-70"
            style={{ left: `${plannedClamped}%` }}
            title={`Planned: ${plannedClamped}%`}
          />
        )}

        {/* Actual Progress Fill */}
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out relative ${actualBarColor}`}
          style={{ width: `${actualClamped}%` }}
        >
          {/* Subtle industrial stripes texture */}
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,rgba(255,255,255,0.3)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.3)_50%,rgba(255,255,255,0.3)_75%,transparent_75%,transparent)] bg-[length:12px_12px]" />
        </div>
      </div>
    </div>
  );
};
