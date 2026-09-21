import React from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Gift, 
  Radio, 
  TrendingUp, 
  Filter
} from 'lucide-react';

const TAG_STYLES = {
  "Retain": "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  "Win-Back": "bg-rose-500/15 text-rose-300 border-rose-500/30",
  "Upsell": "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  "Nurture": "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  "Reward": "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

export default function SegmentDrawer({ 
  segment, 
  onClose, 
  onFilterBySegment 
}) {
  if (!segment) return null;

  const insight = segment.insight || {};
  const actions = insight.recommended_actions || [];
  const channels = insight.best_channels || [];

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'critical': return 'text-rose-400 bg-rose-500/15 border-rose-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/15 border-orange-500/30';
      case 'medium':
      case 'medium-high':
      case 'medium-low': return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
      default: return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      
      {/* Click outside backdrop */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Container */}
      <div className="w-full max-w-xl bg-[#0e121a] text-slate-100 shadow-2xl h-full flex flex-col border-l border-white/[0.10] animate-in slide-in-from-right duration-250">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-white/[0.08] bg-white/[0.02] shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black text-white">{segment.segment}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  <Sparkles className="w-3 h-3 mr-1 text-amber-400" />
                  AI Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                {insight.headline || 'Segment Executive Analysis'}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Segment Stats Strip */}
          <div className="grid grid-cols-4 gap-2 mt-4 text-center font-mono">
            <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.06]">
              <span className="text-[9px] text-slate-400 font-semibold uppercase block font-sans">Accounts</span>
              <span className="text-sm font-bold text-white">{segment.customer_count.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 block">({segment.pct_of_customers}%)</span>
            </div>
            <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.06]">
              <span className="text-[9px] text-slate-400 font-semibold uppercase block font-sans">Revenue</span>
              <span className="text-sm font-bold text-emerald-400">₹{segment.total_revenue.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 block">({segment.pct_of_revenue}%)</span>
            </div>
            <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.06]">
              <span className="text-[9px] text-slate-400 font-semibold uppercase block font-sans">Avg Spend</span>
              <span className="text-sm font-bold text-white">₹{segment.avg_monetary.toFixed(0)}</span>
              <span className="text-[10px] text-slate-400 block">{segment.avg_frequency} orders</span>
            </div>
            <div className="bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.06]">
              <span className="text-[9px] text-slate-400 font-semibold uppercase block font-sans">Recency</span>
              <span className="text-sm font-bold text-white">{segment.avg_recency_days}d</span>
              <span className="text-[10px] text-slate-400 block">average</span>
            </div>
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Churn Risk & Strategic Priority */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
            <div>
              <span className="text-[11px] text-slate-400 font-medium">Churn Risk Exposure</span>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRiskColor(insight.churn_risk)}`}>
                  {insight.churn_risk || 'Medium'} Risk
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  (Score: {insight.risk_score || 50}/100)
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 font-medium">Retention Priority</span>
              <p className="text-xs font-bold text-amber-300 mt-1">
                {insight.retention_priority || 'P2 - High'}
              </p>
            </div>
          </div>

          {/* Business Impact Narrative */}
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              Executive Business Narrative
            </h4>
            <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/[0.07] text-xs text-slate-300 leading-relaxed">
              {insight.business_impact}
            </div>
          </div>

          {/* Tactical Recommendations */}
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Recommended Playbook Actions ({actions.length})
            </h4>
            
            <div className="space-y-2.5">
              {actions.map((act, idx) => (
                <div key={idx} className="p-3.5 bg-white/[0.03] rounded-xl border border-white/[0.06] hover:border-white/[0.14] transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">{act.title}</span>
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${TAG_STYLES[act.tag] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                      {act.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{act.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Campaign Offer */}
          {insight.suggested_offer && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center space-x-2 text-amber-300 mb-1">
                <Gift className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold">Suggested Playbook Offer</span>
              </div>
              <p className="text-xs text-amber-200 font-medium mt-1">
                "{insight.suggested_offer}"
              </p>
            </div>
          )}

          {/* Best Channels */}
          {channels.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                <Radio className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                Optimal Engagement Channels
              </h4>
              <div className="flex flex-wrap gap-2">
                {channels.map((ch, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white/[0.04] text-slate-300 rounded-lg text-xs font-medium border border-white/[0.07]">
                    {ch}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-white/[0.08] bg-white/[0.02] flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              onFilterBySegment(segment.segment);
              onClose();
            }}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl border border-amber-500/30 transition-colors cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 mr-1.5" />
            <span>Filter Customer Table to this Segment</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>

    </div>
  );
}
