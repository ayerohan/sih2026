import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { KPBadge } from '../../components/common/KPBadge';
import { ProgressSliderModal } from '../../components/worker/ProgressSliderModal';
import {
  Sliders,
  FileEdit,
  ArrowLeft,
  Calendar,
  Layers,
  History,
  CheckCircle2,
} from 'lucide-react';

export const WorkerTaskDetailPage: React.FC = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const { l6Activities, l5Processes, fieldReports } = useProject();
  const [showSliderModal, setShowSliderModal] = useState(false);

  const activity = l6Activities.find(a => a.id === activityId) || l6Activities[2]; // defaults to PIPE-L6-003
  const parentL5 = l5Processes.find(l => l.id === activity.l5Id);
  const linkedReports = fieldReports.filter(r => activity.linkedReportIds.includes(r.id));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        to="/worker/tasks"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-graphite-600 hover:text-graphite-900"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Assigned Tasks</span>
      </Link>

      {/* Main Activity Detail Card */}
      <div className="bg-white rounded-card border border-graphite-200 shadow-industrial p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-graphite-150">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold bg-graphite-900 text-amber-brand px-2.5 py-0.5 rounded">
                {activity.code}
              </span>
              <KPBadge location={activity.location} size="md" />
              <StatusBadge status={activity.status} size="md" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-graphite-950 mt-1.5">
              {activity.name}
            </h1>
            <div className="text-xs font-mono text-graphite-500 mt-1">
              PARENT L5: <strong>{parentL5?.name}</strong> (WBS {parentL5?.wbsNumber})
            </div>
          </div>

          <button
            onClick={() => setShowSliderModal(true)}
            className="px-5 py-2.5 bg-amber-brand hover:bg-amber-hover text-graphite-950 font-mono font-bold text-xs rounded-control transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
          >
            <Sliders className="w-4 h-4" />
            <span>UPDATE PROGRESS</span>
          </button>
        </div>

        {/* Progress Bar Display */}
        <div className="bg-offwhite-100 p-4 rounded-card border border-graphite-200 space-y-2">
          <div className="text-xs font-mono font-semibold text-graphite-600 uppercase">
            EXECUTION STATUS & EARNED VALUE:
          </div>
          <ProgressBar
            actual={activity.actualProgress}
            planned={activity.plannedProgress}
            variance={activity.variance}
            status={activity.status}
            height="lg"
          />
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-graphite-50 rounded border border-graphite-200">
            <span className="text-graphite-400 block text-[10px]">DISCIPLINE</span>
            <span className="font-bold text-graphite-900">{activity.discipline}</span>
          </div>
          <div className="p-3 bg-graphite-50 rounded border border-graphite-200">
            <span className="text-graphite-400 block text-[10px]">PIPE SPEC / MATERIAL</span>
            <span className="font-bold text-graphite-900">{activity.specs.pipeSize || '12 inch CS'}</span>
          </div>
          <div className="p-3 bg-graphite-50 rounded border border-graphite-200">
            <span className="text-graphite-400 block text-[10px]">TOTAL TARGET</span>
            <span className="font-bold text-graphite-900">{activity.specs.totalQuantity || '1,000 m'}</span>
          </div>
          <div className="p-3 bg-graphite-50 rounded border border-graphite-200">
            <span className="text-graphite-400 block text-[10px]">WINDOW DUE</span>
            <span className="font-bold text-graphite-900">{activity.endDate}</span>
          </div>
        </div>

        {/* Activity Notes & Audit History */}
        <div className="space-y-3 pt-4 border-t border-graphite-150">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-graphite-800">
            <History className="w-4 h-4 text-amber-brand" />
            <span>PROGRESS UPDATE HISTORY:</span>
          </div>

          {activity.historyNotes.length === 0 ? (
            <div className="p-4 bg-offwhite-50 text-center text-xs font-mono text-graphite-400 rounded">
              No previous progress notes recorded yet.
            </div>
          ) : (
            <div className="space-y-2">
              {activity.historyNotes.map(note => (
                <div key={note.id} className="p-3 bg-offwhite-50 rounded border border-graphite-200 text-xs font-mono space-y-1">
                  <div className="flex justify-between text-graphite-500 text-[11px]">
                    <span className="font-semibold text-graphite-800">{note.author}</span>
                    <span>{note.timestamp}</span>
                  </div>
                  <p className="text-graphite-800">{note.note}</p>
                  <div className="text-[10px] text-amber-900 font-bold">
                    Progress: {note.progressFrom}% → {note.progressTo}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showSliderModal && (
        <ProgressSliderModal
          activity={activity}
          onClose={() => setShowSliderModal(false)}
        />
      )}
    </div>
  );
};
