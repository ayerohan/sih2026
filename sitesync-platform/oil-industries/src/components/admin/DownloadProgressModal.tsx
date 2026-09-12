import React, { useState } from 'react';
import { Project, L5Process, L6Activity } from '../../types';
import { X, Download, FileSpreadsheet, FileCode, Printer, FileText, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface DownloadProgressModalProps {
  project: Project;
  l5Processes: L5Process[];
  l6Activities: L6Activity[];
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadProgressModal: React.FC<DownloadProgressModalProps> = ({
  project,
  l5Processes,
  l6Activities,
  isOpen,
  onClose,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'CSV' | 'JSON' | 'PRINT' | 'TEXT'>('CSV');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setIsExporting(true);
    const dateStr = new Date().toISOString().split('T')[0];
    const safeCode = project.code.replace(/[^a-zA-Z0-9_-]/g, '_');

    if (selectedFormat === 'CSV') {
      // Generate CSV
      const rows: string[][] = [
        ['SiteSync EPC Project Progress Export'],
        ['Project Code', project.code],
        ['Project Name', project.name],
        ['Location', project.location],
        ['Export Date', dateStr],
        ['Overall Planned Progress', `${project.plannedProgress}%`],
        ['Overall Actual Progress', `${project.actualProgress}%`],
        ['Schedule Variance', `${project.variance}%`],
        ['Budget', project.budget || `₹${project.budgetTotalCr} Cr`],
        [''],
        [
          'Level',
          'WBS Code',
          'Name',
          'Discipline',
          'Location',
          'Planned %',
          'Actual %',
          'Variance %',
          'Status',
          'Start Date',
          'End Date',
          'Assigned Supervisor',
        ],
      ];

      // Add L5 and L6 rows
      l5Processes.forEach(l5 => {
        rows.push([
          'L5 Process',
          l5.wbsNumber,
          `"${l5.name.replace(/"/g, '""')}"`,
          l5.discipline,
          '',
          `${l5.plannedProgress}`,
          `${l5.actualProgress}`,
          `${l5.variance}`,
          l5.status,
          '',
          '',
          l5.owner || '',
        ]);

        const childL6s = l6Activities.filter(a => a.l5Id === l5.id);
        childL6s.forEach(l6 => {
          rows.push([
            'L6 Activity',
            l6.wbsNumber || l6.code,
            `"${l6.name.replace(/"/g, '""')}"`,
            l6.discipline,
            `"${l6.location}"`,
            `${l6.plannedProgress}`,
            `${l6.actualProgress}`,
            `${l6.variance}`,
            l6.status,
            l6.startDate,
            l6.endDate,
            `"${l6.assignedWorkerName}"`,
          ]);
        });
      });

      const csvContent = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${safeCode}_Progress_Report_${dateStr}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Excel/CSV progress report downloaded successfully');
    } else if (selectedFormat === 'JSON') {
      const data = {
        project,
        exportedAt: new Date().toISOString(),
        l5Processes: l5Processes.map(l5 => ({
          ...l5,
          l6Activities: l6Activities.filter(a => a.l5Id === l5.id),
        })),
      };

      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${safeCode}_Progress_Dump_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('JSON dataset downloaded successfully');
    } else if (selectedFormat === 'TEXT') {
      let textContent = `==========================================================\n`;
      textContent += ` SITESYNC EPC PROJECT PROGRESS REPORT\n`;
      textContent += ` Project: ${project.name} (${project.code})\n`;
      textContent += ` Location: ${project.location}\n`;
      textContent += ` Generated: ${new Date().toLocaleString()}\n`;
      textContent += ` Planned: ${project.plannedProgress}% | Actual: ${project.actualProgress}% | Variance: ${project.variance}%\n`;
      textContent += `==========================================================\n\n`;

      l5Processes.forEach(l5 => {
        textContent += `[L5] ${l5.wbsNumber} - ${l5.name} (${l5.actualProgress}% / ${l5.plannedProgress}%, Var: ${l5.variance}%)\n`;
        const childL6s = l6Activities.filter(a => a.l5Id === l5.id);
        childL6s.forEach(l6 => {
          textContent += `  ├── [L6] ${l6.code}: ${l6.name} [${l6.status}]\n`;
          textContent += `  │   Progress: ${l6.actualProgress}% (Plan: ${l6.plannedProgress}%) | Location: ${l6.location} | Due: ${l6.endDate}\n`;
        });
        textContent += `\n`;
      });

      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${safeCode}_Progress_Summary_${dateStr}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Text summary report downloaded successfully');
    } else if (selectedFormat === 'PRINT') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Progress Report - ${project.code}</title>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1f2428; }
                h1 { color: #d99a24; font-size: 24px; margin-bottom: 4px; }
                .subtitle { color: #6b7280; font-size: 14px; margin-bottom: 20px; }
                .kpi-row { display: flex; gap: 20px; margin-bottom: 25px; }
                .kpi { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px 20px; min-width: 130px; }
                .kpi-title { font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: bold; }
                .kpi-val { font-size: 20px; font-weight: bold; color: #111827; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
                th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
                th { background: #1f2428; color: white; }
                .l5-row { background: #fef3c7; font-weight: bold; }
                @media print {
                  body { padding: 0; }
                }
              </style>
            </head>
            <body>
              <h1>SiteSync · Executive Project Progress Report</h1>
              <div class="subtitle">${project.code} — ${project.name} | Location: ${project.location}</div>
              
              <div class="kpi-row">
                <div class="kpi"><div class="kpi-title">Actual Progress</div><div class="kpi-val">${project.actualProgress}%</div></div>
                <div class="kpi"><div class="kpi-title">Planned Baseline</div><div class="kpi-val">${project.plannedProgress}%</div></div>
                <div class="kpi"><div class="kpi-title">Schedule Variance</div><div class="kpi-val">${project.variance}%</div></div>
                <div class="kpi"><div class="kpi-title">Approved Budget</div><div class="kpi-val">${project.budget || '₹' + project.budgetTotalCr + ' Cr'}</div></div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>WBS Code</th>
                    <th>Package / Activity Name</th>
                    <th>Discipline</th>
                    <th>Location</th>
                    <th>Plan</th>
                    <th>Actual</th>
                    <th>Variance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${l5Processes.map(l5 => {
                    const childL6s = l6Activities.filter(a => a.l5Id === l5.id);
                    return `
                      <tr class="l5-row">
                        <td>${l5.wbsNumber}</td>
                        <td>${l5.name}</td>
                        <td>${l5.discipline}</td>
                        <td>-</td>
                        <td>${l5.plannedProgress}%</td>
                        <td>${l5.actualProgress}%</td>
                        <td>${l5.variance}%</td>
                        <td>${l5.status}</td>
                      </tr>
                      ${childL6s.map(l6 => `
                        <tr>
                          <td>&nbsp;&nbsp;└── ${l6.code}</td>
                          <td>${l6.name}</td>
                          <td>${l6.discipline}</td>
                          <td>${l6.location}</td>
                          <td>${l6.plannedProgress}%</td>
                          <td>${l6.actualProgress}%</td>
                          <td>${l6.variance}%</td>
                          <td>${l6.status}</td>
                        </tr>
                      `).join('')}
                    `;
                  }).join('')}
                </tbody>
              </table>
              <script>
                window.onload = function() { window.print(); }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
      toast.success('Printable report opened in new tab');
    }

    setIsExporting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-950/70 backdrop-blur-sm animate-fadeIn font-sans select-none">
      <div className="bg-white rounded-3xl border border-graphite-200 w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 bg-graphite-900 text-white flex items-center justify-between border-b border-graphite-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-brand flex items-center justify-center text-graphite-950 font-bold">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Export Project Progress</h2>
              <p className="text-xs text-graphite-400">Download {project.code} data into file format of your choice</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-graphite-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="p-6 space-y-4">
          <label className="block text-xs font-bold text-graphite-700 uppercase tracking-wider">
            Select Output Format
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* CSV / Excel */}
            <button
              type="button"
              onClick={() => setSelectedFormat('CSV')}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                selectedFormat === 'CSV'
                  ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'bg-graphite-50 border-graphite-200 hover:border-graphite-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <FileSpreadsheet className={`w-5 h-5 ${selectedFormat === 'CSV' ? 'text-emerald-600' : 'text-graphite-400'}`} />
                {selectedFormat === 'CSV' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <div>
                <div className="font-bold text-graphite-900 text-sm">Excel / CSV (.csv)</div>
                <div className="text-[11px] text-graphite-500 mt-0.5">Spreadsheet ready table with all WBS rows</div>
              </div>
            </button>

            {/* JSON Dataset */}
            <button
              type="button"
              onClick={() => setSelectedFormat('JSON')}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                selectedFormat === 'JSON'
                  ? 'bg-amber-brand/15 border-amber-brand ring-2 ring-amber-brand/20 shadow-sm'
                  : 'bg-graphite-50 border-graphite-200 hover:border-graphite-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <FileCode className={`w-5 h-5 ${selectedFormat === 'JSON' ? 'text-amber-brand' : 'text-graphite-400'}`} />
                {selectedFormat === 'JSON' && <CheckCircle2 className="w-4 h-4 text-amber-brand" />}
              </div>
              <div>
                <div className="font-bold text-graphite-900 text-sm">JSON Format (.json)</div>
                <div className="text-[11px] text-graphite-500 mt-0.5">Raw hierarchical tree for ERP/API ingestion</div>
              </div>
            </button>

            {/* Printable PDF / HTML */}
            <button
              type="button"
              onClick={() => setSelectedFormat('PRINT')}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                selectedFormat === 'PRINT'
                  ? 'bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                  : 'bg-graphite-50 border-graphite-200 hover:border-graphite-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <Printer className={`w-5 h-5 ${selectedFormat === 'PRINT' ? 'text-blue-600' : 'text-graphite-400'}`} />
                {selectedFormat === 'PRINT' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
              </div>
              <div>
                <div className="font-bold text-graphite-900 text-sm">Printable Report</div>
                <div className="text-[11px] text-graphite-500 mt-0.5">Executive layout ready to print or Save as PDF</div>
              </div>
            </button>

            {/* Plain Text Summary */}
            <button
              type="button"
              onClick={() => setSelectedFormat('TEXT')}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                selectedFormat === 'TEXT'
                  ? 'bg-purple-500/10 border-purple-500 ring-2 ring-purple-500/20 shadow-sm'
                  : 'bg-graphite-50 border-graphite-200 hover:border-graphite-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <FileText className={`w-5 h-5 ${selectedFormat === 'TEXT' ? 'text-purple-600' : 'text-graphite-400'}`} />
                {selectedFormat === 'TEXT' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
              </div>
              <div>
                <div className="font-bold text-graphite-900 text-sm">Text Summary (.txt)</div>
                <div className="text-[11px] text-graphite-500 mt-0.5">Clean markdown-compatible ASCII structure</div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-graphite-50 border-t border-graphite-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-graphite-600 hover:text-graphite-900 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownload}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-brand hover:from-amber-400 hover:to-amber-500 text-graphite-950 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{selectedFormat === 'PRINT' ? 'Open & Print Report' : 'Download File'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
