import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  Shield,
  HardHat,
  FileEdit,
  CheckCircle2,
  Layers,
  X,
  Play,
  RotateCcw,
} from 'lucide-react';

interface DemoFlowGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoFlowGuideModal: React.FC<DemoFlowGuideModalProps> = ({ isOpen, onClose }) => {
  const { resetToDemoScenario } = useProject();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const steps = [
    {
      stepNumber: '01',
      title: 'Admin Control Room View',
      desc: 'Observe Project PEP-001 at 72% actual progress. Note L5 "Pipeline Installation" at 74% (Planned 82%) and activity PIPE-L6-003 at 10% (Planned 40% — AT RISK). Requires ADMIN role.',
      actionLabel: 'Go to Admin Dashboard',
      role: 'ADMIN',
      route: '/admin/dashboard',
      icon: Shield,
    },
    {
      stepNumber: '02',
      title: 'Worker Field Log Submission',
      desc: 'Log in as Site Engineer Ravi Kumar (WRK-001). Submit the field log: "12 inch pipe laying progressed from KP 12 to KP 12.5 today. 2 joints welded, inspection cleared." Requires WORKER role.',
      actionLabel: 'Open Field Report Form',
      role: 'WORKER',
      route: '/worker/report',
      icon: FileEdit,
    },
    {
      stepNumber: '03',
      title: 'AI Information Extraction & Matching',
      desc: 'Watch the industrial AI engine parse Discipline, KP coordinates, Pipe Size, and calculate multi-factor confidence evidence (94% Match to PIPE-L6-003). Requires WORKER role.',
      actionLabel: 'Preview AI Match Result',
      role: 'WORKER',
      route: '/worker/reports',
      icon: Sparkles,
    },
    {
      stepNumber: '04',
      title: 'Admin Verification & Live Roll-Up Cascade',
      desc: 'Log in as Admin (ADM-001). Open Review Queue. Inspect evidence and click ACCEPT MATCH. Watch PIPE-L6-003 (10% → 30%), L5 Process (52% → 58%), and Project (72% → 74%) automatically roll-up with live visual confirmation.',
      actionLabel: 'Open AI Review Queue',
      role: 'ADMIN',
      route: '/admin/review',
      icon: CheckCircle2,
    },
  ];

  const handleStepClick = (step: typeof steps[0]) => {
    navigate(step.route);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-950/75 backdrop-blur-sm">
      <div className="bg-graphite-900 border border-graphite-700 rounded-container text-white max-w-2xl w-full shadow-industrial-dark relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-graphite-800 flex items-center justify-between bg-graphite-850/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-brand/10 border border-amber-brand/30 flex items-center justify-center text-amber-brand">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-amber-brand font-semibold">
                PROJECT CONTROL EVALUATION GUIDE
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                SiteSync L5/L6 Interactive Demo Scenario
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-graphite-400 hover:text-white p-1 rounded-md hover:bg-graphite-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps List */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <p className="text-xs text-graphite-300 leading-relaxed">
            Experience how unstructured field reports are transformed by industrial AI into verifiable L6 activity progress, which immediately rolls up to L5 work packages and portfolio health:
          </p>

          <div className="space-y-3">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-card border border-graphite-750 bg-graphite-850 hover:border-amber-brand/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs font-bold text-amber-brand bg-graphite-900 border border-graphite-700 px-2 py-1 rounded">
                      {s.stepNumber}
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-amber-brand" />
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-brand transition-colors">
                          {s.title}
                        </h4>
                      </div>
                      <p className="text-xs text-graphite-400 max-w-md">{s.desc}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStepClick(s)}
                    className="self-start sm:self-center px-3 py-1.5 bg-graphite-750 hover:bg-amber-brand hover:text-graphite-950 text-white text-xs font-mono font-semibold rounded-control transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <span>{s.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-graphite-800 bg-graphite-950/80 flex items-center justify-between">
          <button
            onClick={() => {
              resetToDemoScenario();
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs font-mono text-graphite-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Scenario State</span>
          </button>

          <button
            onClick={() => {
              handleStepClick(steps[0]);
            }}
            className="px-4 py-2 bg-amber-brand hover:bg-amber-hover text-graphite-950 font-mono font-bold text-xs rounded-control flex items-center gap-2 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-graphite-950" />
            <span>START DEMO FROM STEP 1</span>
          </button>
        </div>
      </div>
    </div>
  );
};
