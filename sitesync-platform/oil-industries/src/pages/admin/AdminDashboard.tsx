import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { useLanguage } from '../../context/LanguageContext';
import { L5ProcessControlCard } from '../../components/admin/L5ProcessControlCard';
import { SCurveChart } from '../../components/admin/SCurveChart';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ProgressBar } from '../../components/common/ProgressBar';
import {
  ShieldAlert,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  FolderKanban,
  CheckCircle2,
  Clock,
  ArrowRight,
  Layers,
  Activity,
  History,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const {
    projects,
    l5Processes,
    l6Activities,
    aiMatches,
    auditLogs,
    selectedProjectId,
  } = useProject();
  const { t, language } = useLanguage();

  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  const pendingMatches = aiMatches.filter(m => m.status === 'PENDING_REVIEW');
  const projectL5s = l5Processes.filter(l => currentProject.l5ProcessIds.includes(l.id));

  // Count active project metrics
  const totalProjects = projects.length;
  const onScheduleProjects = projects.filter(p => p.variance >= -5 && p.status !== 'CRITICAL').length;
  const atRiskProjects = projects.filter(p => p.variance < -5 || p.status === 'CRITICAL').length;

  return (
    <div className="space-y-12 max-w-7xl mx-auto font-sans pb-12">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-7 border-b border-graphite-200">
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-graphite-950 tracking-tight">
            {t('dash.title', 'Project Control')}
          </h1>
          <p className="text-base text-graphite-600 mt-1">
            {language === 'hi' ? 'पोर्टफोलियो अवलोकन · ' : 'Portfolio overview · '}
            <strong className="font-semibold text-graphite-800">
              {totalProjects.toString().padStart(2, '0')} {language === 'hi' ? 'सक्रिय ईपीसी परियोजनाएं' : 'active EPC projects'}
            </strong>
            {' · '}
            {language === 'hi' ? 'L5/L6 पदानुक्रमित विचरण बुद्धिमत्ता' : 'L5/L6 hierarchical variance intelligence'}
          </p>
        </div>

        {/* Live Status Callout Pill */}
        <div className="flex items-center gap-3.5 bg-white px-6 py-3 rounded-2xl border border-graphite-200/90 shadow-sm self-start md:self-auto">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-xs">
            <span className="text-graphite-400 block text-[11px] font-semibold uppercase tracking-wider">
              {t('dash.intelStatus', 'Intelligence Status')}
            </span>
            <span className="font-bold text-graphite-900 text-sm">
              {t('dash.realtimeSync', 'Realtime Sync Active')}
            </span>
          </div>
        </div>
      </div>

      {/* Spacious 4-Column Balanced KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
        {/* Metric 1: Total Active Projects */}
        <div className="bg-white p-7 sm:p-8 rounded-3xl border border-graphite-200/80 shadow-sm hover:shadow-md space-y-4 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-graphite-500 text-xs font-semibold tracking-wider uppercase">
            <span>{t('dash.activeProjects', 'Active Projects')}</span>
            <FolderKanban className="w-4 h-4 text-graphite-400" />
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-extrabold text-graphite-950 tracking-tight">
                {totalProjects.toString().padStart(2, '0')}
              </span>
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">
                {t('dash.allSectors', 'ALL SECTORS')}
              </span>
            </div>
            <div className="text-xs text-graphite-500 font-medium pt-2 border-t border-graphite-100">
              {t('dash.corridors', 'Assam & Bengal EPC Corridors')}
            </div>
          </div>
        </div>

        {/* Metric 2: On Schedule */}
        <div className="bg-white p-7 sm:p-8 rounded-3xl border border-graphite-200/80 shadow-sm hover:shadow-md space-y-4 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-graphite-500 text-xs font-semibold tracking-wider uppercase">
            <span>{t('dash.onSchedule', 'On Schedule')}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-extrabold text-emerald-700 tracking-tight">
                {onScheduleProjects.toString().padStart(2, '0')}
              </span>
              <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg">
                {t('dash.onTrack', 'ON TRACK')}
              </span>
            </div>
            <div className="text-xs text-graphite-500 font-medium pt-2 border-t border-graphite-100">
              {t('dash.withinTolerance', 'Within ±5% Tolerance')}
            </div>
          </div>
        </div>

        {/* Metric 3: Critical / At Risk */}
        <div className="bg-white p-7 sm:p-8 rounded-3xl border border-graphite-200/80 shadow-sm hover:shadow-md space-y-4 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-graphite-500 text-xs font-semibold tracking-wider uppercase">
            <span>{t('dash.varianceCritical', 'Critical Focus')}</span>
            <AlertTriangle className="w-4 h-4 text-amber-brand" />
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-extrabold text-amber-brand tracking-tight">
                {atRiskProjects.toString().padStart(2, '0')}
              </span>
              <span className="text-xs text-amber-900 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg">
                {t('dash.scheduleLag', 'AT RISK')}
              </span>
            </div>
            <div className="text-xs text-rose-700 font-semibold pt-2 border-t border-graphite-100">
              {t('dash.delayedPkg', 'Requires L5 process intervention')}
            </div>
          </div>
        </div>

        {/* Metric 4: AI Review Queue Banner */}
        <div className="bg-gradient-to-br from-graphite-900 via-graphite-850 to-graphite-900 p-7 sm:p-8 rounded-3xl border border-graphite-750 shadow-industrial text-white space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-brand animate-pulse" />
              <span className="text-xs text-amber-brand tracking-wider font-bold uppercase">
                {t('dash.pendingAI', 'Verification Queue')}
              </span>
            </div>
            <Link
              to="/admin/review"
              className="px-3 py-1.5 bg-amber-brand hover:bg-amber-hover text-graphite-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>{language === 'hi' ? 'समीक्षा करें' : 'Review'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2.5">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                {pendingMatches.length.toString().padStart(2, '0')}
              </span>
              <span className="text-xs text-amber-brand font-medium">
                {language === 'hi' ? 'अनुमोदन लंबित' : 'Pending Approval'}
              </span>
            </div>
            <div className="text-xs text-graphite-300 pt-2 border-t border-graphite-750 font-medium truncate">
              {t('dash.queuedReports', 'Queued Field Reports')}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Project Highlight Card with Expansive Breathing Room */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-graphite-200/80 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-graphite-150">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs font-bold text-graphite-950 bg-amber-brand px-3 py-1 rounded-lg">
                {currentProject.code}
              </span>
              <span className="text-xs text-graphite-500 font-semibold">{currentProject.packageCode}</span>
              <StatusBadge status={currentProject.status} size="sm" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-graphite-950 tracking-tight">
              {currentProject.name}
            </h2>
            <div className="text-xs sm:text-sm text-graphite-500 font-medium">
              {language === 'hi' ? 'स्थान:' : 'Location:'} <strong className="text-graphite-800">{currentProject.location}</strong> · {language === 'hi' ? 'ईपीसी ठेकेदार:' : 'EPC Contractor:'} <strong className="text-graphite-800">{currentProject.contractor}</strong>
            </div>
          </div>

          <div className="w-full md:w-96 bg-offwhite-50 p-5 sm:p-6 rounded-2xl border border-graphite-200/80 space-y-2">
            <div className="text-xs text-graphite-500 uppercase font-semibold tracking-wider">
              {language === 'hi' ? 'परियोजना की समग्र प्रगति' : 'Overall Project Progress'}
            </div>
            <ProgressBar
              actual={currentProject.actualProgress}
              planned={currentProject.plannedProgress}
              variance={currentProject.variance}
              status={currentProject.status}
              height="md"
            />
          </div>
        </div>

        {/* Project Quick Sub-tabs */}
        <div className="flex items-center gap-3 overflow-x-auto text-xs pt-1">
          <Link
            to={`/admin/projects/${currentProject.id}`}
            className="px-5 py-2.5 bg-graphite-900 text-white rounded-xl font-semibold shadow-sm"
          >
            {language === 'hi' ? 'अवलोकन' : 'Overview'}
          </Link>
          <Link
            to={`/admin/projects/${currentProject.id}/schedule`}
            className="px-5 py-2.5 bg-graphite-100 hover:bg-graphite-200 text-graphite-700 rounded-xl font-medium transition-colors"
          >
            {language === 'hi' ? 'WBS अनुसूची' : 'WBS Schedule'}
          </Link>
          <Link
            to={`/admin/projects/${currentProject.id}/progress`}
            className="px-5 py-2.5 bg-graphite-100 hover:bg-graphite-200 text-graphite-700 rounded-xl font-medium transition-colors"
          >
            {language === 'hi' ? 'प्रगति वक्र' : 'Progress Trajectory'}
          </Link>
          <Link
            to={`/admin/projects/${currentProject.id}/reports`}
            className="px-5 py-2.5 bg-graphite-100 hover:bg-graphite-200 text-graphite-700 rounded-xl font-medium transition-colors"
          >
            {language === 'hi' ? 'फील्ड लॉग' : 'Field Logs'}
          </Link>
          <Link
            to="/admin/review"
            className="px-5 py-2.5 bg-amber-brand/15 text-amber-900 border border-amber-brand/30 hover:bg-amber-brand/25 rounded-xl font-semibold transition-colors"
          >
            {language === 'hi' ? 'एआई समीक्षा कतार' : 'AI Review Queue'} ({pendingMatches.length})
          </Link>
        </div>
      </div>

      {/* PRIORITY 1: L5 PROCESS CONTROL (Core Highlight of the Dashboard) */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs font-bold text-amber-brand uppercase bg-graphite-900 inline-block px-3.5 py-1 rounded-full">
              {language === 'hi' ? 'मुख्य नियंत्रण तंत्र' : 'Core Control Mechanism'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-graphite-950 tracking-tight">
              {language === 'hi' ? 'L5 कार्य पैकेज और प्रक्रिया नियंत्रण' : 'L5 Work Package & Process Control'}
            </h2>
          </div>
          <div className="text-xs text-graphite-500 font-medium">
            {language === 'hi' ? 'संबंधित L6 गतिविधियों को देखने के लिए किसी भी L5 पैकेज पर क्लिक करें' : 'Click any L5 work package to expand linked L6 field activities'}
          </div>
        </div>

        <div className="space-y-6">
          {projectL5s.map((l5, idx) => (
            <L5ProcessControlCard
              key={l5.id}
              l5={l5}
              l6Activities={l6Activities}
              defaultExpanded={idx === 0}
            />
          ))}
        </div>
      </div>

      {/* Two Column Grid: S-Curve Chart vs Recent Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <SCurveChart />
        </div>

        {/* Live Immutable Audit Trail Snippet (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-graphite-200/80 p-8 sm:p-9 shadow-sm space-y-6 flex flex-col justify-between font-sans">
          <div className="flex items-center justify-between pb-5 border-b border-graphite-150">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-amber-brand" />
              <h3 className="text-xl font-bold text-graphite-950 tracking-tight">
                {t('dash.liveAudit', 'Live Audit Trail')}
              </h3>
            </div>
            <Link
              to="/admin/audit"
              className="text-sm text-amber-brand hover:text-amber-600 font-bold transition-colors"
            >
              {language === 'hi' ? 'पूर्ण लॉग →' : 'Full Log →'}
            </Link>
          </div>

          <div className="space-y-6 divide-y divide-graphite-150">
            {auditLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="pt-5 first:pt-0 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-graphite-950 font-mono text-sm">{log.timeFormatted}</span>
                  <span className="px-3 py-1 bg-graphite-100 rounded-lg text-xs text-graphite-800 font-semibold border border-graphite-200/70">
                    {log.metaBadge || log.eventType}
                  </span>
                </div>
                <p className="text-sm text-graphite-800 leading-relaxed font-medium">
                  {log.details}
                </p>
                <div className="text-xs text-graphite-500 font-medium">
                  {language === 'hi' ? 'द्वारा: ' : 'By: '}<strong className="text-graphite-800 font-semibold">{log.user}</strong> ({log.role})
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
