import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { History, Shield, CheckCircle2, FileText, Workflow, Layers, Building2 } from 'lucide-react';

export const AuditTrailPage: React.FC = () => {
  const { auditLogs } = useProject();

  return (
    <div className="space-y-12 max-w-5xl mx-auto font-sans pb-12">
      <div className="pb-7 border-b border-graphite-200">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="text-xs font-bold text-amber-brand bg-graphite-900 px-3.5 py-1.5 rounded-full">
            Governance / Audit Log
          </span>
          <span className="text-xs text-graphite-500 font-medium">
            Immutable Chronological Ledger
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-graphite-950 tracking-tight">
          Project Verification Audit Trail
        </h1>
        <p className="text-base text-graphite-600 mt-1.5">
          Complete end-to-end traceability from field log submission to AI candidate matching and verified L5 roll-up.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-graphite-200/80 shadow-sm p-8 sm:p-10">
        <div className="relative border-l-2 border-graphite-200 ml-4 pl-8 space-y-8">
          {auditLogs.map((log) => {
            return (
              <div key={log.id} className="relative group">
                {/* Node dot */}
                <span className="absolute -left-[39px] top-1.5 w-4 h-4 rounded-full bg-amber-brand border-2 border-white shadow-sm ring-4 ring-offwhite-100" />

                <div className="bg-offwhite-50 p-6 sm:p-7 rounded-2xl border border-graphite-200 space-y-3 group-hover:border-amber-brand/40 group-hover:bg-offwhite-100/60 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-graphite-950 font-mono text-sm">{log.timeFormatted}</span>
                      <span className="px-3 py-1 bg-graphite-200 text-graphite-800 rounded-lg font-semibold text-xs">
                        {log.metaBadge || log.eventType}
                      </span>
                      {log.wbsCode && (
                        <span className="text-amber-900 font-semibold text-xs bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          WBS {log.wbsCode}
                        </span>
                      )}
                    </div>
                    <span className="text-graphite-500 text-xs font-medium">
                      By: <strong className="text-graphite-800 font-semibold">{log.user}</strong> ({log.role})
                    </span>
                  </div>

                  <p className="text-base text-graphite-800 leading-relaxed font-medium">
                    {log.details}
                  </p>

                  {log.previousValue !== undefined && log.newValue !== undefined && (
                    <div className="text-xs font-mono text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 inline-block font-bold">
                      Delta: {log.previousValue} → {log.newValue}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
