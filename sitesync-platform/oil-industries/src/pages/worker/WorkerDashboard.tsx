import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { useLanguage } from '../../context/LanguageContext';
import { WorkerTaskCard } from '../../components/worker/WorkerTaskCard';
import {
  FileEdit,
  CheckCircle2,
  ListTodo,
  MapPin,
  Sparkles,
  ArrowRight,
  HardHat,
  Clock,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const WorkerDashboard: React.FC = () => {
  const { l6Activities, l5Processes, workers } = useProject();
  const { t, language } = useLanguage();

  // Current worker is Ravi Kumar (W-01)
  const currentWorker = workers[0];
  const assignedL6s = l6Activities.filter(a => a.assignedWorkerId === currentWorker.id);
  const criticalTask = assignedL6s.find(a => a.code === 'PIPE-L6-003');

  return (
    <div className="space-y-12 max-w-6xl mx-auto font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-7 border-b border-graphite-200">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-xs font-bold text-amber-brand bg-graphite-900 px-3.5 py-1.5 rounded-full">
              {language === 'hi' ? 'क्षेत्रीय संचालन' : 'Field Operations'}
            </span>
            <span className="text-xs text-graphite-500 font-medium">
              11 SEP 2026 · 15:32
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-graphite-950 tracking-tight">
            {language === 'hi' ? 'नमस्ते, रवि' : 'Good Afternoon, Ravi'}
          </h1>
          <p className="text-base text-graphite-600 mt-1.5">
            PEP-001 · {language === 'hi' ? 'पाइपलाइन विस्तार परियोजना · सेक्टर 04 (असम)' : 'Pipeline Expansion Project · Sector 04 (Assam)'}
          </p>
        </div>

        {/* Quick Submit Report CTA Banner */}
        <Link
          to="/worker/report"
          className="px-7 py-3.5 bg-gradient-to-r from-amber-500 to-amber-brand hover:from-amber-400 hover:to-amber-500 text-graphite-950 font-bold text-sm rounded-2xl transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2.5 self-start sm:self-auto"
        >
          <FileEdit className="w-4 h-4 stroke-[2.5]" />
          <span>{t('btn.submitReport', '+ Submit Field Report')}</span>
        </Link>
      </div>

      {/* Daily Metrics with Expansive Cards & Large Gaps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
        <div className="bg-white p-8 sm:p-9 rounded-3xl border border-graphite-200/80 shadow-sm hover:shadow-md transition-all space-y-4">
          <span className="text-xs text-graphite-500 uppercase font-semibold tracking-wider">
            {t('metric.assignedTasks', 'Assigned Tasks')}
          </span>
          <div className="text-4xl sm:text-5xl font-extrabold text-graphite-950 tracking-tight font-mono">
            {assignedL6s.length} <span className="text-xl font-normal text-graphite-500 font-sans">{language === 'hi' ? 'कार्य' : 'Tasks'}</span>
          </div>
          <span className="text-xs text-graphite-400 font-medium block pt-3 border-t border-graphite-100">
            {language === 'hi' ? 'पाइपिंग और मैकेनिकल' : 'Piping & Mechanical'}
          </span>
        </div>

        <div className="bg-white p-8 sm:p-9 rounded-3xl border border-graphite-200/80 shadow-sm hover:shadow-md transition-all space-y-4">
          <span className="text-xs text-emerald-700 uppercase font-semibold tracking-wider">
            {t('metric.completedToday', 'Completed Today')}
          </span>
          <div className="text-4xl sm:text-5xl font-extrabold text-emerald-700 tracking-tight font-mono">
            02 <span className="text-xl font-normal text-emerald-600 font-sans">{language === 'hi' ? 'कार्य' : 'Tasks'}</span>
          </div>
          <span className="text-xs text-graphite-400 font-medium block pt-3 border-t border-graphite-100">
            KP 10–11 {language === 'hi' ? 'सेक्शन' : 'sections'}
          </span>
        </div>

        <div className="bg-white p-8 sm:p-9 rounded-3xl border border-graphite-200/80 shadow-sm hover:shadow-md transition-all space-y-4">
          <span className="text-xs text-amber-800 uppercase font-semibold tracking-wider">
            {t('metric.criticalFocus', 'Critical Focus')}
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-amber-brand tracking-tight font-mono">PIPE-L6-003</div>
          <span className="text-xs text-rose-700 font-semibold block pt-3 border-t border-graphite-100">
            KP 12–13 ({language === 'hi' ? '10% वास्तविक' : '10% actual'})
          </span>
        </div>
      </div>

      {/* PRIORITY SECTION: TODAY'S ASSIGNED WORK */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Layers className="w-6 h-6 text-amber-brand" />
            <h2 className="text-2xl font-bold text-graphite-950 tracking-tight">
              {language === 'hi' ? 'आज के कार्य पैकेज (L6)' : "Today's Work Packages (L6)"}
            </h2>
          </div>
          <span className="text-sm text-graphite-500 font-medium">
            {language === 'hi' ? 'प्रगति अपडेट करने या रिपोर्ट दर्ज करने हेतु कार्य चुनें' : 'Select a task to update progress or log a field report'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {assignedL6s.map(activity => {
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
    </div>
  );
};
