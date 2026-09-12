import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { TopNavbar } from './TopNavbar';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { RollUpModal } from '../common/RollUpModal';
import {
  LayoutDashboard,
  CalendarDays,
  TrendingUp,
  FileText,
  AlertTriangle,
  Layers,
  Cpu,
  History,
  Users,
  UserCheck,
  Settings,
  FolderGit2,
  Lock,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { aiMatches, selectedProjectId } = useProject();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const pendingReviewCount = aiMatches.filter(m => m.status === 'PENDING_REVIEW').length;

  interface NavItem {
    name: string;
    path: string;
    icon: any;
    badge?: number;
    badgeAlert?: boolean;
  }

  const navGroups: { group: string; items: NavItem[] }[] = [
    {
      group: t('nav.group.controlCenter', 'CONTROL CENTER'),
      items: [
        { name: t('nav.overview', 'Project Overview'), path: '/admin/dashboard', icon: LayoutDashboard },
        { name: t('nav.schedule', 'Schedule (WBS)'), path: `/admin/projects/${selectedProjectId}/schedule`, icon: CalendarDays },
        { name: t('nav.progress', 'Progress & S-Curve'), path: `/admin/projects/${selectedProjectId}/progress`, icon: TrendingUp },
      ],
    },
    {
      group: t('nav.group.operations', 'OPERATIONS'),
      items: [
        { name: t('nav.reports', 'Field Reports'), path: `/admin/projects/${selectedProjectId}/reports`, icon: FileText },
        {
          name: t('nav.review', 'Review Queue'),
          path: '/admin/review',
          icon: AlertTriangle,
          badge: pendingReviewCount > 0 ? pendingReviewCount : undefined,
          badgeAlert: true,
        },
        { name: t('nav.hierarchy', 'L5 / L6 Hierarchy'), path: `/admin/projects/${selectedProjectId}`, icon: Layers },
      ],
    },
    {
      group: t('nav.group.intelligence', 'INTELLIGENCE & ADMIN'),
      items: [
        { name: t('nav.analytics', 'AI Monitoring & Stats'), path: '/admin/analytics', icon: Cpu },
        { name: t('nav.audit', 'Audit Trail'), path: '/admin/audit', icon: History },
        { name: t('nav.supervisors', 'Field Supervisors'), path: '/admin/workers', icon: Users },
        { name: t('nav.projects', 'All Projects'), path: '/admin/projects', icon: FolderGit2 },
        { name: t('nav.intelligence', 'Intelligence Chat'), path: '/admin/intelligence', icon: BrainCircuit },
        { name: t('nav.profile', 'Admin Profile'), path: '/admin/profile', icon: UserCheck },
        { name: t('nav.settings', 'Settings'), path: '/admin/settings', icon: Settings },
      ],
    },
  ];

  return (
    <div className="h-screen bg-offwhite-100 dark:bg-[#0f1215] flex flex-col text-graphite-900 dark:text-graphite-100 overflow-hidden">
      <TopNavbar
        onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
        isSidebarCollapsed={isSidebarCollapsed}
      />
      <RollUpModal />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Admin Graphite Sidebar - Collapsible with Smooth Transition */}
        <aside
          className={`${
            isSidebarCollapsed ? 'w-20' : 'w-68'
          } bg-graphite-900 border-r border-graphite-800 text-graphite-300 flex flex-col justify-between shrink-0 hidden md:flex select-none font-sans h-full relative sticky top-0 z-30 transition-all duration-300`}
        >
          {/* Floating Collapse / Expand toggle button below header bar and to the right of the menu bar */}
          <button
            onClick={() => setIsSidebarCollapsed(prev => !prev)}
            className="absolute -right-3.5 top-5 z-40 w-7 h-7 rounded-full bg-graphite-900 border-2 border-graphite-700 hover:border-amber-brand text-graphite-300 hover:text-amber-brand shadow-xl flex items-center justify-center cursor-pointer transition-all duration-200 group"
            title={isSidebarCollapsed ? (language === 'hi' ? 'साइडबार विस्तार करें' : 'Expand Sidebar') : (language === 'hi' ? 'साइडबार समेटें' : 'Collapse Sidebar')}
            aria-label="Toggle Sidebar"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            )}
          </button>

          <div className="p-4 space-y-6 overflow-y-auto flex-1">
            {/* Navigation Groups */}
            <div className="space-y-6">
              {navGroups.map((group, idx) => (
                <div key={idx} className="space-y-1.5">
                  {!isSidebarCollapsed && (
                    <div className="px-3 text-[11px] tracking-wider font-semibold text-graphite-400 uppercase truncate">
                      {group.group}
                    </div>
                  )}
                  <div className="space-y-1">
                    {group.items.map((item, iIdx) => {
                      const Icon = item.icon;
                      const isActive =
                        location.pathname === item.path ||
                        (item.path.includes('/schedule') && location.pathname.includes('/schedule'));

                      return (
                        <NavLink
                          key={iIdx}
                          to={item.path}
                          title={isSidebarCollapsed ? item.name : undefined}
                          className={`flex items-center ${
                            isSidebarCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-3.5 py-2.5'
                          } rounded-xl text-sm font-medium transition-all group ${
                            isActive
                              ? 'bg-amber-brand/15 text-amber-brand font-semibold border border-amber-brand/30 shadow-sm'
                              : 'hover:bg-graphite-850 hover:text-white text-graphite-300 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              className={`w-4 h-4 shrink-0 transition-colors ${
                                isActive ? 'text-amber-brand' : 'text-graphite-400 group-hover:text-white'
                              }`}
                            />
                            {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
                          </div>

                          {item.badge !== undefined && (
                            <span
                              className={`${
                                isSidebarCollapsed
                                  ? 'absolute top-1 right-1 w-2.5 h-2.5 p-0'
                                  : 'px-2 py-0.5 text-xs font-mono'
                              } rounded-full font-bold bg-amber-brand text-graphite-950 animate-pulse`}
                            >
                              {!isSidebarCollapsed && item.badge}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Profile Footer - Clickable link to /admin/profile, no logout at bottom */}
          <NavLink
            to="/admin/profile"
            title={isSidebarCollapsed ? `${user?.name || 'Deepak Saxena'} (Admin Profile)` : undefined}
            className={({ isActive }) =>
              `p-3.5 border-t border-graphite-800 bg-graphite-950/70 m-2.5 rounded-2xl space-y-2 shrink-0 transition-all hover:border-amber-brand/40 block ${
                isActive ? 'border-amber-brand/50 ring-1 ring-amber-brand/30' : ''
              }`
            }
          >
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full border border-amber-brand object-cover shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-graphite-700 border border-graphite-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {user?.name?.slice(0, 2).toUpperCase() || 'AD'}
                </div>
              )}
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{user?.name || 'Deepak Saxena'}</div>
                  <div className="text-xs text-amber-brand truncate font-medium">
                    {user?.designation || 'PROJECT DIRECTOR'}
                  </div>
                </div>
              )}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex items-center justify-between text-xs pt-2 border-t border-graphite-800">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Authorized ({user?.employeeId || 'ADM-001'})</span>
                </span>
                <span className="text-[10px] text-graphite-400 font-medium hover:text-amber-brand">{t('btn.details', 'Details')}</span>
              </div>
            )}
          </NavLink>
        </aside>

        {/* Main Content Area with Independent Smooth Scroll */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 bg-offwhite-100 dark:bg-[#0f1215] font-sans h-full">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar for Admin */}
      <div className="md:hidden bg-graphite-900 border-t border-graphite-800 text-white flex items-center justify-around py-2 sticky bottom-0 z-40">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-mono p-1 ${
              isActive ? 'text-amber-brand font-bold' : 'text-graphite-400'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </NavLink>
        <NavLink
          to={`/admin/projects/${selectedProjectId}/schedule`}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-mono p-1 ${
              isActive ? 'text-amber-brand font-bold' : 'text-graphite-400'
            }`
          }
        >
          <CalendarDays className="w-4 h-4" />
          <span>Schedule</span>
        </NavLink>
        <NavLink
          to="/admin/review"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-mono p-1 relative ${
              isActive ? 'text-amber-brand font-bold' : 'text-graphite-400'
            }`
          }
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Review</span>
          {pendingReviewCount > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 bg-amber-brand rounded-full animate-pulse" />
          )}
        </NavLink>
        <NavLink
          to="/admin/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-mono p-1 ${
              isActive ? 'text-amber-brand font-bold' : 'text-graphite-400'
            }`
          }
        >
          <UserCheck className="w-4 h-4" />
          <span>Profile</span>
        </NavLink>
      </div>
    </div>
  );
};
