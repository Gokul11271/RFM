import React from 'react';
import { 
  BarChart3, 
  Upload, 
  Sparkles, 
  Download, 
  FileSpreadsheet, 
  Settings, 
  RefreshCw,
  MessageSquareText
} from 'lucide-react';

export default function Header({ 
  onOpenUpload, 
  onLoadSample, 
  onOpenChat, 
  onOpenExport, 
  onOpenSettings,
  isLoading,
  hasData,
  activeDatasetName
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">RFM Analytics</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  <Sparkles className="w-3 h-3 mr-1 text-indigo-500" />
                  AI Powered
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Customer Quantile Segmentation & Strategy Engine</p>
            </div>
          </div>

          {/* Active Dataset Pill */}
          {hasData && activeDatasetName && (
            <div className="hidden md:flex items-center px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-xs text-slate-600">
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              <span>Dataset: <strong className="text-slate-800 font-medium">{activeDatasetName}</strong></span>
            </div>
          )}

          {/* Header Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* 1-Click Load Sample */}
            <button
              onClick={onLoadSample}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 text-xs sm:text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 rounded-lg transition-colors border border-indigo-200/60 cursor-pointer disabled:opacity-50"
              title="Load standard UCI Online Retail e-commerce dataset"
            >
              <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Load Sample Data</span>
              <span className="sm:hidden">Sample</span>
            </button>

            {/* Upload File */}
            <button
              onClick={onOpenUpload}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-4 h-4 mr-1.5" />
              <span>Upload CSV / XLSX</span>
            </button>

            {/* Ask AI Copilot Button */}
            {hasData && (
              <button
                onClick={onOpenChat}
                className="inline-flex items-center px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-indigo-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <MessageSquareText className="w-4 h-4 mr-1.5 text-indigo-500" />
                <span className="hidden md:inline">Ask AI</span>
              </button>
            )}

            {/* Export Report */}
            {hasData && (
              <button
                onClick={onOpenExport}
                className="inline-flex items-center px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Export customer list and summary report"
              >
                <Download className="w-4 h-4 mr-1.5 text-slate-500" />
                <span className="hidden lg:inline">Export</span>
              </button>
            )}

            {/* Settings Modal (API Key) */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
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
