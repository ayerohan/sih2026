import React, { useMemo } from 'react';
import { ReportAttachment } from '../../types';
import { buildPreviewHtml, downloadAttachment } from '../../utils/documentUtils';
import { X, Download, FileText, FileSpreadsheet, FileCode, Paperclip, Maximize2 } from 'lucide-react';

interface DocumentViewerModalProps {
  attachment: ReportAttachment;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ attachment, onClose }) => {
  const previewHtml = useMemo(() => buildPreviewHtml(attachment), [attachment]);

  const iframeSrcDoc = attachment.file
    ? undefined // For uploaded files we need a blob URL instead
    : previewHtml;

  const iframeSrc = useMemo(() => {
    if (attachment.file && attachment.type === 'pdf') {
      return URL.createObjectURL(attachment.file);
    }
    return undefined;
  }, [attachment]);

  const getFileIcon = () => {
    switch (attachment.type) {
      case 'pdf': return <FileText className="w-5 h-5 text-rose-600" />;
      case 'excel': return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case 'word': return <FileCode className="w-5 h-5 text-sky-600" />;
      default: return <Paperclip className="w-5 h-5 text-graphite-600" />;
    }
  };

  const getTypeBadgeColor = () => {
    switch (attachment.type) {
      case 'pdf': return 'bg-rose-50 border-rose-200 text-rose-800';
      case 'excel': return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'word': return 'bg-sky-50 border-sky-200 text-sky-800';
      default: return 'bg-graphite-100 border-graphite-200 text-graphite-800';
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return bytes + ' B';
  };

  const handleOpenInNewTab = () => {
    const blob = new Blob([previewHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-950/70 backdrop-blur-sm font-sans">
      <div className="bg-white rounded-3xl border border-graphite-200 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-graphite-150 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2.5 rounded-xl border ${getTypeBadgeColor()}`}>
              {getFileIcon()}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-graphite-950 truncate" title={attachment.name}>
                {attachment.name}
              </h3>
              <p className="text-xs text-graphite-500 font-mono mt-0.5">
                {attachment.type.toUpperCase()} · {formatSize(attachment.size)} · {attachment.mimeType}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-4">
            <button
              onClick={handleOpenInNewTab}
              className="p-2.5 text-graphite-500 hover:text-graphite-900 hover:bg-graphite-100 rounded-xl transition-colors"
              title="Open in new tab"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => downloadAttachment(attachment)}
              className="px-4 py-2 bg-amber-brand hover:bg-amber-hover text-graphite-950 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 text-graphite-400 hover:text-graphite-900 hover:bg-graphite-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Preview Area */}
        <div className="flex-1 min-h-0 bg-offwhite-50/60 p-4">
          <div className="w-full h-full bg-white rounded-2xl border border-graphite-200 shadow-inner overflow-hidden">
            {iframeSrc ? (
              <iframe
                src={iframeSrc}
                className="w-full h-full border-0"
                title={`Preview: ${attachment.name}`}
              />
            ) : (
              <iframe
                srcDoc={iframeSrcDoc}
                className="w-full h-full border-0"
                title={`Preview: ${attachment.name}`}
                sandbox="allow-same-origin"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-graphite-150 bg-offwhite-50/40 shrink-0">
          <span className="text-xs text-graphite-500">
            Document enrolled by field operative · Oil India Limited EPC
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-graphite-200 text-graphite-700 font-semibold text-xs hover:bg-graphite-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
