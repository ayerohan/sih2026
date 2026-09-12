import { ReportAttachment } from '../types';
import { toast } from 'sonner';

/**
 * Generates sample content for mock seed attachments if no physical file was uploaded
 */
export function getSampleAttachmentData(attachment: ReportAttachment) {
  const isPdf = attachment.type === 'pdf' || attachment.name.endsWith('.pdf');
  const isExcel = attachment.type === 'excel' || attachment.name.endsWith('.xlsx') || attachment.name.endsWith('.xls');

  if (isPdf) {
    return {
      kind: 'pdf' as const,
      title: 'OIL INDIA LIMITED — PIPELINE EXPANSION (ASSAM)',
      docNumber: 'OIL/PEP-001/QA-QC/2026/0472',
      inspectionDate: '11-SEP-2026',
      inspector: 'Ravi Kumar (Field Pipeline Supervisor)',
      location: 'Sector 04 · KP 12.0 to KP 12.5',
      discipline: 'Mechanical & Welding QA/QC',
      items: [
        { code: 'ITP-01', desc: '12" API 5L X65 Pipe Bevel Angle (30° ± 2.5°)', result: 'PASS (30.5°)', status: 'ACCEPTED' },
        { code: 'ITP-02', desc: 'Root Pass Visual & Dye Penetrant (PT) Clearance', result: 'Zero Porosity / Full Penetration', status: 'ACCEPTED' },
        { code: 'ITP-03', desc: 'Pre-heating Temperature Verification (120°C)', result: '125°C Verified via Tempilstik', status: 'ACCEPTED' },
        { code: 'ITP-04', desc: 'Trench Bedding Depth & Padding Inspection', result: '1.8m Depth with 150mm Soft Sand Bed', status: 'ACCEPTED' },
        { code: 'ITP-05', desc: 'Holiday Detector Coating Continuity Check (15kV)', result: 'Zero Defects Detected', status: 'ACCEPTED' },
      ],
      remarks: 'All 2 joints cleared for pipe lowering into ditch. Certified compliant with OISD-141 & ASME B31.8.',
    };
  }

  if (isExcel) {
    return {
      kind: 'excel' as const,
      title: 'TORQUE WRENCH CALIBRATION & BOLT TIGHTENING LOG',
      sheetName: 'KP12_Flange_Bolting',
      headers: ['Bolt ID', 'Stud Spec', 'Target Torque (N·m)', 'Actual Applied (N·m)', 'Pass/Fail', 'Calibrated Wrench ID'],
      rows: [
        ['B-01', 'M36 Grade B7', '450', '452', 'PASS', 'TW-HYD-04'],
        ['B-02', 'M36 Grade B7', '450', '450', 'PASS', 'TW-HYD-04'],
        ['B-03', 'M36 Grade B7', '450', '455', 'PASS', 'TW-HYD-04'],
        ['B-04', 'M36 Grade B7', '450', '449', 'PASS', 'TW-HYD-04'],
        ['B-05', 'M36 Grade B7', '450', '451', 'PASS', 'TW-HYD-04'],
        ['B-06', 'M36 Grade B7', '450', '453', 'PASS', 'TW-HYD-04'],
        ['B-07', 'M36 Grade B7', '450', '450', 'PASS', 'TW-HYD-04'],
        ['B-08', 'M36 Grade B7', '450', '454', 'PASS', 'TW-HYD-04'],
      ],
    };
  }

  return {
    kind: 'word' as const,
    title: 'SITE EXECUTION MEMORANDUM & MANPOWER TELEMETRY',
    date: '11-SEP-2026',
    author: 'Ravi Kumar (Field Pipeline Supervisor)',
    content: [
      'Project: PEP-001 (Assam Corridor)',
      'Sector: KP 11.5 to 12.5 Section Laying',
      'Weather: 29°C Sunny / Dry Soil Conditions',
      '',
      'Execution Overview:',
      '1. 300m stringed 12" pipe section lowered successfully with Cat 572 pipelayers.',
      '2. Hydraulic torque verification completed on 600# RTJ flange at KP 12.0 station manifold.',
      '3. Trench dewatering completed prior to padding.',
      '4. Toolbox safety meeting conducted with 18 riggers and welders regarding suspended loads.',
      '',
      'Personnel Deployed:',
      '- Welders: 4',
      '- Riggers: 6',
      '- Equipment Operators: 4',
      '- QC Inspectors: 2',
      '- Safety Marshals: 2',
    ].join('\r\n'),
  };
}

/**
 * Builds a preview HTML string for rendering inside an iframe in a document viewer modal.
 */
