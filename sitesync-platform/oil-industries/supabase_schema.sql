-- ==============================================================================
-- SITESYNC SIH 2026 - COMPLETE SUPABASE SQL DATABASE SCHEMA & SEED DATA
-- Project URL: https://nknoevwzahroxbllwlnz.supabase.co
-- Execute this script directly in the Supabase SQL Editor to instantiate all tables.
-- ==============================================================================

-- 1. CLEANUP / RESET EXISTING TABLES (IF ANY)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS ai_matches CASCADE;
DROP TABLE IF EXISTS field_reports CASCADE;
DROP TABLE IF EXISTS l6_activities CASCADE;
DROP TABLE IF EXISTS l5_processes CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS workers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. CREATE USERS TABLE
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    employee_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'WORKER')),
    designation TEXT NOT NULL,
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE PROJECTS TABLE
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    package_code TEXT NOT NULL,
    contractor TEXT NOT NULL,
    planned_progress NUMERIC DEFAULT 0,
    actual_progress NUMERIC DEFAULT 0,
    variance NUMERIC DEFAULT 0,
    start_date TEXT,
    end_date TEXT,
    status TEXT DEFAULT 'ACTIVE',
    budget_total_cr NUMERIC DEFAULT 0,
    spent_cr NUMERIC DEFAULT 0,
    total_workers_on_site INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREATE L5 PROCESSES TABLE
