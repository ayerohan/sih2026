import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useLanguage } from '../../context/LanguageContext';
import { SCurveChart } from '../../components/admin/SCurveChart';
import { L5ProcessControlCard } from '../../components/admin/L5ProcessControlCard';
import { ProgressBar } from '../../components/common/ProgressBar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DownloadProgressModal } from '../../components/admin/DownloadProgressModal';
import {
  TrendingUp,
  Layers,
  Calendar,
  Briefcase,
  Building2,
  MapPin,
  Download,
  Search,
  CheckCircle,
  BarChart2,
  Filter,
  SlidersHorizontal,
} from 'lucide-react';

export const ProgressPage: React.FC = () => {
  const { projects, l5Processes, l6Activities, selectedProjectId } = useProject();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'COMBINED' | 'SCURVE' | 'HIERARCHY'>('COMBINED');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('ALL');
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  const projectL5s = l5Processes.filter(
    l => currentProject.l5ProcessIds?.includes(l.id) || l.projectId === currentProject.id
  );

  // Extract unique disciplines for filtering
  const disciplines = ['ALL', ...Array.from(new Set(projectL5s.map(l => l.discipline)))];

  const filteredL5s = projectL5s.filter(l5 => {
    const matchesSearch =
      l5.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l5.wbsNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l5.discipline.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiscipline = selectedDiscipline === 'ALL' || l5.discipline === selectedDiscipline;
    return matchesSearch && matchesDiscipline;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-12">
      {/* Header with Title and Metadata */}
      <div className="pb-5 border-b border-graphite-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <span className="text-xs font-bold text-amber-brand bg-graphite-900 px-3 py-1 rounded-full">
                {language === 'hi' ? 'प्रगति, एस-वक्र और L5/L6 पदानुक्रम' : 'Progress, S-Curve & L5/L6 Hierarchy'}
              </span>
              <span className="text-xs text-graphite-500 font-medium">
                {currentProject.code} · {currentProject.name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-graphite-950 tracking-tight">
              {language === 'hi' ? 'परियोजना प्रगति व कार्य पदानुक्रम' : 'Project Progress & Work Package Hierarchy'}
            </h1>
            <p className="text-sm text-graphite-600 mt-1">
              {language === 'hi'
                ? 'वास्तविक समय में नियोजित बनाम वास्तविक एस-वक्र व बहुस्तरीय L5/L6 कार्य पैकेज रोल-अप।'
                : 'Real-time earned value S-curve tracking harmonized with multi-level L5/L6 physical field work packages.'}
            </p>
          </div>

          <button
            onClick={() => setShowDownloadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-graphite-900 hover:bg-graphite-800 text-amber-brand text-xs font-bold rounded-xl transition-all shadow-sm shrink-0 cursor-pointer border border-graphite-750 self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>{language === 'hi' ? 'प्रगति रिपोर्ट डाउनलोड' : 'Download Progress Report'}</span>
          </button>
        </div>
      </div>

      {/* Master Project Roll-Up Banner */}
      <div className="bg-white border border-graphite-200/90 rounded-3xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-brand to-safety-orange" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs font-bold text-amber-brand bg-graphite-900 px-3 py-1 rounded-lg">
                {currentProject.code}
              </span>
              <StatusBadge status={currentProject.status} size="sm" />
              <span className="text-xs text-graphite-500 font-medium">
                {projectL5s.length} {language === 'hi' ? 'L5 कार्य पैकेज' : 'L5 Work Packages'} · {l6Activities.length} {language === 'hi' ? 'L6 गतिविधियां' : 'L6 Activities'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-graphite-950 tracking-tight">
              {currentProject.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-graphite-600 pt-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-graphite-400 shrink-0" />
                <span className="truncate">{currentProject.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-graphite-400 shrink-0" />
                <span className="truncate">{currentProject.startDate} &mdash; {currentProject.endDate || currentProject.targetDate || '2027-04-30'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-graphite-400 shrink-0" />
                <span>{language === 'hi' ? 'बजट:' : 'Budget:'} <strong className="text-graphite-900 font-bold">{currentProject.budget || `₹${currentProject.budgetTotalCr || 850} Cr`}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-graphite-400 shrink-0" />
                <span className="truncate">{currentProject.contractor || currentProject.client}</span>
              </div>
            </div>
          </div>

          {/* Master Progress Progress Bar Widget */}
          <div className="w-full lg:w-96 bg-graphite-50 p-5 rounded-2xl border border-graphite-200/80 space-y-3 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="text-graphite-500 font-semibold uppercase tracking-wider">
                {language === 'hi' ? 'समग्र प्रगति रोल-अप' : 'Overall Progress Roll-Up'}
              </span>
              <span className="font-mono font-extrabold text-sm text-graphite-900">
                {currentProject.actualProgress}% / {currentProject.plannedProgress}%
              </span>
            </div>
            <ProgressBar
              actual={currentProject.actualProgress}
              planned={currentProject.plannedProgress}
              variance={currentProject.variance}
              status={currentProject.status}
              height="md"
            />
            <div className="flex justify-between items-center text-[11px] text-graphite-500 pt-1">
              <span>{language === 'hi' ? 'विचलन:' : 'Variance:'} <strong className={currentProject.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{currentProject.variance > 0 ? `+${currentProject.variance}` : currentProject.variance}%</strong></span>
              <span>CPI: <strong className="text-graphite-800 font-mono">{currentProject.cpi || '1.05'}</strong></span>
              <span>SPI: <strong className="text-graphite-800 font-mono">{currentProject.spi || '0.98'}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* View Switcher Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-2 bg-graphite-100 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('COMBINED')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'COMBINED'
                ? 'bg-white text-graphite-950 shadow-sm'
                : 'text-graphite-600 hover:text-graphite-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'संयुक्त दृश्य (S-वक्र + पदानुक्रम)' : 'Unified View (S-Curve & Hierarchy)'}</span>
          </button>
          <button
            onClick={() => setActiveTab('SCURVE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'SCURVE'
                ? 'bg-white text-graphite-950 shadow-sm'
                : 'text-graphite-600 hover:text-graphite-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'एस-वक्र और विचलन' : 'S-Curve & Variance'}</span>
          </button>
          <button
            onClick={() => setActiveTab('HIERARCHY')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'HIERARCHY'
                ? 'bg-white text-graphite-950 shadow-sm'
                : 'text-graphite-600 hover:text-graphite-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'L5/L6 कार्य पैकेज' : 'L5/L6 Work Packages'}</span>
          </button>
        </div>

        {activeTab !== 'SCURVE' && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-graphite-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'hi' ? 'पैकेज या गतिविधि खोजें...' : 'Search L5/L6 packages...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs bg-white border border-graphite-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-brand/30 w-52 sm:w-64"
              />
            </div>
            {disciplines.length > 2 && (
              <select
                value={selectedDiscipline}
                onChange={e => setSelectedDiscipline(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-graphite-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-brand/30 text-graphite-700 font-medium"
              >
                {disciplines.map(d => (
                  <option key={d} value={d}>
                    {d === 'ALL' ? (language === 'hi' ? 'सभी विषय (All)' : 'All Disciplines') : d}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* S-Curve Section (visible on COMBINED or SCURVE tabs) */}
      {(activeTab === 'COMBINED' || activeTab === 'SCURVE') && (
        <div className="space-y-4">
          <SCurveChart />
        </div>
      )}

      {/* S-Curve Variance Analysis Grid (visible on SCURVE tab) */}
      {activeTab === 'SCURVE' && (
        <div className="space-y-5 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-graphite-950 tracking-tight">
              {language === 'hi' ? 'L5 कार्य पैकेज विचलन विश्लेषण' : 'L5 Work Package Variance Analysis'}
            </h2>
            <span className="text-xs text-graphite-500 font-medium">
              {projectL5s.length} {language === 'hi' ? 'सक्रिय पैकेज' : 'Active Packages'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectL5s.map(l5 => {
              const childL6 = l6Activities.filter(a => a.l5Id === l5.id);
              return (
                <div key={l5.id} className="bg-white p-6 sm:p-7 rounded-2xl border border-graphite-200/90 shadow-sm space-y-5 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-graphite-150">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold bg-graphite-900 text-amber-brand px-2.5 py-1 rounded-lg">
                        {l5.wbsNumber}
                      </span>
                      <span className="font-bold text-graphite-950 text-base">{l5.name}</span>
                    </div>
                    <StatusBadge status={l5.status} size="sm" />
                  </div>

                  <ProgressBar
                    actual={l5.actualProgress}
                    planned={l5.plannedProgress}
                    variance={l5.variance}
                    status={l5.status}
                    height="md"
                  />

                  <div className="pt-2 border-t border-graphite-150 text-xs text-graphite-500 flex justify-between font-medium">
                    <span>{language === 'hi' ? 'गतिविधियां:' : 'Activities:'} <strong className="text-graphite-700">{childL6.length} L6 {language === 'hi' ? 'उप-कार्य' : 'sub-tasks'}</strong></span>
                    <span>{language === 'hi' ? 'भार:' : 'Weight:'} <strong className="text-graphite-700">{l5.weightInProject}%</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* L5/L6 Hierarchy Work Packages Section (visible on COMBINED or HIERARCHY tabs) */}
      {(activeTab === 'COMBINED' || activeTab === 'HIERARCHY') && (
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-graphite-200">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-brand" />
                <h2 className="text-xl sm:text-2xl font-bold text-graphite-950 tracking-tight">
                  {language === 'hi' ? 'L5 कार्य पैकेज और विस्तार योग्य L6 गतिविधियां' : 'L5 Work Packages & Expandable L6 Activities'}
                </h2>
              </div>
              <p className="text-xs text-graphite-500 mt-1">
                {language === 'hi'
                  ? 'भौतिक प्रगति, ठेकेदार आवंटन और फील्ड सत्यापन का पदानुक्रमित रोल-अप। विस्तार करने के लिए क्लिक करें।'
                  : 'Hierarchical rollup of physical progress, contractor assignments, and field verification. Click any package to expand child L6 activities.'}
              </p>
            </div>
            <span className="text-xs text-graphite-600 font-semibold bg-graphite-100 px-3.5 py-1.5 rounded-full border border-graphite-200">
              {filteredL5s.length} {language === 'hi' ? 'कार्य पैकेज प्रदर्शित' : 'Packages Displayed'}
            </span>
          </div>

          <div className="space-y-5">
            {filteredL5s.length === 0 ? (
              <div className="bg-white rounded-2xl border border-graphite-200 p-12 text-center text-graphite-500 text-sm">
                {language === 'hi' ? 'कोई कार्य पैकेज नहीं मिला।' : 'No work packages match your search criteria.'}
              </div>
            ) : (
              filteredL5s.map((l5, i) => (
                <L5ProcessControlCard
                  key={l5.id}
                  l5={l5}
                  l6Activities={l6Activities}
                  defaultExpanded={i === 0}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Download Progress Report Modal */}
      <DownloadProgressModal
        project={currentProject}
        l5Processes={projectL5s}
        l6Activities={l6Activities}
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />
    </div>
  );
};
