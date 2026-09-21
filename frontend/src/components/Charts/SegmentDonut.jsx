import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

const SEGMENT_COLORS = {
  "Champions": "#10b981",
  "Loyal Customers": "#6366f1",
  "Potential Loyalists": "#06b6d4",
  "Recent Customers": "#0ea5e9",
  "Promising": "#a855f7",
  "Customers Needing Attention": "#f59e0b",
  "About to Sleep": "#f97316",
  "At Risk": "#f43f5e",
  "Can't Lose Them": "#e11d48",
  "Hibernating": "#64748b",
  "Lost": "#475569"
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
        <div className="bg-[#0e121a]/95 text-white p-3.5 rounded-2xl shadow-2xl text-xs border border-white/[0.12] pointer-events-none backdrop-blur-xl">
          <p className="font-extrabold text-sm text-white" style={{ color: d.color }}>{d.name}</p>
          <div className="mt-2 space-y-1 font-mono text-[11px]">
            <p className="text-slate-300">
              Customers: <strong className="text-white">{d.raw.customer_count.toLocaleString()}</strong> ({d.raw.pct_of_customers}%)
            </p>
            <p className="text-slate-300">
              Revenue: <strong className="text-white">${d.raw.total_revenue.toLocaleString()}</strong> ({d.raw.pct_of_revenue}%)
            </p>
            <p className="text-slate-300">
              Avg Recency: <strong className="text-white">{d.raw.avg_recency_days}d</strong>
            </p>
            <p className="text-slate-300">
              Avg Spend: <strong className="text-white">${d.raw.avg_monetary.toFixed(2)}</strong>
            </p>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Click slice to open strategy playbook →</p>
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
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Segment Distribution</h3>
            <p className="text-[11px] text-slate-400">Customer volume vs revenue concentration</p>
          </div>
        </div>

        {/* Metric Toggle */}
        <div className="flex items-center bg-white/[0.04] p-0.5 rounded-xl border border-white/[0.08]">
          <button
            onClick={() => setMetric('customers')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              metric === 'customers'
                ? 'bg-white/[0.14] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Count
          </button>
          <button
            onClick={() => setMetric('revenue')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              metric === 'revenue'
                ? 'bg-white/[0.14] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Revenue
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
              paddingAngle={2.5}
              dataKey="value"
              cursor="pointer"
              onClick={(entry) => onSelectSegment(entry.raw)}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  stroke={selectedSegment?.segment === entry.name ? '#ffffff' : '#090b10'}
                  strokeWidth={selectedSegment?.segment === entry.name ? 2.5 : 1}
                  className="transition-all hover:opacity-80 cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Mini Interactive Segment Chips */}
      <div className="flex flex-wrap gap-1.5 pt-2.5 border-t border-white/[0.06] max-h-24 overflow-y-auto">
        {data.map((item) => (
          <button
            key={item.name}
            onClick={() => onSelectSegment(item.raw)}
            className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer border ${
              selectedSegment?.segment === item.name
                ? 'bg-white/[0.16] text-white border-white/[0.30] shadow-sm'
                : 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.07] border-white/[0.05]'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full mr-1.5 shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span>{item.name}</span>
            <span className="ml-1 text-[9px] opacity-70 font-mono">
              ({metric === 'customers' ? `${item.pct}%` : `$${(item.value / 1000).toFixed(1)}k`})
            </span>
          </button>
        ))}
      </div>

    </div>
  );
}
