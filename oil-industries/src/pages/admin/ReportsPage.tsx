import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { KPBadge } from '../../components/common/KPBadge';
import { DocumentViewerModal } from '../../components/common/DocumentViewerModal';
import { downloadAttachment } from '../../utils/documentUtils';
import {
  FileText,
  Filter,
  Calendar,
  User,
  Search,
  ArrowUpRight,
  Paperclip,
  FileSpreadsheet,
  FileCode,
  Download,
  Eye,
  CheckCircle2,
  Files,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ReportAttachment } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const ReportsPage: React.FC = () => {
  const { fieldReports, aiMatches, l6Activities } = useProject();
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [previewFile, setPreviewFile] = useState<ReportAttachment | null>(null);

  const totalFilesCount = fieldReports.reduce(
    (acc, r) => acc + (r.attachments ? r.attachments.length : 0),
    0
  );

  const filteredReports = fieldReports.filter(r => {
    const matchesSearch =
      r.rawText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.attachments && r.attachments.some(a => a.name.toLowerCase().includes(searchTerm.toLowerCase())));
    
    let matchesStatus = true;
    if (filterStatus === 'WITH_FILES') {
      matchesStatus = Boolean(r.attachments && r.attachments.length > 0);
    } else if (filterStatus !== 'ALL') {
      matchesStatus = r.status === filterStatus;
    }
    return matchesSearch && matchesStatus;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return bytes + ' B';
  };

  const getFileBadge = (type: string) => {
    switch (type) {
      case 'pdf':
        return {
          icon: <FileText className="w-5 h-5 text-rose-600 shrink-0" />,
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          badgeText: 'PDF Document',
        };
      case 'excel':
        return {
          icon: <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />,
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          badgeText: 'Excel Sheet',
        };
      case 'word':
        return {
          icon: <FileCode className="w-5 h-5 text-sky-600 shrink-0" />,
          bg: 'bg-sky-50 border-sky-200 text-sky-800',
          badgeText: 'Word Doc',
        };
      default:
        return {
          icon: <Paperclip className="w-5 h-5 text-graphite-600 shrink-0" />,
          bg: 'bg-graphite-100 border-graphite-200 text-graphite-800',
          badgeText: 'Attachment',
        };
    }
  };

  const handleDownloadFile = (att: ReportAttachment) => {
    downloadAttachment(att);
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto font-sans pb-12">
      {/* Header */}
      <div className="pb-7 border-b border-graphite-200">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="text-xs font-bold text-amber-brand bg-graphite-900 px-3.5 py-1.5 rounded-full">
            Operations / Field Logs
          </span>
          <span className="text-xs text-graphite-500 font-medium">
            PEP-001 · Pipeline Expansion Project
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-graphite-950 tracking-tight">
          {t('reports.title', 'Field Execution Reports & Worker Files')}
        </h1>
        <p className="text-base text-graphite-600 mt-1.5">
          {t('reports.subtitle', 'Unstructured field logs and enrolled technical files (PDF, Excel, Word) submitted by field site engineers.')}
        </p>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
        <div className="bg-white p-7 sm:p-8 rounded-3xl border border-graphite-200/80 shadow-sm space-y-3">
          <span className="text-xs text-graphite-500 uppercase font-semibold tracking-wider">
            {t('reports.total', 'Total Field Reports')}
          </span>
          <div className="text-4xl sm:text-5xl font-extrabold text-graphite-950 font-mono tracking-tight">{fieldReports.length}</div>
          <span className="text-xs text-graphite-400 font-medium block pt-2 border-t border-graphite-100">
            {language === 'hi' ? 'सेक्टर 04 के अंतर्गत' : 'Across Sector 04'}
          </span>
        </div>

        <div className="bg-white p-7 sm:p-8 rounded-3xl border border-amber-brand/40 shadow-sm space-y-3 bg-gradient-to-br from-amber-50/40 via-white to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-800 uppercase font-bold tracking-wider">
              {t('reports.files', 'Enrolled Worker Files')}
            </span>
            <span className="p-1.5 bg-amber-100 rounded-lg text-amber-700">
              <Files className="w-4 h-4" />
            </span>
          </div>
          <div className="text-4xl sm:text-5xl font-extrabold text-amber-brand font-mono tracking-tight">
            {totalFilesCount} <span className="text-xl font-normal text-graphite-500 font-sans">{language === 'hi' ? 'फाइलें' : 'Files'}</span>
          </div>
          <span className="text-xs text-amber-900 font-medium block pt-2 border-t border-amber-100">
            {language === 'hi' ? 'PDF, Excel और Word दस्तावेज' : 'PDFs, Excel Logs & Word Docs'}
          </span>
        </div>

        <div className="bg-white p-7 sm:p-8 rounded-3xl border border-graphite-200/80 shadow-sm space-y-3">
          <span className="text-xs text-emerald-700 uppercase font-semibold tracking-wider">
            {t('reports.verified', 'Verified Reports')}
          </span>
          <div className="text-4xl sm:text-5xl font-extrabold text-emerald-700 font-mono tracking-tight">
            {fieldReports.filter(r => r.status === 'VERIFIED').length}
          </div>
          <span className="text-xs text-graphite-400 font-medium block pt-2 border-t border-graphite-100">
            {language === 'hi' ? 'एआई व गुणवत्ता सत्यापन उत्तीर्ण' : 'Passed Quality & AI Validation'}
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-7 sm:p-8 rounded-3xl border border-graphite-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-lg">
          <Search className="w-5 h-5 text-graphite-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder={
              language === 'hi'
                ? 'रिपोर्ट लॉग, केपी, फाइलें (.pdf, .xlsx), पर्यवेक्षक खोजें...'
                : 'Search report logs, KP, files (e.g. .pdf, .xlsx), workers...'
            }
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-offwhite-50 border border-graphite-200 rounded-2xl text-sm font-sans text-graphite-900 placeholder-graphite-400 focus:outline-none focus:border-amber-brand transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-graphite-700 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-amber-brand" />
            <span>{language === 'hi' ? 'फ़िल्टर:' : 'Filter:'}</span>
          </div>
          {[
            { key: 'ALL', label: language === 'hi' ? 'सभी रिपोर्टें' : 'All Reports' },
            { key: 'WITH_FILES', label: language === 'hi' ? `फाइलों के साथ (${totalFilesCount})` : `With Files (${totalFilesCount})` },
            { key: 'AI_MATCHED', label: language === 'hi' ? 'एआई मिलान' : 'AI Matched' },
            { key: 'VERIFIED', label: language === 'hi' ? 'सत्यापित' : 'Verified' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === tab.key
                  ? 'bg-amber-brand text-graphite-950 font-bold shadow-sm'
                  : 'bg-graphite-100 text-graphite-600 hover:bg-graphite-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-8">
        {filteredReports.map(report => {
          const match = aiMatches.find(m => m.reportId === report.id);
          const matchedL6 = match ? l6Activities.find(a => a.id === match.candidateL6Id) : null;
          const reportAttachments = report.attachments || [];

          return (
            <div
              key={report.id}
              className="bg-white rounded-3xl border border-graphite-200/80 shadow-sm p-8 sm:p-9 space-y-6 hover:border-graphite-300 hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-graphite-150">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-sm font-bold text-graphite-900 bg-graphite-150 px-3 py-1 rounded-xl border border-graphite-200">
                    {report.id}
                  </span>
                  <KPBadge location={report.locationText} size="sm" />
                  <StatusBadge status={report.status} size="sm" />
                  {reportAttachments.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold">
                      <Paperclip className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        {reportAttachments.length} {language === 'hi' ? 'संलग्न फाइलें' : `Enrolled File${reportAttachments.length > 1 ? 's' : ''}`}
                      </span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-5 text-xs font-medium text-graphite-500 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-graphite-400" />
                    <strong className="text-graphite-800 font-semibold">{report.workerName}</strong> ({report.workerRole})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-graphite-400" />
                    {report.date}
                  </span>
                  {report.submissionTimestamp && (
                    <span className="text-graphite-400 font-mono text-[11px] bg-graphite-100 px-2.5 py-1 rounded-lg">
                      ⏱ {report.submissionTimestamp}
                    </span>
                  )}
                </div>
              </div>

              {/* Raw text */}
              <div className="bg-offwhite-50 p-5 rounded-2xl text-base leading-relaxed text-graphite-800 border border-graphite-200 italic shadow-inner">
                "{report.rawText}"
              </div>

              {/* ENROLLED FILES & TECHNICAL DOCUMENTS SECTION */}
              {reportAttachments.length > 0 && (
                <div className="bg-offwhite-100/70 p-5 sm:p-6 rounded-2xl border border-graphite-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Files className="w-4 h-4 text-amber-brand" />
                      <h4 className="text-xs font-bold text-graphite-800 uppercase tracking-wider">
                        {language === 'hi' ? 'संलग्न फील्ड दस्तावेज व फाइलें' : 'Enrolled Worker Documents & Files'} ({reportAttachments.length})
                      </h4>
                    </div>
                    <span className="text-xs text-graphite-400 font-medium">
                      {language === 'hi' ? 'फील्ड ऑपरेटर द्वारा अपलोड किया गया' : 'Uploaded by Field Operative'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reportAttachments.map(att => {
                      const badge = getFileBadge(att.type);
                      return (
                        <div
                          key={att.id}
                          className="bg-white p-4 rounded-xl border border-graphite-200 shadow-sm flex items-center justify-between gap-3 hover:border-graphite-300 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-2.5 rounded-xl border ${badge.bg}`}>
                              {badge.icon}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-graphite-900 truncate" title={att.name}>
                                {att.name}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-graphite-500 mt-0.5">
                                <span className="font-semibold uppercase text-[11px] text-graphite-600">{att.type}</span>
                                <span>·</span>
                                <span className="font-mono">{formatFileSize(att.size)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => setPreviewFile(att)}
                              className="p-2 text-graphite-500 hover:text-amber-brand hover:bg-graphite-100 rounded-xl transition-colors"
                              title="Preview Document"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadFile(att)}
                              className="p-2 text-graphite-500 hover:text-graphite-900 hover:bg-graphite-100 rounded-xl transition-colors"
                              title="Download File"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* AI Extraction & Matching Tag Footer */}
              {report.extractedData && (
                <div className="pt-3 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-graphite-400 text-xs uppercase font-bold tracking-wider">AI Extracted:</span>
                    <span className="px-3 py-1.5 bg-graphite-100 rounded-xl text-graphite-800 font-semibold">
                      {report.extractedData.discipline}
                    </span>
                    <span className="px-3 py-1.5 bg-graphite-100 rounded-xl text-graphite-800 font-semibold">
                      {report.extractedData.pipeSize || '12" CS'}
                    </span>
                    <span className="px-3 py-1.5 bg-amber-50 text-amber-900 font-bold rounded-xl border border-amber-200">
                      +{report.extractedData.quantDeltaEstimated}% Quantity Delta
                    </span>
                  </div>

                  {matchedL6 && (
                    <div className="flex items-center gap-3">
                      <span className="text-graphite-500 font-medium">Candidate L6: <strong className="text-graphite-900 font-mono font-bold">{matchedL6.code}</strong></span>
                      <Link
                        to="/admin/review"
                        className="text-amber-brand hover:text-amber-600 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <span>Review in AI Queue</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <DocumentViewerModal
          attachment={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
};
