import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { TopNavbar } from './TopNavbar';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { RollUpModal } from '../common/RollUpModal';
import {
  ClipboardList,
  CheckSquare,
  FileEdit,
  History,
  User,
  MapPin,
  Wifi,
  Lock,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
} from 'lucide-react';

export const WorkerLayout: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const supervisorNav = [
    {
      group: t('nav.group.today', 'TODAY'),
      items: [
        { name: t('supervisor.dashboard', 'My Work Dashboard'), path: '/worker/dashboard', icon: ClipboardList },
        { name: t('supervisor.tasks', 'Assigned L6 Tasks'), path: '/worker/tasks', icon: CheckSquare },
        { name: t('supervisor.submit', 'Submit Field Report'), path: '/worker/report', icon: FileEdit, highlight: true },
      ],
    },
    {
      group: t('nav.group.history', 'HISTORY & SYNC'),
      items: [
        { name: t('supervisor.myReports', 'My Field Reports'), path: '/worker/reports', icon: History },
        { name: t('supervisor.profile', 'Field Profile & Badges'), path: '/worker/profile', icon: User },
        { name: t('nav.intelligence', 'Intelligence Chat'), path: '/worker/intelligence', icon: BrainCircuit },
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
        {/* Supervisor Streamlined Sidebar - Collapsible with Smooth Transition */}
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
            {/* Header / Context */}
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-2 pt-1 pb-3 border-b border-graphite-800`}>
              {!isSidebarCollapsed && (
                <div>
                  <div className="text-xs font-bold tracking-wider text-amber-brand uppercase">
                    {t('header.siteOps', 'Site Supervisor Portal')}
                  </div>
                  <div className="text-[11px] text-graphite-400 font-normal mt-0.5">
                    Field Execution
                  </div>
                </div>
              )}
              <div
                className="flex items-center gap-1 text-[10px] text-emerald-400 bg-graphite-800/90 border border-graphite-700/80 px-2 py-0.5 rounded-md font-mono"
                title="Status"
              >
                <Lock className="w-3 h-3 text-emerald-400" />
                {!isSidebarCollapsed && <span>ACTIVE</span>}
              </div>
            </div>

            {/* Navigation Groups */}
            <div className="space-y-6">
              {supervisorNav.map((group, idx) => (
                <div key={idx} className="space-y-1.5">
                  {!isSidebarCollapsed && (
                    <div className="px-3 text-[11px] tracking-wider font-semibold text-graphite-400 uppercase truncate">
                      {group.group}
                    </div>
                  )}
                  <div className="space-y-1">
                    {group.items.map((item, iIdx) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;

                      return (
                        <NavLink
                          key={iIdx}
                          to={item.path}
                          title={isSidebarCollapsed ? item.name : undefined}
                          className={`flex items-center ${
                            isSidebarCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-3.5 py-2.5'
                          } rounded-xl text-sm font-medium transition-all group ${
                            isActive
                              ? 'bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30 shadow-sm'
                              : item.highlight
                              ? 'bg-amber-brand/10 hover:bg-amber-brand/20 text-amber-brand border border-amber-brand/30'
                              : 'hover:bg-graphite-850 hover:text-white text-graphite-300 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              className={`w-4 h-4 shrink-0 transition-colors ${
                                isActive
                                  ? 'text-emerald-400'
                                  : item.highlight
                                  ? 'text-amber-brand'
                                  : 'text-graphite-400 group-hover:text-white'
                              }`}
                            />
                            {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
                          </div>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supervisor Identity Badge (no logout here) */}
          <div
            title={isSidebarCollapsed ? `${user?.name || 'Ravi Kumar'} (${user?.employeeId || 'WRK-001'})` : undefined}
            className="p-3.5 border-t border-graphite-800 bg-graphite-950/70 m-2.5 rounded-2xl space-y-2 shrink-0"
          >
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full border border-emerald-400 object-cover shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-graphite-700 border border-emerald-400 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
                  {user?.name?.slice(0, 2).toUpperCase() || 'RK'}
                </div>
              )}
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{user?.name || 'Ravi Kumar'}</div>
                  <div className="text-xs text-emerald-400 truncate font-medium">
                    {user?.designation || 'SITE SUPERVISOR (SE-8842)'}
                  </div>
                </div>
              )}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex items-center justify-between text-xs text-emerald-400 pt-2 border-t border-graphite-800 font-medium">
                <span className="flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Field Sync Connected</span>
                </span>
                <span className="text-[11px] text-graphite-400 font-mono">ID: {user?.employeeId || 'WRK-001'}</span>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 bg-offwhite-100 dark:bg-[#0f1215] font-sans h-full">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar for Supervisor */}
      <div className="md:hidden bg-graphite-900 border-t border-graphite-800 text-white flex items-center justify-around py-2 sticky bottom-0 z-40">
        <NavLink
          to="/worker/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-mono p-1 ${
              isActive ? 'text-amber-brand font-bold' : 'text-graphite-400'
            }`
          }
        >
          <ClipboardList className="w-4 h-4" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/worker/tasks"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-mono p-1 ${
              isActive ? 'text-amber-brand font-bold' : 'text-graphite-400'
            }`
          }
        >
          <CheckSquare className="w-4 h-4" />
          <span>Tasks</span>
        </NavLink>
        <NavLink
          to="/worker/report"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-mono p-1 ${
              isActive ? 'text-amber-brand font-bold' : 'text-graphite-400'
            }`
          }
        >
          <FileEdit className="w-4 h-4 text-amber-brand" />
          <span className="text-amber-brand font-bold">Report</span>
        </NavLink>
        <NavLink
          to="/worker/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-mono p-1 ${
              isActive ? 'text-amber-brand font-bold' : 'text-graphite-400'
            }`
          }
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </NavLink>
      </div>
    </div>
  );
};
