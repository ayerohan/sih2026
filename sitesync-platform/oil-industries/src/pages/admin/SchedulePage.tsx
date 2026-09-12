import React from 'react';
import { ScheduleWbsTree } from '../../components/admin/ScheduleWbsTree';

export const SchedulePage: React.FC = () => {
  return (
    <div className="space-y-12 max-w-7xl mx-auto font-sans pb-12">
      <div className="pb-7 border-b border-graphite-200">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="text-xs font-bold text-amber-brand bg-graphite-900 px-3.5 py-1.5 rounded-full">
            Project Control / Schedule
          </span>
          <span className="text-xs text-graphite-500 font-medium">
            PEP-001 · WBS Level 5/6 Hierarchy
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-graphite-950 tracking-tight">
          Work Breakdown Schedule
        </h1>
        <p className="text-base text-graphite-600 mt-1.5">
          Manage planned timelines, assign field engineers to L6 activities, adjust progress weights, and trace linked field logs.
        </p>
      </div>

      <ScheduleWbsTree />
    </div>
  );
};
