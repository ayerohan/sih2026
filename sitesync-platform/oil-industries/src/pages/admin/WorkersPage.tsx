import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { useLanguage } from '../../context/LanguageContext';
import { Users, Phone, MapPin, CheckCircle, Clock } from 'lucide-react';

export const WorkersPage: React.FC = () => {
  const { workers, l6Activities } = useProject();
  const { t, language } = useLanguage();

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      <div className="pb-5 border-b border-graphite-200">
        <div className="flex items-center gap-2.5 mb-1.5">
          <span className="text-xs font-bold text-amber-brand bg-graphite-900 px-3 py-1 rounded-full">
            {language === 'hi' ? 'क्षेत्रीय संचालन / पर्यवेक्षक दल' : 'Field Operations / Crew'}
          </span>
          <span className="text-xs text-graphite-500 font-medium">
            PEP-001 · {language === 'hi' ? 'कार्यस्थल कर्मी' : 'On-Site Personnel'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-graphite-950 tracking-tight">
          {language === 'hi' ? 'साइट इंजीनियर्स और पर्यवेक्षक फोरमैन' : 'Site Engineers & Foremen'}
        </h1>
        <p className="text-sm text-graphite-600 mt-1">
          {language === 'hi'
            ? 'दैनिक L6 कार्य पैकेज, प्रगति अद्यतन और फील्ड रिपोर्ट दर्ज करने हेतु उत्तरदायी पर्यवेक्षक दल।'
            : 'Field crews responsible for daily L6 work packages, progress updates, and field report logging.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workers.map(worker => {
          const assignedActivities = l6Activities.filter(a => a.assignedWorkerId === worker.id);

          return (
            <div
              key={worker.id}
              className="bg-white rounded-2xl border border-graphite-200/90 shadow-sm p-6 sm:p-7 space-y-5 hover:border-amber-brand/40 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={worker.avatar}
                    alt={worker.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-graphite-200 shadow-sm shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-graphite-950 tracking-tight">{worker.name}</h3>
                      <span className="text-[11px] font-mono bg-graphite-150 px-2 py-0.5 rounded-md text-graphite-700 font-semibold">
                        {worker.badgeId}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-amber-900 mt-0.5">
                      {language === 'hi' && worker.role.includes('Engineer') ? 'साइट पर्यवेक्षक' : worker.role}
                    </div>
                    <div className="text-xs text-graphite-500 font-medium">{worker.discipline}</div>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
                  worker.status === 'IN_FIELD'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}>
                  ● {worker.status === 'IN_FIELD'
                      ? (language === 'hi' ? 'कार्यक्षेत्र में' : 'IN FIELD')
                      : (language === 'hi' ? 'उपलब्ध' : 'AVAILABLE')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-offwhite-50 p-4 rounded-xl text-xs border border-graphite-200">
                <div>
                  <span className="text-graphite-400 block text-[11px] font-semibold uppercase tracking-wider">
                    {language === 'hi' ? 'सक्रिय L6 कार्य' : 'Active L6 Assignments'}
                  </span>
                  <span className="font-bold text-graphite-950 text-sm mt-0.5 block">
                    {assignedActivities.length} {language === 'hi' ? 'गतिविधियां' : 'Activities'}
                  </span>
                </div>
                <div>
                  <span className="text-graphite-400 block text-[11px] font-semibold uppercase tracking-wider">
                    {language === 'hi' ? 'फोन / संपर्क' : 'Phone / VHF Contact'}
                  </span>
                  <span className="font-bold text-graphite-950 text-sm mt-0.5 block">{worker.phone}</span>
                </div>
              </div>

              {/* Assigned L6 activities chips */}
              <div className="space-y-2 pt-1 border-t border-graphite-150">
                <span className="text-xs font-semibold text-graphite-400 uppercase tracking-wider block">
                  {language === 'hi' ? 'आवंटित कार्य पैकेज:' : 'Assigned Work Packages:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {assignedActivities.map(act => (
                    <span
                      key={act.id}
                      className="px-3 py-1 bg-graphite-100 border border-graphite-200 rounded-lg text-xs font-medium text-graphite-800"
                    >
                      <strong className="font-mono font-semibold text-graphite-950">{act.code}</strong> · {act.actualProgress}%
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
