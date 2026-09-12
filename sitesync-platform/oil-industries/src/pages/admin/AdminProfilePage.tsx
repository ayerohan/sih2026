import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { Link } from 'react-router-dom';
import {
  Shield,
  User,
  Mail,
  Briefcase,
  MapPin,
  Calendar,
  CheckCircle2,
  Lock,
  Key,
  Award,
  Layers,
  FileCheck2,
  Cpu,
  Clock,
  ExternalLink,
  ChevronRight,
  Sliders,
} from 'lucide-react';

export const AdminProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { projects } = useProject();

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 font-sans">
      {/* Top Header Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-graphite-500 uppercase tracking-wider mb-1">
            <Link to="/admin/dashboard" className="hover:text-amber-brand transition-colors">Admin Portal</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-amber-brand">Executive Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-graphite-900 tracking-tight">
            Administrator Profile & Access Governance
          </h1>
          <p className="text-sm text-graphite-600 mt-1">
            Certified EPC Project Director credentials, security clearances, and operational jurisdiction.
          </p>
        </div>

        <Link
          to="/admin/settings"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-graphite-900 hover:bg-graphite-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Sliders className="w-4 h-4 text-amber-brand" />
          <span>System Settings</span>
        </Link>
      </div>

      {/* Main Executive Identity Card */}
      <div className="bg-white border border-graphite-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-amber-brand to-safety-orange" />

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-8 border-b border-graphite-100">
          {/* Avatar / Portrait */}
          <div className="relative">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-amber-brand object-cover shadow-md"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-graphite-800 to-graphite-900 border-2 border-amber-brand flex items-center justify-center text-white text-3xl font-extrabold shadow-md">
                {user?.name?.slice(0, 2).toUpperCase() || 'AD'}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Active Session">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          {/* Profile Identity Details */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl font-bold text-graphite-900">
                {user?.name || 'Deepak Saxena'}
              </h2>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-brand/10 text-amber-brand border border-amber-brand/30">
                {user?.role || 'ADMIN'}
              </span>
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active EPC Director
              </span>
            </div>

            <p className="text-sm font-semibold text-graphite-700">
              {user?.designation || 'Corporate Project Director & Governance Authority'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs text-graphite-600">
              <div className="flex items-center gap-2 bg-graphite-50 px-3 py-2 rounded-xl border border-graphite-100">
                <Briefcase className="w-4 h-4 text-graphite-500 shrink-0" />
                <span className="font-mono font-medium">{user?.employeeId || 'ADM-001'}</span>
              </div>
              <div className="flex items-center gap-2 bg-graphite-50 px-3 py-2 rounded-xl border border-graphite-100">
                <Mail className="w-4 h-4 text-graphite-500 shrink-0" />
                <span className="truncate">{user?.email || 'deepak.saxena@epc-control.corp'}</span>
              </div>
              <div className="flex items-center gap-2 bg-graphite-50 px-3 py-2 rounded-xl border border-graphite-100">
                <MapPin className="w-4 h-4 text-graphite-500 shrink-0" />
                <span>Central HQ, New Delhi</span>
              </div>
              <div className="flex items-center gap-2 bg-graphite-50 px-3 py-2 rounded-xl border border-graphite-100">
                <Calendar className="w-4 h-4 text-graphite-500 shrink-0" />
                <span>Session Active Since Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Access Clearance Matrix */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Clearance Tier */}
          <div className="bg-graphite-50 border border-graphite-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-graphite-500 uppercase tracking-wider">Clearance Tier</span>
              <Shield className="w-4 h-4 text-amber-brand" />
            </div>
            <div className="text-lg font-bold text-graphite-900">Level 5 - Unrestricted</div>
            <p className="text-xs text-graphite-600 leading-relaxed">
              Authorized to execute WBS Baseline resets, rollups, multi-modal variance overrides, and dispute sign-offs.
            </p>
            <div className="pt-2 border-t border-graphite-200/60 flex items-center gap-2 text-[11px] text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Digital HSM Key Verified</span>
            </div>
          </div>

          {/* Card 2: Jurisdiction Scope */}
          <div className="bg-graphite-50 border border-graphite-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-graphite-500 uppercase tracking-wider">Jurisdiction Scope</span>
              <Layers className="w-4 h-4 text-amber-brand" />
            </div>
            <div className="text-lg font-bold text-graphite-900">{projects.length} Active EPC Projects</div>
            <p className="text-xs text-graphite-600 leading-relaxed">
              Supervises all cross-country pipelines, offshore terminals, compressor stations, and civil crossing packages.
            </p>
            <div className="pt-2 border-t border-graphite-200/60 flex items-center gap-2 text-[11px] text-graphite-700 font-medium">
              <Award className="w-3.5 h-3.5 text-amber-brand" />
              <span>Lead Project Governance Committee</span>
            </div>
          </div>

          {/* Card 3: AI & Verification Authority */}
          <div className="bg-graphite-50 border border-graphite-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-graphite-500 uppercase tracking-wider">AI Governance</span>
              <Cpu className="w-4 h-4 text-amber-brand" />
            </div>
            <div className="text-lg font-bold text-graphite-900">Automated & Manual Review</div>
            <p className="text-xs text-graphite-600 leading-relaxed">
              Direct authority to approve or reject Gemini AI multi-modal progress matches from site photos and drone scans.
            </p>
            <div className="pt-2 border-t border-graphite-200/60 flex items-center gap-2 text-[11px] text-graphite-700 font-medium">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Confidence Threshold Tuning Enabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Oversight List */}
      <div className="bg-white border border-graphite-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-graphite-900">Managed Project Portfolio</h3>
            <p className="text-xs text-graphite-500 mt-0.5">Projects currently assigned under your direct administrative sign-off.</p>
          </div>
          <Link
            to="/admin/projects"
            className="text-xs text-amber-brand hover:text-amber-600 font-semibold flex items-center gap-1"
          >
            <span>View All Projects</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => (
            <Link
              key={proj.id}
              to={`/admin/projects/${proj.id}`}
              className="p-4 rounded-2xl border border-graphite-200 hover:border-amber-brand/50 hover:bg-amber-brand/5 transition-all flex items-start justify-between group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-graphite-500">{proj.id}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium font-mono">
                    {proj.overallProgress}% Complete
                  </span>
                </div>
                <div className="font-bold text-graphite-900 text-sm group-hover:text-amber-brand transition-colors">
                  {proj.name}
                </div>
                <div className="text-xs text-graphite-500">
                  {proj.client} · Budget: {proj.budget}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-graphite-400 group-hover:text-amber-brand group-hover:translate-x-1 transition-all mt-1" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
