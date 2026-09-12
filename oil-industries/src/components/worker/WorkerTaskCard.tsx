import React, { useState } from 'react';
import { L6Activity } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { ProgressBar } from '../common/ProgressBar';
import { KPBadge } from '../common/KPBadge';
import { ProgressSliderModal } from './ProgressSliderModal';
import { Sliders, Calendar, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

interface WorkerTaskCardProps {
  activity: L6Activity;
  l5Name?: string;
}

export const WorkerTaskCard: React.FC<WorkerTaskCardProps> = ({ activity, l5Name }) => {
  const [showSliderModal, setShowSliderModal] = useState(false);
  const { t, language } = useLanguage();

  return (
    <>
      <div className="bg-white rounded-3xl border border-graphite-200/80 shadow-sm hover:shadow-lg p-8 sm:p-9 space-y-6 hover:border-amber-brand/60 transition-all duration-200 font-sans group">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap mb-2">
              <span className="font-mono text-xs font-bold text-graphite-900 bg-graphite-150 px-3 py-1 rounded-lg border border-graphite-200">
                {activity.code}
              </span>
              <KPBadge location={activity.location} size="sm" />
              <StatusBadge status={activity.status} size="sm" />
            </div>
            <h3 className="text-xl font-bold text-graphite-950 tracking-tight">
              {activity.name}
            </h3>
            {l5Name && (
              <div className="text-xs text-graphite-500 font-medium mt-1.5">
                {language === 'hi' ? 'पैकेज:' : 'Package:'} <span className="font-semibold text-graphite-700">{l5Name}</span>
              </div>
            )}
          </div>

          <Link
            to={`/worker/tasks/${activity.id}`}
            className="text-xs font-semibold text-graphite-500 hover:text-amber-brand flex items-center gap-1 shrink-0 p-1.5 transition-colors"
          >
            <span>{language === 'hi' ? 'विवरण' : 'Details'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Specs snippet */}
        <div className="bg-offwhite-100 p-4 rounded-2xl text-xs text-graphite-700 flex flex-wrap items-center justify-between gap-3">
          <span>{language === 'hi' ? 'विशिष्टता:' : 'Spec:'} <strong className="font-semibold text-graphite-900">{activity.specs.pipeSize || activity.specs.material || 'Standard EPC'}</strong></span>
          <span className="text-graphite-500 font-medium">{language === 'hi' ? 'अंतिम तिथि:' : 'Due:'} <strong className="font-semibold text-graphite-800">{activity.endDate}</strong></span>
        </div>

        {/* Progress Dual Bar */}
        <div className="space-y-2">
          <ProgressBar
            actual={activity.actualProgress}
            planned={activity.plannedProgress}
            variance={activity.variance}
            status={activity.status}
            height="md"
          />
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-graphite-150 flex items-center justify-between gap-4">
          <Link
            to={`/worker/tasks/${activity.id}`}
            className="text-xs font-semibold text-graphite-600 hover:text-graphite-950 flex items-center gap-2 transition-colors py-1 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-amber-brand" />
            <span>{t('btn.viewTaskDetails', 'View Task Details')}</span>
          </Link>

          <Link
            to={`/worker/report?l6=${activity.id}`}
            className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-brand hover:from-amber-400 hover:to-amber-500 text-graphite-950 text-xs font-bold rounded-2xl transition-all flex items-center gap-2.5 shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>{t('btn.updateProgress', 'Update Progress')}</span>
          </Link>
        </div>
      </div>
    </>
  );
};
