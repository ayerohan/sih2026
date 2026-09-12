import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { AIProcessingRadar } from '../../components/ai/AIProcessingRadar';
import {
  FileEdit,
  Sparkles,
  Send,
  MapPin,
  Calendar,
  Layers,
  Wrench,
  Shield,
  Camera,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Paperclip,
  X,
  Upload,
  FileText,
  FileSpreadsheet,
  FileType,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ExtractedReportData, AIMatch, ReportAttachment } from '../../types';

export const WorkerReportPage: React.FC = () => {
  const { submitFieldReport, l5Processes, l6Activities } = useProject();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const l6Param = searchParams.get('l6');

  const [rawText, setRawText] = useState(
    '12 inch pipe laying progressed from KP 12 to KP 12.5 today. 2 joints welded, visual inspection cleared with pipelayers.'
  );
  const [locationText, setLocationText] = useState('KP 12 → KP 12.5');
  const [selectedL5Id, setSelectedL5Id] = useState('L5-01');
  const [equipment, setEquipment] = useState('Cat 572 Pipelayers (2x), Lincoln Welder');
  const [materials, setMaterials] = useState('12" API 5L X65 Carbon Steel Pipe joints');
  const [safetyNote, setSafetyNote] = useState('Toolbox talk conducted on ditch slope stability.');

  // Pre-fill if directed from supervisor dashboard task card
  useEffect(() => {
    if (l6Param && l6Activities.length > 0) {
      const targetL6 = l6Activities.find(a => a.id === l6Param || a.code === l6Param);
      if (targetL6) {
        setSelectedL5Id(targetL6.l5Id);
        setLocationText(targetL6.location);
        setRawText(`Progressed on ${targetL6.name} (${targetL6.code}) at ${targetL6.location}. Work executed according to schedule specifications.`);
        if (targetL6.discipline === 'Piping') {
          setEquipment('Cat 572 Pipelayers, Lincoln DC-400 Welder');
        } else if (targetL6.discipline === 'Mechanical') {
          setEquipment('Mobile Crane 25T, Torque Wrench');
        } else if (targetL6.discipline === 'Electrical' || targetL6.discipline === 'Instrumentation') {
          setEquipment('Cable Drum Trailer, Multi-tester');
        }
        if (targetL6.specs.pipeSize) {
          setMaterials(`${targetL6.specs.pipeSize} ${targetL6.specs.material || 'Carbon Steel Pipe'}`);
        } else if (targetL6.specs.material) {
          setMaterials(targetL6.specs.material);
        }
        toast.info(`Pre-loaded task: ${targetL6.code} — ${targetL6.name}`);
      }
    }
  }, [l6Param, l6Activities]);

  // AI Radar Processing State
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [extractedResult, setExtractedResult] = useState<ExtractedReportData | null>(null);
  const [aiMatchResult, setAiMatchResult] = useState<AIMatch | null>(null);
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  // File Attachments State
  const [attachments, setAttachments] = useState<ReportAttachment[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED_TYPES: Record<string, ReportAttachment['type']> = {
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'excel',
    'application/vnd.ms-excel': 'excel',
    'text/csv': 'excel',
    'application/xml': 'other',
    'text/xml': 'other',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'word',
    'application/msword': 'word',
  };

  const ACCEPTED_EXTENSIONS = '.pdf,.xlsx,.xls,.docx,.doc,.csv,.xer,.xml';

  const getFileType = (file: File): ReportAttachment['type'] => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') return 'excel';
    if (ext === 'docx' || ext === 'doc') return 'word';
    if (ext === 'xer' || ext === 'xml') return 'other';
    return ACCEPTED_TYPES[file.type] || 'other';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: ReportAttachment['type']) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'excel': return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
      case 'word': return <FileType className="w-5 h-5 text-blue-500" />;
      default: return <Paperclip className="w-5 h-5 text-amber-500" />;
    }
  };

  const processFiles = useCallback((files: FileList | File[]) => {
    const newAttachments: ReportAttachment[] = [];
    const maxSize = 25 * 1024 * 1024; // 25MB

    Array.from(files).forEach(file => {
      const type = getFileType(file);
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds 25 MB limit.`);
        return;
      }
      // prevent duplicates
      if (attachments.some(a => a.name === file.name && a.size === file.size)) {
        toast.info(`${file.name} is already attached.`);
        return;
      }
      newAttachments.push({
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        size: file.size,
        type,
        mimeType: file.type,
        file,
        url: URL.createObjectURL(file),
      });
    });

    if (newAttachments.length > 0) {
      setAttachments(prev => [...prev, ...newAttachments]);
      toast.success(`${newAttachments.length} file(s) attached`);
    }
  }, [attachments]);

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = ''; // reset so same file can be re-selected
    }
  };

  // Quick fill demo templates
  const applyTemplate = (type: 'PIPE_HIGH' | 'VALVE_LOW' | 'SCADA') => {
    if (type === 'PIPE_HIGH') {
      setRawText('12 inch pipe laying progressed from KP 12 to KP 12.5 today. 2 joints welded, visual inspection cleared with pipelayers.');
      setLocationText('KP 12 → KP 12.5');
      setSelectedL5Id('L5-01');
      setEquipment('Cat 572 Pipelayers, Lincoln DC-400');
      setMaterials('12" API 5L X65 Carbon Steel Pipes');
    } else if (type === 'VALVE_LOW') {
      setRawText('Valve work at KP 12 progressed well. Station assembly ongoing with 25T crane.');
      setLocationText('KP 12 Station');
      setSelectedL5Id('L5-02');
      setEquipment('Mobile Crane 25T, Torque Wrench');
      setMaterials('Class 600 RTJ Gaskets');
    } else {
      setRawText('SCADA conduit trenching completed from KP 10 to KP 11. Armored optical fiber pulled.');
      setLocationText('KP 10 → KP 11');
      setSelectedL5Id('L5-04');
      setEquipment('Mini Excavator, Cable Drum Trailer');
      setMaterials('24 Core Single Mode OFC');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) {
      toast.error('Please enter work completed text');
      return;
    }

    setIsProcessingAI(true);
    const res = await submitFieldReport({
      rawText,
      locationText,
      l5ProcessId: selectedL5Id,
      equipment,
      materialsUsed: materials,
      safetyNotes: safetyNote,
      attachments: attachments.length > 0 ? attachments : undefined,
      workerId: 'W-01',
      workerName: 'Ravi Kumar',
      workerRole: 'SITE ENGINEER',
    });

    setExtractedResult(res.report.extractedData || null);
    setAiMatchResult(res.match);
  };

  const handleRadarComplete = () => {
    setIsProcessingAI(false);
    setShowSuccessCard(true);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="pb-5 border-b border-graphite-200">
        <div className="flex items-center gap-2.5 mb-1.5">
          <span className="text-xs font-bold text-amber-brand bg-graphite-900 px-3 py-1 rounded-full">
            Field Log / New Report
          </span>
          <span className="text-xs text-graphite-500 font-medium">
            FR-00472 · 11 SEP 2026
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-graphite-950 tracking-tight">
          Submit Field Progress Report
        </h1>
        <p className="text-sm text-graphite-600 mt-1">
          Enter daily site execution log. SiteSync AI will extract engineering attributes and match with L6 schedule activities.
        </p>
      </div>

      {/* Quick Template Selector Chips for SIH Demo */}
      <div className="bg-graphite-900 text-white p-5 sm:p-6 rounded-2xl border border-graphite-750 shadow-industrial space-y-3">
        <div className="flex items-center gap-2 text-xs text-amber-brand font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Quick Load Demo Field Scenario:</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => applyTemplate('PIPE_HIGH')}
            className="px-4 py-2 bg-amber-brand/20 hover:bg-amber-brand text-amber-brand hover:text-graphite-950 text-xs font-bold rounded-xl transition-all border border-amber-brand/40"
          >
            ★ Scenario 1: Pipe Laying KP 12–12.5 (94% High Conf)
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('VALVE_LOW')}
            className="px-4 py-2 bg-graphite-800 hover:bg-graphite-700 text-graphite-300 text-xs font-medium rounded-xl transition-colors border border-graphite-700"
          >
            Scenario 2: Valve Work KP 12 (67% Low Conf)
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('SCADA')}
            className="px-4 py-2 bg-graphite-800 hover:bg-graphite-700 text-graphite-300 text-xs font-medium rounded-xl transition-colors border border-graphite-700"
          >
            Scenario 3: SCADA Fiber KP 10–11
          </button>
        </div>
      </div>

      {/* AI Processing Radar Overlay Modal */}
      {isProcessingAI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-950/80 backdrop-blur-md">
          <AIProcessingRadar
            onComplete={handleRadarComplete}
            extractedData={extractedResult || undefined}
            aiMatch={aiMatchResult || undefined}
          />
        </div>
      )}

      {/* Success Banner Card upon radar completion */}
      {showSuccessCard && aiMatchResult && (
        <div className="bg-white rounded-2xl border-2 border-emerald-500 p-7 shadow-lg space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs text-emerald-700 font-bold uppercase tracking-wider">
                Field Report Logged & AI Matched
              </span>
              <h3 className="text-xl font-bold text-graphite-950 mt-0.5">
                Matched to {aiMatchResult.candidateL6Code} ({aiMatchResult.confidence}% Confidence)
              </h3>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-graphite-700 bg-offwhite-100 p-4 rounded-xl border border-graphite-200 leading-relaxed">
            {aiMatchResult.extractedData.summary}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
            <button
              onClick={() => {
                setShowSuccessCard(false);
                setRawText('');
                setAttachments([]);
              }}
              className="px-4 py-2.5 bg-graphite-100 hover:bg-graphite-200 text-graphite-800 text-xs font-semibold rounded-xl transition-colors"
            >
              Submit Another Report
            </button>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigate('/worker/reports')}
                className="px-4 py-2.5 bg-graphite-900 hover:bg-graphite-800 text-white text-xs font-bold rounded-xl transition-colors"
              >
                View My Reports
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Report Form */}
      <form onSubmit={handleSubmit} className="bg-white p-7 sm:p-9 rounded-2xl border border-graphite-200/90 shadow-sm space-y-6">
        {/* Project & L5 Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div>
            <label className="block text-graphite-600 mb-1.5 uppercase font-semibold tracking-wider">
              Project Code & Title:
            </label>
            <input
              type="text"
              readOnly
              value="PEP-001 / PIPELINE EXPANSION (ASSAM)"
              className="w-full bg-graphite-100 border border-graphite-200 rounded-xl p-3 font-semibold text-graphite-900"
            />
          </div>

          <div>
            <label className="block text-graphite-600 mb-1.5 uppercase font-semibold tracking-wider">
              L5 Work Package Category:
            </label>
            <select
              value={selectedL5Id}
              onChange={e => setSelectedL5Id(e.target.value)}
              className="w-full bg-offwhite-50 border border-graphite-200 rounded-xl p-3 font-semibold text-graphite-900 focus:outline-none focus:border-amber-brand cursor-pointer"
            >
              {l5Processes.map(l5 => (
                <option key={l5.id} value={l5.id}>
                  {l5.wbsNumber} — {l5.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Work Completed Large Textarea */}
        <div className="space-y-2 text-xs">
          <label className="flex items-center justify-between text-graphite-800 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <FileEdit className="w-4 h-4 text-amber-brand" />
              <span>Work Completed / Site Execution Log:</span>
            </span>
            <span className="text-graphite-400 font-normal normal-case text-xs">Freeform engineering notes</span>
          </label>
          <textarea
            rows={4}
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            placeholder="Describe pipe laid, joints welded, valve fitted, KP markers, or inspections completed..."
            className="w-full bg-offwhite-50 border border-graphite-200 rounded-xl p-4 text-sm text-graphite-950 placeholder-graphite-400 focus:outline-none focus:border-amber-brand shadow-inner leading-relaxed"
          />
        </div>

        {/* Location KP Range */}
        <div className="space-y-1.5 text-xs">
          <label className="block text-graphite-700 font-bold uppercase tracking-wider">
            Location / KP Coordinates:
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-graphite-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={locationText}
              onChange={e => setLocationText(e.target.value)}
              placeholder="e.g. KP 12 → KP 12.5"
              className="w-full pl-10 pr-4 py-2.5 bg-offwhite-50 border border-graphite-200 rounded-xl text-sm font-semibold text-graphite-900"
            />
          </div>
        </div>

        {/* Equipment & Material Optional Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div>
            <label className="block text-graphite-600 mb-1.5 uppercase font-semibold tracking-wider">
              Equipment Deployed:
            </label>
            <input
              type="text"
              value={equipment}
              onChange={e => setEquipment(e.target.value)}
              className="w-full bg-offwhite-50 border border-graphite-200 rounded-xl p-3 text-sm text-graphite-800"
            />
          </div>

          <div>
            <label className="block text-graphite-600 mb-1.5 uppercase font-semibold tracking-wider">
              Materials Consumed:
            </label>
            <input
              type="text"
              value={materials}
              onChange={e => setMaterials(e.target.value)}
              className="w-full bg-offwhite-50 border border-graphite-200 rounded-xl p-3 text-sm text-graphite-800"
            />
          </div>
        </div>

        {/* Safety Note */}
        <div className="text-xs space-y-1.5">
          <label className="block text-graphite-600 uppercase font-semibold tracking-wider">
            Safety / HSE Observation:
          </label>
          <input
            type="text"
            value={safetyNote}
            onChange={e => setSafetyNote(e.target.value)}
            className="w-full bg-offwhite-50 border border-graphite-200 rounded-xl p-3 text-sm text-graphite-800"
          />
        </div>

        {/* File Attachments Section */}
        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between text-graphite-800 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-amber-brand" />
              <span>Attach Supporting Documents:</span>
            </span>
            <span className="text-graphite-400 font-normal normal-case text-xs">PDF, Excel, Word · Max 25 MB each</span>
          </label>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 group ${
              isDragOver
                ? 'border-amber-brand bg-amber-brand/5 scale-[1.01]'
                : 'border-graphite-200 bg-offwhite-50/50 hover:border-graphite-400 hover:bg-offwhite-100/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_EXTENSIONS}
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
              isDragOver
                ? 'bg-amber-brand/20 text-amber-brand scale-110'
                : 'bg-graphite-100 text-graphite-400 group-hover:bg-graphite-200 group-hover:text-graphite-600'
            }`}>
              <Upload className="w-6 h-6" />
            </div>

            <div className="text-center">
              <p className={`text-sm font-semibold transition-colors ${isDragOver ? 'text-amber-brand' : 'text-graphite-700'}`}>
                {isDragOver ? 'Drop files here' : 'Drag & drop files here, or click to browse'}
              </p>
              <p className="text-graphite-400 mt-1 text-xs">
                Attach daily progress reports, inspection sheets, or material logs
              </p>
            </div>

            {/* Accepted format badges */}
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-semibold border border-red-100">PDF</span>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold border border-emerald-100">Excel</span>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold border border-blue-100">Word</span>
            </div>
          </div>

          {/* Attached Files List */}
          {attachments.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <p className="text-xs text-graphite-500 font-semibold uppercase tracking-wider">
                {attachments.length} file{attachments.length !== 1 ? 's' : ''} attached
              </p>
              <div className="space-y-2">
                {attachments.map(att => (
                  <div
                    key={att.id}
                    className="flex items-center gap-3.5 p-3.5 bg-white border border-graphite-200/80 rounded-xl hover:border-graphite-300 transition-colors group/file"
                  >
                    {/* File type icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      att.type === 'pdf' ? 'bg-red-50' :
                      att.type === 'excel' ? 'bg-emerald-50' :
                      att.type === 'word' ? 'bg-blue-50' : 'bg-graphite-100'
                    }`}>
                      {getFileIcon(att.type)}
                    </div>

                    {/* File info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-graphite-900 truncate">{att.name}</p>
                      <p className="text-xs text-graphite-400 mt-0.5">
                        {att.type.toUpperCase()} · {formatFileSize(att.size)}
                      </p>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeAttachment(att.id); }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-graphite-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover/file:opacity-100 cursor-pointer shrink-0"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-graphite-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-xs text-graphite-500 font-medium">
            Logged as Site Engineer Ravi Kumar (SE-8842)
          </span>

          <button
            type="submit"
            className="px-7 py-3 bg-gradient-to-r from-amber-500 to-amber-brand hover:from-amber-400 hover:to-amber-500 text-graphite-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Submit Field Report & Run AI Match</span>
          </button>
        </div>
      </form>
    </div>
  );
};
