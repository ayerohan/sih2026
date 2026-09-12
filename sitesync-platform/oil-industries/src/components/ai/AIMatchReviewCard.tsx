import React, { useState } from 'react';
import { AIMatch, L6Activity, L5Process, ReportAttachment } from '../../types';
import { useProject } from '../../context/ProjectContext';
import { useLanguage } from '../../context/LanguageContext';
import { ConfidenceMeter } from '../common/ConfidenceMeter';
import { KPBadge } from '../common/KPBadge';
import { StatusBadge } from '../common/StatusBadge';
import { DocumentViewerModal } from '../common/DocumentViewerModal';
import { downloadAttachment } from '../../utils/documentUtils';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  FileText,
  Workflow,
  Layers,
  MapPin,
  Calendar,
  Sliders,
  Check,
  ChevronDown,
  Paperclip,
  Eye,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

interface AIMatchReviewCardProps {
  match: AIMatch;
}

export const AIMatchReviewCard: React.FC<AIMatchReviewCardProps> = ({ match }) => {
  const {
    l6Activities,
    l5Processes,
    fieldReports,
    acceptAIMatch,
    rejectAIMatch,
    glitteringActivityId,
  } = useProject();
  const { t, language } = useLanguage();

  const [selectedCandidateL6Id, setSelectedCandidateL6Id] = useState<string>(match.candidateL6Id);
  const [customDelta, setCustomDelta] = useState<number>(match.suggestedProgressTo);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [showRejectBox, setShowRejectBox] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [viewingAttachment, setViewingAttachment] = useState<ReportAttachment | null>(null);

  const report = fieldReports.find(r => r.id === match.reportId);
  const candidateL6 = l6Activities.find(a => a.id === selectedCandidateL6Id);
  const candidateL5 = candidateL6 ? l5Processes.find(l => l.id === candidateL6.l5Id) : null;

  const isLowConfidence = match.confidence < 85;

  const handleAccept = () => {
    setIsProcessing(true);
    setTimeout(() => {
      acceptAIMatch(match.id, selectedCandidateL6Id, customDelta);
      setIsProcessing(false);
      toast.success(`Match ${match.id} Accepted! Cascaded roll-up to L5 and Project PEP-001.`, {
        description: `${candidateL6?.code} updated to ${customDelta}%.`,
      });
    }, 400);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Please specify a reason for rejecting this AI match.');
      return;
    }
    rejectAIMatch(match.id, rejectReason);
    setShowRejectBox(false);
    toast.info(`Match ${match.id} rejected.`);
  };

  const isGlittering = glitteringActivityId === match.candidateL6Id || (candidateL6 && glitteringActivityId === candidateL6.id);

  if (match.status === 'ACCEPTED') {
    return (
      <div className={`bg-white rounded-2xl border ${isGlittering ? 'animate-glitter-pulse border-amber-brand ring-4 ring-amber-400/50' : 'border-emerald-200'} p-5 shadow-sm transition-all duration-300 relative overflow-hidden`}>
        {isGlittering && (
          <div className="absolute top-2 right-4 px-2.5 py-0.5 bg-amber-400 text-graphite-950 text-[10px] font-extrabold uppercase rounded-full tracking-wider animate-bounce shadow-sm">
            {language === 'hi' ? '★ कार्य सत्यापित!' : '★ Task Verified!'}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider">
                {language === 'hi' ? 'मैच स्वीकृत एवं रोल-अप संपन्न' : 'MATCH ACCEPTED & ROLLED UP'}
              </span>
              <h4 className="text-sm font-bold text-graphite-900 font-mono">
                {match.candidateL6Code} — {match.candidateL6Name}
              </h4>
            </div>
          </div>
          <span className="text-xs font-mono text-graphite-500">
            {language === 'hi' ? 'दीपक सक्सेना द्वारा सत्यापित' : 'Verified by Deepak Saxena'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-graphite-200/90 shadow-sm hover:shadow-md overflow-hidden transition-all hover:border-graphite-300 font-sans">
      {/* Card Header with Spacious Padding */}
      <div className="p-5 sm:p-6 bg-graphite-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-graphite-800">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-brand/15 border border-amber-brand/30 flex items-center justify-center text-amber-brand shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs font-bold text-amber-brand">{match.id}</span>
              <span className="text-graphite-400 text-xs font-medium">· {language === 'hi' ? 'रिपोर्ट ' : 'Report '}{match.reportId}</span>
              <StatusBadge status={match.status} size="sm" />
            </div>
            <div className="text-xs text-graphite-300 font-medium mt-1">
              {language === 'hi'
                ? 'एआई मिलान सुझाव · मानवीय सत्यापन अनिवार्य'
                : 'AI Match Suggestion · Human Verification Required'}
            </div>
          </div>
        </div>

        {/* Confidence Gauge */}
        <div className="w-56 sm:w-64 bg-graphite-850 p-3 rounded-xl border border-graphite-750">
          <ConfidenceMeter confidence={match.confidence} size="md" />
        </div>
      </div>

      {/* Main Grid: Left (Report Log) vs Right (Schedule Match) with Generous Padding */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-graphite-150">
        {/* Left Column: Field Report Input */}
        <div className="p-6 sm:p-7 space-y-5 bg-offwhite-50/40">
          <div className="flex items-center justify-between pb-3 border-b border-graphite-150">
            <div className="flex items-center gap-2 text-xs font-bold text-graphite-700 uppercase tracking-wider">
              <FileText className="w-4 h-4 text-amber-brand" />
              <span>{language === 'hi' ? 'फील्ड रिपोर्ट विवरण' : 'Field Report Details'}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-graphite-500 font-medium block">
                {report?.workerName || 'Ravi Kumar'} ({report?.workerRole || (language === 'hi' ? 'फील्ड पर्यवेक्षक' : 'Site Engineer')})
              </span>
              {report?.submissionTimestamp && (
                <span className="text-[10px] text-graphite-400 font-mono block mt-0.5">
                  {report.submissionTimestamp}
                </span>
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-graphite-200 text-xs sm:text-sm leading-relaxed text-graphite-800 shadow-sm italic">
            "{report?.rawText || match.extractedData.summary}"
          </div>

          {/* Attached Files if present */}
          {report?.attachments && report.attachments.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-graphite-400 uppercase tracking-wider block">
                {language === 'hi' ? 'संलग्न दस्तावेज' : 'Attached Documents'} ({report.attachments.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {report.attachments.map(att => (
                  <div
                    key={att.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-graphite-200 rounded-xl text-xs font-medium text-graphite-800 shadow-sm group/att"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-amber-brand shrink-0" />
                    <span className="truncate max-w-[140px]">{att.name}</span>
                    <span className="text-[10px] text-graphite-400 font-mono uppercase">
                      ({att.type})
                    </span>
                    <button
                      onClick={() => setViewingAttachment(att)}
                      className="ml-1 p-1 rounded-md text-graphite-400 hover:text-amber-brand hover:bg-amber-50 transition-colors"
                      title={language === 'hi' ? 'दस्तावेज देखें' : 'View Document'}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => downloadAttachment(att)}
                      className="p-1 rounded-md text-graphite-400 hover:text-graphite-900 hover:bg-graphite-100 transition-colors"
                      title={language === 'hi' ? 'डाउनलोड' : 'Download'}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Entities Chips */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-graphite-400 uppercase tracking-wider">
              {language === 'hi' ? 'एआई द्वारा विश्लेषित विशेषताएं' : 'AI Extracted Attributes'}
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-graphite-100/90 rounded-xl border border-graphite-200">
                <span className="text-graphite-400 block text-[11px] font-medium">{language === 'hi' ? 'संकाय' : 'DISCIPLINE'}</span>
                <span className="font-semibold text-graphite-900">{match.extractedData.discipline}</span>
              </div>
              <div className="p-2.5 bg-graphite-100/90 rounded-xl border border-graphite-200">
                <span className="text-graphite-400 block text-[11px] font-medium">{language === 'hi' ? 'विश्लेषित स्थान' : 'PARSED LOCATION'}</span>
                <span className="font-semibold text-amber-800">{match.extractedData.locationRange}</span>
              </div>
              <div className="p-2.5 bg-graphite-100/90 rounded-xl border border-graphite-200">
                <span className="text-graphite-400 block text-[11px] font-medium">{language === 'hi' ? 'कार्य प्रकार' : 'WORK TYPE'}</span>
                <span className="font-semibold text-graphite-900">{match.extractedData.workType}</span>
              </div>
              <div className="p-2.5 bg-graphite-100/90 rounded-xl border border-graphite-200">
                <span className="text-graphite-400 block text-[11px] font-medium">{language === 'hi' ? 'विनिर्देश / आकार' : 'SPEC / SIZE'}</span>
                <span className="font-semibold text-graphite-900">{match.extractedData.pipeSize || '12 inch'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Schedule Match & Evidence */}
        <div className="p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-graphite-150">
            <div className="flex items-center gap-2 text-xs font-bold text-graphite-700 uppercase tracking-wider">
              <Workflow className="w-4 h-4 text-amber-brand" />
              <span>{language === 'hi' ? 'संबद्ध L6 अनुसूची गतिविधि' : 'Matched L6 Schedule Activity'}</span>
            </div>
            <span className="text-xs text-emerald-700 font-bold">
              {match.confidence}% {language === 'hi' ? 'मिलान संभावना' : 'Match Probability'}
            </span>
          </div>

          {/* Candidate Selection if Low Confidence */}
          {isLowConfidence && match.alternativeCandidates && match.alternativeCandidates.length > 1 ? (
            <div className="space-y-2.5 p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>{language === 'hi' ? 'एकाधिक संभावित L6 गतिविधियां पाई गईं:' : 'Multiple Candidate L6 Activities Detected:'}</span>
              </div>
              <div className="space-y-2">
                {match.alternativeCandidates.map(cand => (
                  <label
                    key={cand.l6Id}
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer text-xs border transition-all ${
                      selectedCandidateL6Id === cand.l6Id
                        ? 'bg-amber-brand/20 border-amber-brand text-graphite-950 font-bold'
                        : 'bg-white border-graphite-200 text-graphite-700 hover:bg-graphite-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`cand-${match.id}`}
                        checked={selectedCandidateL6Id === cand.l6Id}
                        onChange={() => {
                          setSelectedCandidateL6Id(cand.l6Id);
                          const act = l6Activities.find(a => a.id === cand.l6Id);
                          if (act) {
                            setCustomDelta(Math.min(100, act.actualProgress + match.extractedData.quantDeltaEstimated));
                          }
                        }}
                        className="text-amber-brand focus:ring-amber-brand"
                      />
                      <span>{cand.l6Code} — {cand.l6Name}</span>
                    </div>
                    <span className="font-bold text-amber-900">{cand.confidence}%</span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-graphite-50 rounded-xl border border-graphite-200 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-graphite-900 bg-graphite-200 px-2.5 py-0.5 rounded-md">
                  {candidateL6?.code}
                </span>
                <KPBadge location={candidateL6?.location || 'KP 12–13'} size="sm" />
                <span className="text-xs text-graphite-500 font-medium">{candidateL5?.name}</span>
              </div>
              <div className="text-sm font-bold text-graphite-900 pt-1">
                {candidateL6?.name}
              </div>
            </div>
          )}

          {/* Evidence Breakdown 4-factor Grid */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-graphite-400 uppercase tracking-wider">
              {language === 'hi' ? 'पुष्टिकारी साक्ष्य मैट्रिक्स' : 'Corroborating Evidence Matrix'}
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-offwhite-100 rounded-xl flex items-center justify-between">
                <span className="text-graphite-600">{language === 'hi' ? 'स्थान मिलान' : 'Location Match'}</span>
                <span className="font-bold text-emerald-700">{match.evidenceBreakdown.locationMatch}%</span>
              </div>
              <div className="p-2.5 bg-offwhite-100 rounded-xl flex items-center justify-between">
                <span className="text-graphite-600">{language === 'hi' ? 'संकाय मिलान' : 'Discipline Match'}</span>
                <span className="font-bold text-emerald-700">{match.evidenceBreakdown.disciplineMatch}%</span>
              </div>
              <div className="p-2.5 bg-offwhite-100 rounded-xl flex items-center justify-between">
                <span className="text-graphite-600">{language === 'hi' ? 'विवरण मिलान' : 'Description Match'}</span>
                <span className="font-bold text-emerald-700">{match.evidenceBreakdown.descriptionMatch}%</span>
              </div>
              <div className="p-2.5 bg-offwhite-100 rounded-xl flex items-center justify-between">
                <span className="text-graphite-600">{language === 'hi' ? 'तिथि मिलान' : 'Date Window Match'}</span>
                <span className="font-bold text-emerald-700">{match.evidenceBreakdown.dateCompatibility}%</span>
              </div>
            </div>

            {/* Evidence Tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              {match.evidenceTags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                >
                  ✓ {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Roll-up Preview delta */}
          <div className="p-4 bg-graphite-900 text-white rounded-xl space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-graphite-400 font-medium">
                {language === 'hi' ? 'प्रस्तावित L6 प्रगति अद्यतन:' : 'Proposed L6 Progress Update:'}
              </span>
              <span className="flex items-center gap-2 font-bold">
                <span className="text-graphite-400">{candidateL6?.actualProgress || 10}%</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-brand" />
                <span className="text-amber-brand text-sm">{customDelta}%</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={customDelta}
                onChange={(e) => setCustomDelta(Number(e.target.value))}
                className="w-full accent-amber-brand h-2 bg-graphite-700 rounded-lg cursor-pointer"
              />
              <span className="font-mono text-xs font-bold text-amber-brand w-10 text-right">
                {customDelta}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Box Dropdown if open */}
      {showRejectBox && (
        <div className="p-5 bg-rose-50 border-t border-rose-200 space-y-2.5">
          <label className="block text-xs font-bold text-rose-900 uppercase tracking-wider">
            {language === 'hi' ? 'इस मिलान को अस्वीकार करने का कारण बताएं:' : 'Specify Reason for Rejecting this Match:'}
          </label>
          <input
            type="text"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={language === 'hi' ? 'उदा. कार्य अन्य पैकेज से संबंधित है...' : 'e.g. Work belongs to different package or already logged under another L6...'}
            className="w-full text-xs p-3 border border-rose-300 rounded-xl focus:outline-none focus:border-rose-500"
          />
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              onClick={() => setShowRejectBox(false)}
              className="px-4 py-2 text-xs font-medium text-graphite-600 hover:text-graphite-900 cursor-pointer"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              onClick={handleReject}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
            >
              {language === 'hi' ? 'अस्वीकृति की पुष्टि करें' : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      )}

      {/* Footer Action Buttons with Generous Padding */}
      <div className="p-5 sm:p-6 bg-graphite-100/90 border-t border-graphite-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-xs text-graphite-600 flex items-center gap-2 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-brand animate-pulse" />
          <span>
            {language === 'hi'
              ? 'L5 रोल-अप से पूर्व मानवीय सत्यापन अनिवार्य'
              : 'Human-in-the-loop verification required before L5 roll-up'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRejectBox(!showRejectBox)}
            className="px-4 py-2.5 bg-white hover:bg-rose-50 border border-graphite-300 hover:border-rose-300 text-graphite-700 hover:text-rose-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            {language === 'hi' ? 'मिलान अस्वीकारें' : 'Reject Match'}
          </button>

          <button
            onClick={handleAccept}
            disabled={isProcessing}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-brand hover:from-amber-400 hover:to-amber-500 text-graphite-950 text-xs font-bold rounded-xl transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{language === 'hi' ? 'मिलान स्वीकारें और रोल-अप करें' : 'Accept Match & Cascade Roll-Up'}</span>
          </button>
        </div>
      </div>
      </div>
      {/* Document Viewer Modal */}
      {viewingAttachment && (
        <DocumentViewerModal
          attachment={viewingAttachment}
          onClose={() => setViewingAttachment(null)}
        />
      )}
    </>
  );
};
