import React, { useState, useEffect } from 'react';
import { Columns, ArrowRight, CheckCircle2, AlertTriangle, Eye, Sparkles, X } from 'lucide-react';

export default function ColumnMapper({ 
  isOpen, 
  onClose, 
  previewData, 
  onConfirmMapping, 
  isAnalyzing 
}) {
  if (!isOpen || !previewData) return null;

  const { columns = [], detected_mapping = {}, preview_rows = [], filename = '' } = previewData;

  const [mapping, setMapping] = useState({
    customer_id: detected_mapping.customer_id || '',
    order_date: detected_mapping.order_date || '',
    order_id: detected_mapping.order_id || '',
    amount: detected_mapping.amount || '',
    category: detected_mapping.category || '',
  });

  useEffect(() => {
    if (detected_mapping) {
      setMapping({
        customer_id: detected_mapping.customer_id || '',
        order_date: detected_mapping.order_date || '',
        order_id: detected_mapping.order_id || '',
        amount: detected_mapping.amount || '',
        category: detected_mapping.category || '',
      });
    }
  }, [detected_mapping]);

  const isValid = mapping.customer_id && mapping.order_date && mapping.amount;

  const handleSelectChange = (field, value) => {
    setMapping(prev => ({ ...prev, [field]: value }));
  };

  const handleRun = () => {
    if (!isValid) return;
    onConfirmMapping(mapping);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-slate-900">Map Dataset Columns</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                {filename}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Confirm or adjust which columns correspond to RFM transaction parameters.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto py-5 space-y-6 flex-1 pr-1">
          
          {/* Mapping Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Customer ID */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center">
                  Customer ID <span className="text-rose-500 ml-1">*</span>
                </label>
                {mapping.customer_id && (
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-0.5" /> Mapped
                  </span>
                )}
              </div>
              <select
                value={mapping.customer_id}
                onChange={(e) => handleSelectChange('customer_id', e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">-- Select Column --</option>
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">Unique buyer identifier</p>
            </div>

            {/* Order Date */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center">
                  Order / Invoice Date <span className="text-rose-500 ml-1">*</span>
                </label>
                {mapping.order_date && (
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-0.5" /> Mapped
                  </span>
                )}
              </div>
              <select
                value={mapping.order_date}
                onChange={(e) => handleSelectChange('order_date', e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">-- Select Column --</option>
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">Used to compute Recency</p>
            </div>

            {/* Amount / Spend */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center">
                  Amount / Total Spend <span className="text-rose-500 ml-1">*</span>
                </label>
                {mapping.amount && (
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-0.5" /> Mapped
                  </span>
                )}
              </div>
              <select
                value={mapping.amount}
                onChange={(e) => handleSelectChange('amount', e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">-- Select Column --</option>
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">Used to compute Monetary value</p>
            </div>

            {/* Order ID (Optional) */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Order / Invoice ID <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
                </label>
                {mapping.order_id && (
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-0.5" /> Mapped
                  </span>
                )}
              </div>
              <select
                value={mapping.order_id}
                onChange={(e) => handleSelectChange('order_id', e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">-- None (Count Rows) --</option>
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">Deduplicates multi-item orders</p>
            </div>

            {/* Category (Optional) */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Product Category <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
                </label>
                {mapping.category && (
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-0.5" /> Mapped
                  </span>
                )}
              </div>
              <select
                value={mapping.category}
                onChange={(e) => handleSelectChange('category', e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">-- None --</option>
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">Product segment enrichment</p>
            </div>

          </div>

          {/* Live Data Preview */}
          {preview_rows && preview_rows.length > 0 && (
            <div className="bg-slate-900 rounded-xl p-4 text-white overflow-hidden shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-200">Raw Data Preview (First 5 Rows)</span>
                </div>
                <span className="text-[11px] text-slate-400">{columns.length} columns detected</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                      {columns.map(col => {
                        const isMapped = Object.values(mapping).includes(col);
                        return (
                          <th key={col} className={`p-2 whitespace-nowrap ${isMapped ? 'text-indigo-400 font-bold' : ''}`}>
                            {col}
                            {isMapped && <span className="ml-1 text-[9px] bg-indigo-500/20 text-indigo-300 px-1 py-0.2 rounded">✓</span>}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {preview_rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        {columns.map(col => (
                          <td key={col} className="p-2 whitespace-nowrap text-slate-300">
                            {String(row[col] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 shrink-0">
          {!isValid ? (
            <div className="flex items-center text-xs text-amber-600">
              <AlertTriangle className="w-4 h-4 mr-1.5" />
              <span>Please map Customer ID, Order Date, and Amount to proceed.</span>
            </div>
          ) : (
            <div className="flex items-center text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              <span>Ready for RFM computation and AI insights generation.</span>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={handleRun}
              disabled={!isValid || isAnalyzing}
              className="inline-flex items-center px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  <span>Computing RFM Quintiles...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span>Run RFM Analytics</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
