import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { useLanguage } from '../../context/LanguageContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { KPBadge } from '../../components/common/KPBadge';
import { FileText, Calendar, CheckCircle2, Sparkles, ArrowRight, Paperclip } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WorkerReportsHistoryPage: React.FC = () => {
  const { fieldReports, aiMatches, l6Activities } = useProject();
  const { t, language } = useLanguage();

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans">
      <div className="pb-5 border-b border-graphite-200">
        <div className="flex items-center gap-2.5 mb-1.5">
          <span className="text-xs font-bold text-amber-brand bg-graphite-900 px-3 py-1 rounded-full">
            {language === 'hi' ? 'फील्ड लॉग / मेरी प्रस्तुतियां' : 'Field Logs / My Submissions'}
          </span>
          <span className="text-xs text-graphite-500 font-medium">
            Ravi Kumar · {language === 'hi' ? 'फील्ड पर्यवेक्षक' : 'Site Engineer'} (SE-8842)
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-graphite-950 tracking-tight">
          {language === 'hi' ? 'मेरी फील्ड रिपोर्टें' : 'My Field Reports'}
        </h1>
        <p className="text-sm text-graphite-600 mt-1">
          {language === 'hi'
            ? 'रवि कुमार द्वारा प्रस्तुत सभी फील्ड लॉग, उनकी एआई मिलान स्थिति और सत्यापन विवरण।'
            : 'History of all field logs submitted by Ravi Kumar, their AI matching status, and verification states.'}
        </p>
      </div>

      <div className="space-y-6">
        {fieldReports.map(report => {
          const match = aiMatches.find(m => m.reportId === report.id);
          const matchedL6 = match ? l6Activities.find(a => a.id === match.candidateL6Id) : null;

          return (
            <div
              key={report.id}
              className="bg-white rounded-2xl border border-graphite-200/90 shadow-sm p-6 sm:p-7 space-y-5 hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-graphite-150">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-xs font-bold text-graphite-900 bg-graphite-150 px-2.5 py-1 rounded-lg">
                    {report.id}
                  </span>
                  <KPBadge location={report.locationText} size="sm" />
                  <StatusBadge status={report.status} size="sm" />
                </div>
                <div className="flex items-center gap-3 text-xs font-medium text-graphite-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-graphite-400" />
                    <span>{report.date}</span>
                  </span>
                  {report.submissionTimestamp && (
                    <span className="text-graphite-400 font-mono text-[11px]">
                      {language === 'hi' ? 'प्रस्तुत: ' : 'Submitted: '}{report.submissionTimestamp}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-sm leading-relaxed text-graphite-800 bg-offwhite-50 p-4 rounded-xl border border-graphite-200 italic shadow-inner">
                "{report.rawText}"
              </div>

              {report.attachments && report.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {report.attachments.map(att => (
                    <span
                      key={att.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-graphite-200 rounded-xl text-xs font-medium text-graphite-800 shadow-sm"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-amber-brand shrink-0" />
                      <span className="font-medium truncate max-w-[200px]">{att.name}</span>
                      <span className="text-[10px] text-graphite-400 font-mono uppercase">
                        ({att.type})
                      </span>
                    </span>
                  ))}
                </div>
              )}

              {match && (
                <div className="bg-graphite-900 text-white p-4 rounded-xl text-xs font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-brand shrink-0" />
                    <span>
                      {language === 'hi' ? 'संबद्ध L6: ' : 'Matched to '}
                      <strong className="font-bold text-amber-brand font-mono">{match.candidateL6Code}</strong> ({match.candidateL6Name})
                    </span>
                  </div>
                  <span className="font-bold text-amber-brand font-sans tracking-wide">
                    {match.confidence}% {language === 'hi' ? 'विश्वास' : 'CONFIDENCE'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
