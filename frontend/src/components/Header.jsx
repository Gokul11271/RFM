import React, { useState } from 'react';
import { 
  BarChart3, 
  Upload, 
  Sparkles, 
  Download, 
  FileSpreadsheet, 
  Settings, 
  RefreshCw,
  MessageSquareText,
  Compass,
  LayoutDashboard,
  ChevronDown,
  ShoppingBag,
  Building2
} from 'lucide-react';

export default function Header({ 
  currentView = 'landing',
  onNavigate,
  onOpenUpload, 
  onLoadSample,
  onLoadSaasSample, 
  onOpenChat, 
  onOpenExport, 
  onOpenSettings,
  isLoading,
  hasData,
  activeDatasetName
}) {
  const [isDatasetDropdownOpen, setIsDatasetDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#090b10]/85 backdrop-blur-xl border-b border-white/[0.08] text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-6">
            <div 
              onClick={() => onNavigate('landing')}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/20 to-amber-400/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10 group-hover:border-amber-400/60 transition-all">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-base tracking-tight text-white">RFM Analytics</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    <Sparkles className="w-2.5 h-2.5 mr-1 text-amber-400" />
                    AI Intelligence
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">Executive Customer Segmentation & Churn Science</p>
              </div>
            </div>

            {/* View Switcher Tabs */}
            <nav className="hidden md:flex items-center space-x-1 p-1 bg-white/[0.04] rounded-xl border border-white/[0.08]">
              <button
                onClick={() => onNavigate('landing')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentView === 'landing'
                    ? 'bg-white/[0.12] text-white shadow-xs border border-white/[0.12]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Overview & Guide</span>
              </button>

              <button
                onClick={() => onNavigate('dashboard')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentView === 'dashboard'
                    ? 'bg-white/[0.12] text-white shadow-xs border border-white/[0.12]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
                <span>Analytics Studio</span>
              </button>
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Dataset Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDatasetDropdownOpen(!isDatasetDropdownOpen)}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-200 bg-white/[0.05] hover:bg-white/[0.09] rounded-xl transition-colors border border-white/[0.08] cursor-pointer disabled:opacity-50"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                <span className="hidden sm:inline max-w-[130px] truncate text-[11px]">
                  {activeDatasetName || 'Datasets'}
                </span>
                <ChevronDown className="w-3 h-3 ml-1.5 text-slate-400" />
              </button>

              {isDatasetDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-[#0e121a]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/[0.12] py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setIsDatasetDropdownOpen(false)}
                >
                  <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Sample Datasets
                  </div>
                  
                  {/* Retail Sample */}
                  <button
                    onClick={() => {
                      onLoadSample(true);
                      onNavigate('dashboard');
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs hover:bg-white/[0.06] flex items-center space-x-2.5 text-slate-200 cursor-pointer"
                  >
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">E-Commerce Retail</p>
                      <p className="text-[10px] text-slate-400">4,200 orders · 750 customers</p>
                    </div>
                  </button>

                  {/* SaaS Sample */}
                  <button
                    onClick={() => {
                      onLoadSaasSample(true);
                      onNavigate('dashboard');
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs hover:bg-white/[0.06] flex items-center space-x-2.5 text-slate-200 cursor-pointer"
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">B2B SaaS Subscriptions</p>
                      <p className="text-[10px] text-slate-400">2,800 cycles · 400 accounts</p>
                    </div>
                  </button>

                  <div className="my-1.5 border-t border-white/[0.08]" />

                  {/* Upload Custom */}
                  <button
                    onClick={() => onOpenUpload()}
                    className="w-full px-3.5 py-2 text-left text-xs hover:bg-white/[0.06] flex items-center space-x-2 text-amber-400 font-semibold cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 shrink-0" />
                    <span>Upload Custom CSV / XLSX</span>
                  </button>
                </div>
              )}
            </div>

            {/* Upload File Button */}
            <button
              onClick={onOpenUpload}
              disabled={isLoading}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5 text-slate-900" />
              <span className="hidden sm:inline">Upload Data</span>
              <span className="sm:hidden">Upload</span>
            </button>

            {/* Ask AI Copilot Button */}
            {hasData && (
              <button
                onClick={onOpenChat}
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                <span className="hidden md:inline">Ask AI</span>
              </button>
            )}

            {/* Export Report */}
            {hasData && (
              <button
                onClick={onOpenExport}
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] rounded-xl transition-colors cursor-pointer"
                title="Export report"
              >
                <Download className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                <span className="hidden lg:inline">Export</span>
              </button>
            )}

            {/* Settings Modal */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors cursor-pointer"
              title="LLM API Key Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
