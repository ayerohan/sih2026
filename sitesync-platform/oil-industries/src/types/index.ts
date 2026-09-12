export type UserRole = 'ADMIN' | 'WORKER' | 'admin' | 'worker';

export interface AuthUser {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'WORKER';
  designation: string;
  avatar?: string;
}

export type StatusLevel = 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'COMPLETE' | 'NOT_STARTED' | 'IN_PROGRESS';

export interface Worker {
  id: string;
  name: string;
  role: string;
  badgeId: string;
  avatar: string;
  activeProjectCode: string;
  phone: string;
  activeAssignmentsCount: number;
  completedTodayCount: number;
  assignedL6Ids: string[];
  discipline: string;
  status: 'ONLINE' | 'IN_FIELD' | 'OFFLINE';
}

export interface L6Activity {
  id: string;
  code: string; // e.g. PIPE-L6-003
  wbsNumber: string; // e.g. 01.01.03
  name: string; // e.g. Lay 12 inch Pipe KP 12–13
  l5Id: string;
  projectId: string;
  discipline: 'Piping' | 'Mechanical' | 'Civil' | 'Electrical' | 'Instrumentation' | 'QA/QC';
  location: string; // e.g. KP 12–13
  kpStart: number;
  kpEnd: number;
  plannedProgress: number; // 0-100
  actualProgress: number; // 0-100
  variance: number; // actual - planned
  weightInL5: number; // e.g. 25 (%)
  assignedWorkerId: string;
  assignedWorkerName: string;
  startDate: string;
  endDate: string;
  status: StatusLevel;
  specs: {
    pipeSize?: string;
    material?: string;
    totalQuantity?: string;
    completedQuantity?: string;
    unit?: string;
  };
  linkedReportIds: string[];
  historyNotes: {
    id: string;
    timestamp: string;
    author: string;
    note: string;
    progressFrom: number;
    progressTo: number;
    source: 'FIELD_REPORT_AI' | 'MANUAL_UPDATE' | 'SCHEDULE_REVISE';
  }[];
}

export interface L5Process {
  id: string;
  projectId: string;
  wbsNumber: string; // e.g. 01.01
  code: string; // e.g. L5-01
  name: string; // e.g. PIPELINE INSTALLATION
  discipline: string;
  plannedProgress: number;
  actualProgress: number;
  variance: number;
  weightInProject: number; // e.g. 40 (%)
  status: StatusLevel;
  l6ActivityIds: string[];
  owner?: string;
  activityCount?: number;
}

export interface Project {
  id: string;
  code: string; // PEP-001
  name: string; // Pipeline Expansion Project
  location: string; // Assam, Sector 4
  packageCode: string; // EPC Package 04
  contractor: string; // Oil Private Limited / PetroInfra EPC
  plannedProgress: number;
  actualProgress: number;
  variance: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'CRITICAL' | 'COMPLETED' | 'ON_HOLD';
  l5ProcessIds: string[];
  budgetTotalCr: number;
  spentCr: number;
  totalWorkersOnSite: number;
  budget?: string;
  client?: string;
  description?: string;
  targetDate?: string;
  plannedValue?: number;
  earnedValue?: number;
  actualCost?: number;
  cpi?: number;
  spi?: number;
  totalLengthKm?: number;
  overallProgress?: number;
}

export interface ExtractedReportData {
  discipline: string;
  workType: string;
  locationRange: string;
  kpStart: number;
  kpEnd: number;
  pipeSize?: string;
  statusDetected: string;
  quantDeltaEstimated: number; // e.g. 20 (%)
  equipmentDetected: string[];
  materialDetected: string[];
  jointsWelded?: number;
  safetyMentioned?: string;
  summary: string;
}

export interface AIMatchCandidate {
  l6Id: string;
  l6Code: string;
  l6Name: string;
  confidence: number;
  reason: string;
  locationScore: number;
  disciplineScore: number;
  descriptionScore: number;
  dateScore: number;
}

export interface AIMatch {
  id: string; // e.g. MAT-00472
  reportId: string;
  candidateL6Id: string;
  candidateL6Code: string;
  candidateL6Name: string;
  candidateL5Id: string;
  confidence: number; // 0-100
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  evidenceBreakdown: {
    locationMatch: number;
    disciplineMatch: number;
    descriptionMatch: number;
    dateCompatibility: number;
  };
  evidenceTags: string[];
  extractedData: ExtractedReportData;
  suggestedProgressFrom: number;
  suggestedProgressTo: number;
  alternativeCandidates: AIMatchCandidate[];
  status: 'PENDING_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'OVERRIDDEN';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface ReportAttachment {
  id: string;
  name: string;
  size: number; // bytes
  type: 'pdf' | 'excel' | 'word' | 'other';
  mimeType: string;
  file?: File; // client-side only, not persisted
  url?: string; // remote URL after upload
}

export interface FieldReport {
  id: string; // FR-00472
  reportNumber: string;
  projectId: string;
  l5ProcessId: string;
  workerId: string;
  workerName: string;
  workerRole: string;
  timestamp: string;
  date: string;
  submissionTimestamp?: string; // Human-readable e.g. "11 Sep 2026, 4:35 PM IST"
  rawText: string;
  locationText: string;
  kpStart: number;
  kpEnd: number;
  equipment?: string;
  materialsUsed?: string;
  weather?: string;
  safetyNotes?: string;
  photos: string[];
  attachments?: ReportAttachment[];
  extractedData?: ExtractedReportData;
  aiMatchId?: string;
  status: 'PENDING_AI' | 'AI_MATCHED' | 'VERIFIED' | 'REJECTED';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  timeFormatted: string;
  eventType: 
    | 'REPORT_SUBMITTED'
    | 'AI_MATCH_GENERATED'
    | 'MATCH_ACCEPTED'
    | 'MATCH_REJECTED'
    | 'L6_PROGRESS_UPDATED'
    | 'L5_RECALCULATED'
    | 'PROJECT_RECALCULATED'
    | 'SCHEDULE_EDITED'
    | 'WORKER_ASSIGNED';
  entityId: string;
  entityType: 'REPORT' | 'AI_MATCH' | 'L6_ACTIVITY' | 'L5_PROCESS' | 'PROJECT' | 'WORKER';
  user: string;
  role: string;
  details: string;
  wbsCode?: string;
  previousValue?: string | number;
  newValue?: string | number;
  metaBadge?: string;
}

export interface SCurveDataPoint {
  month: string;
  planned: number;
  actual: number;
  forecast?: number;
  reportsCount: number;
}
