import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { PieChart as PieIcon, Info } from 'lucide-react';

const SEGMENT_COLORS = {
  "Champions": "#10b981",
  "Loyal Customers": "#3b82f6",
  "Potential Loyalists": "#06b6d4",
  "Recent Customers": "#0284c7",
  "Promising": "#8b5cf6",
  "Customers Needing Attention": "#f59e0b",
  "About to Sleep": "#ea580c",
  "At Risk": "#ef4444",
  "Can't Lose Them": "#e11d48",
  "Hibernating": "#64748b",
  "Lost": "#94a3b8"
};

export default function SegmentDonut({ segments, onSelectSegment, selectedSegment }) {
  const [metric, setMetric] = useState('customers'); // 'customers' or 'revenue'

  if (!segments || segments.length === 0) return null;

  const data = segments
    .filter(s => s.customer_count > 0)
    .map(s => ({
      name: s.segment,
      value: metric === 'customers' ? s.customer_count : s.total_revenue,
      pct: metric === 'customers' ? s.pct_of_customers : s.pct_of_revenue,
      raw: s,
      color: SEGMENT_COLORS[s.segment] || '#6366f1'
    }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700 pointer-events-none">
          <p className="font-bold text-sm text-indigo-300">{d.name}</p>
          <div className="mt-1.5 space-y-1">
            <p className="text-slate-300">
              Customers: <strong className="text-white">{d.raw.customer_count.toLocaleString()}</strong> ({d.raw.pct_of_customers}%)
            </p>
            <p className="text-slate-300">
              Revenue: <strong className="text-white">${d.raw.total_revenue.toLocaleString()}</strong> ({d.raw.pct_of_revenue}%)
            </p>
            <p className="text-slate-300">
              Avg Recency: <strong className="text-white">{d.raw.avg_recency_days} days</strong>
            </p>
            <p className="text-slate-300">
              Avg Spend: <strong className="text-white">${d.raw.avg_monetary.toFixed(2)}</strong>
            </p>
          </div>
          <p className="text-[10px] text-indigo-400 mt-2 font-medium">Click slice for AI strategy deep-dive →</p>
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
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Segment Distribution</h3>
            <p className="text-xs text-slate-500">Breakdown of customer base & revenue share</p>
          </div>
        </div>

        {/* Metric Toggle */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => setMetric('customers')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              metric === 'customers'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            By Count
          </button>
          <button
            onClick={() => setMetric('revenue')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              metric === 'revenue'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            By Revenue
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={95}
              paddingAngle={2}
              dataKey="value"
              cursor="pointer"
              onClick={(entry) => onSelectSegment(entry.raw)}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  stroke={selectedSegment?.segment === entry.name ? '#1e1b4b' : '#ffffff'}
                  strokeWidth={selectedSegment?.segment === entry.name ? 3 : 1}
                  className="transition-all hover:opacity-80 cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Mini Interactive Segment Chips */}
      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 max-h-24 overflow-y-auto">
        {data.map((item) => (
          <button
            key={item.name}
            onClick={() => onSelectSegment(item.raw)}
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
              selectedSegment?.segment === item.name
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full mr-1.5 shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span>{item.name}</span>
            <span className="ml-1 text-[10px] opacity-70">
              ({metric === 'customers' ? `${item.pct}%` : `$${(item.value / 1000).toFixed(1)}k`})
            </span>
          </button>
        ))}
      </div>

    </div>
  );
}
