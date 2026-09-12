import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useLanguage } from '../../context/LanguageContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { FolderKanban, MapPin, ArrowRight, Building2, Calendar, Users, Plus, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const ProjectsPage: React.FC = () => {
  const { projects, setSelectedProjectId, addNewProject } = useProject();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    client: 'Oil India Limited (OIL)',
    contractor: 'Kalpataru Projects International Ltd',
    location: '',
    packageCode: 'PKG-PL-0' + (projects.length + 1),
    budget: '₹850 Cr',
    totalLengthKm: '120',
    targetDate: '2027-06-30',
  });

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    navigate(`/admin/projects/${projectId}`);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location.trim()) {
      toast.error('Please enter project name and location.');
      return;
    }

    const created = addNewProject({
      name: formData.name.trim(),
      code: formData.code.trim() || `EPC-00${projects.length + 1}`,
      client: formData.client.trim(),
      contractor: formData.contractor.trim(),
      location: formData.location.trim(),
      packageCode: formData.packageCode.trim(),
      budget: formData.budget.trim(),
      totalLengthKm: Number(formData.totalLengthKm) || 100,
      targetDate: formData.targetDate,
      startDate: '2026-09-11',
      overallProgress: 0,
      plannedProgress: 5,
      actualProgress: 0,
      variance: -5,
      status: 'ACTIVE',
      totalWorkersOnSite: 24,
      l5ProcessIds: [],
    });

    toast.success(`Project "${created.name}" created successfully from scratch!`);
    setShowAddModal(false);
    navigate(`/admin/projects/${created.id}`);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-5 border-b border-graphite-200">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-xs font-bold text-amber-brand bg-graphite-900 px-3 py-1 rounded-full">
              {language === 'hi' ? 'पोर्टफोलियो नियंत्रण' : 'Portfolio Control'}
            </span>
            <span className="text-xs text-graphite-500 font-medium">
              {projects.length.toString().padStart(2, '0')} {language === 'hi' ? 'ईपीसी पैकेज' : 'EPC Packages'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-graphite-950 tracking-tight">
            {language === 'hi' ? 'सक्रिय अवसंरचना परियोजनाएं' : 'Active Infrastructure Projects'}
          </h1>
          <p className="text-sm text-graphite-600 mt-1">
            {language === 'hi'
              ? 'उत्तर-पूर्व भारत में रिफाइनरी इकाइयां, क्रॉस-कंट्री पाइपलाइन और टर्मिनल अवसंरचना।'
              : 'Refinery units, cross-country pipelines, and terminal infrastructure across North-East India.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 via-amber-brand to-safety-orange hover:from-amber-400 hover:to-amber-500 text-graphite-950 font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'hi' ? '+ नई परियोजना जोड़ें' : 'Add New Project'}</span>
        </button>
      </div>

      {/* Projects Grid with Spacious 2xl Cards and gap-7 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="bg-white rounded-2xl border border-graphite-200/90 shadow-sm hover:shadow-md p-6 sm:p-7 flex flex-col justify-between space-y-5 hover:border-amber-brand/60 transition-all group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold bg-graphite-900 text-amber-brand px-3 py-1 rounded-md">
                  {proj.code}
                </span>
                <StatusBadge status={proj.status} size="sm" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-graphite-950 group-hover:text-amber-brand transition-colors">
                  {proj.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-graphite-500 font-medium mt-1">
                  <MapPin className="w-4 h-4 text-graphite-400 shrink-0" />
                  <span className="truncate">{proj.location}</span>
                </div>
              </div>

              <div className="text-xs text-graphite-600 space-y-1.5 bg-offwhite-100 p-3.5 rounded-xl">
                <div className="flex justify-between">
                  <span className="text-graphite-400 font-medium">{language === 'hi' ? 'ठेकेदार:' : 'Contractor:'}</span>
                  <span className="font-semibold text-graphite-800 truncate max-w-[170px]">{proj.contractor || 'EPC Consortium'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-graphite-400 font-medium">{language === 'hi' ? 'पैकेज:' : 'Package:'}</span>
                  <span className="font-semibold text-graphite-800">{proj.packageCode || proj.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-graphite-400 font-medium">{language === 'hi' ? 'बजट:' : 'Budget:'}</span>
                  <span className="font-semibold text-graphite-800">{proj.budget}</span>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-1.5">
                <ProgressBar
                  actual={proj.actualProgress}
                  planned={proj.plannedProgress}
                  variance={proj.variance}
                  status={proj.status}
                  height="md"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-graphite-150 flex items-center justify-between">
              <div className="text-xs text-graphite-500 font-medium flex items-center gap-1.5">
                <Users className="w-4 h-4 text-graphite-400" />
                <span>{proj.totalWorkersOnSite || 18} {language === 'hi' ? 'कार्यस्थल पर' : 'on site'}</span>
              </div>

              <button
                onClick={() => handleSelectProject(proj.id)}
                className="px-4 py-2 bg-graphite-100 group-hover:bg-amber-brand group-hover:text-graphite-950 text-graphite-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>{language === 'hi' ? 'L5/L6 खोलें' : 'Open L5/L6'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Project Modal Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl border border-graphite-200 w-full max-w-2xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-graphite-900 text-white flex items-center justify-between border-b border-graphite-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-brand flex items-center justify-center text-graphite-950 font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">
                    {language === 'hi' ? 'नई ईपीसी परियोजना जोड़ें' : 'Add New EPC Project'}
                  </h2>
                  <p className="text-xs text-graphite-400">
                    {language === 'hi'
                      ? 'आधारभूत अनुसूची के साथ नया परियोजना पैकेज आरंभ करें'
                      : 'Initialize a new project package with baseline schedule'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-graphite-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateProject} className="p-6 sm:p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-graphite-700 uppercase tracking-wider">
                  {language === 'hi' ? 'परियोजना शीर्षक / नाम *' : 'Project Title / Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Numaligarh to Siliguri Feeder Pipeline Section-3"
                  className="w-full bg-graphite-50 border border-graphite-300 rounded-xl px-4 py-2.5 text-sm text-graphite-900 focus:outline-none focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/20 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-graphite-700 uppercase tracking-wider">
                    {language === 'hi' ? 'परियोजना कोड / आईडी' : 'Project Code / ID'}
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder={`e.g. EPC-00${projects.length + 1}`}
                    className="w-full bg-graphite-50 border border-graphite-300 rounded-xl px-4 py-2.5 text-sm text-graphite-900 focus:outline-none focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/20 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-graphite-700 uppercase tracking-wider">
                    {language === 'hi' ? 'स्थान कॉरिडोर *' : 'Location Corridor *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Jorhat to Dibrugarh, Assam"
                    className="w-full bg-graphite-50 border border-graphite-300 rounded-xl px-4 py-2.5 text-sm text-graphite-900 focus:outline-none focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/20 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-graphite-700 uppercase tracking-wider">
                    {language === 'hi' ? 'ग्राहक प्राधिकरण' : 'Client Authority'}
                  </label>
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full bg-graphite-50 border border-graphite-300 rounded-xl px-4 py-2.5 text-sm text-graphite-900 focus:outline-none focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/20 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-graphite-700 uppercase tracking-wider">
                    {language === 'hi' ? 'प्रमुख ईपीसी ठेकेदार' : 'Primary EPC Contractor'}
                  </label>
                  <input
                    type="text"
                    value={formData.contractor}
                    onChange={(e) => setFormData({ ...formData, contractor: e.target.value })}
                    className="w-full bg-graphite-50 border border-graphite-300 rounded-xl px-4 py-2.5 text-sm text-graphite-900 focus:outline-none focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/20 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-graphite-700 uppercase tracking-wider">
                    {language === 'hi' ? 'स्वीकृत बजट' : 'Approved Budget'}
                  </label>
                  <input
                    type="text"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full bg-graphite-50 border border-graphite-300 rounded-xl px-4 py-2.5 text-sm text-graphite-900 focus:outline-none focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/20 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-graphite-700 uppercase tracking-wider">
                    {language === 'hi' ? 'लंबाई (किमी)' : 'Length (Km)'}
                  </label>
                  <input
                    type="number"
                    value={formData.totalLengthKm}
                    onChange={(e) => setFormData({ ...formData, totalLengthKm: e.target.value })}
                    className="w-full bg-graphite-50 border border-graphite-300 rounded-xl px-4 py-2.5 text-sm text-graphite-900 focus:outline-none focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/20 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-graphite-700 uppercase tracking-wider">
                    {language === 'hi' ? 'लक्षित पूर्णता तिथि' : 'Target Completion'}
                  </label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full bg-graphite-50 border border-graphite-300 rounded-xl px-4 py-2.5 text-sm text-graphite-900 focus:outline-none focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/20 font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-graphite-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-graphite-100 hover:bg-graphite-200 text-graphite-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-brand hover:bg-amber-hover text-graphite-950 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'hi' ? 'परियोजना बेसलाइन बनाएं' : 'Create Project Baseline'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
