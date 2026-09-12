import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  ComposedChart,
} from 'recharts';
import { SCURVE_DATA } from '../../data/mockData';

export const SCurveChart: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl border border-graphite-200/80 p-8 sm:p-10 shadow-sm font-sans space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-graphite-150">
        <div>
          <div className="text-xs font-bold text-graphite-400 uppercase tracking-wider">
            Progress S-Curve & Baseline
          </div>
          <h3 className="text-xl font-bold text-graphite-950 tracking-tight mt-1">
            Planned vs Actual Execution Trajectory
          </h3>
        </div>
        <div className="flex items-center gap-5 text-xs font-semibold">
          <span className="flex items-center gap-2 text-graphite-600">
            <span className="w-4 h-1.5 bg-graphite-400 rounded-full inline-block" /> Planned Baseline (79%)
          </span>
          <span className="flex items-center gap-2 text-amber-800">
            <span className="w-4 h-3 bg-amber-brand rounded-md inline-block shadow-sm" /> Verified Actual (72%)
          </span>
        </div>
      </div>

      <div className="h-80 sm:h-96 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={SCURVE_DATA} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EAECEE" />
            <XAxis
              dataKey="month"
              stroke="#8A9196"
              fontSize={12}
              tickLine={false}
              fontFamily="Inter, sans-serif"
            />
            <YAxis
              stroke="#8A9196"
              fontSize={12}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              fontFamily="Inter, sans-serif"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#171A1D',
                borderRadius: '16px',
                border: '1px solid #2F353A',
                color: '#fff',
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              }}
              formatter={(value: any, name: string) => [
                `${value}%`,
                name === 'planned' ? 'Planned Baseline' : name === 'actual' ? 'Actual Progress' : 'Forecast'
              ]}
            />
            {/* Planned Line (Dotted Gray) */}
            <Line
              type="monotone"
              dataKey="planned"
              stroke="#626B73"
              strokeWidth={2.5}
              strokeDasharray="4 4"
              dot={{ r: 3.5, fill: '#626B73' }}
              name="planned"
            />
            {/* Actual Line (Solid Amber with Glow) */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#D99A24"
              strokeWidth={3.5}
              dot={{ r: 5.5, fill: '#D99A24', stroke: '#171A1D', strokeWidth: 2 }}
              activeDot={{ r: 7.5, fill: '#D99A24' }}
              name="actual"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-5 border-t border-graphite-150 grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs font-mono text-graphite-600">
        <div>
          <span className="text-graphite-400 block text-[11px] mb-1">SCHEDULE VARIANCE</span>
          <span className="font-bold text-rose-700 text-sm">-7.0% (Behind Schedule)</span>
        </div>
        <div>
          <span className="text-graphite-400 block text-[11px] mb-1">CRITICAL PATH L5</span>
          <span className="font-bold text-graphite-900 text-sm">01 Pipeline Installation</span>
        </div>
        <div>
          <span className="text-graphite-400 block text-[11px] mb-1">ESTIMATED COMPLETION</span>
          <span className="font-bold text-graphite-900 text-sm">31 MAR 2027</span>
        </div>
        <div>
          <span className="text-graphite-400 block text-[11px] mb-1">VERIFIED FIELD LOGS</span>
          <span className="font-bold text-emerald-700 text-sm">124 Reports Processed</span>
        </div>
      </div>
    </div>
  );
};
