import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Project,
  L5Process,
  L6Activity,
  Worker,
  FieldReport,
  AIMatch,
  AuditLog,
  UserRole,
  StatusLevel,
} from '../types';
import {
  INITIAL_PROJECTS,
  INITIAL_L5_PROCESSES,
  INITIAL_L6_ACTIVITIES,
  INITIAL_WORKERS,
  INITIAL_FIELD_REPORTS,
  INITIAL_AI_MATCHES,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';
import { extractReportInformation, matchReportToL6Activities } from '../services/aiEngine';

import { useAuth } from './AuthContext';

interface RollUpCascadeEvent {
  matchId: string;
  l6Code: string;
  l6Name: string;
  l6Old: number;
  l6New: number;
  l5Name: string;
  l5Old: number;
  l5New: number;
  projectOld: number;
  projectNew: number;
}

export interface SystemSettings {
  confidenceThreshold: number;
  varianceTolerance: number;
}

interface ProjectContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  projects: Project[];
  l5Processes: L5Process[];
  l6Activities: L6Activity[];
  workers: Worker[];
  fieldReports: FieldReport[];
  aiMatches: AIMatch[];
  auditLogs: AuditLog[];
  activeRollUpEvent: RollUpCascadeEvent | null;
  dismissRollUpEvent: () => void;
  glitteringActivityId: string | null;
  systemSettings: SystemSettings;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  
  // Actions
  acceptAIMatch: (matchId: string, overrideL6Id?: string, customNewProgress?: number) => void;
  rejectAIMatch: (matchId: string, reason: string) => void;
  submitFieldReport: (reportData: Partial<FieldReport>) => Promise<{ report: FieldReport; match: AIMatch }>;
  manualUpdateL6Progress: (l6Id: string, newProgress: number, note: string) => void;
  assignWorkerToL6: (l6Id: string, workerId: string) => void;
  updateL6Dates: (l6Id: string, startDate: string, endDate: string) => void;
  addNewL6Activity: (activity: Partial<L6Activity>) => void;
  importScheduleActivities: (activities: L6Activity[], sourceName?: string) => void;
  addNewProject: (projectData: Partial<Project>) => Project;
  resetToDemoScenario: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'sitesync_epc_v1_';

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const role: UserRole = user ? (user.role.toLowerCase() as UserRole) : 'admin';
  const setRole = (_r: UserRole) => {
    console.warn('Role cannot be switched via frontend component.');
  };
  const [selectedProjectId, setSelectedProjectId] = useState<string>('PRJ-001');

  // Load from localStorage or defaults
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [l5Processes, setL5Processes] = useState<L5Process[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'l5Processes');
    return saved ? JSON.parse(saved) : INITIAL_L5_PROCESSES;
  });

  const [l6Activities, setL6Activities] = useState<L6Activity[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'l6Activities');
    return saved ? JSON.parse(saved) : INITIAL_L6_ACTIVITIES;
  });

  const [workers, setWorkers] = useState<Worker[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'workers');
    return saved ? JSON.parse(saved) : INITIAL_WORKERS;
  });

  const [fieldReports, setFieldReports] = useState<FieldReport[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'fieldReports');
    if (!saved) return INITIAL_FIELD_REPORTS;
    try {
      const parsed: FieldReport[] = JSON.parse(saved);
      // Ensure seed reports or reports with missing attachments get populated with their documents
      const merged = parsed.map(r => {
        const seed = INITIAL_FIELD_REPORTS.find(s => s.id === r.id);
        if (seed && (!r.attachments || r.attachments.length === 0)) {
          return { ...r, attachments: seed.attachments };
        }
        return r;
      });
      // Also ensure any newly added seed reports like FR-00470 are included if missing
      INITIAL_FIELD_REPORTS.forEach(seed => {
        if (!merged.some(m => m.id === seed.id)) {
          merged.push(seed);
        }
      });
      return merged;
    } catch (e) {
      return INITIAL_FIELD_REPORTS;
    }
  });

  const [aiMatches, setAiMatches] = useState<AIMatch[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'aiMatches');
    return saved ? JSON.parse(saved) : INITIAL_AI_MATCHES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'auditLogs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [activeRollUpEvent, setActiveRollUpEvent] = useState<RollUpCascadeEvent | null>(null);
  const [glitteringActivityId, setGlitteringActivityId] = useState<string | null>(null);

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'system_settings');
    return saved ? JSON.parse(saved) : { confidenceThreshold: 85, varianceTolerance: 5 };
  });

  const updateSystemSettings = (newSettings: Partial<SystemSettings>) => {
    setSystemSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(STORAGE_KEY_PREFIX + 'system_settings', JSON.stringify(updated));
      return updated;
    });
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'projects', JSON.stringify(projects));
  }, [projects]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'l5Processes', JSON.stringify(l5Processes));
  }, [l5Processes]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'l6Activities', JSON.stringify(l6Activities));
  }, [l6Activities]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'fieldReports', JSON.stringify(fieldReports));
  }, [fieldReports]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'aiMatches', JSON.stringify(aiMatches));
  }, [aiMatches]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'auditLogs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Status helper
  const calculateStatus = (actual: number, planned: number): StatusLevel => {
    if (actual >= 100) return 'COMPLETE';
    const variance = actual - planned;
    if (variance < -15) return 'DELAYED';
    if (variance < -5) return 'AT_RISK';
    if (actual > 0) return 'IN_PROGRESS';
    return 'ON_TRACK';
  };

  /**
   * Recalculates L5 process progress and Project progress from L6 activities
   */
  const recalculateHierarchy = (
    currentL6s: L6Activity[],
    targetL5Id: string,
    targetProjectId: string
  ) => {
    // 1. Calculate L5
    const siblings = currentL6s.filter(a => a.l5Id === targetL5Id);
    let totalWeight = siblings.reduce((sum, a) => sum + (a.weightInL5 || 1), 0);
    if (totalWeight === 0) totalWeight = 1;

    const weightedSum = siblings.reduce((sum, a) => sum + (a.actualProgress * (a.weightInL5 || 1)), 0);
    const newL5Actual = Math.min(100, Math.round(weightedSum / totalWeight));

    let updatedL5s: L5Process[] = [];
    setL5Processes(prevL5s => {
      updatedL5s = prevL5s.map(l5 => {
        if (l5.id === targetL5Id) {
          const variance = newL5Actual - l5.plannedProgress;
          return {
            ...l5,
            actualProgress: newL5Actual,
            variance,
            status: calculateStatus(newL5Actual, l5.plannedProgress),
          };
        }
        return l5;
      });
      return updatedL5s;
    });

    // 2. Calculate Project
    setTimeout(() => {
      setProjects(prevProjects => {
        return prevProjects.map(proj => {
          if (proj.id === targetProjectId) {
            const projL5s = updatedL5s.filter(l => proj.l5ProcessIds.includes(l.id));
            let projTotalWeight = projL5s.reduce((sum, l) => sum + (l.weightInProject || 1), 0);
            if (projTotalWeight === 0) projTotalWeight = 1;

            const projWeightedSum = projL5s.reduce((sum, l) => sum + (l.actualProgress * (l.weightInProject || 1)), 0);
            const newProjActual = Math.min(100, Math.round(projWeightedSum / projTotalWeight));
            const projVariance = newProjActual - proj.plannedProgress;

            return {
              ...proj,
              actualProgress: newProjActual,
              variance: projVariance,
              status: newProjActual >= 100 ? 'COMPLETED' : (projVariance < -10 ? 'CRITICAL' : 'ACTIVE'),
            };
          }
          return proj;
        });
      });
    }, 50);
  };

  /**
   * ACCEPT AI MATCH — Trigger cascading roll-up
   */
  const acceptAIMatch = (matchId: string, overrideL6Id?: string, customNewProgress?: number) => {
    const match = aiMatches.find(m => m.id === matchId);
    if (!match) return;

    const targetL6Id = overrideL6Id || match.candidateL6Id;
    const targetL6 = l6Activities.find(a => a.id === targetL6Id);
    if (!targetL6) return;

    const oldL6Actual = targetL6.actualProgress;
    // If custom provided use it, otherwise suggestedProgressTo (e.g. 10% -> 30%)
    const newL6Actual = customNewProgress !== undefined ? customNewProgress : match.suggestedProgressTo;

    const targetL5 = l5Processes.find(l => l.id === targetL6.l5Id);
    const targetProj = projects.find(p => p.id === targetL6.projectId);

    const oldL5Actual = targetL5 ? targetL5.actualProgress : 74;
    const oldProjActual = targetProj ? targetProj.actualProgress : 72;

    // 1. Update Match status
    const updatedMatches = aiMatches.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          status: 'ACCEPTED' as const,
          reviewedBy: 'Deepak Saxena (Project Manager)',
          reviewedAt: new Date().toISOString(),
        };
      }
      return m;
    });
    setAiMatches(updatedMatches);

    // 2. Update Field Report status
    setFieldReports(prev =>
      prev.map(r => (r.id === match.reportId ? { ...r, status: 'VERIFIED' as const } : r))
    );

    // 3. Update L6 Activity
    const updatedL6s = l6Activities.map(act => {
      if (act.id === targetL6Id) {
        const newVariance = newL6Actual - act.plannedProgress;
        const newHistory = [
          {
            id: `HN-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' TODAY',
            author: 'Deepak Saxena (Admin)',
            note: `Verified AI match ${match.id} (Report ${match.reportId}): ${match.extractedData.summary}`,
            progressFrom: oldL6Actual,
            progressTo: newL6Actual,
            source: 'FIELD_REPORT_AI' as const,
          },
          ...act.historyNotes,
        ];

        return {
          ...act,
          actualProgress: newL6Actual,
          variance: newVariance,
          status: calculateStatus(newL6Actual, act.plannedProgress),
          linkedReportIds: act.linkedReportIds.includes(match.reportId)
            ? act.linkedReportIds
            : [...act.linkedReportIds, match.reportId],
          historyNotes: newHistory,
        };
      }
      return act;
    });
    setL6Activities(updatedL6s);

    // 4. Calculate expected new L5 and Project for animation preview
    const siblings = updatedL6s.filter(a => a.l5Id === targetL6.l5Id);
    let totalWeight = siblings.reduce((sum, a) => sum + (a.weightInL5 || 1), 0);
    if (totalWeight === 0) totalWeight = 1;
    const newL5Actual = Math.round(
      siblings.reduce((sum, a) => sum + (a.actualProgress * (a.weightInL5 || 1)), 0) / totalWeight
    );

    const projectedProjActual = targetProj
      ? Math.round(
          (oldProjActual * 100 - (oldL5Actual * (targetL5?.weightInProject || 45)) + (newL5Actual * (targetL5?.weightInProject || 45))) / 100
        )
      : oldProjActual + 2;

    // 5. Trigger Roll-up Animation Event
    setActiveRollUpEvent({
      matchId: match.id,
      l6Code: targetL6.code,
      l6Name: targetL6.name,
      l6Old: oldL6Actual,
      l6New: newL6Actual,
      l5Name: targetL5 ? targetL5.name : 'PIPELINE INSTALLATION',
      l5Old: oldL5Actual,
      l5New: newL5Actual,
      projectOld: oldProjActual,
      projectNew: projectedProjActual,
    });

    // Fire 1-second golden glittering highlight on the accepted activity
    setGlitteringActivityId(targetL6Id);
    setTimeout(() => setGlitteringActivityId(null), 1000);

    // 6. Recalculate Hierarchy
    recalculateHierarchy(updatedL6s, targetL6.l5Id, targetL6.projectId);

    // 7. Push Audit Log entries
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newAuditEntries: AuditLog[] = [
      {
        id: `AUD-${Date.now()}-1`,
        timestamp: new Date().toISOString(),
        timeFormatted: timeNow,
        eventType: 'MATCH_ACCEPTED',
        entityId: match.id,
        entityType: 'AI_MATCH',
        user: 'Deepak Saxena (Admin)',
        role: 'Project Manager',
        details: `Verified AI match ${match.id} with ${match.confidence}% confidence for ${targetL6.code}.`,
        wbsCode: targetL6.wbsNumber,
        metaBadge: 'VERIFIED',
      },
      {
        id: `AUD-${Date.now()}-2`,
        timestamp: new Date().toISOString(),
        timeFormatted: timeNow,
        eventType: 'L6_PROGRESS_UPDATED',
        entityId: targetL6.id,
        entityType: 'L6_ACTIVITY',
        user: 'SiteSync Engine',
        role: 'System',
        details: `${targetL6.code} actual progress updated ${oldL6Actual}% → ${newL6Actual}%.`,
        wbsCode: targetL6.wbsNumber,
        previousValue: `${oldL6Actual}%`,
        newValue: `${newL6Actual}%`,
        metaBadge: `+${newL6Actual - oldL6Actual}% DELTA`,
      },
      {
        id: `AUD-${Date.now()}-3`,
        timestamp: new Date().toISOString(),
        timeFormatted: timeNow,
        eventType: 'L5_RECALCULATED',
        entityId: targetL5 ? targetL5.id : 'L5-01',
        entityType: 'L5_PROCESS',
        user: 'SiteSync Engine',
        role: 'System',
        details: `L5 ${targetL5?.name || 'PIPELINE INSTALLATION'} recalculated ${oldL5Actual}% → ${newL5Actual}%.`,
        wbsCode: targetL5?.wbsNumber || '01.01',
        previousValue: `${oldL5Actual}%`,
        newValue: `${newL5Actual}%`,
        metaBadge: 'ROLL-UP CASCADE',
      },
      {
        id: `AUD-${Date.now()}-4`,
        timestamp: new Date().toISOString(),
        timeFormatted: timeNow,
        eventType: 'PROJECT_RECALCULATED',
        entityId: targetProj ? targetProj.id : 'PRJ-001',
        entityType: 'PROJECT',
        user: 'SiteSync Engine',
        role: 'System',
        details: `Project PEP-001 overall progress recalculated ${oldProjActual}% → ${projectedProjActual}%.`,
        wbsCode: '01',
        previousValue: `${oldProjActual}%`,
        newValue: `${projectedProjActual}%`,
        metaBadge: 'PORTFOLIO SYNC',
      },
    ];

    setAuditLogs(prev => [...newAuditEntries, ...prev]);
  };

  /**
   * REJECT AI MATCH
   */
  const rejectAIMatch = (matchId: string, reason: string) => {
    setAiMatches(prev =>
      prev.map(m =>
        m.id === matchId
          ? {
              ...m,
              status: 'REJECTED',
              reviewedBy: 'Deepak Saxena (Project Manager)',
              reviewedAt: new Date().toISOString(),
              reviewNotes: reason,
            }
          : m
      )
    );

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const log: AuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeFormatted: timeNow,
      eventType: 'MATCH_REJECTED',
      entityId: matchId,
      entityType: 'AI_MATCH',
      user: 'Deepak Saxena (Admin)',
      role: 'Project Manager',
      details: `Rejected AI match ${matchId}. Reason: ${reason}`,
      metaBadge: 'REJECTED',
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  /**
   * SUBMIT FIELD REPORT — Worker Flow
   */
  const submitFieldReport = async (reportData: Partial<FieldReport>) => {
    const reportNum = `FR-004${Math.floor(70 + Math.random() * 25)}`;
    const reportId = reportNum;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Extract info with AI
    const extracted = extractReportInformation(
      reportData.rawText || '',
      reportData.locationText || 'KP 12–12.5'
    );

    // 2. Candidate matching
    const projectL6s = l6Activities.filter(a => a.projectId === (reportData.projectId || 'PRJ-001'));
    const aiMatch = matchReportToL6Activities(
      extracted,
      projectL6s,
      reportId,
      reportData.rawText || ''
    );

    const now = new Date();
    const submissionTimestamp = now.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    }) + ' IST';
    const dateFormatted = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

    const newReport: FieldReport = {
      id: reportId,
      reportNumber: reportNum,
      projectId: reportData.projectId || 'PRJ-001',
      l5ProcessId: aiMatch.candidateL5Id || 'L5-01',
      workerId: reportData.workerId || 'W-01',
      workerName: reportData.workerName || 'Ravi Kumar',
      workerRole: reportData.workerRole || 'SITE ENGINEER',
      timestamp: now.toISOString(),
      date: dateFormatted,
      submissionTimestamp,
      rawText: reportData.rawText || '',
      locationText: reportData.locationText || extracted.locationRange,
      kpStart: extracted.kpStart,
      kpEnd: extracted.kpEnd,
      equipment: reportData.equipment || extracted.equipmentDetected.join(', '),
      materialsUsed: reportData.materialsUsed || extracted.materialDetected.join(', '),
      weather: reportData.weather || 'Clear, 28°C',
      safetyNotes: reportData.safetyNotes || 'Toolbox talk completed before pipe lowering.',
      photos: reportData.photos && reportData.photos.length > 0
        ? reportData.photos
        : ['https://images.unsplash.com/photo-1541888946425-d0fbb186156a?w=500&auto=format&fit=crop&q=80'],
      attachments: reportData.attachments || [],
      extractedData: extracted,
      aiMatchId: aiMatch.id,
      status: 'AI_MATCHED',
    };

    setFieldReports(prev => [newReport, ...prev]);
    setAiMatches(prev => [aiMatch, ...prev]);

    // Push Audit Log
    const log1: AuditLog = {
      id: `AUD-${Date.now()}-1`,
      timestamp: new Date().toISOString(),
      timeFormatted: timeNow,
      eventType: 'REPORT_SUBMITTED',
      entityId: newReport.id,
      entityType: 'REPORT',
      user: newReport.workerName,
      role: newReport.workerRole,
      details: `Field report ${newReport.id} submitted: "${newReport.rawText.slice(0, 70)}..."`,
      wbsCode: aiMatch.candidateL6Code,
      metaBadge: 'NEW REPORT',
    };

    const log2: AuditLog = {
      id: `AUD-${Date.now()}-2`,
      timestamp: new Date().toISOString(),
      timeFormatted: timeNow,
      eventType: 'AI_MATCH_GENERATED',
      entityId: aiMatch.id,
      entityType: 'AI_MATCH',
      user: 'SiteSync AI Engine v2.4',
      role: 'AI System',
      details: `Generated match: ${aiMatch.candidateL6Code} (${aiMatch.candidateL6Name}) with ${aiMatch.confidence}% confidence.`,
      wbsCode: aiMatch.candidateL6Code,
      metaBadge: `${aiMatch.confidence}% CONFIDENCE`,
    };

    setAuditLogs(prev => [log2, log1, ...prev]);

    return { report: newReport, match: aiMatch };
  };

  /**
   * Manual update from Worker Progress Slider
   */
  const manualUpdateL6Progress = (l6Id: string, newProgress: number, note: string) => {
    const act = l6Activities.find(a => a.id === l6Id);
    if (!act) return;

    const oldProgress = act.actualProgress;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedL6s = l6Activities.map(a => {
      if (a.id === l6Id) {
        return {
          ...a,
          actualProgress: newProgress,
          variance: newProgress - a.plannedProgress,
          status: calculateStatus(newProgress, a.plannedProgress),
          historyNotes: [
            {
              id: `HN-${Date.now()}`,
              timestamp: `${timeNow} TODAY`,
              author: 'Ravi Kumar (Worker)',
              note: note || `Manual progress update: ${oldProgress}% → ${newProgress}%`,
              progressFrom: oldProgress,
              progressTo: newProgress,
              source: 'MANUAL_UPDATE' as const,
            },
            ...a.historyNotes,
          ],
        };
      }
      return a;
    });

    setL6Activities(updatedL6s);
    recalculateHierarchy(updatedL6s, act.l5Id, act.projectId);

    const log: AuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeFormatted: timeNow,
      eventType: 'L6_PROGRESS_UPDATED',
      entityId: act.id,
      entityType: 'L6_ACTIVITY',
      user: 'Ravi Kumar',
      role: 'Site Engineer',
      details: `${act.code} manual update from ${oldProgress}% to ${newProgress}%. Note: "${note}"`,
      wbsCode: act.wbsNumber,
      previousValue: `${oldProgress}%`,
      newValue: `${newProgress}%`,
      metaBadge: 'FIELD UPDATE',
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const assignWorkerToL6 = (l6Id: string, workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker) return;

    setL6Activities(prev =>
      prev.map(a =>
        a.id === l6Id
          ? {
              ...a,
              assignedWorkerId: worker.id,
              assignedWorkerName: worker.name,
            }
          : a
      )
    );
  };

  const updateL6Dates = (l6Id: string, startDate: string, endDate: string) => {
    setL6Activities(prev =>
      prev.map(a => (a.id === l6Id ? { ...a, startDate, endDate } : a))
    );
  };

  const addNewL6Activity = (activity: Partial<L6Activity>) => {
    const newAct: L6Activity = {
      id: `ACT-NEW-${Date.now()}`,
      code: activity.code || `PIPE-L6-00${l6Activities.length + 1}`,
      wbsNumber: activity.wbsNumber || `01.01.0${l6Activities.length + 1}`,
      name: activity.name || 'New Pipeline Work Package',
      l5Id: activity.l5Id || 'L5-01',
      projectId: activity.projectId || 'PRJ-001',
      discipline: activity.discipline || 'Piping',
      location: activity.location || 'KP 13–14',
      kpStart: activity.kpStart || 13.0,
      kpEnd: activity.kpEnd || 14.0,
      plannedProgress: activity.plannedProgress || 0,
      actualProgress: 0,
      variance: -(activity.plannedProgress || 0),
      weightInL5: activity.weightInL5 || 20,
      assignedWorkerId: activity.assignedWorkerId || 'W-01',
      assignedWorkerName: activity.assignedWorkerName || 'Ravi Kumar',
      startDate: activity.startDate || '2026-09-15',
      endDate: activity.endDate || '2026-09-25',
      status: 'NOT_STARTED',
      specs: activity.specs || {
        pipeSize: '12 inch API 5L',
        material: 'Carbon Steel',
        totalQuantity: '1,000m',
        completedQuantity: '0m',
      },
      linkedReportIds: [],
      historyNotes: [],
    };

    const updated = [...l6Activities, newAct];
    setL6Activities(updated);
    recalculateHierarchy(updated, newAct.l5Id, newAct.projectId);
  };

  const importScheduleActivities = (newActivities: L6Activity[], sourceName = 'Schedule File') => {
    if (!newActivities || newActivities.length === 0) return;
    setL6Activities(prev => {
      const existingCodes = new Set(newActivities.map(a => a.code));
      const filteredOld = prev.filter(a => !existingCodes.has(a.code));
      const combined = [...filteredOld, ...newActivities];
      recalculateHierarchy(combined, newActivities[0].l5Id, newActivities[0].projectId);
      return combined;
    });

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const log: AuditLog = {
      id: `AUD-${Date.now()}-IMP`,
      timestamp: new Date().toISOString(),
      timeFormatted: timeNow,
      eventType: 'SCHEDULE_EDITED',
      entityId: 'WBS-L6',
      entityType: 'L6_ACTIVITY',
      user: 'Deepak Saxena (Admin)',
      role: 'Project Manager',
      details: `Imported ${newActivities.length} schedule activities from ${sourceName}`,
      metaBadge: 'IMPORT',
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const addNewProject = (projectData: Partial<Project>): Project => {
    const nextNum = projects.length + 1;
    const newId = projectData.id || `PRJ-00${nextNum}`;
    const newL5Id = `L5-${newId}-01`;
    const newL6Act1Id = `ACT-${newId}-001`;
    const newL6Act2Id = `ACT-${newId}-002`;

    const newProject: Project = {
      id: newId,
      code: projectData.code || `EPC-00${nextNum}`,
      name: projectData.name || `Pipeline EPC Project #${nextNum}`,
      location: projectData.location || 'Western Energy Corridor, India',
      packageCode: projectData.packageCode || `PKG-PL-0${nextNum}`,
      contractor: projectData.contractor || 'Kalpataru Projects International Ltd',
      plannedProgress: projectData.plannedProgress ?? 5,
      actualProgress: projectData.actualProgress ?? 0,
      variance: projectData.variance ?? -5,
      startDate: projectData.startDate || '2026-09-11',
      endDate: projectData.endDate || projectData.targetDate || '2027-04-30',
      status: projectData.status || 'ACTIVE',
      l5ProcessIds: [newL5Id],
      budgetTotalCr: projectData.budgetTotalCr || 850,
      spentCr: projectData.spentCr || 40,
      totalWorkersOnSite: projectData.totalWorkersOnSite || 24,
      budget: projectData.budget || '₹850 Cr',
      client: projectData.client || 'National Petroleum Infrastructure Corp.',
      description: projectData.description || 'Turnkey EPC cross-country hydrocarbon pipeline construction and commissioning.',
      targetDate: projectData.targetDate || '2027-04-30',
      plannedValue: projectData.plannedValue || 25,
      earnedValue: projectData.earnedValue || 25,
      actualCost: projectData.actualCost || 23,
      cpi: projectData.cpi || 1.09,
      spi: projectData.spi || 1.0,
      totalLengthKm: projectData.totalLengthKm || 120,
      overallProgress: projectData.overallProgress || 5,
    };

    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    localStorage.setItem(STORAGE_KEY_PREFIX + 'projects', JSON.stringify(updatedProjects));

    // Default L5 and L6 for this new project
    const newL5: L5Process = {
      id: newL5Id,
      projectId: newProject.id,
      wbsNumber: '01.01',
      code: `L5-${newProject.id}-01`,
      name: 'Mainline Pipeline Civil & Laying Works',
      discipline: 'Piping',
      weightInProject: 100,
      plannedProgress: 10,
      actualProgress: 10,
      variance: 0,
      status: 'ON_TRACK',
      l6ActivityIds: [newL6Act1Id, newL6Act2Id],
      owner: 'EPC Site Team',
      activityCount: 2,
    };

    const newL6List: L6Activity[] = [
      {
        id: newL6Act1Id,
        code: `PIPE-${newProject.id}-01`,
        wbsNumber: '01.01.01',
        name: 'Right of Way (ROW) Clearing & Grading',
        l5Id: newL5.id,
        projectId: newProject.id,
        discipline: 'Civil',
        location: 'Section 01 (KP 00 - KP 20)',
        kpStart: 0,
        kpEnd: 20,
        plannedProgress: 10,
        actualProgress: 10,
        variance: 0,
        weightInL5: 50,
        assignedWorkerId: 'W-01',
        assignedWorkerName: 'Ravi Kumar',
        startDate: '2026-09-11',
        endDate: '2026-10-20',
        status: 'IN_PROGRESS',
        specs: {
          pipeSize: '24 inch API 5L',
          material: 'Carbon Steel X70',
          totalQuantity: '20 km',
          completedQuantity: '2 km',
        },
        linkedReportIds: [],
        historyNotes: [
          {
            id: `HN-${newProject.id}-01`,
            timestamp: '11 SEP 2026 10:00',
            author: 'Administrator',
            note: 'Created during project initialization',
            progressFrom: 0,
            progressTo: 10,
            source: 'SCHEDULE_REVISE',
          }
        ],
      },
      {
        id: newL6Act2Id,
        code: `PIPE-${newProject.id}-02`,
        wbsNumber: '01.01.02',
        name: 'Trenching & Pipe Stringing',
        l5Id: newL5.id,
        projectId: newProject.id,
        discipline: 'Piping',
        location: 'Section 01 (KP 00 - KP 20)',
        kpStart: 0,
        kpEnd: 20,
        plannedProgress: 0,
        actualProgress: 0,
        variance: 0,
        weightInL5: 50,
        assignedWorkerId: 'W-02',
        assignedWorkerName: 'Manoj Verma',
        startDate: '2026-10-15',
        endDate: '2026-11-30',
        status: 'NOT_STARTED',
        specs: {
          pipeSize: '24 inch API 5L',
          material: 'Carbon Steel X70',
          totalQuantity: '20 km',
          completedQuantity: '0 km',
        },
        linkedReportIds: [],
        historyNotes: [],
      }
    ];

    setL5Processes(prev => {
      const up = [...prev, newL5];
      localStorage.setItem(STORAGE_KEY_PREFIX + 'l5Processes', JSON.stringify(up));
      return up;
    });

    setL6Activities(prev => {
      const up = [...prev, ...newL6List];
      localStorage.setItem(STORAGE_KEY_PREFIX + 'l6Activities', JSON.stringify(up));
      return up;
    });

    setSelectedProjectId(newProject.id);
    return newProject;
  };

  /**
   * Reset the whole state to default demo scenario
   */
  const resetToDemoScenario = () => {
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'projects');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'l5Processes');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'l6Activities');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'fieldReports');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'aiMatches');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'auditLogs');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'workers');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'system_settings');

    setProjects(INITIAL_PROJECTS);
    setL5Processes(INITIAL_L5_PROCESSES);
    setL6Activities(INITIAL_L6_ACTIVITIES);
    setWorkers(INITIAL_WORKERS);
    setFieldReports(INITIAL_FIELD_REPORTS);
    setAiMatches(INITIAL_AI_MATCHES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSystemSettings({ confidenceThreshold: 85, varianceTolerance: 5 });
    setActiveRollUpEvent(null);
  };

  const dismissRollUpEvent = () => setActiveRollUpEvent(null);

  return (
    <ProjectContext.Provider
      value={{
        role,
        setRole,
        selectedProjectId,
        setSelectedProjectId,
        projects,
        l5Processes,
        l6Activities,
        workers,
        fieldReports,
        aiMatches,
        auditLogs,
        activeRollUpEvent,
        dismissRollUpEvent,
        glitteringActivityId,
        systemSettings,
        updateSystemSettings,
        acceptAIMatch,
        rejectAIMatch,
        submitFieldReport,
        manualUpdateL6Progress,
        assignWorkerToL6,
        updateL6Dates,
        addNewL6Activity,
        importScheduleActivities,
        addNewProject,
        resetToDemoScenario,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
