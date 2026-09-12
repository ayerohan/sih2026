import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleReturnToDashboard = () => {
    if (!isAuthenticated || !user) {
      navigate('/login');
    } else if (user.role.toUpperCase() === 'ADMIN') {
      navigate('/admin/dashboard');
    } else {
      navigate('/worker/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-graphite-950 text-white flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
      {/* Background Subtle Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

      <div className="max-w-lg w-full bg-graphite-900 border border-red-900/60 rounded-container p-8 text-center space-y-6 shadow-industrial-dark backdrop-blur-xl relative z-10">
        {/* Warning Badge Icon */}
        <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-800 flex items-center justify-center mx-auto text-red-500 shadow-lg animate-pulse-subtle">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-900/80 text-red-400 font-mono text-[11px] font-bold tracking-widest uppercase">
            <Lock className="w-3 h-3" />
            HTTP 403 · AUTHORIZATION DENIED
          </div>
          <h1 className="text-2xl font-bold font-mono text-white tracking-tight pt-2">
            ACCESS RESTRICTED
          </h1>
          <p className="text-sm font-sans text-graphite-300">
            You don't have permission to access this area.
          </p>
          <p className="text-xs font-sans text-graphite-400">
            Your account does not have the required role for this section of SiteSync.
          </p>
        </div>

        {/* User Identity Context info */}
        {user && (
          <div className="bg-graphite-850 p-3 rounded-card border border-graphite-750 font-mono text-xs text-left flex items-center justify-between">
            <div>
              <div className="text-[10px] text-graphite-400">CURRENT USER:</div>
              <div className="font-semibold text-white">{user.name} ({user.employeeId})</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-graphite-400">ACTIVE ROLE:</div>
              <div className={`font-bold text-xs ${user.role.toUpperCase() === 'ADMIN' ? 'text-amber-brand' : 'text-emerald-400'}`}>
                {user.role.toUpperCase()}
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleReturnToDashboard}
            className="w-full bg-amber-brand hover:bg-amber-hover text-graphite-950 font-mono font-extrabold text-sm py-3 px-4 rounded-control transition-all shadow-glow-amber flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO DASHBOARD</span>
          </button>
        </div>
      </div>
    </div>
  );
};
