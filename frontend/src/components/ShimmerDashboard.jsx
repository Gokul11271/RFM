import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

export default function ShimmerDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Loading Status Pill */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-indigo-900 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <RefreshCw className="w-4 h-4 animate-spin" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Computing Vectorized RFM Quantiles</p>
            <p className="text-[11px] text-slate-500">Calculating Recency, Frequency & Spend distributions and AI playbooks...</p>
          </div>
        </div>
        <div className="h-6 w-24 rounded-full shimmer-animated" />
      </div>

      {/* KPI Cards Shimmer Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="material-card p-5 space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 w-24 rounded-md shimmer-animated" />
                <div className="h-7 w-32 rounded-lg shimmer-animated" />
              </div>
              <div className="w-10 h-10 rounded-xl shimmer-animated" />
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center space-x-2">
              <div className="h-4 w-12 rounded-md shimmer-animated" />
              <div className="h-3 w-28 rounded-md shimmer-animated" />
            </div>
          </div>
        ))}
      </div>

      {/* Secondary KPI Strip Shimmer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-2">
            <div className="h-3 w-20 rounded shimmer-animated" />
            <div className="h-5 w-24 rounded shimmer-animated" />
          </div>
        ))}
      </div>

      {/* Visualizations Row 1: Donut + Scatter Shimmer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Donut Card */}
        <div className="lg:col-span-5 material-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-5 w-40 rounded-md shimmer-animated" />
            <div className="h-4 w-16 rounded shimmer-animated" />
          </div>
          <div className="flex items-center justify-center py-6">
            <div className="w-48 h-48 rounded-full border-8 border-slate-100 shimmer-animated" />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            {[1, 2, 3, 4].map(j => (
              <div key={j} className="h-4 rounded shimmer-animated" />
            ))}
          </div>
        </div>

        {/* Scatter Card */}
        <div className="lg:col-span-7 material-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-5 w-48 rounded-md shimmer-animated" />
            <div className="h-4 w-20 rounded shimmer-animated" />
          </div>
          <div className="h-64 rounded-xl shimmer-animated" />
          <div className="flex justify-between pt-2">
            <div className="h-3 w-32 rounded shimmer-animated" />
            <div className="h-3 w-24 rounded shimmer-animated" />
          </div>
        </div>

      </div>

      {/* Visualizations Row 2: Revenue Bar + Recency Histogram Shimmer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 material-card p-6 space-y-4">
          <div className="h-5 w-44 rounded-md shimmer-animated" />
          <div className="space-y-3 py-2">
            {[1, 2, 3, 4, 5].map(k => (
              <div key={k} className="flex items-center space-x-3">
                <div className="w-24 h-3.5 rounded shimmer-animated" />
                <div className="flex-1 h-5 rounded-md shimmer-animated" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 material-card p-6 space-y-4">
          <div className="h-5 w-44 rounded-md shimmer-animated" />
          <div className="h-48 rounded-xl shimmer-animated" />
          <div className="flex justify-between pt-2">
            <div className="h-3 w-24 rounded shimmer-animated" />
            <div className="h-3 w-24 rounded shimmer-animated" />
          </div>
        </div>
      </div>

      {/* Customer Table Shimmer */}
      <div className="material-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div className="h-5 w-48 rounded-md shimmer-animated" />
          <div className="flex space-x-2">
            <div className="h-8 w-44 rounded-lg shimmer-animated" />
            <div className="h-8 w-28 rounded-lg shimmer-animated" />
          </div>
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5, 6].map(row => (
            <div key={row} className="flex items-center justify-between py-2 border-b border-slate-100/60 last:border-0">
              <div className="h-4 w-20 rounded shimmer-animated" />
              <div className="h-5 w-28 rounded-full shimmer-animated" />
              <div className="h-4 w-16 rounded shimmer-animated" />
              <div className="h-4 w-12 rounded shimmer-animated" />
              <div className="h-4 w-16 rounded shimmer-animated" />
              <div className="h-5 w-20 rounded shimmer-animated" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