export function buildPreviewHtml(attachment: ReportAttachment): string {
  const data = getSampleAttachmentData(attachment);

  if (data.kind === 'pdf') {
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 32px; color: #171a1d; line-height: 1.5; margin: 0; }
  .header { border-bottom: 3px solid #d99a24; padding-bottom: 14px; margin-bottom: 20px; }
  .title { font-size: 18px; font-weight: bold; }
  .subtitle { font-size: 11px; color: #666; margin-top: 4px; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; font-size: 12px; background: #f9f9f9; padding: 14px; border-radius: 8px; border: 1px solid #e0e0e0; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  th { background: #f0f0f0; font-weight: bold; }
  .badge { display: inline-block; padding: 2px 7px; font-size: 10px; font-weight: bold; border-radius: 4px; background: #e6f4ea; color: #137333; }
  .remark { margin-top: 18px; font-size: 12px; background: #fffbe6; padding: 10px; border: 1px solid #ffe58f; border-radius: 6px; }
</style></head><body>
  <div class="header">
    <div class="title">${data.title}</div>
    <div class="subtitle">DOCUMENT CONTROL NO: ${data.docNumber} · EPC PACKAGE 04</div>
  </div>
  <div class="meta">
    <div><strong>Inspection Date:</strong> ${data.inspectionDate}</div>
    <div><strong>Inspector:</strong> ${data.inspector}</div>
    <div><strong>Location:</strong> ${data.location}</div>
    <div><strong>Discipline:</strong> ${data.discipline}</div>
  </div>
  <h4 style="margin:0 0 8px;font-size:13px;">Inspection Checklist & Quality Verification Items</h4>
  <table><thead><tr><th>Code</th><th>Parameter</th><th>Result</th><th>Status</th></tr></thead><tbody>
  ${data.items.map(it => `<tr><td><strong>${it.code}</strong></td><td>${it.desc}</td><td>${it.result}</td><td><span class="badge">${it.status}</span></td></tr>`).join('')}
  </tbody></table>
  <div class="remark"><strong>Remarks:</strong> ${data.remarks}</div>
</body></html>`;
  }

  if (data.kind === 'excel') {
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 32px; margin: 0; color: #171a1d; }
  h3 { margin: 0 0 16px; font-size: 15px; }
  .sheet { font-size: 11px; color: #666; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border: 1px solid #d0d0d0; padding: 7px 10px; text-align: left; }
  th { background: #f0f0f0; font-weight: bold; }
  tr:nth-child(even) { background: #fafafa; }
  .pass { color: #137333; font-weight: bold; }
</style></head><body>
  <h3>${data.title}</h3>
  <div class="sheet">Sheet: ${data.sheetName} · Project PEP-001</div>
  <table><thead><tr>${data.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>
  ${data.rows.map(r => `<tr>${r.map((c, i) => `<td${i === 4 ? ' class="pass"' : ''}>${c}</td>`).join('')}</tr>`).join('')}
  </tbody></table>
</body></html>`;
  }

  // word
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 32px; margin: 0; color: #171a1d; line-height: 1.6; }
  h3 { margin: 0 0 6px; font-size: 16px; }
  .meta { font-size: 12px; color: #666; margin-bottom: 20px; }
  pre { white-space: pre-wrap; font-family: inherit; font-size: 13px; background: #f9f9f9; padding: 16px; border-radius: 8px; border: 1px solid #e0e0e0; }
</style></head><body>
  <h3>${data.title}</h3>
  <div class="meta">Date: ${data.date} · Author: ${data.author}</div>
  <pre>${data.content}</pre>
</body></html>`;
}

/**
 * Reliable universal file downloader for both uploaded and seed attachments
 */
export function downloadAttachment(attachment: ReportAttachment) {
  try {
    // 1. If physical File object exists (user uploaded during session)
    if (attachment.file) {
      const url = URL.createObjectURL(attachment.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded "${attachment.name}"`);
      return;
    }

    // 2. If valid remote URL exists
    if (attachment.url && !attachment.url.startsWith('blob:')) {
      const a = document.createElement('a');
      a.href = attachment.url;
      a.download = attachment.name;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`Downloaded "${attachment.name}"`);
      return;
    }

    // 3. Generate downloadable content for mock seed attachments
    const data = getSampleAttachmentData(attachment);
    let blob: Blob;

    if (data.kind === 'excel') {
      // Generate CSV with UTF-8 BOM for Excel auto-detection
      let csv = '\uFEFF';
      csv += `${data.title}\r\n`;
      csv += `Generated: 11-SEP-2026 · Project: PEP-001\r\n\r\n`;
      csv += `${data.headers.join(',')}\r\n`;
      data.rows.forEach((r: string[]) => {
        csv += `${r.join(',')}\r\n`;
      });
      blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    } else if (data.kind === 'pdf') {
      // Generate print-ready HTML document (opens in browser and can be printed to PDF)
      const html = buildPreviewHtml(attachment);
      blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    } else {
      // Word → plain text
      const text = `${data.title}\r\nDate: ${data.date}\r\nAuthor: ${data.author}\r\n\r\n${data.content}`;
      blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    }

    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = attachment.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
    toast.success(`Downloaded "${attachment.name}"`);
  } catch (err) {
    console.error('Download error:', err);
    toast.error(`Could not download ${attachment.name}`);
  }
}
