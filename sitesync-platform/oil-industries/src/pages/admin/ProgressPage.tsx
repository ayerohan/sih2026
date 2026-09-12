import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { SCurveChart } from '../../components/admin/SCurveChart';
import { ProgressBar } from '../../components/common/ProgressBar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { TrendingUp, AlertOctagon, CheckCircle, BarChart2 } from 'lucide-react';

export const ProgressPage: React.FC = () => {
  const { projects, l5Processes, l6Activities, selectedProjectId } = useProject();
  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  const projectL5s = l5Processes.filter(l => currentProject.l5ProcessIds.includes(l.id));

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      <div className="pb-5 border-b border-graphite-200">
        <div className="flex items-center gap-2.5 mb-1.5">
          <span className="text-xs font-bold text-amber-brand bg-graphite-900 px-3 py-1 rounded-full">
            Progress & S-Curve
          </span>
          <span className="text-xs text-graphite-500 font-medium">
            {currentProject.code} · Earned Value & Variance
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-graphite-950 tracking-tight">
          Progress Trajectory & S-Curve
        </h1>
        <p className="text-sm text-graphite-600 mt-1">
          Real-time earned value progress curves comparing planned vs human-verified field actuals.
        </p>
      </div>

      {/* S-Curve Chart */}
      <SCurveChart />

      {/* Discipline & L5 Breakdown Grid */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-graphite-950 tracking-tight">
            L5 Work Package Variance Analysis
          </h2>
          <span className="text-xs text-graphite-500 font-medium">
            {projectL5s.length} Active Packages
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projectL5s.map(l5 => {
            const childL6 = l6Activities.filter(a => a.l5Id === l5.id);
            return (
              <div key={l5.id} className="bg-white p-6 sm:p-7 rounded-2xl border border-graphite-200/90 shadow-sm space-y-5 hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-xs pb-3 border-b border-graphite-150">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold bg-graphite-900 text-amber-brand px-2.5 py-1 rounded-lg">
                      {l5.wbsNumber}
                    </span>
                    <span className="font-bold text-graphite-950 text-base">{l5.name}</span>
                  </div>
                  <StatusBadge status={l5.status} size="sm" />
                </div>

                <ProgressBar
                  actual={l5.actualProgress}
                  planned={l5.plannedProgress}
                  variance={l5.variance}
                  status={l5.status}
                  height="md"
                />

                <div className="pt-2 border-t border-graphite-150 text-xs text-graphite-500 flex justify-between font-medium">
                  <span>Activities: <strong className="text-graphite-700">{childL6.length} L6 sub-tasks</strong></span>
                  <span>Weight: <strong className="text-graphite-700">{l5.weightInProject}% of project</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
