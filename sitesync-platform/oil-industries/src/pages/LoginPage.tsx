import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, Lock, User, AlertCircle, ArrowRight, Sparkles, CheckCircle2, KeyRound } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { isAuthenticated, user, login, isLoading } = useAuth();

  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilledRole, setActiveFilledRole] = useState<'ADMIN' | 'WORKER' | null>(null);

  // If already authenticated, redirect to role dashboard
  if (isAuthenticated && user) {
    const dest = user.role.toUpperCase() === 'ADMIN' ? '/admin/dashboard' : '/worker/dashboard';
    return <Navigate to={dest} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await login(employeeId, password);

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Authentication failed. Please try again.');
    }
  };

  const handleQuickFill = (empId: string, pass: string, role: 'ADMIN' | 'WORKER') => {
    setEmployeeId(empId);
    setPassword(pass);
    setActiveFilledRole(role);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-graphite-950 text-white flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {/* Aceternity UI Background Ambient Glows & Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-left Ambient Glowing Orb */}
        <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-amber-500/15 rounded-full blur-[140px] animate-pulse-subtle" />
        {/* Bottom-right Ambient Glowing Orb */}
        <div className="absolute -bottom-32 -right-32 w-[32rem] h-[32rem] bg-emerald-500/10 rounded-full blur-[140px] animate-pulse-subtle" />
        {/* Center Spotlight Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-graphite-950/70 to-graphite-950" />
        {/* Subtle Tech Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2428_1px,transparent_1px),linear-gradient(to_bottom,#1f2428_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
      </div>

      {/* Top Header Branding with Generous Padding */}
      <header className="px-8 py-5 flex items-center justify-between border-b border-graphite-800/70 bg-graphite-900/40 backdrop-blur-xl relative z-10">
        <div className="flex items-center gap-3.5">
          <img
            src="/logo.png"
            alt="SiteSync Logo"
            className="w-12 h-12 object-contain rounded-2xl bg-white p-1 shadow-md transition-transform hover:scale-105"
          />
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-bold tracking-tight text-lg text-white font-sans">
                SiteSync
              </span>
            </div>
            <div className="text-xs text-graphite-400 font-medium tracking-wide mt-0.5">
              Project Control & Field Operations Platform
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2.5 text-xs text-graphite-300 bg-graphite-900/90 px-4 py-2 rounded-full border border-graphite-800 backdrop-blur-md shadow-sm">
          <Shield className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="font-medium">Enterprise Security Active</span>
        </div>
      </header>

      {/* Main Form Center Card with Generous Width & Spacing */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16 relative z-10">
        <div className="w-full max-w-xl bg-graphite-900/85 border border-graphite-750/80 rounded-3xl p-8 sm:p-12 shadow-[0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl relative transition-all duration-300 hover:border-amber-brand/40 group">
          {/* Top Aceternity Light Beam Highlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-[1.5px] bg-gradient-to-r from-transparent via-amber-brand to-transparent" />

          {/* Card Title Header with Generous Bottom Spacing */}
          <div className="text-center space-y-3 mb-10">
            <div className="flex justify-center mb-3">
              <div className="p-2.5 bg-white rounded-2xl shadow-xl ring-1 ring-white/30 transition-transform hover:scale-105">
                <img
                  src="/logo.png"
                  alt="SiteSync Logo"
                  className="w-16 h-16 object-contain"
                />
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-graphite-800/90 border border-graphite-700 text-amber-brand text-xs font-semibold backdrop-blur-md shadow-sm">
              <Lock className="w-3.5 h-3.5" />
              <span>Authentication Required</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-2 font-sans bg-clip-text text-transparent bg-gradient-to-b from-white via-graphite-100 to-graphite-300">
              Sign In to SiteSync
            </h1>
            <p className="text-sm text-graphite-400 font-normal leading-relaxed max-w-sm mx-auto">
              Access your role-authorized project dashboard, L5/L6 control schedules, and field verification.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-8 p-4 bg-red-950/70 border border-red-800/80 rounded-2xl text-red-200 text-sm flex items-start gap-3 shadow-lg animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug font-medium">{error}</div>
            </div>
          )}

          {/* Form with Spacious Fields */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Employee ID Field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-graphite-300 uppercase tracking-wider">
                Employee ID / User ID
              </label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-graphite-400 group-focus-within/input:text-amber-brand transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => {
                    setEmployeeId(e.target.value);
                    setActiveFilledRole(null);
                  }}
                  placeholder="e.g. ADM-001 or WRK-001"
                  className="w-full bg-graphite-850/90 border border-graphite-700/80 rounded-xl pl-11 pr-4 py-3.5 text-base text-white placeholder-graphite-500 focus:outline-none focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/30 transition-all duration-200 shadow-inner font-mono font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-graphite-300 uppercase tracking-wider">
                Password
              </label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-graphite-400 group-focus-within/input:text-amber-brand transition-colors">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setActiveFilledRole(null);
                  }}
                  placeholder="Enter account password"
                  className="w-full bg-graphite-850/90 border border-graphite-700/80 rounded-xl pl-11 pr-12 py-3.5 text-base text-white placeholder-graphite-500 focus:outline-none focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/30 transition-all duration-200 shadow-inner font-mono font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-graphite-400 hover:text-white transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full bg-gradient-to-r from-amber-500 via-amber-brand to-safety-orange hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] text-graphite-950 font-bold text-sm sm:text-base py-4 px-6 rounded-xl transition-all duration-200 shadow-[0_6px_24px_rgba(217,154,36,0.35)] hover:shadow-[0_8px_30px_rgba(217,154,36,0.5)] flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer pt-3"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-graphite-950 border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            {/* Sign Up Link */}
            <div className="text-center pt-2">
              <span className="text-xs text-graphite-400 font-medium">Don't have an enterprise account? </span>
              <Link to="/signup" className="text-xs text-amber-brand hover:text-amber-400 font-semibold underline underline-offset-4 transition-colors">
                Sign Up
              </Link>
            </div>
          </form>

          {/* Quick Demo Credentials Assistant with Role Tabs */}
          <div className="mt-10 pt-8 border-t border-graphite-800/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-graphite-300 font-semibold tracking-wide">
                <Sparkles className="w-4 h-4 text-amber-brand animate-spin" style={{ animationDuration: '6s' }} />
                <span>One-Click Role Selection:</span>
              </div>
              <span className="text-xs text-graphite-500 font-medium">Click to populate role login</span>
            </div>

            {/* Role Filter Tabs */}
            <div className="flex items-center gap-2 pb-1">
              <span className="text-[11px] font-bold text-graphite-400 uppercase tracking-wider">Category:</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-brand/10 text-amber-brand border border-amber-brand/30">
                All Engineering & Admin Roles
              </span>
            </div>

            {/* Categorized Role Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {/* Admin: Project Director */}
              <button
                type="button"
                onClick={() => handleQuickFill('ADM-001', 'admin123', 'ADMIN')}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 relative group/btn ${
                  employeeId === 'ADM-001'
                    ? 'bg-amber-brand/15 border-amber-brand ring-1 ring-amber-brand/40 shadow-sm'
                    : 'bg-graphite-850/80 hover:bg-graphite-800 border-graphite-750/90 hover:border-amber-brand/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-amber-brand uppercase tracking-wider text-[11px]">Admin · Project Director</span>
                  <Shield className="w-3.5 h-3.5 text-amber-brand" />
                </div>
                <div className="text-xs font-bold text-white font-mono">Deepak Saxena (ADM-001)</div>
                <div className="text-[10px] text-graphite-400 mt-1 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-brand"></span>
                  Corporate Project Director
                </div>
              </button>

              {/* Admin: Controls & Planning */}
              <button
                type="button"
                onClick={() => handleQuickFill('ADM-002', 'admin123', 'ADMIN')}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 relative group/btn ${
                  employeeId === 'ADM-002'
                    ? 'bg-amber-brand/15 border-amber-brand ring-1 ring-amber-brand/40 shadow-sm'
                    : 'bg-graphite-850/80 hover:bg-graphite-800 border-graphite-750/90 hover:border-amber-brand/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-amber-brand uppercase tracking-wider text-[11px]">Admin · Controls & Planning</span>
                  <Shield className="w-3.5 h-3.5 text-amber-brand" />
                </div>
                <div className="text-xs font-bold text-white font-mono">Rajesh Iyer (ADM-002)</div>
                <div className="text-[10px] text-graphite-400 mt-1 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-brand"></span>
                  Head of Planning & Control
                </div>
              </button>

              {/* Supervisor: Site Pipeline */}
              <button
                type="button"
                onClick={() => handleQuickFill('WRK-001', 'worker123', 'WORKER')}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 relative group/btn ${
                  employeeId === 'WRK-001' || employeeId === 'ENG-001'
                    ? 'bg-emerald-500/15 border-emerald-500 ring-1 ring-emerald-500/40 shadow-sm'
                    : 'bg-graphite-850/80 hover:bg-graphite-800 border-graphite-750/90 hover:border-emerald-500/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">Site Pipeline Supervisor</span>
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-xs font-bold text-white font-mono">Ravi Kumar (WRK-001 / ENG-001)</div>
                <div className="text-[10px] text-graphite-400 mt-1 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Piping & Laying Lead
                </div>
              </button>

              {/* Supervisor: Mechanical & Valve */}
              <button
                type="button"
                onClick={() => handleQuickFill('WRK-002', 'worker123', 'WORKER')}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 relative group/btn ${
                  employeeId === 'WRK-002' || employeeId === 'ENG-002'
                    ? 'bg-emerald-500/15 border-emerald-500 ring-1 ring-emerald-500/40 shadow-sm'
                    : 'bg-graphite-850/80 hover:bg-graphite-800 border-graphite-750/90 hover:border-emerald-500/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">Mechanical & Valve Supervisor</span>
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-xs font-bold text-white font-mono">Manoj Verma (WRK-002 / ENG-002)</div>
                <div className="text-[10px] text-graphite-400 mt-1 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Station Equipment & Valves
                </div>
              </button>

              {/* Supervisor: QA/QC & Welding */}
              <button
                type="button"
                onClick={() => handleQuickFill('WRK-003', 'worker123', 'WORKER')}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 relative group/btn ${
                  employeeId === 'WRK-003' || employeeId === 'ENG-003'
                    ? 'bg-emerald-500/15 border-emerald-500 ring-1 ring-emerald-500/40 shadow-sm'
                    : 'bg-graphite-850/80 hover:bg-graphite-800 border-graphite-750/90 hover:border-emerald-500/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">QA/QC & Welding Supervisor</span>
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-xs font-bold text-white font-mono">Sunita Sharma (WRK-003 / ENG-003)</div>
                <div className="text-[10px] text-graphite-400 mt-1 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  NDT & Weld Quality Control
                </div>
              </button>

              {/* Supervisor: E&I / SCADA */}
              <button
                type="button"
                onClick={() => handleQuickFill('WRK-004', 'worker123', 'WORKER')}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 relative group/btn ${
                  employeeId === 'WRK-004' || employeeId === 'ENG-004'
                    ? 'bg-emerald-500/15 border-emerald-500 ring-1 ring-emerald-500/40 shadow-sm'
                    : 'bg-graphite-850/80 hover:bg-graphite-800 border-graphite-750/90 hover:border-emerald-500/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">E&I & SCADA Supervisor</span>
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-xs font-bold text-white font-mono">Vikram Das (WRK-004 / ENG-004)</div>
                <div className="text-[10px] text-graphite-400 mt-1 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Telemetry & Instrumentation
                </div>
              </button>

              {/* Supervisor: Civil Pipeline Crossings */}
              <button
                type="button"
                onClick={() => handleQuickFill('WRK-005', 'worker123', 'WORKER')}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 relative group/btn ${
                  employeeId === 'WRK-005' || employeeId === 'ENG-005'
                    ? 'bg-emerald-500/15 border-emerald-500 ring-1 ring-emerald-500/40 shadow-sm'
                    : 'bg-graphite-850/80 hover:bg-graphite-800 border-graphite-750/90 hover:border-emerald-500/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">Civil & Crossings Supervisor</span>
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-xs font-bold text-white font-mono">Amit Patel (WRK-005 / ENG-005)</div>
                <div className="text-[10px] text-graphite-400 mt-1 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  HDD & Civil Earthworks
                </div>
              </button>

              {/* Supervisor: HSE Safety Officer */}
              <button
                type="button"
                onClick={() => handleQuickFill('WRK-006', 'worker123', 'WORKER')}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 relative group/btn ${
                  employeeId === 'WRK-006' || employeeId === 'ENG-006'
                    ? 'bg-emerald-500/15 border-emerald-500 ring-1 ring-emerald-500/40 shadow-sm'
                    : 'bg-graphite-850/80 hover:bg-graphite-800 border-graphite-750/90 hover:border-emerald-500/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">Field HSE Safety Supervisor</span>
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-xs font-bold text-white font-mono">Neha Reddy (WRK-006 / ENG-006)</div>
                <div className="text-[10px] text-graphite-400 mt-1 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Site Safety & Compliance
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
