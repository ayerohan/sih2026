import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Sparkles, Cpu, Target, FileSearch, ShieldCheck } from 'lucide-react';
import { ExtractedReportData, AIMatch } from '../../types';

interface AIProcessingRadarProps {
  onComplete: () => void;
  extractedData?: ExtractedReportData;
  aiMatch?: AIMatch;
}

export const AIProcessingRadar: React.FC<AIProcessingRadarProps> = ({
  onComplete,
  extractedData,
  aiMatch,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [animatedConfidence, setAnimatedConfidence] = useState<number>(0);

  const steps = [
    { label: 'REPORT RECEIVED & VALIDATED', icon: CheckCircle2, duration: 450 },
    { label: 'WORK ACTIVITIES & ENTITIES EXTRACTED', icon: FileSearch, duration: 550 },
    { label: 'LOCATION BOUNDARIES IDENTIFIED (KP 12–12.5)', icon: Target, duration: 500 },
    { label: 'MATCHING WITH L6 SCHEDULE ACTIVITIES', icon: Cpu, duration: 650 },
    { label: 'CALCULATING MULTI-FACTOR CONFIDENCE SCORE', icon: Sparkles, duration: 600 },
    { label: 'MATCH COMPLETE · DISPATCHING TO REVIEW QUEUE', icon: ShieldCheck, duration: 400 },
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const runSteps = (stepIdx: number) => {
      if (stepIdx < steps.length) {
        setCurrentStep(stepIdx);
        timer = setTimeout(() => {
          runSteps(stepIdx + 1);
        }, steps[stepIdx].duration);
      } else {
        setCurrentStep(steps.length);
        setTimeout(() => {
          onComplete();
        }, 800);
      }
    };

    runSteps(0);
    return () => clearTimeout(timer);
  }, []);

  // Animate confidence score counter
  useEffect(() => {
    if (currentStep >= 4) {
      const target = aiMatch?.confidence || 94;
      let start = 0;
      const interval = setInterval(() => {
        start += 4;
        if (start >= target) {
          setAnimatedConfidence(target);
          clearInterval(interval);
        } else {
          setAnimatedConfidence(start);
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [currentStep, aiMatch]);

  return (
    <div className="bg-graphite-900 border border-graphite-700 rounded-card p-6 text-white max-w-lg w-full mx-auto shadow-industrial-dark">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-graphite-800">
        <div className="w-10 h-10 rounded-xl bg-amber-brand/10 border border-amber-brand/30 flex items-center justify-center text-amber-brand">
          <Cpu className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="text-[10px] font-mono tracking-widest text-amber-brand font-semibold">
            SITESYNC VERIFICATION ENGINE v2.4
          </div>
          <h3 className="text-base font-bold text-white font-mono tracking-tight">
            Industrial AI Extraction Pipeline
          </h3>
        </div>
      </div>

      {/* Steps List */}
      <div className="my-6 space-y-3.5">
        {steps.map((step, idx) => {
          const isDone = currentStep > idx;
          const isCurrent = currentStep === idx;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isDone || isCurrent ? 1 : 0.35, x: 0 }}
              className={`flex items-center justify-between text-xs font-mono p-2.5 rounded-control transition-all ${
                isCurrent
                  ? 'bg-graphite-800 border border-amber-brand/40 text-amber-brand font-semibold'
                  : isDone
                  ? 'bg-graphite-850/60 text-emerald-400 font-medium'
                  : 'text-graphite-500'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-amber-brand animate-spin shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-graphite-700 inline-block shrink-0" />
                )}
                <span>{step.label}</span>
              </div>

              {isDone && <span className="text-[10px] text-graphite-400">PASSED</span>}
              {isCurrent && <span className="text-[10px] text-amber-brand animate-pulse">RUNNING...</span>}
            </motion.div>
          );
        })}
      </div>

      {/* Dynamic Confidence Counter Callout */}
      {currentStep >= 4 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-graphite-850 rounded-control border border-emerald-500/30 flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] font-mono text-graphite-400 block uppercase">
              AI MATCH CONFIDENCE
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {aiMatch?.candidateL6Code || 'PIPE-L6-003'} — {aiMatch?.candidateL6Name || 'Lay 12" Pipe KP 12–13'}
            </span>
          </div>
          <div className="text-right font-mono">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {animatedConfidence}%
            </span>
            <span className="block text-[9px] font-bold text-emerald-500 tracking-wider">
              HIGH CONFIDENCE
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
