import React, { useState } from 'react';
import { L6Activity, L5Process, Worker } from '../../types';
import { useProject } from '../../context/ProjectContext';
import { StatusBadge } from '../common/StatusBadge';
import { ProgressBar } from '../common/ProgressBar';
import { KPBadge } from '../common/KPBadge';
import {
  Calendar,
  User,
  Plus,
  Edit2,
  ChevronDown,
  ChevronRight,
  Workflow,
  Layers,
  Filter,
  Check,
  X,
  FileText,
  Upload,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { uploadScheduleToBackend } from '../../services/apiService';

export const ScheduleWbsTree: React.FC = () => {
  const {
    l5Processes,
    l6Activities,
    workers,
    assignWorkerToL6,
    updateL6Dates,
    addNewL6Activity,
    glitteringActivityId,
    importScheduleActivities,
  } = useProject();

  const [isImporting, setIsImporting] = useState<boolean>(false);

  const [filterDiscipline, setFilterDiscipline] = useState<string>('ALL');
  const [editingL6Id, setEditingL6Id] = useState<string | null>(null);
  const [editStartDate, setEditStartDate] = useState<string>('');
  const [editEndDate, setEditEndDate] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New activity state
  const [newCode, setNewCode] = useState('PIPE-L6-005');
  const [newName, setNewName] = useState('');
  const [newL5Id, setNewL5Id] = useState('L5-01');
  const [newDiscipline, setNewDiscipline] = useState<'Piping' | 'Mechanical' | 'Civil' | 'Electrical' | 'Instrumentation' | 'QA/QC'>('Piping');
  const [newLocation, setNewLocation] = useState('KP 13–14');
  const [newWorkerId, setNewWorkerId] = useState('W-01');
  const [newPlanned, setNewPlanned] = useState(30);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleStartEdit = (l6: L6Activity) => {
    setEditingL6Id(l6.id);
    // Altered dates start from current date onwards and not from previous past dates
    const startFromToday = l6.startDate < todayStr ? todayStr : l6.startDate;
    const endValid = l6.endDate < startFromToday ? startFromToday : l6.endDate;
    setEditStartDate(startFromToday);
    setEditEndDate(endValid);
  };

  const handleSaveEdit = (l6Id: string) => {
    updateL6Dates(l6Id, editStartDate, editEndDate);
    setEditingL6Id(null);
    toast.success('Schedule dates updated successfully');
  };

  const handleImportSchedule = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    toast.info(`Parsing schedule file: ${file.name}...`);

    try {
      const result = await uploadScheduleToBackend(file);
      if (result && result.activities.length > 0) {
        importScheduleActivities(result.activities, `${file.name} (${result.reportType})`);
        try { confetti({ particleCount: 50, spread: 70 }); } catch {}
        toast.success(`Successfully imported ${result.activities.length} activities from ${file.name}!`);
      } else {
        toast.warning('No compatible schedule activities found in this file.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to parse schedule file. Check file format.');
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error('Please enter activity name');
      return;
    }
    const worker = workers.find(w => w.id === newWorkerId);
    addNewL6Activity({
      code: newCode,
      name: newName,
      l5Id: newL5Id,
      discipline: newDiscipline,
      location: newLocation,
      assignedWorkerId: newWorkerId,
      assignedWorkerName: worker?.name || 'Ravi Kumar',
      plannedProgress: newPlanned,
    });
    setShowAddModal(false);
    setNewName('');
    toast.success(`Activity ${newCode} added to WBS schedule!`);
  };

  const filteredL5s = l5Processes.filter(l5 => {
    if (filterDiscipline === 'ALL') return true;
    return l5.discipline.toLowerCase().includes(filterDiscipline.toLowerCase());
  });

  return (
    <div className="space-y-8 font-sans">
      {/* Controls Bar */}
      <div className="bg-white p-7 sm:p-8 rounded-3xl border border-graphite-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-bold text-graphite-700 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-amber-brand" />
            <span>Discipline Filter:</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {['ALL', 'Piping', 'Mechanical', 'SCADA', 'QA/QC'].map(d => (
              <button
                key={d}
                onClick={() => setFilterDiscipline(d)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  filterDiscipline === d
                    ? 'bg-amber-brand text-graphite-950 font-bold shadow-sm'
                    : 'bg-graphite-100 text-graphite-600 hover:bg-graphite-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          <label className="px-5 py-3.5 bg-amber-500/10 hover:bg-amber-brand text-amber-950 border border-amber-500/30 text-sm font-bold rounded-2xl transition-all flex items-center gap-2.5 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]">
            <Upload className="w-4 h-4 stroke-[2.5]" />
            <span>{isImporting ? 'Importing...' : 'Import Primavera / MS Project'}</span>
            <input
              type="file"
              accept=".xer,.xml,.csv,.xlsx"
              className="hidden"
              disabled={isImporting}
              onChange={handleImportSchedule}
            />
          </label>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3.5 bg-graphite-900 hover:bg-amber-brand hover:text-graphite-950 text-white text-sm font-bold rounded-2xl transition-all flex items-center gap-2.5 shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add L6 Activity</span>
          </button>
        </div>
      </div>

      {/* WBS Tree Table / Accordion */}
      <div className="space-y-8">
        {filteredL5s.map(l5 => {
          const l6List = l6Activities.filter(a => a.l5Id === l5.id);

          return (
            <div
              key={l5.id}
              className="bg-white rounded-3xl border border-graphite-200/80 shadow-sm overflow-hidden"
            >
              {/* L5 Package Row */}
              <div className="p-7 sm:p-8 bg-gradient-to-r from-offwhite-50 via-white to-offwhite-50 border-b border-graphite-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs font-extrabold text-amber-brand bg-graphite-900 px-3 py-1.5 rounded-lg">
                    WBS {l5.wbsNumber}
                  </span>
                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="text-xs text-graphite-500 uppercase font-semibold">
                        L5 Process · {l5.discipline}
                      </span>
                      <StatusBadge status={l5.status} size="sm" />
                    </div>
                    <h3 className="text-xl font-bold text-graphite-950 tracking-tight">{l5.name}</h3>
                  </div>
                </div>

                <div className="w-64 sm:w-72 shrink-0">
                  <ProgressBar
                    actual={l5.actualProgress}
                    planned={l5.plannedProgress}
                    variance={l5.variance}
                    status={l5.status}
                    height="md"
                  />
                </div>
              </div>

              {/* L6 Sub-Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-sans divide-y divide-graphite-150">
                  <thead className="bg-graphite-50 text-graphite-600 text-xs uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-4 px-6">WBS & Code</th>
                      <th className="py-4 px-6">L6 Activity Name</th>
                      <th className="py-4 px-6">Location</th>
                      <th className="py-4 px-6">Planned vs Actual</th>
                      <th className="py-4 px-6">Schedule Window</th>
                      <th className="py-4 px-6">Assigned Worker</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-graphite-150">
                    {l6List.map(l6 => {
                      const isEditing = editingL6Id === l6.id;
                      const isGlittering = glitteringActivityId === l6.id;

                      return (
                        <tr
                          key={l6.id}
                          className={`transition-all duration-300 ${
                            isGlittering
                              ? 'animate-glitter-pulse bg-amber-50/90 ring-2 ring-amber-400'
                              : 'hover:bg-offwhite-50/90'
                          }`}
                        >
                          <td className="py-5 px-6 whitespace-nowrap">
                            <span className="text-graphite-400 font-mono text-xs font-semibold block">{l6.wbsNumber}</span>
                            <div className="font-bold text-graphite-950 font-mono text-sm mt-0.5">{l6.code}</div>
                          </td>

                          <td className="py-5 px-6 font-sans max-w-sm">
                            <div className="font-bold text-graphite-950 text-sm leading-snug">{l6.name}</div>
                            <div className="text-xs font-normal text-graphite-500 truncate mt-1">
                              {l6.specs.pipeSize || l6.specs.material || 'Standard API spec'}
                            </div>
                          </td>

                          <td className="py-5 px-6 whitespace-nowrap">
                            <KPBadge location={l6.location} size="sm" />
                          </td>

                          <td className="py-5 px-6 w-56 sm:w-64 min-w-[210px]">
                            <ProgressBar
                              actual={l6.actualProgress}
                              planned={l6.plannedProgress}
                              variance={l6.variance}
                              status={l6.status}
                              height="sm"
                              showNumbers={true}
                            />
                          </td>

                          <td className="py-5 px-6 whitespace-nowrap text-graphite-700 font-medium text-xs">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="date"
                                  min={todayStr}
                                  value={editStartDate}
                                  onChange={e => {
                                    setEditStartDate(e.target.value);
                                    if (editEndDate < e.target.value) {
                                      setEditEndDate(e.target.value);
                                    }
                                  }}
                                  className="border border-graphite-300 rounded-lg px-2.5 py-1 text-xs"
                                />
                                <span>-</span>
                                <input
                                  type="date"
                                  min={editStartDate || todayStr}
                                  value={editEndDate}
                                  onChange={e => setEditEndDate(e.target.value)}
                                  className="border border-graphite-300 rounded-lg px-2.5 py-1 text-xs"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-graphite-400" />
                                <span>{l6.startDate} → {l6.endDate}</span>
                              </div>
                            )}
                          </td>

                          <td className="py-5 px-6 whitespace-nowrap">
                            <select
                              value={l6.assignedWorkerId}
                              onChange={e => {
                                assignWorkerToL6(l6.id, e.target.value);
                                toast.success(`Assigned ${l6.code} to new worker`);
                              }}
                              className="bg-offwhite-100 hover:bg-offwhite-200 border border-graphite-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-graphite-800 focus:outline-none focus:border-amber-brand cursor-pointer transition-colors shadow-sm"
                            >
                              {workers.map(w => (
                                <option key={w.id} value={w.id}>
                                  {w.name} ({w.role})
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="py-5 px-6 whitespace-nowrap">
                            <StatusBadge status={l6.status} size="sm" />
                          </td>

                          <td className="py-5 px-6 text-right whitespace-nowrap">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleSaveEdit(l6.id)}
                                  className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
                                  title="Save"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingL6Id(null)}
                                  className="p-2 bg-graphite-200 text-graphite-700 rounded-xl hover:bg-graphite-300 transition-colors"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleStartEdit(l6)}
                                className="p-2 text-graphite-400 hover:text-amber-brand hover:bg-graphite-100 rounded-xl transition-colors"
                                title="Edit Dates"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add L6 Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite-950/70 backdrop-blur-sm font-sans">
          <div className="bg-graphite-900 border border-graphite-750 rounded-3xl text-white max-w-md w-full p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-graphite-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5 pb-3 border-b border-graphite-800">
              <Workflow className="w-5 h-5 text-amber-brand" />
              <span>Add New L6 Activity</span>
            </h3>

            <form onSubmit={handleCreateActivity} className="space-y-4 text-xs">
              <div>
                <label className="block text-graphite-400 mb-1.5 uppercase font-semibold tracking-wider">Parent L5 Work Package:</label>
                <select
                  value={newL5Id}
                  onChange={e => setNewL5Id(e.target.value)}
                  className="w-full bg-graphite-850 border border-graphite-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-brand"
                >
                  {l5Processes.map(l5 => (
                    <option key={l5.id} value={l5.id}>
                      {l5.wbsNumber} — {l5.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-graphite-400 mb-1.5 uppercase font-semibold tracking-wider">Activity Code:</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={e => setNewCode(e.target.value)}
                    className="w-full bg-graphite-850 border border-graphite-700 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-amber-brand"
                  />
                </div>
                <div>
                  <label className="block text-graphite-400 mb-1.5 uppercase font-semibold tracking-wider">Location (KP):</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                    className="w-full bg-graphite-850 border border-graphite-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-graphite-400 mb-1.5 uppercase font-semibold tracking-wider">Activity Name / Scope:</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Lay 12 inch Pipe KP 13–14"
                  className="w-full bg-graphite-850 border border-graphite-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-graphite-400 mb-1.5 uppercase font-semibold tracking-wider">Discipline:</label>
                  <select
                    value={newDiscipline}
                    onChange={e => setNewDiscipline(e.target.value as any)}
                    className="w-full bg-graphite-850 border border-graphite-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-brand"
                  >
                    <option value="Piping">Piping</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Instrumentation">Instrumentation</option>
                    <option value="QA/QC">QA/QC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-graphite-400 mb-1.5 uppercase font-semibold tracking-wider">Assigned Worker:</label>
                  <select
                    value={newWorkerId}
                    onChange={e => setNewWorkerId(e.target.value)}
                    className="w-full bg-graphite-850 border border-graphite-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-brand"
                  >
                    {workers.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-graphite-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-graphite-400 hover:text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-brand text-graphite-950 font-bold rounded-xl hover:bg-amber-hover transition-colors shadow-md"
                >
                  Create Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
