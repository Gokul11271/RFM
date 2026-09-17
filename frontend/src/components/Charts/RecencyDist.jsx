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
        <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl text-xs border border-slate-700">
          <p className="font-bold text-indigo-300">{d.range}</p>
          <p className="mt-1 text-slate-300">
            Customers: <strong className="text-white">{d.count.toLocaleString()}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="material-card p-5 flex flex-col justify-between h-full">
      
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            {activeTab === 'recency' ? <Clock className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {activeTab === 'recency' ? 'Recency Churn Decay Curve' : 'Purchase Frequency Distribution'}
            </h3>
            <p className="text-xs text-slate-500">
              {activeTab === 'recency' ? 'Customer inactivity and churn drop-off' : 'Order volume repetition buckets'}
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('recency')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'recency'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Recency
          </button>
          <button
            onClick={() => setActiveTab('frequency')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'frequency'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
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
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              radius={[6, 6, 0, 0]}
              fill={activeTab === 'recency' ? '#3b82f6' : '#8b5cf6'}
            >
              {data.map((entry, index) => {
                let color = activeTab === 'recency' ? '#3b82f6' : '#8b5cf6';
                if (activeTab === 'recency' && index >= 4) {
                  color = '#ef4444'; // Red for long inactivity
                }
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
        <span>{activeTab === 'recency' ? 'Left: Fresh buyers (<30d) | Right: Inactive / Lost (>1yr)' : 'Distribution of single vs repeat order buyers'}</span>
      </div>

    </div>
  );
}
