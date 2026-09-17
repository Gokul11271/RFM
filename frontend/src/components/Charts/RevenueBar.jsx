import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';

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

export default function RevenueBar({ segments, onSelectSegment }) {
  if (!segments || segments.length === 0) return null;

  const data = segments
    .filter(s => s.total_revenue > 0)
    .map(s => ({
      name: s.segment,
      revenue: s.total_revenue,
      customers: s.customer_count,
      pctRevenue: s.pct_of_revenue,
      pctCustomers: s.pct_of_customers,
      raw: s
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700 pointer-events-none">
          <p className="font-bold text-indigo-300">{d.name}</p>
          <div className="mt-1.5 space-y-1 text-slate-300">
            <p>Total Revenue: <strong className="text-emerald-400">${d.revenue.toLocaleString()}</strong> ({d.pctRevenue}%)</p>
            <p>Customer Volume: <strong className="text-blue-400">{d.customers.toLocaleString()}</strong> ({d.pctCustomers}%)</p>
          </div>
          <p className="text-[10px] text-indigo-400 mt-2">Click bar to inspect segment playbook →</p>
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
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Revenue Contribution by Segment</h3>
            <p className="text-xs text-slate-500">Segments driving financial value</p>
          </div>
        </div>
      </div>

      {/* Bar Chart Canvas */}
      <div className="h-64 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
          >
            <XAxis
              type="number"
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }}
              tickLine={false}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="revenue"
              radius={[0, 6, 6, 0]}
              cursor="pointer"
              onClick={(entry) => onSelectSegment(entry.raw)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={SEGMENT_COLORS[entry.name] || '#6366f1'}
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Ranked by aggregate monetary revenue</span>
        <span className="text-indigo-600 font-medium cursor-pointer" onClick={() => onSelectSegment(data[0]?.raw)}>
          Top Driver: {data[0]?.name}
        </span>
      </div>

    </div>
  );
}
