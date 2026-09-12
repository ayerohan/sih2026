import React, { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, Lock, User, Mail, Briefcase, AlertCircle, ArrowRight, CheckCircle2, KeyRound, Building2 } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { isAuthenticated, user, signup } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'WORKER'>('WORKER');
  const [discipline, setDiscipline] = useState('Piping');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to role dashboard
  if (isAuthenticated && user) {
    const dest = user.role.toUpperCase() === 'ADMIN' ? '/admin/dashboard' : '/worker/dashboard';
    return <Navigate to={dest} replace />;
  }

  const handleRoleChange = (newRole: 'ADMIN' | 'WORKER') => {
    setRole(newRole);
    if (newRole === 'ADMIN') {
      setDiscipline('Project Controls & Planning');
      if (!employeeId || employeeId.startsWith('WRK-')) {
        setEmployeeId('ADM-0' + Math.floor(10 + Math.random() * 90));
      }
    } else {
      setDiscipline('Piping');
      if (!employeeId || employeeId.startsWith('ADM-')) {
        setEmployeeId('WRK-0' + Math.floor(10 + Math.random() * 90));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    const result = await signup({
      name: fullName.trim(),
      employeeId: employeeId.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      password,
      role,
      discipline,
    });

    setIsSubmitting(false);

    if (result.success) {
      navigate(role === 'ADMIN' ? '/admin/dashboard' : '/worker/dashboard');
    } else {
      setError(result.error || 'Failed to create account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-graphite-950 text-white flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {/* Background Ambient Glows & Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-amber-500/15 rounded-full blur-[140px] animate-pulse-subtle" />
        <div className="absolute -bottom-32 -right-32 w-[32rem] h-[32rem] bg-emerald-500/10 rounded-full blur-[140px] animate-pulse-subtle" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-graphite-950/70 to-graphite-950" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2428_1px,transparent_1px),linear-gradient(to_bottom,#1f2428_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
      </div>

      {/* Top Header Branding */}
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

        <div className="flex items-center gap-3">
          <span className="text-xs text-graphite-400 hidden sm:inline">Already registered?</span>
          <Link
            to="/login"
            className="text-xs font-semibold text-amber-brand bg-amber-brand/10 hover:bg-amber-brand/20 border border-amber-brand/30 px-3.5 py-1.5 rounded-full transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Registration Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-14 relative z-10">
        <div className="w-full max-w-2xl bg-graphite-900/85 border border-graphite-750/80 rounded-3xl p-8 sm:p-12 shadow-[0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl relative transition-all duration-300 hover:border-amber-brand/40 group">
          {/* Top Aceternity Light Beam Highlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-[1.5px] bg-gradient-to-r from-transparent via-amber-brand to-transparent" />

          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-graphite-800/90 border border-graphite-700 text-amber-brand text-xs font-semibold backdrop-blur-md shadow-sm">
              <Building2 className="w-3.5 h-3.5" />
              <span>Enterprise Account Registration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-2 font-sans bg-clip-text text-transparent bg-gradient-to-b from-white via-graphite-100 to-graphite-300">
              Create Your Account
            </h1>
            <p className="text-sm text-graphite-400 font-normal leading-relaxed max-w-md mx-auto">
              Join SiteSync to collaborate across EPC pipeline control, WBS activity logging, and progress analytics.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-950/70 border border-red-800/80 rounded-2xl text-red-200 text-sm flex items-start gap-3 shadow-lg animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug font-medium">{error}</div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection Tabs */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-graphite-300 uppercase tracking-wider">
                Select Operational Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleChange('WORKER')}
                  className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    role === 'WORKER'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-graphite-850/70 border-graphite-750 text-graphite-400 hover:text-white hover:bg-graphite-800'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Field Supervisor / Inspector</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('ADMIN')}
                  className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    role === 'ADMIN'
                      ? 'bg-amber-brand/20 border-amber-brand text-amber-brand shadow-[0_0_15px_rgba(217,154,36,0.2)]'
                      : 'bg-graphite-850/70 border-graphite-750 text-graphite-400 hover:text-white hover:bg-graphite-800'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Project Administrator</span>
                </button>
              </div>
            </div>

            {/* Two-Column Grid: Name & Employee ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-graphite-300 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-graphite-400 group-focus-within/input:text-amber-brand">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full bg-graphite-850/90 border border-graphite-700/80 rounded-xl pl-10 pr-3.5 py-3 text-sm text-white placeholder-graphite-500 focus:outline-none focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/30 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-graphite-300 uppercase tracking-wider">
                  Employee / Staff ID
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-graphite-400 group-focus-within/input:text-amber-brand">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                    placeholder={role === 'ADMIN' ? 'ADM-010' : 'WRK-010'}
                    className="w-full bg-graphite-850/90 border border-graphite-700/80 rounded-xl pl-10 pr-3.5 py-3 text-sm text-white placeholder-graphite-500 focus:outline-none focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/30 transition-all font-mono font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Two-Column Grid: Email & Discipline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-graphite-300 uppercase tracking-wider">
                  Corporate Email
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-graphite-400 group-focus-within/input:text-amber-brand">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@pipelinecorp.in"
                    className="w-full bg-graphite-850/90 border border-graphite-700/80 rounded-xl pl-10 pr-3.5 py-3 text-sm text-white placeholder-graphite-500 focus:outline-none focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/30 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-graphite-300 uppercase tracking-wider">
                  Discipline / Department
                </label>
                {role === 'ADMIN' ? (
                  <select
                    value={discipline}
                    onChange={(e) => setDiscipline(e.target.value)}
                    className="w-full bg-graphite-850/90 border border-graphite-700/80 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/30 transition-all font-medium cursor-pointer"
                  >
                    <option value="Project Controls & Planning">Project Controls & Planning</option>
                    <option value="Project Management Office">Project Management Office</option>
                    <option value="EPC Contract Governance">EPC Contract Governance</option>
                    <option value="Quality & Safety Directorate">Quality & Safety Directorate</option>
                  </select>
                ) : (
                  <select
                    value={discipline}
                    onChange={(e) => setDiscipline(e.target.value)}
                    className="w-full bg-graphite-850/90 border border-graphite-700/80 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/30 transition-all font-medium cursor-pointer"
                  >
                    <option value="Piping">Piping & Mainline Laying</option>
                    <option value="Mechanical">Mechanical & Equipment</option>
                    <option value="QA/QC">QA/QC & NDT Inspection</option>
                    <option value="Electrical & Instrumentation">E&I & SCADA Telemetry</option>
                    <option value="Civil">Civil Works & Crossings</option>
                    <option value="HSE">HSE Safety Compliance</option>
                  </select>
                )}
              </div>
            </div>

            {/* Two-Column Grid: Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-graphite-300 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-graphite-400 group-focus-within/input:text-amber-brand">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-graphite-850/90 border border-graphite-700/80 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-graphite-500 focus:outline-none focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/30 transition-all font-mono font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-graphite-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-graphite-300 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-graphite-400 group-focus-within/input:text-amber-brand">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full bg-graphite-850/90 border border-graphite-700/80 rounded-xl pl-10 pr-3.5 py-3 text-sm text-white placeholder-graphite-500 focus:outline-none focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/30 transition-all font-mono font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-gradient-to-r from-amber-500 via-amber-brand to-safety-orange hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] text-graphite-950 font-bold text-sm sm:text-base py-4 px-6 rounded-xl transition-all duration-200 shadow-[0_6px_24px_rgba(217,154,36,0.35)] hover:shadow-[0_8px_30px_rgba(217,154,36,0.5)] flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-graphite-950 border-t-transparent rounded-full animate-spin" />
                  <span>Registering Enterprise Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Sign in redirect */}
            <div className="text-center pt-2">
              <span className="text-xs text-graphite-400 font-medium">Already have an enterprise account? </span>
              <Link to="/login" className="text-xs text-amber-brand hover:text-amber-400 font-semibold underline underline-offset-4 transition-colors">
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
