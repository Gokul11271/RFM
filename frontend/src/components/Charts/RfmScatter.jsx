import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip } from 'recharts';
import { Target } from 'lucide-react';

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

export default function RfmScatter({ scatterData, onSelectSegment }) {
  if (!scatterData || scatterData.length === 0) return null;

  const segmentGroups = {};
  scatterData.forEach(pt => {
    if (!segmentGroups[pt.segment]) {
      segmentGroups[pt.segment] = [];
    }
    segmentGroups[pt.segment].push(pt);
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0e121a]/95 text-white p-3.5 rounded-2xl shadow-2xl text-xs border border-white/[0.12] pointer-events-none backdrop-blur-xl">
          <div className="flex items-center justify-between space-x-3 pb-1 border-b border-white/[0.08]">
            <span className="font-bold text-white font-mono">Account {data.customer_id}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.10] text-amber-300 font-mono font-bold">
              RFM {data.rfm_score}
            </span>
          </div>
          <p className="font-semibold text-xs mt-2" style={{ color: SEGMENT_COLORS[data.segment] || '#10b981' }}>{data.segment}</p>
          <div className="mt-1.5 space-y-0.5 text-slate-300 font-mono text-[11px]">
            <p>Spend: <strong className="text-emerald-400">₹{data.monetary.toLocaleString()}</strong></p>
            <p>Orders: <strong className="text-indigo-300">{data.frequency}</strong></p>
            <p>Recency: <strong className="text-slate-200">{data.recency}d ago</strong></p>
          </div>
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
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">RFM Behavioral Scatter Map</h3>
            <p className="text-[11px] text-slate-400">Spend vs Order Cadence (Bubble volume = Recency freshness)</p>
          </div>
        </div>
        <div className="text-[10px] font-mono text-slate-400 hidden sm:block">
          {scatterData.length} sampled nodes
        </div>
      </div>

      {/* Scatter Canvas */}
      <div className="h-64 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 15, right: 20, bottom: 20, left: 10 }}>
            <XAxis
              type="number"
              dataKey="monetary"
              name="Monetary Spend"
              unit="₹"
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tick={{ fontSize: 10, fill: '#64748b' }}
              label={{ value: 'Spend (₹)', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#64748b' }}
            />
            <YAxis
              type="number"
              dataKey="frequency"
              name="Frequency"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#64748b' }}
              label={{ value: 'Orders', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }}
            />
            <ZAxis
              type="number"
              dataKey="recency"
              range={[35, 200]}
              name="Recency"
            />
            <Tooltip content={<CustomTooltip />} />
            
            {Object.keys(segmentGroups).map(segName => (
              <Scatter
                key={segName}
                name={segName}
                data={segmentGroups[segName]}
                fill={SEGMENT_COLORS[segName] || '#6366f1'}
                fillOpacity={0.75}
                cursor="pointer"
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06] text-[10px] text-slate-400">
        <div className="flex items-center space-x-3 font-medium">
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5" /> Champions
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-indigo-400 mr-1.5" /> Loyal
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-rose-400 mr-1.5" /> At Risk
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-slate-500 mr-1.5" /> Lost
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Hover node for RFM score</span>
      </div>

    </div>
  );
}
