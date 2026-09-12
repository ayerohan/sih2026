import React, { useEffect, useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { CheckCircle2, ArrowRight, Layers, Workflow, Building2, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const RollUpModal: React.FC = () => {
  const { activeRollUpEvent, dismissRollUpEvent } = useProject();
  const [step, setStep] = useState<number>(0);

  useEffect(() => {
    if (activeRollUpEvent) {
      setStep(1);
      const t1 = setTimeout(() => setStep(2), 600);
      const t2 = setTimeout(() => setStep(3), 1300);
      const t3 = setTimeout(() => setStep(4), 2100);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      setStep(0);
    }
  }, [activeRollUpEvent]);

  if (!activeRollUpEvent) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.25 }}
          className="bg-graphite-900 border border-graphite-700 rounded-container text-white p-6 max-w-lg w-full shadow-industrial-dark relative overflow-hidden"
        >
          {/* Subtle glowing header stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-brand via-emerald-500 to-amber-brand animate-pulse" />

          <button
            onClick={dismissRollUpEvent}
            className="absolute top-4 right-4 text-graphite-400 hover:text-white p-1 rounded-md hover:bg-graphite-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-amber-brand font-semibold">
                HUMAN VERIFIED · PROGRESS CASCADE
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                L5/L6 Progress Roll-Up Completed
              </h3>
            </div>
          </div>

          <div className="space-y-3.5 my-6">
            {/* Step 1: L6 Activity Updated */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: step >= 1 ? 1 : 0.4, x: 0 }}
              className={`p-3.5 rounded-card border transition-all duration-300 ${
                step >= 1
                  ? 'bg-graphite-850/90 border-emerald-500/40 text-white'
                  : 'bg-graphite-850/30 border-graphite-800 text-graphite-500'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-2 text-graphite-300 font-medium">
                  <Workflow className="w-4 h-4 text-amber-brand" />
                  <span>L6 ACTIVITY: <strong className="text-white">{activeRollUpEvent.l6Code}</strong></span>
                </span>
                <span className="flex items-center gap-1.5 font-bold">
                  <span className="text-graphite-400">{activeRollUpEvent.l6Old}%</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-sm">{activeRollUpEvent.l6New}%</span>
                </span>
              </div>
              <div className="text-xs text-graphite-400 mt-1 pl-6 truncate">
                {activeRollUpEvent.l6Name}
              </div>
            </motion.div>

            {/* Step 2: L5 Process Recalculated */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: step >= 2 ? 1 : 0.4, x: 0 }}
              className={`p-3.5 rounded-card border transition-all duration-300 ${
                step >= 2
                  ? 'bg-graphite-850/90 border-emerald-500/40 text-white'
                  : 'bg-graphite-850/30 border-graphite-800 text-graphite-500'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-2 text-graphite-300 font-medium">
                  <Layers className="w-4 h-4 text-amber-brand" />
                  <span>L5 PROCESS: <strong className="text-white">{activeRollUpEvent.l5Name}</strong></span>
                </span>
                <span className="flex items-center gap-1.5 font-bold">
                  <span className="text-graphite-400">{activeRollUpEvent.l5Old}%</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-sm">{activeRollUpEvent.l5New}%</span>
                </span>
              </div>
              <div className="text-[11px] text-graphite-400 mt-1 pl-6">
                Weighted roll-up calculated across active L6 activities
              </div>
            </motion.div>

            {/* Step 3: Project Progress Recalculated */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: step >= 3 ? 1 : 0.4, x: 0 }}
              className={`p-3.5 rounded-card border transition-all duration-300 ${
                step >= 3
                  ? 'bg-graphite-850/90 border-emerald-500/40 text-white'
                  : 'bg-graphite-850/30 border-graphite-800 text-graphite-500'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-2 text-graphite-300 font-medium">
                  <Building2 className="w-4 h-4 text-amber-brand" />
                  <span>PROJECT: <strong className="text-white">PEP-001 Pipeline Expansion</strong></span>
                </span>
                <span className="flex items-center gap-1.5 font-bold">
                  <span className="text-graphite-400">{activeRollUpEvent.projectOld}%</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-sm">{activeRollUpEvent.projectNew}%</span>
                </span>
              </div>
              <div className="text-[11px] text-graphite-400 mt-1 pl-6">
                Overall project health and schedule variance updated
              </div>
            </motion.div>
          </div>

          <div className="pt-2 border-t border-graphite-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Immutable Audit Trail Logged</span>
            </div>
            <button
              onClick={dismissRollUpEvent}
              className="px-4 py-2 bg-amber-brand hover:bg-amber-hover text-graphite-950 font-semibold font-mono text-xs rounded-control transition-colors shadow-sm"
            >
              CONTINUE DASHBOARD
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
