import React from 'react';
import { Users, IndianRupee, Crown, AlertOctagon, Clock, Calendar, Sparkles } from 'lucide-react';

export default function KpiCards({ kpis }) {
  if (!kpis) return null;

  const {
    total_customers = 0,
    total_revenue = 0,
    avg_order_value = 0,
    avg_recency_days = 0,
    avg_frequency = 0,
    champions_count = 0,
    champions_revenue_pct = 0,
    at_risk_count = 0,
    at_risk_revenue_pct = 0,
    lost_count = 0,
    date_range_start = '',
    date_range_end = '',
    snapshot_date = '',
    total_transactions = 0
  } = kpis;

  const cards = [
    {
      title: 'Active Customers',
      value: total_customers.toLocaleString(),
      subtitle: `${total_transactions.toLocaleString()} total orders`,
      icon: Users,
      accentBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    },
    {
      title: 'Cumulative Revenue',
      value: `₹${total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `AOV: ₹${avg_order_value.toFixed(2)} / basket`,
      icon: IndianRupee,
      accentBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      title: 'Champions Share',
      value: `${champions_revenue_pct}%`,
      subtitle: `${champions_count.toLocaleString()} VIP accounts`,
      icon: Crown,
      accentBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      badge: 'Core Revenue',
      badgeStyle: 'bg-amber-500/10 text-amber-300 border-amber-500/30'
    },
    {
      title: 'At-Risk Revenue',
      value: `${at_risk_revenue_pct}%`,
      subtitle: `${at_risk_count.toLocaleString()} slipping buyers`,
      icon: AlertOctagon,
      accentBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      badge: 'Urgent Defense',
      badgeStyle: 'bg-rose-500/10 text-rose-300 border-rose-500/30'
    },
    {
      title: 'Average Recency',
      value: `${avg_recency_days}d`,
      subtitle: `Avg cadence: ${avg_frequency} orders`,
      icon: Clock,
      accentBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    },
  ];

  return (
    <div className="space-y-3.5">
      
      {/* Date Range & Metadata Banner */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 bg-white/[0.03] px-4 py-2.5 rounded-2xl border border-white/[0.07] backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>
            Transaction Period: <strong className="text-slate-200">{date_range_start}</strong> to <strong className="text-slate-200">{date_range_end}</strong>
          </span>
        </div>
        <div className="flex items-center space-x-4 mt-1 sm:mt-0 text-[11px]">
          <span>Snapshot Date: <strong className="text-slate-200">{snapshot_date}</strong></span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-400">11 Segments Active</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="material-card p-4.5 flex flex-col justify-between relative overflow-hidden group hover:border-white/[0.16] transition-all"
            >
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-xl border ${card.accentBg} transition-transform group-hover:scale-105`}>
                  <Icon className="w-4 h-4" />
                </div>
                {card.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${card.badgeStyle}`}>
                    {card.badge}
                  </span>
                )}
              </div>

              <div className="mt-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{card.title}</p>
                <p className="text-xl font-extrabold text-white mt-0.5 font-mono tracking-tight">{card.value}</p>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">{card.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
