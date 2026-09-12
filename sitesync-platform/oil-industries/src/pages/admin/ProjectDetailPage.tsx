import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { useLanguage } from '../../context/LanguageContext';
import { L5ProcessControlCard } from '../../components/admin/L5ProcessControlCard';
import { ScheduleWbsTree } from '../../components/admin/ScheduleWbsTree';
import { SCurveChart } from '../../components/admin/SCurveChart';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { DownloadProgressModal } from '../../components/admin/DownloadProgressModal';
import {
  Calendar,
  Layers,
  TrendingUp,
  FileText,
  Sparkles,
  MapPin,
  Building2,
  AlertTriangle,
  ChevronRight,
  Clock,
  Briefcase,
  Shield,
  ArrowRight,
  Download,
} from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, l5Processes, l6Activities, aiMatches } = useProject();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SCHEDULE' | 'PROGRESS' | 'REPORTS' | 'AI_REVIEW'>('OVERVIEW');
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const project = projects.find(p => p.id === projectId) || projects[0];
  const projectL5s = l5Processes.filter(l => project.l5ProcessIds?.includes(l.id) || l.projectId === project.id);
  const pendingCount = aiMatches.filter(m => m.status === 'PENDING_REVIEW').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-graphite-500 uppercase tracking-wider">
        <Link to="/admin/projects" className="hover:text-amber-brand transition-colors">
          {language === 'hi' ? 'सभी परियोजनाएं' : 'All Projects'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-mono text-graphite-700">{project.code}</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-amber-brand truncate max-w-xs">{project.name}</span>
      </div>

      {/* Modern, Airy, Elegant Master Project Card */}
      <div className="bg-white border border-graphite-200/90 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden space-y-6">
        {/* Top Amber Brand Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-brand to-safety-orange" />

        {/* Master Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-graphite-100">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs font-extrabold bg-graphite-900 text-amber-brand px-3 py-1 rounded-lg shadow-sm">
                {project.code}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-brand/10 text-amber-brand font-semibold border border-amber-brand/30">
                {project.packageCode || 'PACKAGE A'}
              </span>
              <StatusBadge status={project.status} size="sm" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-graphite-950">
              {project.name}
            </h1>

            {/* Quick Context Stats Row */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-graphite-600 font-medium">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-graphite-400 shrink-0" />
                <span>{project.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-graphite-400 shrink-0" />
                <span>
                  {project.startDate} &mdash; {project.endDate || project.targetDate || '2027-04-30'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-graphite-400 shrink-0" />
                <span>{language === 'hi' ? 'बजट:' : 'Budget:'} <strong className="text-graphite-900 font-bold">{project.budget || `₹${project.budgetTotalCr || 850} Cr`}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-graphite-400 shrink-0" />
                <span className="truncate max-w-[220px]">{project.contractor || project.client}</span>
              </div>
            </div>
          </div>

          {/* Master Progress Roll-Up Widget */}
          <div className="w-full lg:w-96 bg-graphite-50 p-5 rounded-2xl border border-graphite-200/80 space-y-3 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="text-graphite-500 font-semibold uppercase tracking-wider">
                {language === 'hi' ? 'समग्र रोल-अप' : 'Overall Roll-Up'}
              </span>
              <span className="font-mono font-extrabold text-sm text-graphite-900">
                {project.actualProgress}% / {project.plannedProgress}%
              </span>
            </div>
            <ProgressBar
              actual={project.actualProgress}
              planned={project.plannedProgress}
              variance={project.variance}
              status={project.status}
              height="md"
            />
            <div className="flex justify-between items-center text-[11px] text-graphite-500 pt-1">
              <span>{language === 'hi' ? 'विचलन:' : 'Variance:'} <strong className={project.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{project.variance > 0 ? `+${project.variance}` : project.variance}%</strong></span>
              <span>CPI: <strong className="text-graphite-800 font-mono">{project.cpi || '1.05'}</strong></span>
              <span>SPI: <strong className="text-graphite-800 font-mono">{project.spi || '0.98'}</strong></span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Bar with Clean Pills */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs pt-1">
          {(['OVERVIEW', 'SCHEDULE', 'PROGRESS', 'REPORTS', 'AI_REVIEW'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? 'bg-amber-brand text-graphite-950 shadow-sm'
                  : 'text-graphite-600 hover:text-graphite-900 hover:bg-graphite-100'
              }`}
            >
              {tab === 'OVERVIEW' && (language === 'hi' ? 'L5/L6 पदानुक्रम' : 'L5/L6 HIERARCHY')}
              {tab === 'SCHEDULE' && (language === 'hi' ? 'WBS अनुसूची' : 'WBS SCHEDULE')}
              {tab === 'PROGRESS' && (language === 'hi' ? 'एस-वक्र और ईवीए' : 'S-CURVE & EVA')}
              {tab === 'REPORTS' && (language === 'hi' ? 'फील्ड लॉग' : 'FIELD LOGS')}
              {tab === 'AI_REVIEW' && (language === 'hi' ? 'एआई सत्यापन' : 'AI VERIFICATION')}
              {tab === 'AI_REVIEW' && pendingCount > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-graphite-900 text-amber-brand font-mono font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}

          {/* Download Progress Report Button */}
          <button
            onClick={() => setShowDownloadModal(true)}
            className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-graphite-900 hover:bg-graphite-800 text-amber-brand text-xs font-bold rounded-xl transition-all shadow-sm shrink-0 cursor-pointer border border-graphite-750"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'प्रगति डाउनलोड करें' : 'Download Progress'}</span>
          </button>
        </div>
      </div>

      {/* Export Modal */}
      <DownloadProgressModal
        project={project}
        l5Processes={projectL5s}
        l6Activities={l6Activities}
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />

      {/* Tab Content */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-graphite-950 tracking-tight">
                  {language === 'hi' ? 'L5 कार्य पैकेज और विस्तार योग्य L6 गतिविधियां' : 'L5 Work Packages & Expandable L6 Activities'}
                </h2>
                <p className="text-xs text-graphite-500 mt-0.5">
                  {language === 'hi'
                    ? 'भौतिक प्रगति, ठेकेदार आवंटन और फील्ड सत्यापन का पदानुक्रमित रोल-अप।'
                    : 'Hierarchical rollup of physical progress, contractor assignments, and field verification.'}
                </p>
              </div>
              <span className="text-xs text-graphite-500 font-medium bg-graphite-100 px-3 py-1 rounded-full">
                {projectL5s.length} {language === 'hi' ? 'कार्य पैकेज' : 'Work Packages'}
              </span>
            </div>
            <div className="space-y-5">
              {projectL5s.map((l5, i) => (
                <L5ProcessControlCard
                  key={l5.id}
                  l5={l5}
                  l6Activities={l6Activities}
                  defaultExpanded={i === 0}
                />
              ))}
            </div>
          </div>

          <SCurveChart />
        </div>
      )}

      {activeTab === 'SCHEDULE' && (
        <div className="space-y-6">
          <ScheduleWbsTree />
        </div>
      )}

      {activeTab === 'PROGRESS' && (
        <div className="space-y-8">
          <SCurveChart />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectL5s.map(l5 => (
              <div key={l5.id} className="bg-white p-6 sm:p-7 rounded-2xl border border-graphite-200/90 shadow-sm space-y-4 hover:shadow-md transition-all">
                <div className="flex justify-between items-center text-xs pb-3 border-b border-graphite-150">
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
                  height="md"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'REPORTS' && (
        <div className="bg-white p-10 rounded-3xl border border-graphite-200/90 text-center space-y-4 shadow-sm max-w-xl mx-auto">
          <FileText className="w-12 h-12 text-graphite-400 mx-auto" />
          <h3 className="text-xl font-bold text-graphite-950 tracking-tight">Field Reports Log</h3>
          <p className="text-sm text-graphite-500">Check the dedicated Field Reports page for detailed entity tags and attached documents.</p>
          <Link
            to={`/admin/projects/${project.id}/reports`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-brand hover:bg-amber-hover text-graphite-950 font-bold text-sm rounded-xl transition-all shadow-md"
          >
            <span>View All Field Logs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {activeTab === 'AI_REVIEW' && (
        <div className="bg-white p-10 rounded-3xl border border-graphite-200/90 text-center space-y-4 shadow-sm max-w-xl mx-auto">
          <Sparkles className="w-12 h-12 text-amber-brand mx-auto" />
          <h3 className="text-xl font-bold text-graphite-950 tracking-tight">AI Verification Center</h3>
          <p className="text-sm text-graphite-500">Human-in-the-loop review queue for candidate activity matches.</p>
          <Link
            to="/admin/review"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-brand hover:bg-amber-hover text-graphite-950 font-bold text-sm rounded-xl transition-all shadow-md"
          >
            <span>Open AI Review Queue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};
