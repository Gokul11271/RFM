import React from 'react';
import { 
  X, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  Gift, 
  Radio, 
  TrendingUp, 
  ShieldAlert, 
  ArrowRight,
  Filter
} from 'lucide-react';

const TAG_STYLES = {
  "Retain": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Win-Back": "bg-rose-50 text-rose-700 border-rose-200",
  "Upsell": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Nurture": "bg-blue-50 text-blue-700 border-blue-200",
  "Reward": "bg-amber-50 text-amber-700 border-amber-200",
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
      case 'critical': return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
      case 'medium-high':
      case 'medium-low': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      
      {/* Click outside backdrop */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Container */}
      <div className="w-full max-w-xl bg-white shadow-2xl h-full flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-250">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-slate-900">{segment.segment}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Sparkles className="w-3 h-3 mr-1 text-indigo-500" />
                  AI Strategy
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {insight.headline || 'Segment Executive Analysis'}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Segment Stats Strip */}
          <div className="grid grid-cols-4 gap-2 mt-4 text-center">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Customers</span>
              <span className="text-sm font-bold text-slate-800">{segment.customer_count.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 block">({segment.pct_of_customers}%)</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Revenue</span>
              <span className="text-sm font-bold text-emerald-700">${segment.total_revenue.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 block">({segment.pct_of_revenue}%)</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Avg Spend</span>
              <span className="text-sm font-bold text-slate-800">${segment.avg_monetary.toFixed(0)}</span>
              <span className="text-[10px] text-slate-500 block">{segment.avg_frequency} orders</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Recency</span>
              <span className="text-sm font-bold text-slate-800">{segment.avg_recency_days}d</span>
              <span className="text-[10px] text-slate-500 block">average</span>
            </div>
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Churn Risk & Strategic Priority */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-xs text-slate-500 font-medium">Churn Risk Level</span>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRiskColor(insight.churn_risk)}`}>
                  {insight.churn_risk || 'Medium'} Churn Risk
                </span>
                <span className="text-xs text-slate-400 font-mono font-medium">
                  (Score: {insight.risk_score || 50}/100)
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium">Action Priority</span>
              <p className="text-xs font-bold text-indigo-700 mt-1">
                {insight.retention_priority || 'P2 - High'}
              </p>
            </div>
          </div>

          {/* Business Impact Narrative */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
              Executive Business Narrative
            </h4>
            <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100 text-xs text-slate-700 leading-relaxed">
              {insight.business_impact}
            </div>
          </div>

          {/* Tactical Recommendations */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              Recommended Marketing Actions ({actions.length})
            </h4>
            
            <div className="space-y-3">
              {actions.map((act, idx) => (
                <div key={idx} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-200 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">{act.title}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${TAG_STYLES[act.tag] || 'bg-slate-100 text-slate-700'}`}>
                      {act.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Campaign Offer */}
          {insight.suggested_offer && (
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
              <div className="flex items-center space-x-2 text-amber-900 mb-1">
                <Gift className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold">Suggested Playbook Offer</span>
              </div>
              <p className="text-xs text-amber-800 font-medium mt-1">
                "{insight.suggested_offer}"
              </p>
            </div>
          )}

          {/* Best Channels */}
          {channels.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
                <Radio className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                Optimal Engagement Channels
              </h4>
              <div className="flex flex-wrap gap-2">
                {channels.map((ch, idx) => (
                  <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200">
                    {ch}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              onFilterBySegment(segment.segment);
              onClose();
            }}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 mr-1.5" />
            <span>Filter Customer Table to this Segment</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>

    </div>
  );
}
