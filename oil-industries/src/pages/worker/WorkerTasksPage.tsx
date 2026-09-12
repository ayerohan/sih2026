import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useLanguage } from '../../context/LanguageContext';
import { WorkerTaskCard } from '../../components/worker/WorkerTaskCard';
import { Filter, CheckSquare } from 'lucide-react';

export const WorkerTasksPage: React.FC = () => {
  const { l6Activities, l5Processes, workers } = useProject();
  const { t, language } = useLanguage();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const currentWorker = workers[0];
  const assignedL6s = l6Activities.filter(a => a.assignedWorkerId === currentWorker.id);

  const filteredTasks = assignedL6s.filter(a => {
    if (filterStatus === 'ALL') return true;
    return a.status === filterStatus;
  });

  const FILTER_LABELS: Record<string, { en: string; hi: string }> = {
    ALL: { en: 'ALL', hi: 'सभी' },
    IN_PROGRESS: { en: 'IN PROGRESS', hi: 'प्रगति पर' },
    AT_RISK: { en: 'AT RISK', hi: 'जोखिम में' },
    DELAYED: { en: 'DELAYED', hi: 'विलंबित' },
    NOT_STARTED: { en: 'NOT STARTED', hi: 'शुरू नहीं हुआ' },
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      <div className="pb-2 border-b border-graphite-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-brand bg-graphite-900 px-2.5 py-1 rounded-full">
            {language === 'hi' ? 'क्षेत्रीय संचालन / कार्य' : 'FIELD OPERATIONS / TASKS'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-graphite-950 tracking-tight mt-1.5">
          {language === 'hi' ? 'आवंटित L6 गतिविधियां' : 'Assigned L6 Activities'}
        </h1>
        <p className="text-xs sm:text-sm text-graphite-600 mt-0.5">
          {language === 'hi'
            ? 'ईपीसी पैकेज 04 के अंतर्गत रवि कुमार (SE-8842) को सौंपे गए कार्य पैकेज।'
            : 'Work packages assigned to Ravi Kumar (SE-8842) under EPC Package 04.'}
        </p>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="w-3.5 h-3.5 text-graphite-400 shrink-0" />
        {['ALL', 'IN_PROGRESS', 'AT_RISK', 'DELAYED', 'NOT_STARTED'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
              filterStatus === s
                ? 'bg-amber-brand text-graphite-950 font-bold shadow-sm'
                : 'bg-white border border-graphite-200 text-graphite-700 hover:bg-offwhite-100'
            }`}
          >
            {language === 'hi' ? FILTER_LABELS[s]?.hi : FILTER_LABELS[s]?.en}
          </button>
        ))}
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        {filteredTasks.map(activity => {
          const parentL5 = l5Processes.find(l => l.id === activity.l5Id);
          return (
            <WorkerTaskCard
              key={activity.id}
              activity={activity}
              l5Name={parentL5?.name}
            />
          );
        })}
      </div>
    </div>
  );
};
