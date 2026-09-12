import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { useLanguage } from '../../context/LanguageContext';
import { ScheduleWbsTree } from '../../components/admin/ScheduleWbsTree';
import { AIMatchReviewCard } from '../../components/ai/AIMatchReviewCard';
import {
  CalendarDays,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Filter,
  RotateCcw,
  Layers,
  ArrowRight,
  Columns,
  ListTree,
  ChevronRight,
} from 'lucide-react';

interface SchedulePageProps {
  initialTab?: 'SCHEDULE' | 'REVIEW' | 'SPLIT';
}

export const SchedulePage: React.FC<SchedulePageProps> = ({ initialTab }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState<'SCHEDULE' | 'REVIEW' | 'SPLIT'>(
    initialTab || (tabParam === 'review' ? 'REVIEW' : 'SCHEDULE')
  );

  useEffect(() => {
    if (tabParam === 'review') {
      setActiveTab('REVIEW');
    } else if (tabParam === 'schedule') {
      setActiveTab('SCHEDULE');
    }
  }, [tabParam]);

  const { aiMatches, resetToDemoScenario, projects, selectedProjectId } = useProject();
  const { t, language } = useLanguage();
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('PENDING');

  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const pendingMatches = aiMatches.filter(m => m.status === 'PENDING_REVIEW');
  const acceptedMatches = aiMatches.filter(m => m.status === 'ACCEPTED');
  const rejectedMatches = aiMatches.filter(m => m.status === 'REJECTED');

  const displayMatches = aiMatches.filter(m => {
    if (filterLevel === 'PENDING') return m.status === 'PENDING_REVIEW';
    if (filterLevel === 'ACCEPTED') return m.status === 'ACCEPTED';
    if (filterLevel === 'REJECTED') return m.status === 'REJECTED';
    return true;
  });

  const handleTabSwitch = (tab: 'SCHEDULE' | 'REVIEW' | 'SPLIT') => {
    setActiveTab(tab);
    if (tab === 'REVIEW') {
      setSearchParams({ tab: 'review' });
    } else if (tab === 'SCHEDULE') {
      setSearchParams({ tab: 'schedule' });
    } else {
      setSearchParams({ tab: 'split' });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-12">
      {/* Page Header */}
      <div className="pb-5 border-b border-graphite-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <span className="text-xs font-bold text-amber-brand bg-graphite-900 px-3 py-1 rounded-full">
                {language === 'hi' ? 'परियोजना अनुसूची और समीक्षा केंद्र' : 'Schedule & Review Control Hub'}
              </span>
              <span className="text-xs text-graphite-500 font-medium">
                {currentProject.code} · WBS Level 5/6 & AI Verification
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-graphite-950 tracking-tight">
              {language === 'hi' ? 'कार्य अनुसूची और सत्यापन समीक्षा' : 'Work Breakdown Schedule & AI Review'}
            </h1>
            <p className="text-sm text-graphite-600 mt-1">
              {language === 'hi'
                ? 'नियोजित WBS समयसीमा का प्रबंधन करें और AI-सुझावित फील्ड गतिविधियों की समीक्षा एक ही स्थान पर करें।'
                : 'Manage planned WBS timelines and verify AI-suggested field activity matches in a unified, non-congested workspace.'}
            </p>
          </div>

          {/* Tab / Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-graphite-100 p-1.5 rounded-2xl shrink-0 self-start sm:self-auto border border-graphite-200/80">
            <button
              onClick={() => handleTabSwitch('SCHEDULE')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'SCHEDULE'
                  ? 'bg-white text-graphite-950 shadow-sm'
                  : 'text-graphite-600 hover:text-graphite-900'
              }`}
            >
              <ListTree className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'WBS अनुसूची' : 'WBS Schedule'}</span>
            </button>
            <button
              onClick={() => handleTabSwitch('REVIEW')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                activeTab === 'REVIEW'
                  ? 'bg-white text-graphite-950 shadow-sm'
                  : 'text-graphite-600 hover:text-graphite-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-brand" />
              <span>{language === 'hi' ? 'समीक्षा कतार' : 'Review Queue'}</span>
              {pendingMatches.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-amber-brand text-graphite-950">
                  {pendingMatches.length}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabSwitch('SPLIT')}
              className={`hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'SPLIT'
                  ? 'bg-white text-graphite-950 shadow-sm'
                  : 'text-graphite-600 hover:text-graphite-900'
              }`}
              title={language === 'hi' ? 'विभाजित दृश्य' : 'Split View'}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'विभाजित' : 'Split View'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Pending Alert Banner on Schedule Tab */}
      {activeTab === 'SCHEDULE' && pendingMatches.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-brand/10 to-amber-500/5 border border-amber-brand/30 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-amber-brand text-graphite-950 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <div>
              <div className="text-xs font-bold text-graphite-900">
                {language === 'hi'
                  ? `${pendingMatches.length} फील्ड रिपोर्ट गतिविधियां मानवीय समीक्षा की प्रतीक्षा कर रही हैं`
                  : `${pendingMatches.length} AI Field Activity Matches Awaiting Human Verification`}
              </div>
              <div className="text-[11px] text-graphite-600">
                {language === 'hi'
                  ? 'सत्यापन के बाद ये गतिविधियां स्वतः WBS L5 और परियोजना समग्र प्रगति में रोल-अप हो जाएंगी।'
                  : 'Once verified, progress rolls up automatically to WBS L5 packages and project health.'}
              </div>
            </div>
          </div>
          <button
            onClick={() => handleTabSwitch('REVIEW')}
            className="flex items-center gap-1.5 px-4 py-2 bg-graphite-900 hover:bg-graphite-800 text-amber-brand rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer shadow-sm"
          >
            <span>{language === 'hi' ? 'समीक्षा करें' : 'Review Queue'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Mode 1: SCHEDULE VIEW ONLY */}
      {activeTab === 'SCHEDULE' && (
        <div className="space-y-6">
          <ScheduleWbsTree />
        </div>
      )}

      {/* Mode 2: REVIEW QUEUE VIEW ONLY */}
      {activeTab === 'REVIEW' && (
        <div className="space-y-8 max-w-6xl mx-auto font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-graphite-950 tracking-tight">
                {t('queue.title', 'AI Match Review Queue')}
              </h2>
              <p className="text-xs text-graphite-600 mt-0.5">
                {t('queue.subtitle', 'Review AI-suggested L6 activity matches. When verified, progress automatically rolls up to L5 and Project health.')}
              </p>
            </div>
            <button
              onClick={resetToDemoScenario}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-graphite-100 border border-graphite-300 text-graphite-700 rounded-xl text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'डेमो मैच रीसेट करें' : 'Reset Demo Matches'}</span>
            </button>
          </div>

          {/* Filter Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={() => setFilterLevel('PENDING')}
              className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                filterLevel === 'PENDING'
                  ? 'bg-amber-50/70 border-amber-brand shadow-sm ring-1 ring-amber-brand/30'
                  : 'bg-white border-graphite-200 hover:bg-offwhite-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-graphite-500 font-semibold uppercase tracking-wider">
                <span>{t('queue.pending', 'Pending')}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-brand animate-pulse" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-graphite-950 tracking-tight mt-1.5">
                {pendingMatches.length.toString().padStart(2, '0')}
              </div>
              <div className="text-[11px] text-amber-900 font-medium mt-0.5">
                {language === 'hi' ? 'स्वीकृति प्रतीक्षारत' : 'Awaiting approval'}
              </div>
            </button>

            <button
              onClick={() => setFilterLevel('ACCEPTED')}
              className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                filterLevel === 'ACCEPTED'
                  ? 'bg-emerald-50/70 border-emerald-600 shadow-sm ring-1 ring-emerald-600/30'
                  : 'bg-white border-graphite-200 hover:bg-offwhite-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-graphite-500 font-semibold uppercase tracking-wider">
                <span>{t('queue.verified', 'Verified')}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight mt-1.5">
                {acceptedMatches.length.toString().padStart(2, '0')}
              </div>
              <div className="text-[11px] text-emerald-800 font-medium mt-0.5">
                {language === 'hi' ? 'रोल-अप अद्यतित' : 'Rolled up to L5'}
              </div>
            </button>

            <button
              onClick={() => setFilterLevel('REJECTED')}
              className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                filterLevel === 'REJECTED'
                  ? 'bg-rose-50/70 border-rose-500 shadow-sm ring-1 ring-rose-500/30'
                  : 'bg-white border-graphite-200 hover:bg-offwhite-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-graphite-500 font-semibold uppercase tracking-wider">
                <span>{t('queue.rejected', 'Rejected')}</span>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-700 tracking-tight mt-1.5">
                {rejectedMatches.length.toString().padStart(2, '0')}
              </div>
              <div className="text-[11px] text-rose-800 font-medium mt-0.5">
                {language === 'hi' ? 'बहिष्कृत' : 'Excluded'}
              </div>
            </button>

            <button
              onClick={() => setFilterLevel('ALL')}
              className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                filterLevel === 'ALL'
                  ? 'bg-graphite-900 border-graphite-700 text-white shadow-md'
                  : 'bg-white border-graphite-200 hover:bg-offwhite-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-graphite-400 font-semibold uppercase tracking-wider">
                <span>{t('queue.total', 'Total')}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-brand" />
              </div>
              <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-1.5 ${filterLevel === 'ALL' ? 'text-white' : 'text-graphite-950'}`}>
                {aiMatches.length.toString().padStart(2, '0')}
              </div>
              <div className={`text-[11px] font-medium mt-0.5 ${filterLevel === 'ALL' ? 'text-amber-brand' : 'text-graphite-500'}`}>
                {language === 'hi' ? 'सभी सुझाव' : 'All suggestions'}
              </div>
            </button>
          </div>

          {/* List of review cards */}
          <div className="space-y-6">
            {displayMatches.length === 0 ? (
              <div className="bg-white rounded-2xl border border-graphite-200/90 p-12 text-center space-y-3 shadow-sm">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-graphite-950 tracking-tight">
                  {language === 'hi' ? 'समीक्षा कतार रिक्त है!' : 'Review Queue is Clear!'}
                </h3>
                <p className="text-xs text-graphite-500 max-w-md mx-auto">
                  {language === 'hi'
                    ? 'सभी फील्ड रिपोर्ट सत्यापित कर ली गई हैं और L5 कार्य पैकेज में रोल-अप हो चुकी हैं।'
                    : 'All field reports have been verified and rolled up to L5 work packages. Switch to Worker role to submit a new report or reset demo data.'}
                </p>
              </div>
            ) : (
              displayMatches.map((match) => (
                <AIMatchReviewCard key={match.id} match={match} />
              ))
            )}
          </div>
        </div>
      )}

      {/* Mode 3: SPLIT VIEW (Schedule + Review Queue Side-by-Side with No Congestion) */}
      {activeTab === 'SPLIT' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-7 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-graphite-200">
              <h3 className="text-base font-bold text-graphite-900 flex items-center gap-2">
                <ListTree className="w-4 h-4 text-amber-brand" />
                <span>{language === 'hi' ? 'WBS कार्य अनुसूची' : 'WBS Schedule Structure'}</span>
              </h3>
            </div>
            <ScheduleWbsTree />
          </div>

          <div className="xl:col-span-5 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-graphite-200">
              <h3 className="text-base font-bold text-graphite-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-brand" />
                <span>{language === 'hi' ? 'एआई समीक्षा कतार' : 'AI Match Verification'}</span>
              </h3>
              <span className="text-xs font-mono font-bold bg-amber-brand text-graphite-950 px-2 py-0.5 rounded-full">
                {pendingMatches.length} {language === 'hi' ? 'लंबित' : 'Pending'}
              </span>
            </div>

            <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
              {pendingMatches.length === 0 ? (
                <div className="bg-white rounded-2xl border border-graphite-200 p-8 text-center text-graphite-500 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-semibold text-graphite-900">
                    {language === 'hi' ? 'कोई लंबित समीक्षा नहीं' : 'All Activities Verified'}
                  </p>
                  <p className="text-[11px] mt-1 text-graphite-500">
                    {language === 'hi' ? 'शेड्यूल पूरी तरह अद्यतित है' : 'Schedule is completely up to date'}
                  </p>
                </div>
              ) : (
                pendingMatches.map(match => (
                  <AIMatchReviewCard key={match.id} match={match} />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

