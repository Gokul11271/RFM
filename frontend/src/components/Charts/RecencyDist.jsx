import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Clock, Layers } from 'lucide-react';

export default function RecencyDist({ distributions }) {
  const [activeTab, setActiveTab] = useState('recency'); // 'recency' or 'frequency'

  if (!distributions) return null;

  const { recency_histogram = [], frequency_histogram = [] } = distributions;

  const data = activeTab === 'recency' ? recency_histogram : frequency_histogram;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-[#0e121a]/95 text-white p-3 rounded-2xl shadow-2xl text-xs border border-white/[0.12] backdrop-blur-xl">
          <p className="font-extrabold text-white text-xs">{d.range}</p>
          <p className="mt-1 text-slate-300 font-mono text-[11px]">
            Customer Accounts: <strong className="text-amber-400">{d.count.toLocaleString()}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="material-card p-5 flex flex-col justify-between h-full">
      
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            {activeTab === 'recency' ? <Clock className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              {activeTab === 'recency' ? 'Recency Churn Decay Curve' : 'Purchase Frequency Distribution'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {activeTab === 'recency' ? 'Inactivity intervals & drop-off thresholds' : 'Single vs repeat buyer cohorts'}
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-white/[0.04] p-0.5 rounded-xl border border-white/[0.08]">
          <button
            onClick={() => setActiveTab('recency')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'recency'
                ? 'bg-white/[0.14] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Recency
          </button>
          <button
            onClick={() => setActiveTab('frequency')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'frequency'
                ? 'bg-white/[0.14] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Frequency
          </button>
        </div>
      </div>

      {/* Histogram Canvas */}
      <div className="h-64 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 15, right: 10, left: -20, bottom: 20 }}>
            <XAxis
              dataKey="range"
              tick={{ fontSize: 9, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              radius={[6, 6, 0, 0]}
              fill={activeTab === 'recency' ? '#6366f1' : '#a855f7'}
            >
              {data.map((entry, index) => {
                let color = activeTab === 'recency' ? '#6366f1' : '#a855f7';
                if (activeTab === 'recency' && index >= 4) {
                  color = '#f43f5e'; // Red for long dormancy
                }
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="pt-2.5 border-t border-white/[0.06] text-[10px] text-slate-500 flex items-center justify-between font-mono">
        <span>{activeTab === 'recency' ? 'Fresh (0-30d) ──→ Dormant (>1yr)' : '1 Order ──→ 12+ Repeat Orders'}</span>
      </div>

    </div>
  );
}
