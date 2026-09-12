import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useLanguage } from '../../context/LanguageContext';
import { AIMatchReviewCard } from '../../components/ai/AIMatchReviewCard';
import { Sparkles, AlertTriangle, CheckCircle2, History, Filter, RotateCcw } from 'lucide-react';

export const ReviewQueuePage: React.FC = () => {
  const { aiMatches, resetToDemoScenario } = useProject();
  const { t, language } = useLanguage();
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('PENDING');

  const pendingMatches = aiMatches.filter(m => m.status === 'PENDING_REVIEW');
  const acceptedMatches = aiMatches.filter(m => m.status === 'ACCEPTED');
  const rejectedMatches = aiMatches.filter(m => m.status === 'REJECTED');

  const displayMatches = aiMatches.filter(m => {
    if (filterLevel === 'PENDING') return m.status === 'PENDING_REVIEW';
    if (filterLevel === 'ACCEPTED') return m.status === 'ACCEPTED';
    if (filterLevel === 'REJECTED') return m.status === 'REJECTED';
    return true;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-5 border-b border-graphite-200">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-xs font-bold text-amber-brand bg-graphite-900 px-3 py-1 rounded-full">
              {language === 'hi' ? 'एआई सत्यापन' : 'SiteSync AI Verification'}
            </span>
            <span className="text-xs text-graphite-500 font-medium">
              {language === 'hi' ? 'मानवीय नियंत्रण प्रणाली' : 'Human-in-the-Loop Control'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-graphite-950 tracking-tight">
            {t('queue.title', 'AI Match Review Queue')}
          </h1>
          <p className="text-sm text-graphite-600 mt-1">
            {t('queue.subtitle', 'Review AI-suggested L6 activity matches. When verified, progress automatically rolls up to L5 and Project health.')}
          </p>
        </div>

        <button
          onClick={resetToDemoScenario}
          className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-graphite-100 border border-graphite-300 text-graphite-700 rounded-xl text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{language === 'hi' ? 'डेमो मैच रीसेट करें' : 'Reset Demo Matches'}</span>
        </button>
      </div>

      {/* Filter Tabs & Queue Statistics with Spacious 2xl Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <button
          onClick={() => setFilterLevel('PENDING')}
          className={`p-5 sm:p-6 rounded-2xl border text-left transition-all duration-200 ${
            filterLevel === 'PENDING'
              ? 'bg-amber-50/70 border-amber-brand shadow-sm ring-1 ring-amber-brand/30'
              : 'bg-white border-graphite-200 hover:bg-offwhite-50 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-graphite-500 font-semibold uppercase tracking-wider">
            <span>{t('queue.pending', 'Pending Review')}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-brand animate-pulse" />
          </div>
          <div className="text-3xl font-extrabold text-graphite-950 tracking-tight mt-2">
            {pendingMatches.length.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-amber-900 font-medium mt-1">
            {language === 'hi' ? 'मानवीय स्वीकृति प्रतीक्षारत' : 'Awaiting human approval'}
          </div>
        </button>

        <button
          onClick={() => setFilterLevel('ACCEPTED')}
          className={`p-5 sm:p-6 rounded-2xl border text-left transition-all duration-200 ${
            filterLevel === 'ACCEPTED'
              ? 'bg-emerald-50/70 border-emerald-600 shadow-sm ring-1 ring-emerald-600/30'
              : 'bg-white border-graphite-200 hover:bg-offwhite-50 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-graphite-500 font-semibold uppercase tracking-wider">
            <span>{t('queue.verified', 'Verified & Rolled Up')}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-700 tracking-tight mt-2">
            {acceptedMatches.length.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-emerald-800 font-medium mt-1">
            {language === 'hi' ? 'L5 और प्रोजेक्ट अद्यतित' : 'L5 & Project updated'}
          </div>
        </button>

        <button
          onClick={() => setFilterLevel('REJECTED')}
          className={`p-5 sm:p-6 rounded-2xl border text-left transition-all duration-200 ${
            filterLevel === 'REJECTED'
              ? 'bg-rose-50/70 border-rose-500 shadow-sm ring-1 ring-rose-500/30'
              : 'bg-white border-graphite-200 hover:bg-offwhite-50 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-graphite-500 font-semibold uppercase tracking-wider">
            <span>{t('queue.rejected', 'Rejected Matches')}</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-extrabold text-rose-700 tracking-tight mt-2">
            {rejectedMatches.length.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-rose-800 font-medium mt-1">
            {language === 'hi' ? 'अनुसूची से बाहर रखा गया' : 'Excluded from schedule'}
          </div>
        </button>

        <button
          onClick={() => setFilterLevel('ALL')}
          className={`p-5 sm:p-6 rounded-2xl border text-left transition-all duration-200 ${
            filterLevel === 'ALL'
              ? 'bg-graphite-900 border-graphite-700 text-white shadow-md ring-1 ring-graphite-700'
              : 'bg-white border-graphite-200 hover:bg-offwhite-50 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-graphite-400 font-semibold uppercase tracking-wider">
            <span>{t('queue.total', 'Total Processed')}</span>
            <Sparkles className="w-4 h-4 text-amber-brand" />
          </div>
          <div className={`text-3xl font-extrabold tracking-tight mt-2 ${filterLevel === 'ALL' ? 'text-white' : 'text-graphite-950'}`}>
            {aiMatches.length.toString().padStart(2, '0')}
          </div>
          <div className={`text-xs font-medium mt-1 ${filterLevel === 'ALL' ? 'text-amber-brand' : 'text-graphite-500'}`}>
            {language === 'hi' ? 'सभी एआई सुझाव' : 'All AI suggestions'}
          </div>
        </button>
      </div>

      {/* Matches List */}
      <div className="space-y-6">
        {displayMatches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-graphite-200/90 p-12 text-center space-y-3 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-graphite-950 font-sans tracking-tight">
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
  );
};
