import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip } from 'recharts';
import { Target, Info } from 'lucide-react';

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

export default function RfmScatter({ scatterData, onSelectSegment }) {
  if (!scatterData || scatterData.length === 0) return null;

  // Group by segment to create distinct colored scatter series
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
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700 pointer-events-none">
          <div className="flex items-center justify-between space-x-2">
            <span className="font-bold text-indigo-300">Customer {data.customer_id}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              Score: {data.rfm_score}
            </span>
          </div>
          <p className="font-semibold text-white mt-1">{data.segment}</p>
          <div className="mt-2 space-y-0.5 text-slate-300">
            <p>Monetary (Spend): <strong className="text-emerald-400">${data.monetary.toLocaleString()}</strong></p>
            <p>Frequency (Orders): <strong className="text-blue-400">{data.frequency}</strong></p>
            <p>Recency (Days): <strong className="text-amber-400">{data.recency} days ago</strong></p>
          </div>
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
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">RFM Behavioral Scatter Plot</h3>
            <p className="text-xs text-slate-500">Spend vs Order Cadence (Bubble size = Recency freshness)</p>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 hidden sm:block">
          Showing {scatterData.length} customer sample
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
              unit="$"
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{ value: 'Total Spend ($)', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#94a3b8' }}
            />
            <YAxis
              type="number"
              dataKey="frequency"
              name="Frequency"
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{ value: 'Orders Count', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8' }}
            />
            <ZAxis
              type="number"
              dataKey="recency"
              range={[30, 220]}
              name="Recency"
            />
            <Tooltip content={<CustomTooltip />} />
            
            {Object.keys(segmentGroups).map(segName => (
              <Scatter
                key={segName}
                name={segName}
                data={segmentGroups[segName]}
                fill={SEGMENT_COLORS[segName] || '#6366f1'}
                fillOpacity={0.7}
                cursor="pointer"
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
        <div className="flex items-center space-x-3">
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1" /> Champions
          </span>
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-1" /> Loyal
          </span>
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-1" /> At Risk
          </span>
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 mr-1" /> Lost / Dormant
          </span>
        </div>
        <span className="text-[10px] text-slate-400">Hover bubble for RFM score</span>
      </div>

    </div>
  );
}
