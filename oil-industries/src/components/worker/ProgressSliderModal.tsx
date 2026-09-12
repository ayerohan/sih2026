import React, { useState } from 'react';
import { L6Activity } from '../../types';
import { useProject } from '../../context/ProjectContext';
import { KPBadge } from '../common/KPBadge';
import { Sliders, X, Check, ArrowRight, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface ProgressSliderModalProps {
  activity: L6Activity;
  onClose: () => void;
}

export const ProgressSliderModal: React.FC<ProgressSliderModalProps> = ({
  activity,
  onClose,
}) => {
  const { manualUpdateL6Progress } = useProject();
  const [newProgress, setNewProgress] = useState<number>(activity.actualProgress);
  const [siteNote, setSiteNote] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    manualUpdateL6Progress(activity.id, newProgress, siteNote);
    toast.success(`Progress updated for ${activity.code}!`, {
      description: `${activity.actualProgress}% → ${newProgress}%. L5 process recalculated.`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-950/75 backdrop-blur-sm">
      <div className="bg-graphite-900 border border-graphite-700 rounded-container text-white max-w-md w-full shadow-industrial-dark p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-graphite-400 hover:text-white p-1 rounded-md hover:bg-graphite-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-graphite-800">
          <div className="w-9 h-9 rounded-xl bg-amber-brand/15 border border-amber-brand/30 flex items-center justify-center text-amber-brand">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-brand">{activity.code}</span>
              <KPBadge location={activity.location} size="sm" />
            </div>
            <h3 className="text-sm font-bold text-white mt-0.5 truncate max-w-xs">
              {activity.name}
            </h3>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Visual Slider */}
          <div className="bg-graphite-850 p-4 rounded-card border border-graphite-750 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-graphite-400 uppercase">CURRENT ACTUAL:</span>
              <span className="font-bold text-graphite-300">{activity.actualProgress}%</span>
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-amber-brand font-semibold uppercase">TODAY'S NEW PROGRESS:</span>
              <span className="text-2xl font-black font-mono text-amber-brand">
                {newProgress}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={newProgress}
              onChange={(e) => setNewProgress(Number(e.target.value))}
              className="w-full h-2.5 bg-graphite-700 rounded-lg appearance-none cursor-pointer accent-amber-brand"
            />

            <div className="flex justify-between text-[10px] font-mono text-graphite-500">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Site Note */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-mono text-graphite-300">
              <MessageSquare className="w-3.5 h-3.5 text-amber-brand" />
              <span>FIELD OBSERVATION / SITE NOTE:</span>
            </label>
            <textarea
              rows={3}
              value={siteNote}
              onChange={(e) => setSiteNote(e.target.value)}
              placeholder="e.g. Completed stringing and welded 4 joints between KP 12.0 and 12.5..."
              className="w-full bg-graphite-850 border border-graphite-700 rounded-control p-3 text-xs font-mono text-white placeholder-graphite-500 focus:outline-none focus:border-amber-brand"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-graphite-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-graphite-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-brand hover:bg-amber-hover text-graphite-950 text-xs font-mono font-bold rounded-control transition-all flex items-center gap-2 shadow-md"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>SUBMIT UPDATE</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
