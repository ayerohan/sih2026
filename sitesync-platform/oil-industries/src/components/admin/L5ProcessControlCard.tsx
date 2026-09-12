import React, { useState } from 'react';
import { L5Process, L6Activity } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { ProgressBar } from '../common/ProgressBar';
import { KPBadge } from '../common/KPBadge';
import { ChevronDown, ChevronRight, Layers, Workflow, User, AlertCircle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

interface L5ProcessControlCardProps {
  l5: L5Process;
  l6Activities: L6Activity[];
  defaultExpanded?: boolean;
}

export const L5ProcessControlCard: React.FC<L5ProcessControlCardProps> = ({
  l5,
  l6Activities,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { language } = useLanguage();

  const childL6s = l6Activities.filter(a => l5.l6ActivityIds.includes(a.id) || a.l5Id === l5.id);

  return (
    <div className="bg-white rounded-3xl border border-graphite-200/80 shadow-sm hover:shadow-md overflow-hidden transition-all duration-200 hover:border-graphite-300 font-sans">
      {/* L5 Header Bar with Generous Padding */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-7 sm:p-8 bg-gradient-to-r from-offwhite-50 to-white cursor-pointer select-none flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-graphite-150 hover:bg-offwhite-100/60 transition-colors"
      >
        <div className="flex items-start sm:items-center gap-4">
          <button className="p-2 rounded-xl bg-graphite-100 text-graphite-600 hover:bg-graphite-200 transition-colors shrink-0 mt-0.5 sm:mt-0">
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs font-bold text-amber-brand bg-graphite-900 px-3 py-1 rounded-lg">
                WBS {l5.wbsNumber}
              </span>
              <span className="text-xs text-graphite-500 uppercase font-semibold">
                {language === 'hi' ? 'L5 कार्य पैकेज · ' : 'L5 Work Package · '}{l5.discipline}
              </span>
              <StatusBadge status={l5.status} size="sm" />
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-graphite-950 tracking-tight mt-2">
              {l5.name}
            </h3>
          </div>
        </div>

        {/* L5 Metrics & Mini Bar */}
        <div className="flex items-center gap-7 md:w-96 shrink-0">
          <div className="flex-1">
            <ProgressBar
              actual={l5.actualProgress}
              planned={l5.plannedProgress}
              variance={l5.variance}
              status={l5.status}
              height="md"
            />
          </div>
          <div className="text-right shrink-0">
            <div className="text-[11px] text-graphite-400 font-semibold uppercase tracking-wider">
              {language === 'hi' ? 'महत्व' : 'Weight'}
            </div>
            <div className="text-lg font-extrabold text-graphite-900 font-mono">{l5.weightInProject}%</div>
          </div>
        </div>
      </div>

      {/* Expandable L6 Sub-Activities Section */}
      {isExpanded && (
        <div className="divide-y divide-graphite-150 bg-offwhite-50/50">
          <div className="px-8 py-4 bg-graphite-100/80 border-b border-graphite-200 flex items-center justify-between text-xs font-semibold text-graphite-500 uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <Workflow className="w-4 h-4 text-amber-brand" />
              <span>{language === 'hi' ? 'L6 विशिष्ट गतिविधियां' : 'L6 Granular Activities'} ({childL6s.length})</span>
            </div>
            <span className="hidden sm:inline font-medium">
              {language === 'hi' ? 'वास्तविक बनाम नियोजित · स्थिति · पर्यवेक्षक' : 'Actual vs Planned · Status · Assigned Worker'}
            </span>
          </div>

          {childL6s.length === 0 ? (
            <div className="p-8 text-center text-xs text-graphite-400 font-medium">
              {language === 'hi' ? 'इस L5 पैकेज के तहत कोई L6 गतिविधि कॉन्फ़िगर नहीं है।' : 'No L6 activities configured under this L5 work package.'}
            </div>
          ) : (
            childL6s.map((l6) => (
              <div
                key={l6.id}
                className="p-6 sm:px-8 hover:bg-white transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-5 group"
              >
                {/* Left: Code, Name, Location */}
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-graphite-900 bg-graphite-150 px-2.5 py-0.5 rounded-md border border-graphite-200">
                      {l6.code}
                    </span>
                    <KPBadge location={l6.location} size="sm" />
                    <span className="text-xs text-graphite-500 font-medium">
                      {l6.discipline}
                    </span>
                    <StatusBadge status={l6.status} size="sm" />
                    {l6.status === 'AT_RISK' && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>{language === 'hi' ? 'प्रगति आवश्यक' : 'Needs Field Progress'}</span>
                      </span>
                    )}
                  </div>

                  <div className="text-sm sm:text-base font-semibold text-graphite-900 flex items-center gap-2">
                    <span>{l6.name}</span>
                    <span className="text-xs text-graphite-400 font-mono font-normal hidden sm:inline">
                      ({l6.specs.pipeSize || l6.specs.material || 'Standard Spec'})
                    </span>
                  </div>
                </div>

                {/* Right: Worker, Progress Bar, Link */}
                <div className="flex items-center gap-5 sm:gap-7 shrink-0 pt-2 lg:pt-0">
                  <div className="flex items-center gap-2 text-xs text-graphite-600 w-38 shrink-0 font-medium">
                    <User className="w-4 h-4 text-graphite-400" />
                    <span className="truncate">{l6.assignedWorkerName}</span>
                  </div>

                  <div className="w-48 sm:w-60">
                    <ProgressBar
                      actual={l6.actualProgress}
                      planned={l6.plannedProgress}
                      variance={l6.variance}
                      status={l6.status}
                      height="sm"
                    />
                  </div>

                  <Link
                    to={`/admin/projects/${l6.projectId}/schedule`}
                    className="p-2 text-graphite-400 hover:text-amber-brand hover:bg-graphite-100 rounded-xl transition-colors"
                    title="View in WBS Schedule"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
