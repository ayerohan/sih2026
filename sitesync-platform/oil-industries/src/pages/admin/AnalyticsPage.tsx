import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BarChart2,
  PieChart as PieChartIcon,
  TrendingUp,
  Activity,
  Layers,
  Calendar,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

// Trend data over time leading up to 11 Sep 2026
const AI_TREND_DATA = [
  { date: '01 Sep', total: 8, autoAccepted: 6, reviewed: 2, confidenceAvg: 87 },
  { date: '02 Sep', total: 11, autoAccepted: 9, reviewed: 2, confidenceAvg: 89 },
  { date: '03 Sep', total: 14, autoAccepted: 11, reviewed: 3, confidenceAvg: 88 },
  { date: '04 Sep', total: 10, autoAccepted: 8, reviewed: 2, confidenceAvg: 91 },
  { date: '05 Sep', total: 16, autoAccepted: 13, reviewed: 3, confidenceAvg: 90 },
  { date: '06 Sep', total: 12, autoAccepted: 10, reviewed: 2, confidenceAvg: 92 },
  { date: '07 Sep', total: 15, autoAccepted: 12, reviewed: 3, confidenceAvg: 89 },
  { date: '08 Sep', total: 18, autoAccepted: 14, reviewed: 4, confidenceAvg: 93 },
  { date: '09 Sep', total: 22, autoAccepted: 18, reviewed: 4, confidenceAvg: 94 },
  { date: '10 Sep', total: 19, autoAccepted: 15, reviewed: 4, confidenceAvg: 92 },
  { date: '11 Sep', total: 24, autoAccepted: 20, reviewed: 4, confidenceAvg: 95 },
];

// Discipline Breakdown
const DISCIPLINE_METRICS = [
  { discipline: 'Piping', totalLogs: 48, highConfidence: 41, manualReview: 7, accuracy: 96.5 },
  { discipline: 'Mechanical', totalLogs: 28, highConfidence: 23, manualReview: 5, accuracy: 94.2 },
  { discipline: 'QA/QC', totalLogs: 22, highConfidence: 19, manualReview: 3, accuracy: 97.8 },
  { discipline: 'E&I / SCADA', totalLogs: 16, highConfidence: 13, manualReview: 3, accuracy: 92.4 },
  { discipline: 'Civil', totalLogs: 18, highConfidence: 15, manualReview: 3, accuracy: 95.1 },
  { discipline: 'HSE Safety', totalLogs: 12, highConfidence: 11, manualReview: 1, accuracy: 98.6 },
];

// Confidence Distribution Pie
const CONFIDENCE_DISTRIBUTION = [
  { name: '90% - 100% (Instant Sync)', value: 68, color: '#10b981' },
  { name: '80% - 89% (High Confidence)', value: 34, color: '#d99a24' },
  { name: '70% - 79% (Human Review)', value: 16, color: '#f59e0b' },
  { name: '< 70% (Manual Mapping)', value: 6, color: '#ef4444' },
];

// Multi-Modal Dimension Weights
const MULTI_MODAL_DIMENSIONS = [
  { factor: 'Location / KP Range', weight: 35, accuracy: 97.4, description: 'GPS coordinates, KP milestones & section tags' },
  { factor: 'Discipline Alignment', weight: 25, accuracy: 95.0, description: 'Matching engineer role with WBS code trade' },
  { factor: 'Entity & Spec Specs', weight: 25, accuracy: 93.2, description: 'Pipe diameter, joint numbers, NDT test tags' },
  { factor: 'Schedule Time Window', weight: 15, accuracy: 91.8, description: 'WBS baseline timeline & lookahead calendar' },
];

