import React from 'react';
import { Users, DollarSign, ShoppingBag, Crown, AlertOctagon, Clock, Calendar } from 'lucide-react';

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
      title: 'Total Active Customers',
      value: total_customers.toLocaleString(),
      subtitle: `${total_transactions.toLocaleString()} total transactions`,
      icon: Users,
      color: 'indigo',
      accent: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      title: 'Total Platform Revenue',
      value: `$${total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `AOV: $${avg_order_value.toFixed(2)} / order`,
      icon: DollarSign,
      color: 'emerald',
      accent: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      title: 'Champions Revenue Share',
      value: `${champions_revenue_pct}%`,
      subtitle: `${champions_count.toLocaleString()} VIP accounts`,
      icon: Crown,
      color: 'amber',
      accent: 'bg-amber-50 text-amber-600 border-amber-100',
      badge: 'Core Drivers',
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      title: 'At-Risk Revenue Exposure',
      value: `${at_risk_revenue_pct}%`,
      subtitle: `${at_risk_count.toLocaleString()} customers in danger`,
      icon: AlertOctagon,
      color: 'rose',
      accent: 'bg-rose-50 text-rose-600 border-rose-100',
      badge: 'Urgent Win-Back',
      badgeColor: 'bg-rose-100 text-rose-800'
    },
    {
      title: 'Avg Customer Recency',
      value: `${avg_recency_days} days`,
      subtitle: `Avg purchase cadence: ${avg_frequency} orders`,
      icon: Clock,
      color: 'blue',
      accent: 'bg-blue-50 text-blue-600 border-blue-100',
    },
  ];

  return (
    <div className="space-y-4">
      
      {/* Date Range Banner */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center space-x-2">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <span>
            Transaction Period: <strong className="text-slate-700">{date_range_start}</strong> to <strong className="text-slate-700">{date_range_end}</strong>
          </span>
        </div>
        <div className="flex items-center space-x-4 mt-1 sm:mt-0">
          <span>Analysis Snapshot Date: <strong className="text-slate-700">{snapshot_date}</strong></span>
          <span className="hidden md:inline text-slate-300">|</span>
          <span className="hidden md:inline">11 Segments Computed</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="material-card p-4.5 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl border ${card.accent}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {card.badge && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                )}
              </div>

              <div className="mt-3">
                <p className="text-xs font-medium text-slate-500">{card.title}</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight">{card.value}</p>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">{card.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
