import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';

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
        <div className="bg-[#0e121a]/95 text-white p-3.5 rounded-2xl shadow-2xl text-xs border border-white/[0.12] pointer-events-none backdrop-blur-xl">
          <p className="font-extrabold text-white" style={{ color: SEGMENT_COLORS[d.name] || '#10b981' }}>{d.name}</p>
          <div className="mt-2 space-y-1 text-slate-300 font-mono text-[11px]">
            <p>Total Revenue: <strong className="text-emerald-400">₹{d.revenue.toLocaleString()}</strong> ({d.pctRevenue}%)</p>
            <p>Customer Accounts: <strong className="text-indigo-300">{d.customers.toLocaleString()}</strong> ({d.pctCustomers}%)</p>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Click bar to open strategy playbook →</p>
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
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Revenue Contribution by Segment</h3>
            <p className="text-[11px] text-slate-400">Segments driving financial value</p>
          </div>
        </div>
      </div>

      {/* Bar Chart Canvas */}
      <div className="h-64 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 75, bottom: 5 }}
          >
            <XAxis
              type="number"
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
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
                  fill={SEGMENT_COLORS[entry.name] || '#10b981'}
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="pt-2.5 border-t border-white/[0.06] text-[10px] text-slate-500 flex items-center justify-between">
        <span>Ranked by cumulative revenue</span>
        <span className="text-emerald-400 font-semibold cursor-pointer hover:underline" onClick={() => onSelectSegment(data[0]?.raw)}>
          Top Driver: {data[0]?.name}
        </span>
      </div>

    </div>
  );
}