export const AnalyticsPage: React.FC = () => {
  const { aiMatches, fieldReports, systemSettings } = useProject();
  const { t, language } = useLanguage();
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('ALL');
  const [hoveredPieEntry, setHoveredPieEntry] = useState<typeof CONFIDENCE_DISTRIBUTION[0] | null>(null);

  const totalReportsCount = 124 + fieldReports.length;
  const highConfCount = Math.round(totalReportsCount * 0.76);
  const reviewReqCount = totalReportsCount - highConfCount;

  // Custom tooltip for Confidence Distribution Pie Chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload || payload[0];
      const total = CONFIDENCE_DISTRIBUTION.reduce((acc, item) => acc + item.value, 0);
      const percent = ((data.value / total) * 100).toFixed(1);

      return (
        <div className="bg-graphite-950 text-white p-3.5 rounded-2xl border border-graphite-700 shadow-2xl text-xs space-y-1.5 min-w-[210px] z-50 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: data.color }} />
            <span className="font-bold text-white leading-tight">{data.name}</span>
          </div>
          <div className="flex items-baseline justify-between pt-1.5 border-t border-graphite-800 text-graphite-300">
            <span>{language === 'hi' ? 'रिपोर्ट मात्रा:' : 'Volume:'}</span>
            <strong className="text-amber-brand font-mono text-sm">{data.value} {language === 'hi' ? 'रिपोर्टें' : 'reports'}</strong>
          </div>
          <div className="flex items-baseline justify-between text-graphite-400 text-[11px]">
            <span>{language === 'hi' ? 'कुल का हिस्सा:' : 'Share of Total:'}</span>
            <strong className="text-emerald-400 font-mono text-xs">{percent}%</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto font-sans pb-14">
      {/* Page Header */}
      <div className="pb-5 border-b border-graphite-200">
        <div className="flex items-center gap-2.5 mb-1.5">
          <span className="text-xs font-bold text-amber-brand bg-graphite-900 px-3.5 py-1 rounded-full">
            Intelligence / Analytics
          </span>
          <span className="text-xs text-graphite-500 font-medium">
            AI Extraction Metrics & Multi-Modal Verification
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-graphite-950 tracking-tight">
          AI Intelligence & Verification Analytics
        </h1>
        <p className="text-sm text-graphite-600 mt-1">
          Real-time performance tracking for Gemini multi-modal matching engine, entity parsing throughput, and human acceptance rates.
        </p>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-graphite-200/90 shadow-sm space-y-2 hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs text-graphite-500 font-semibold uppercase tracking-wider">
            <span>Total Ingested Logs</span>
            <Activity className="w-4 h-4 text-graphite-400" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-graphite-950 tracking-tight">{totalReportsCount}</div>
          <span className="text-xs text-graphite-400 font-medium block pt-1 border-t border-graphite-100">
            Across photos, PDFs, Excel & text
          </span>
        </div>

        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-graphite-200/90 shadow-sm space-y-2 hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold uppercase tracking-wider">
            <span>Auto-Verified</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700 tracking-tight">
            {highConfCount} <span className="text-sm font-semibold text-emerald-600">(76.2%)</span>
          </div>
          <span className="text-xs text-graphite-400 font-medium block pt-1 border-t border-graphite-100">
            &gt;{systemSettings.confidenceThreshold}% threshold confidence
          </span>
        </div>

        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-graphite-200/90 shadow-sm space-y-2 hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs text-amber-800 font-semibold uppercase tracking-wider">
            <span>Review Queue</span>
            <AlertTriangle className="w-4 h-4 text-amber-brand" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-amber-brand tracking-tight">
            {reviewReqCount} <span className="text-sm font-semibold text-amber-800">(23.8%)</span>
          </div>
          <span className="text-xs text-graphite-400 font-medium block pt-1 border-t border-graphite-100">
            Human-in-the-loop review pool
          </span>
        </div>

        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-graphite-200/90 shadow-sm space-y-2 hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold uppercase tracking-wider">
            <span>Human Acceptance</span>
            <Sparkles className="w-4 h-4 text-amber-brand" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-800 tracking-tight">96.8%</div>
          <span className="text-xs text-graphite-400 font-medium block pt-1 border-t border-graphite-100">
            Director sign-off validation rate
          </span>
        </div>
      </div>

      {/* Chart 1: AI Processing Throughput & Auto-Accept Trajectory */}
      <div className="bg-white p-7 sm:p-9 rounded-3xl border border-graphite-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-graphite-150">
          <div>
            <div className="text-xs font-bold text-graphite-400 uppercase tracking-wider">
              Time Series Execution
            </div>
            <h3 className="text-xl font-bold text-graphite-950 tracking-tight mt-0.5">
              Daily AI Parsing & Auto-Accept Trajectory
            </h3>
          </div>
          <div className="flex items-center gap-5 text-xs font-semibold">
            <span className="flex items-center gap-2 text-graphite-700">
              <span className="w-3.5 h-3.5 bg-amber-brand rounded-md inline-block shadow-sm" /> Total Logs Ingested
            </span>
            <span className="flex items-center gap-2 text-emerald-700">
              <span className="w-3.5 h-3.5 bg-emerald-500 rounded-md inline-block shadow-sm" /> Auto-Accepted (&gt;{systemSettings.confidenceThreshold}%)
            </span>
          </div>
        </div>

        <div className="h-80 sm:h-96 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={AI_TREND_DATA} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d99a24" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#d99a24" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorAuto" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2428',
                  borderRadius: '16px',
                  border: '1px solid #374151',
                  color: '#fff',
                  fontSize: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                name="Total Field Reports"
                stroke="#d99a24"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTotal)"
              />
              <Area
                type="monotone"
                dataKey="autoAccepted"
                name="Auto-Accepted"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorAuto)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Layout: Bar Chart for Disciplines & Pie Chart for Confidence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 2: Discipline Breakdown Bar Chart */}
        <div className="bg-white p-7 sm:p-9 rounded-3xl border border-graphite-200/90 shadow-sm space-y-6">
          <div className="pb-4 border-b border-graphite-150">
            <div className="text-xs font-bold text-graphite-400 uppercase tracking-wider">
              Engineering Disciplines
            </div>
            <h3 className="text-lg font-bold text-graphite-950 tracking-tight mt-0.5">
              Resolution Throughput by Department
            </h3>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DISCIPLINE_METRICS} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="discipline" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2428',
                    borderRadius: '12px',
                    border: '1px solid #374151',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="highConfidence" name="High Confidence" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="manualReview" name="Manual Review" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Confidence Score Distribution Pie Chart */}
        <div className="bg-white p-7 sm:p-9 rounded-3xl border border-graphite-200/90 shadow-sm space-y-6">
          <div className="pb-4 border-b border-graphite-150 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-graphite-400 uppercase tracking-wider">
                {t('analytics.qualityTiers', 'Quality Tiers')}
              </div>
              <h3 className="text-lg font-bold text-graphite-950 tracking-tight mt-0.5">
                {t('analytics.distribution', 'Confidence Score Distribution')}
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-bold">
              124 {language === 'hi' ? 'नमूने' : 'Samples'}
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CONFIDENCE_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                  onMouseEnter={(_, index) => setHoveredPieEntry(CONFIDENCE_DISTRIBUTION[index])}
                  onMouseLeave={() => setHoveredPieEntry(null)}
                >
                  {CONFIDENCE_DISTRIBUTION.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={hoveredPieEntry?.name === entry.name ? '#171a1d' : 'transparent'}
                      strokeWidth={2}
                      className="cursor-pointer transition-all duration-200"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Interactive Hover Telemetry Status */}
          {hoveredPieEntry ? (
            <div className="p-3.5 bg-graphite-900 text-white rounded-2xl border border-graphite-750 flex items-center justify-between text-xs shadow-md transition-all">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: hoveredPieEntry.color }} />
                <span className="font-bold text-white truncate">{hoveredPieEntry.name}</span>
              </div>
              <div className="text-right shrink-0 pl-3">
                <span className="font-mono text-amber-brand font-bold text-sm">{hoveredPieEntry.value}</span>
                <span className="text-graphite-400 text-[11px] ml-1">
                  ({((hoveredPieEntry.value / 124) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-offwhite-50 text-graphite-500 rounded-2xl border border-graphite-200/80 text-center text-xs flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-brand animate-ping" />
              <span>{language === 'hi' ? 'विवरण देखने के लिए किसी भी चार्ट खंड पर माउस घुमाएं' : 'Hover over any pie slice to inspect volume and share'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Multi-factor accuracy table with Visual Weights */}
      <div className="bg-white p-7 sm:p-9 rounded-3xl border border-graphite-200/90 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-graphite-150">
          <div>
            <div className="text-xs font-bold text-graphite-400 uppercase tracking-wider">
              Algorithmic Composition
            </div>
            <h2 className="text-lg font-bold text-graphite-950 tracking-tight mt-0.5">
              4-Dimensional Multi-Modal Weighting & Match Accuracy
            </h2>
          </div>
          <span className="text-xs font-mono font-bold bg-amber-brand/10 text-amber-brand border border-amber-brand/30 px-3 py-1 rounded-full">
            Gemini 1.5 Flash + Pro Multi-Modal
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MULTI_MODAL_DIMENSIONS.map((item, idx) => (
            <div key={idx} className="p-5 bg-graphite-50 rounded-2xl border border-graphite-200/80 space-y-3 hover:border-amber-brand/40 transition-colors">
              <div className="flex justify-between items-center text-xs">
                <span className="text-graphite-500 font-bold uppercase tracking-wider text-[11px]">{item.factor}</span>
                <span className="font-mono text-amber-brand font-bold bg-graphite-900 px-2 py-0.5 rounded text-[11px]">
                  {item.weight}% WT
                </span>
              </div>
              <div className="text-2xl font-extrabold text-graphite-950 tracking-tight">{item.accuracy}%</div>
              
              {/* Progress Bar of accuracy */}
              <div className="w-full bg-graphite-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${item.accuracy}%` }} />
              </div>

              <p className="text-xs text-graphite-600 leading-relaxed pt-1">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