CREATE TABLE l5_processes (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    wbs_number TEXT NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    discipline TEXT NOT NULL,
    planned_progress NUMERIC DEFAULT 0,
    actual_progress NUMERIC DEFAULT 0,
    variance NUMERIC DEFAULT 0,
    weight_in_project NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'ON_TRACK',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CREATE WORKERS TABLE
CREATE TABLE workers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    badge_id TEXT NOT NULL,
    avatar TEXT,
    active_project_code TEXT,
    phone TEXT,
    active_assignments_count INTEGER DEFAULT 0,
    completed_today_count INTEGER DEFAULT 0,
    assigned_l6_ids TEXT[],
    discipline TEXT,
    status TEXT DEFAULT 'ONLINE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CREATE L6 ACTIVITIES TABLE
CREATE TABLE l6_activities (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    wbs_number TEXT NOT NULL,
    name TEXT NOT NULL,
    l5_id TEXT REFERENCES l5_processes(id) ON DELETE CASCADE,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    discipline TEXT NOT NULL,
    location TEXT NOT NULL,
    kp_start NUMERIC DEFAULT 0,
    kp_end NUMERIC DEFAULT 0,
    planned_progress NUMERIC DEFAULT 0,
    actual_progress NUMERIC DEFAULT 0,
    variance NUMERIC DEFAULT 0,
    weight_in_l5 NUMERIC DEFAULT 0,
    assigned_worker_id TEXT REFERENCES workers(id) ON DELETE SET NULL,
    assigned_worker_name TEXT,
    start_date TEXT,
    end_date TEXT,
    status TEXT DEFAULT 'NOT_STARTED',
    specs JSONB,
    linked_report_ids TEXT[],
    history_notes JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CREATE FIELD REPORTS TABLE
CREATE TABLE field_reports (
    id TEXT PRIMARY KEY,
    report_number TEXT UNIQUE NOT NULL,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    l5_process_id TEXT REFERENCES l5_processes(id) ON DELETE SET NULL,
    worker_id TEXT REFERENCES workers(id) ON DELETE SET NULL,
    worker_name TEXT NOT NULL,
    worker_role TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    date TEXT NOT NULL,
    raw_text TEXT NOT NULL,
    location_text TEXT,
    kp_start NUMERIC DEFAULT 0,
    kp_end NUMERIC DEFAULT 0,
    equipment TEXT,
    materials_used TEXT,
    weather TEXT,
    safety_notes TEXT,
    photos TEXT[],
    extracted_data JSONB,
    ai_match_id TEXT,
    status TEXT DEFAULT 'AI_MATCHED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CREATE AI MATCHES TABLE
CREATE TABLE ai_matches (
    id TEXT PRIMARY KEY,
    report_id TEXT REFERENCES field_reports(id) ON DELETE CASCADE,
    candidate_l6_id TEXT REFERENCES l6_activities(id) ON DELETE CASCADE,
    candidate_l6_code TEXT NOT NULL,
    candidate_l6_name TEXT NOT NULL,
    candidate_l5_id TEXT REFERENCES l5_processes(id) ON DELETE SET NULL,
    confidence NUMERIC NOT NULL,
    confidence_level TEXT NOT NULL,
    evidence_breakdown JSONB,
    evidence_tags TEXT[],
    extracted_data JSONB,
    suggested_progress_from NUMERIC DEFAULT 0,
    suggested_progress_to NUMERIC DEFAULT 0,
    alternative_candidates JSONB,
    status TEXT DEFAULT 'PENDING_REVIEW',
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CREATE AUDIT LOGS TABLE
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    time_formatted TEXT NOT NULL,
    event_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    details TEXT NOT NULL,
    wbs_code TEXT,
    previous_value TEXT,
    new_value TEXT,
    meta_badge TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR DEMO EVALUATION
-- ==============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE l5_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE l6_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public read/write projects" ON projects FOR ALL USING (true);
CREATE POLICY "Allow public read/write l5_processes" ON l5_processes FOR ALL USING (true);
CREATE POLICY "Allow public read/write workers" ON workers FOR ALL USING (true);
CREATE POLICY "Allow public read/write l6_activities" ON l6_activities FOR ALL USING (true);
CREATE POLICY "Allow public read/write field_reports" ON field_reports FOR ALL USING (true);
CREATE POLICY "Allow public read/write ai_matches" ON ai_matches FOR ALL USING (true);
CREATE POLICY "Allow public read/write audit_logs" ON audit_logs FOR ALL USING (true);

-- ==============================================================================
-- SEED INITIAL DATA
-- ==============================================================================

-- Seed Users
INSERT INTO users (id, employee_id, name, email, password, role, designation, avatar) VALUES
('USR-ADM-001', 'ADM-001', 'Deepak Saxena', 'deepak.saxena@sitesync.oil.in', 'admin123', 'ADMIN', 'PROJECT DIRECTOR', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),
('USR-WRK-001', 'WRK-001', 'Ravi Kumar', 'ravi.kumar@sitesync.oil.in', 'worker123', 'WORKER', 'SITE ENGINEER (SE-8842)', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');

-- Seed Project
INSERT INTO projects (id, code, name, location, package_code, contractor, planned_progress, actual_progress, variance, start_date, end_date, status, budget_total_cr, spent_cr, total_workers_on_site) VALUES
('PRJ-001', 'PEP-001', 'Pipeline Expansion Project (Assam)', 'Assam Sector 04 (KP 00–45)', 'EPC Package 04', 'Oil Private Limited / PetroInfra EPC', 82, 72, -10, '2026-06-01', '2027-03-31', 'ACTIVE', 450.0, 312.5, 184);

-- Seed L5 Processes
INSERT INTO l5_processes (id, project_id, wbs_number, code, name, discipline, planned_progress, actual_progress, variance, weight_in_project, status) VALUES
('L5-01', 'PRJ-001', '01.01', 'L5-01', 'PIPELINE INSTALLATION', 'Piping & Pipeline', 82, 74, -8, 45, 'AT_RISK'),
('L5-02', 'PRJ-001', '01.02', 'L5-02', 'VALVE STATIONS & INTERCONNECTS', 'Mechanical', 75, 78, 3, 25, 'ON_TRACK'),
('L5-03', 'PRJ-001', '01.03', 'L5-03', 'CIVIL & CROSSINGS', 'Civil & Structural', 90, 88, -2, 15, 'ON_TRACK'),
('L5-04', 'PRJ-001', '01.04', 'L5-04', 'E&I / SCADA TELEMETRY', 'Electrical & Instrumentation', 50, 45, -5, 15, 'ON_TRACK');

-- Seed Workers
INSERT INTO workers (id, name, role, badge_id, avatar, active_project_code, phone, active_assignments_count, completed_today_count, assigned_l6_ids, discipline, status) VALUES
('W-01', 'Ravi Kumar', 'SITE ENGINEER', 'SE-8842', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'PEP-001', '+91 98450 12390', 4, 2, ARRAY['ACT-PIPE-03', 'ACT-PIPE-02', 'ACT-PIPE-04', 'ACT-VALVE-02'], 'Piping & Pipeline', 'IN_FIELD'),
('W-02', 'Manoj Verma', 'PIPING FOREMAN', 'PF-4109', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'PEP-001', '+91 97120 44921', 3, 1, ARRAY['ACT-PIPE-01', 'ACT-VALVE-01', 'ACT-VALVE-03'], 'Piping', 'ONLINE'),
('W-03', 'Sunita Sharma', 'QA/QC INSPECTOR', 'QC-1092', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', 'PEP-001', '+91 99012 88471', 2, 3, ARRAY['ACT-PIPE-04', 'ACT-MECH-02'], 'QA/QC Inspection', 'IN_FIELD'),
('W-04', 'Vikram Das', 'E&I SUPERVISOR', 'EI-6512', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'PEP-001', '+91 94350 99120', 3, 1, ARRAY['ACT-ELEC-01', 'ACT-ELEC-02', 'ACT-MECH-01'], 'Electrical & Instrumentation', 'ONLINE');

-- Seed L6 Activities
INSERT INTO l6_activities (id, code, wbs_number, name, l5_id, project_id, discipline, location, kp_start, kp_end, planned_progress, actual_progress, variance, weight_in_l5, assigned_worker_id, assigned_worker_name, start_date, end_date, status, specs, linked_report_ids, history_notes) VALUES
('ACT-PIPE-01', 'PIPE-L6-001', '01.01.01', 'Lay 12 inch Pipe KP 10–11', 'L5-01', 'PRJ-001', 'Piping', 'KP 10–11', 10.0, 11.0, 100, 100, 0, 25, 'W-02', 'Manoj Verma', '2026-09-01', '2026-09-05', 'COMPLETE', '{"pipeSize":"12 inch API 5L X65","material":"Carbon Steel ERW","totalQuantity":"1,000 meters","completedQuantity":"1,000 meters","unit":"m"}'::jsonb, ARRAY['FR-00461', 'FR-00463'], '[{"id":"HN-01","timestamp":"05 SEP 2026 17:00","author":"Manoj Verma","note":"Completed 1,000m pipe lowering and stringing from KP 10 to KP 11. Hydrotest pass.","progressFrom":80,"progressTo":100,"source":"FIELD_REPORT_AI"}]'::jsonb),
('ACT-PIPE-02', 'PIPE-L6-002', '01.01.02', 'Lay 12 inch Pipe KP 11–12', 'L5-01', 'PRJ-001', 'Piping', 'KP 11–12', 11.0, 12.0, 100, 95, -5, 25, 'W-01', 'Ravi Kumar', '2026-09-04', '2026-09-08', 'ON_TRACK', '{"pipeSize":"12 inch API 5L X65","material":"Carbon Steel ERW","totalQuantity":"1,000 meters","completedQuantity":"950 meters","unit":"m"}'::jsonb, ARRAY['FR-00465'], '[{"id":"HN-02","timestamp":"08 SEP 2026 16:30","author":"Ravi Kumar","note":"Welding completed up to KP 11.95. Final 50m pending NDT radiograph.","progressFrom":70,"progressTo":95,"source":"MANUAL_UPDATE"}]'::jsonb),
('ACT-PIPE-03', 'PIPE-L6-003', '01.01.03', 'Lay 12 inch Pipe KP 12–13', 'L5-01', 'PRJ-001', 'Piping', 'KP 12–13', 12.0, 13.0, 40, 10, -30, 25, 'W-01', 'Ravi Kumar', '2026-09-09', '2026-09-15', 'DELAYED', '{"pipeSize":"12 inch API 5L X65","material":"Carbon Steel ERW","totalQuantity":"1,000 meters","completedQuantity":"100 meters","unit":"m"}'::jsonb, ARRAY[]::text[], '[{"id":"HN-03","timestamp":"09 SEP 2026 09:00","author":"Ravi Kumar","note":"Trenching delayed due to rocky terrain at KP 12.2. Equipment mobilized.","progressFrom":0,"progressTo":10,"source":"MANUAL_UPDATE"}]'::jsonb),
('ACT-PIPE-04', 'PIPE-L6-004', '01.01.04', 'Lay 12 inch Pipe KP 13–14', 'L5-01', 'PRJ-001', 'Piping', 'KP 13–14', 13.0, 14.0, 0, 0, 0, 25, 'W-01', 'Ravi Kumar', '2026-09-16', '2026-09-22', 'NOT_STARTED', '{"pipeSize":"12 inch API 5L X65","material":"Carbon Steel ERW","totalQuantity":"1,000 meters","completedQuantity":"0 meters","unit":"m"}'::jsonb, ARRAY[]::text[], '[]'::jsonb);

-- Seed Initial Field Report
INSERT INTO field_reports (id, report_number, project_id, l5_process_id, worker_id, worker_name, worker_role, timestamp, date, raw_text, location_text, kp_start, kp_end, equipment, materials_used, weather, safety_notes, photos, extracted_data, ai_match_id, status) VALUES
('FR-00472', 'FR-00472', 'PRJ-001', 'L5-01', 'W-01', 'Ravi Kumar', 'SITE ENGINEER', '2026-09-11 11:30:00+00', '11 SEP 2026', '12 inch pipe laying progressed from KP 12 to KP 12.5 today. 2 joints welded, visual inspection cleared with pipelayers.', 'KP 12 → KP 12.5', 12.0, 12.5, 'Cat 572 Pipelayers (2x), Lincoln DC-400 Welder', '12" API 5L X65 Carbon Steel Pipe joints', 'Clear, 28°C', 'Toolbox talk conducted on ditch slope stability.', ARRAY['https://images.unsplash.com/photo-1541888946425-d0fbb186156a?w=500&auto=format&fit=crop&q=80'], '{"discipline":"Piping","workType":"Pipe Laying & Welding","locationRange":"KP 12 → KP 12.5","kpStart":12.0,"kpEnd":12.5,"pipeSize":"12 inch","statusDetected":"IN_PROGRESS","quantDeltaEstimated":20,"equipmentDetected":["Cat 572 Pipelayer","Lincoln Welder"],"materialDetected":["12 inch API 5L Pipe"],"jointsWelded":2,"safetyMentioned":"Toolbox talk conducted","summary":"Progressed 12-inch pipe laying from KP 12 to KP 12.5 with 2 welded joints."}'::jsonb, 'MAT-00472', 'AI_MATCHED');

-- Seed AI Match
INSERT INTO ai_matches (id, report_id, candidate_l6_id, candidate_l6_code, candidate_l6_name, candidate_l5_id, confidence, confidence_level, evidence_breakdown, evidence_tags, extracted_data, suggested_progress_from, suggested_progress_to, alternative_candidates, status) VALUES
('MAT-00472', 'FR-00472', 'ACT-PIPE-03', 'PIPE-L6-003', 'Lay 12 inch Pipe KP 12–13', 'L5-01', 94, 'HIGH', '{"locationMatch":98,"disciplineMatch":100,"descriptionMatch":90,"dateCompatibility":88}'::jsonb, ARRAY['EXACT_KP_RANGE_MATCH', 'DISCIPLINE_MATCH', 'PIPE_SPEC_MATCH'], '{"discipline":"Piping","workType":"Pipe Laying & Welding","locationRange":"KP 12 → KP 12.5","kpStart":12.0,"kpEnd":12.5,"pipeSize":"12 inch","statusDetected":"IN_PROGRESS","quantDeltaEstimated":20,"equipmentDetected":["Cat 572 Pipelayer","Lincoln Welder"],"materialDetected":["12 inch API 5L Pipe"],"jointsWelded":2,"safetyMentioned":"Toolbox talk conducted","summary":"Progressed 12-inch pipe laying from KP 12 to KP 12.5 with 2 welded joints."}'::jsonb, 10, 30, '[{"l6Id":"ACT-PIPE-02","l6Code":"PIPE-L6-002","l6Name":"Lay 12 inch Pipe KP 11–12","confidence":34,"reason":"Location KP 12 overlaps adjacent segment border."}]'::jsonb, 'PENDING_REVIEW');

-- Seed Audit Log
INSERT INTO audit_logs (id, timestamp, time_formatted, event_type, entity_id, entity_type, user_name, user_role, details, wbs_code, meta_badge) VALUES
('AUD-1001', '2026-09-11 11:30:00+00', '11:30 AM', 'REPORT_SUBMITTED', 'FR-00472', 'REPORT', 'Ravi Kumar', 'Site Engineer', 'Field report FR-00472 submitted: "12 inch pipe laying progressed from KP 12 to KP 12.5 today..."', 'PIPE-L6-003', 'NEW REPORT'),
('AUD-1002', '2026-09-11 11:30:05+00', '11:30 AM', 'AI_MATCH_GENERATED', 'MAT-00472', 'AI_MATCH', 'SiteSync AI Engine v2.4', 'AI System', 'Generated match: PIPE-L6-003 (Lay 12 inch Pipe KP 12–13) with 94% confidence.', 'PIPE-L6-003', '94% CONFIDENCE');
