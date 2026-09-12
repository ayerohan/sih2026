import { L6Activity } from '../types';

const API_BASE = '/api';

export interface ScheduleImportResult {
  site: string;
  reportType: string;
  activities: L6Activity[];
}

/**
 * Checks if the local AI Service & Backend is active
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'UP';
  } catch {
    return false;
  }
}

/**
 * Client-side fallback parser for Primavera P6 (.xer), MS Project (.xml), and CSV schedules
 */
async function parseScheduleFileLocally(file: File): Promise<ScheduleImportResult> {
  const text = await file.text();
  const ext = file.name.split('.').pop()?.toLowerCase();
  const activities: L6Activity[] = [];

  if (ext === 'xer') {
    // Parse Primavera P6 XER table lines
    const lines = text.split('\n');
    let inTaskTable = false;
    let fields: string[] = [];

    for (const line of lines) {
      const parts = line.split('\t').map(p => p.trim());
      if (parts[0] === '%T') {
        inTaskTable = parts[1] === 'TASK';
        fields = [];
      } else if (parts[0] === '%F' && inTaskTable) {
        fields = parts.slice(1);
      } else if (parts[0] === '%R' && inTaskTable && fields.length > 0) {
        const row: Record<string, string> = {};
        parts.slice(1).forEach((val, i) => {
          if (fields[i]) row[fields[i]] = val;
        });

        const code = row.task_code || `TSK-${activities.length + 1}`;
        const name = row.task_name || 'Schedule Activity';
        const pct = parseFloat(row.phys_complete_pct || '0') || 0;
        const discipline = row.actv_code_discipline || (code.includes('CIV') ? 'Civil' : 'Piping');

        activities.push({
          id: `L6-XER-${Date.now()}-${activities.length}`,
          code,
          wbsNumber: `01.01.${String(activities.length + 1).padStart(2, '0')}`,
          name,
          l5Id: 'L5-01',
          projectId: 'PRJ-001',
          discipline: discipline as any,
          location: 'KP 12–18 Main Route',
          kpStart: 12.0 + activities.length * 0.5,
          kpEnd: 12.5 + activities.length * 0.5,
          plannedProgress: pct,
          actualProgress: 0,
          variance: -pct,
          weightInL5: 20,
          assignedWorkerId: 'W-01',
          assignedWorkerName: 'Ravi Kumar',
          startDate: row.target_start_date ? row.target_start_date.substring(0, 10) : '2026-03-01',
          endDate: row.target_end_date ? row.target_end_date.substring(0, 10) : '2026-06-30',
          status: pct >= 100 ? 'COMPLETE' : pct > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
          specs: {
            pipeSize: '12 inch API 5L X65',
            material: 'Carbon Steel',
            totalQuantity: '500 rmt',
            unit: 'rmt',
          },
          linkedReportIds: [],
          historyNotes: [
            {
              id: `HN-XER-${activities.length}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' TODAY',
              author: 'Primavera P6 Engine',
              note: `Ingested from ${file.name}`,
              progressFrom: 0,
              progressTo: 0,
              source: 'SCHEDULE_REVISE',
            },
          ],
        });
      }
    }
    return {
      site: 'Urban Metro Project (Primavera Baseline)',
      reportType: 'Primavera P6 (.xer) Schedule',
      activities: activities.length > 0 ? activities : getDefaultActivities(),
    };
  } else if (ext === 'xml') {
    // Parse MS Project XML
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/xml');
    const tasks = doc.querySelectorAll('Task');

    tasks.forEach((task, idx) => {
      const name = task.querySelector('Name')?.textContent?.trim();
      const wbs = task.querySelector('WBS')?.textContent?.trim() || `01.01.${idx + 1}`;
      const pct = parseFloat(task.querySelector('PercentComplete')?.textContent || '0') || 0;
      const start = task.querySelector('Start')?.textContent?.substring(0, 10) || '2026-03-01';
      const finish = task.querySelector('Finish')?.textContent?.substring(0, 10) || '2026-06-30';

      if (name && !name.toLowerCase().includes('project')) {
        activities.push({
          id: `L6-MSP-${Date.now()}-${idx}`,
          code: `MSP-T${idx + 1}`,
          wbsNumber: wbs,
          name,
          l5Id: 'L5-01',
          projectId: 'PRJ-001',
          discipline: 'Piping',
          location: 'KP 12–15',
          kpStart: 12.0 + idx * 0.4,
          kpEnd: 12.4 + idx * 0.4,
          plannedProgress: pct,
          actualProgress: 0,
          variance: -pct,
          weightInL5: 25,
          assignedWorkerId: 'W-01',
          assignedWorkerName: 'Ravi Kumar',
          startDate: start,
          endDate: finish,
          status: 'NOT_STARTED',
          specs: { totalQuantity: '350 rmt', unit: 'rmt' },
          linkedReportIds: [],
          historyNotes: [],
        });
      }
    });

    return {
      site: 'MS Project Schedule Workspace',
      reportType: 'MS Project (.xml) Export',
      activities: activities.length > 0 ? activities : getDefaultActivities(),
    };
  } else {
    // Parse CSV
    const rows = text.split('\n').filter(r => r.trim());
    if (rows.length > 1) {
      rows.slice(1).forEach((row, idx) => {
        const cols = row.split(',').map(c => c.trim().replace(/"/g, ''));
        if (cols[0] && cols[1]) {
          activities.push({
            id: `L6-CSV-${Date.now()}-${idx}`,
            code: cols[0],
            wbsNumber: `01.01.${String(idx + 1).padStart(2, '0')}`,
            name: cols[1],
            l5Id: 'L5-01',
            projectId: 'PRJ-001',
            discipline: (cols[3] as any) || 'Piping',
            location: cols[4] || 'Main Corridor',
            kpStart: 12.0 + idx * 0.5,
            kpEnd: 12.5 + idx * 0.5,
            plannedProgress: parseFloat(cols[7] || '30') || 30,
            actualProgress: 0,
            variance: -(parseFloat(cols[7] || '30') || 30),
            weightInL5: 20,
            assignedWorkerId: 'W-01',
            assignedWorkerName: 'Ravi Kumar',
            startDate: cols[5] || '2026-03-01',
            endDate: cols[6] || '2026-06-30',
            status: 'NOT_STARTED',
            specs: { unit: cols[8] || 'rmt', totalQuantity: cols[9] || '500' },
            linkedReportIds: [],
            historyNotes: [],
          });
        }
      });
    }

    return {
      site: 'Master Baseline Schedule',
      reportType: 'Spreadsheet (.csv) Baseline',
      activities: activities.length > 0 ? activities : getDefaultActivities(),
    };
  }
}

function getDefaultActivities(): L6Activity[] {
  return [
    {
      id: 'L6-DEF-1',
      code: 'CIV-1001',
      wbsNumber: '01.01.01',
      name: 'Site Excavation and Earthwork Phase 1',
      l5Id: 'L5-01',
      projectId: 'PRJ-001',
      discipline: 'Civil',
      location: 'KP 12–13',
      kpStart: 12.0,
      kpEnd: 13.0,
      plannedProgress: 100,
      actualProgress: 0,
      variance: -100,
      weightInL5: 25,
      assignedWorkerId: 'W-01',
      assignedWorkerName: 'Ravi Kumar',
      startDate: '2026-02-01',
      endDate: '2026-02-20',
      status: 'COMPLETE',
      specs: {},
      linkedReportIds: [],
      historyNotes: [],
    },
  ];
}

/**
 * Uploads Primavera P6 (.xer), MS Project (.xml), or Schedule (.csv/.xlsx) to the backend
 * and returns the parsed L6 activities to immediately populate the WBS tree.
 */
export async function uploadScheduleToBackend(file: File): Promise<ScheduleImportResult | null> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    const activities: L6Activity[] = (data.records || []).map((r: any, idx: number) => {
      const codeMatch = (r.quantity || '').match(/\[([A-Za-z0-9\-]+)\]/);
      const code = codeMatch ? codeMatch[1] : `ACT-${String(idx + 1).padStart(3, '0')}`;
      const nameMatch = (r.quantity || '').replace(/\[.*?\]\s*/, '').replace(/\s*\(Planned:.*?\)/, '');
      const name = nameMatch || r.quantity || 'Planned Schedule Activity';

      return {
        id: `L6-IMP-${Date.now()}-${idx}`,
        code,
        wbsNumber: `01.01.${String(idx + 1).padStart(2, '0')}`,
        name,
        l5Id: 'L5-01',
        projectId: 'PRJ-001',
        discipline: (r.type as any) || 'Piping',
        location: r.site || 'Main Pipeline Route',
        kpStart: 12.0 + idx * 0.5,
        kpEnd: 12.5 + idx * 0.5,
        plannedProgress: Number(r.quantity_numeric) || 30,
        actualProgress: 0,
        variance: -(Number(r.quantity_numeric) || 30),
        weightInL5: 20,
        assignedWorkerId: 'W-01',
        assignedWorkerName: 'Ravi Kumar',
        startDate: r.date || new Date().toISOString().split('T')[0],
        endDate: '2026-10-30',
        status: 'NOT_STARTED',
        specs: {
          pipeSize: '12 inch API 5L X65',
          material: 'Carbon Steel',
          totalQuantity: '500 rmt',
          unit: 'rmt',
        },
        linkedReportIds: [],
        historyNotes: [
          {
            id: `HN-INIT-${idx}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' TODAY',
            author: 'System Schedule Import',
            note: `Imported from ${file.name} (${data.report_type || 'Schedule'})`,
            progressFrom: 0,
            progressTo: 0,
            source: 'SCHEDULE_REVISE',
          },
        ],
      };
    });

    return {
      site: data.site || 'Imported Project Schedule',
      reportType: data.report_type || 'Schedule Baseline',
      activities,
    };
  } catch (err) {
    console.warn('Backend unavailable, parsing file locally:', err);
    return await parseScheduleFileLocally(file);
  }
}

/**
 * Sends a DPR PDF or Progress file to the backend AI semantic matcher
 */
export async function processDprWithBackendAI(file: File): Promise<any | null> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('AI Service DPR processing offline or failed:', err);
    return null;
  }
}
