import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Bell,
  LogOut,
  RotateCcw,
  Languages,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopNavbarProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onToggleSidebar,
  isSidebarCollapsed = false,
}) => {
  const { role, projects, selectedProjectId, setSelectedProjectId, aiMatches, resetToDemoScenario } = useProject();
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState('11 SEP 2026 · 15:32:00');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-GB', { hour12: false });
      setCurrentTime(`11 SEP 2026 · ${timeStr}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pendingCount = aiMatches.filter(m => m.status === 'PENDING_REVIEW').length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-graphite-900 border-b border-graphite-800 text-white flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 select-none font-sans">
      {/* Left: Brand Logo & Project Selector */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Brand Logo */}
        <div className="flex items-center">
          <img
            src="/logo.png"
            alt="SiteSync Logo"
            className="h-9 w-9 object-contain rounded-xl bg-white p-0.5 shadow-sm transition-transform hover:scale-105"
          />
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-graphite-400 font-medium hidden sm:inline">
            {language === 'hi' ? 'परियोजना:' : 'Project:'}
          </span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-graphite-850 text-xs font-semibold text-amber-brand border border-graphite-700 rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-brand hover:bg-graphite-800 transition-colors cursor-pointer"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id} className="bg-graphite-900 text-white font-sans">
                {p.code} — {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center Ticker / Clock */}
      <div className="hidden lg:flex items-center gap-3 text-xs">
        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-graphite-850 rounded-full border border-graphite-750">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-graphite-300 font-medium">{currentTime}</span>
        </div>
      </div>

      {/* Right Controls: Language Switcher, AI Review Queue Pill, Logout */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Language Toggle Switch */}
        <button
          onClick={toggleLanguage}
          className="relative w-16 h-7 rounded-full transition-colors duration-300 focus:outline-none cursor-pointer"
          style={{ backgroundColor: language === 'hi' ? '#d99a24' : '#4a5058' }}
          title={language === 'en' ? 'Switch to Hindi (हिन्दी)' : 'वेबसाइट की भाषा अंग्रेज़ी में बदलें'}
          aria-label="Toggle language"
        >
          <div
            className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300 ${
              language === 'hi' ? 'left-[36px]' : 'left-0.5'
            }`}
          >
            <span className="text-[10px] font-extrabold text-graphite-700">
              {language === 'hi' ? 'हि' : 'EN'}
            </span>
          </div>
          <span className={`absolute top-1 text-[10px] font-bold ${language === 'hi' ? 'left-1.5 text-graphite-900' : 'right-1.5 text-graphite-300'}`}>
            {language === 'hi' ? 'हिन्दी' : 'ENG'}
          </span>
        </button>

        {/* AI Review Queue Pill (if Admin) */}
        {(role === 'admin' || user?.role === 'ADMIN') && (
          <button
            onClick={() => navigate('/admin/review')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
              pendingCount > 0
                ? 'bg-amber-brand/15 text-amber-brand border-amber-brand/40 hover:bg-amber-brand/25 animate-pulse-subtle'
                : 'bg-graphite-850 text-graphite-400 border-graphite-750 hover:bg-graphite-800'
            }`}
            title="AI Verification Review Queue"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="font-bold">{pendingCount}</span>
            <span className="hidden md:inline text-xs">{t('nav.review', 'Review Queue')}</span>
          </button>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 hover:text-red-100 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
          title="Sign out of SiteSync"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Logout</span>
        </button>

        {/* Reset State button */}
        <button
          onClick={() => {
            if (window.confirm('Reset all demo data to baseline scenario?')) {
              resetToDemoScenario();
            }
          }}
          className="p-2 bg-graphite-850 hover:bg-graphite-800 border border-graphite-750 text-graphite-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          title="Reset to Initial Baseline State"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
