import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Upload, 
  RefreshCw, 
  BarChart3, 
  Layers, 
  ShieldAlert, 
  MessageSquareText,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  ArrowRight,
  Compass,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

import Header from './components/Header';
import LandingPage from './components/LandingPage/LandingPage';
import UploadModal from './components/UploadModal';
import ColumnMapper from './components/ColumnMapper';
import KpiCards from './components/KpiCards';
import SegmentDonut from './components/Charts/SegmentDonut';
import RfmScatter from './components/Charts/RfmScatter';
import RevenueBar from './components/Charts/RevenueBar';
import RecencyDist from './components/Charts/RecencyDist';
import SegmentTable from './components/SegmentTable';
import SegmentDrawer from './components/SegmentDrawer';
import AskAiChat from './components/AskAiChat';
import ExportModal from './components/ExportModal';
import ApiKeyModal from './components/ApiKeyModal';
import ShimmerDashboard from './components/ShimmerDashboard';

import { loadSampleAnalysis, loadSampleSaasAnalysis, analyzeDataset } from './services/api';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'dashboard'
  const [rfmData, setRfmData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeDatasetName, setActiveDatasetName] = useState('');
  const [snackbar, setSnackbar] = useState(null);

  // Modals & Drawers state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isMapperOpen, setIsMapperOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState(null);

  // Upload & Mapping Flow state
  const [pendingFile, setPendingFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // API Key state
  const [apiKey, setApiKey] = useState('');
  const [llmProvider, setLlmProvider] = useState('gemini');

  // Pre-load default retail dataset silently in background
  useEffect(() => {
    handleLoadSample(false, false);
  }, []);

  const showSnackbar = (message, type = 'info') => {
    setSnackbar({ message, type });
    setTimeout(() => {
      setSnackbar(null);
    }, 4000);
  };

  const handleLoadSample = async (notify = true, switchToDashboard = true) => {
    setIsLoading(true);
    try {
      if (notify) showSnackbar('Loading Global E-Commerce Retail dataset...', 'info');
      const data = await loadSampleAnalysis(apiKey);
      setRfmData(data);
      setActiveDatasetName('E-Commerce Retail');
      setIsLoading(false);
      if (switchToDashboard) {
        setCurrentView('dashboard');
      }
      if (notify) {
        showSnackbar('E-Commerce Retail dataset loaded & analyzed!', 'success');
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.85 } });
      }
    } catch (err) {
      setIsLoading(false);
      showSnackbar(`Failed to load retail sample: ${err.message}`, 'error');
    }
  };

  const handleLoadSaasSample = async (notify = true, switchToDashboard = true) => {
    setIsLoading(true);
    try {
      if (notify) showSnackbar('Loading B2B SaaS Subscriptions dataset...', 'info');
      const data = await loadSampleSaasAnalysis(apiKey);
      setRfmData(data);
      setActiveDatasetName('B2B SaaS Subscriptions');
      setIsLoading(false);
      if (switchToDashboard) {
        setCurrentView('dashboard');
      }
      if (notify) {
        showSnackbar('B2B SaaS dataset loaded & analyzed!', 'success');
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.85 } });
      }
    } catch (err) {
      setIsLoading(false);
      showSnackbar(`Failed to load SaaS sample: ${err.message}`, 'error');
    }
  };

  const handleFileReady = (file, preview) => {
    setPendingFile(file);
    setPreviewData(preview);
    setIsUploadOpen(false);
    setIsMapperOpen(true);
  };

  const handleConfirmMapping = async (mapping) => {
    setIsAnalyzing(true);
    showSnackbar('Computing RFM quintiles and generating AI insights...', 'info');
    try {
      const data = await analyzeDataset(pendingFile, mapping, apiKey);
      setRfmData(data);
      setActiveDatasetName(pendingFile ? pendingFile.name : 'Custom Dataset');
      setIsAnalyzing(false);
      setIsMapperOpen(false);
      setPendingFile(null);
      setPreviewData(null);
      setCurrentView('dashboard');
      showSnackbar('Analysis complete! Segment dashboard updated.', 'success');
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    } catch (err) {
      setIsAnalyzing(false);
      showSnackbar(`Analysis error: ${err.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      
      {/* Universal Header */}
      <Header
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onLoadSample={() => handleLoadSample(true, true)}
        onLoadSaasSample={() => handleLoadSaasSample(true, true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isLoading={isLoading}
        hasData={!!rfmData}
        activeDatasetName={activeDatasetName}
      />

      {/* VIEW 1: Educational Landing Page & Methodology Guide */}
      {currentView === 'landing' && (
        <LandingPage
          onLaunchDashboard={() => setCurrentView('dashboard')}
          onLoadSample={() => handleLoadSample(true, true)}
          onLoadSaasSample={() => handleLoadSaasSample(true, true)}
        />
      )}

      {/* VIEW 2: Analytics Dashboard Studio */}
      {currentView === 'dashboard' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20">
          
          {/* Subheader Banner / Return to Guide */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white shadow-md">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-white/10 text-indigo-300">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold flex items-center space-x-2">
                  <span>Executive RFM Intelligence Studio</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live Model
                  </span>
                </h2>
                <p className="text-xs text-slate-300">
                  Active Dataset: <strong className="text-white">{activeDatasetName || 'Default E-Commerce'}</strong> · {rfmData?.kpis?.total_customers?.toLocaleString() || 0} Analyzed Accounts
                </p>
              </div>
            </div>

            <button
              onClick={() => setCurrentView('landing')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer w-fit"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-300" />
              <span>Explore RFM Guide & Simulator</span>
            </button>
          </div>

          {/* Shimmer UI Loading State */}
          {isLoading ? (
            <ShimmerDashboard />
          ) : rfmData ? (
            <div className="space-y-6 animate-in fade-in duration-250">
              
              {/* KPI Cards Row */}
              <KpiCards kpis={rfmData.kpis} />

              {/* Visualizations Row 1: Donut + Scatter */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5">
                  <SegmentDonut
                    segments={rfmData.segments}
                    onSelectSegment={(seg) => setSelectedSegment(seg)}
                    selectedSegment={selectedSegment}
                  />
                </div>
                <div className="lg:col-span-7">
                  <RfmScatter
                    scatterData={rfmData.distributions.scatter_sample}
                    onSelectSegment={(seg) => setSelectedSegment(seg)}
                  />
                </div>
              </div>

              {/* Visualizations Row 2: Revenue Bar + Recency Decay */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6">
                  <RevenueBar
                    segments={rfmData.segments}
                    onSelectSegment={(seg) => setSelectedSegment(seg)}
                  />
                </div>
                <div className="lg:col-span-6">
                  <RecencyDist
                    distributions={rfmData.distributions}
                  />
                </div>
              </div>

              {/* Segment Drilldown Customer Table */}
              <div>
                <SegmentTable
                  customers={rfmData.top_customers}
                  segments={rfmData.segments}
                  onSelectSegment={(seg) => setSelectedSegment(seg)}
                  selectedSegmentFilter={selectedSegmentFilter}
                  onSetSegmentFilter={(segName) => setSelectedSegmentFilter(segName)}
                />
              </div>

            </div>
          ) : null}

        </main>
      )}

      {/* Floating Action Button (FAB) for Ask AI */}
      {rfmData && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-full shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-transform hover:scale-105 cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span className="text-xs font-bold tracking-wide">Ask Strategy AI</span>
        </button>
      )}

      {/* Snackbar Alert */}
      {snackbar && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className={`px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium flex items-center space-x-2 ${
            snackbar.type === 'success' 
              ? 'bg-slate-900 text-white border border-slate-700' 
              : snackbar.type === 'error'
              ? 'bg-rose-600 text-white'
              : 'bg-indigo-600 text-white'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{snackbar.message}</span>
          </div>
        </div>
      )}

      {/* Modals & Slide-Over Drawers */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onFileReady={handleFileReady}
        onLoadSample={() => handleLoadSample(true, true)}
      />

      <ColumnMapper
        isOpen={isMapperOpen}
        onClose={() => setIsMapperOpen(false)}
        previewData={previewData}
        onConfirmMapping={handleConfirmMapping}
        isAnalyzing={isAnalyzing}
      />

      <SegmentDrawer
        segment={selectedSegment}
        onClose={() => setSelectedSegment(null)}
        onFilterBySegment={(segName) => setSelectedSegmentFilter(segName)}
      />

      <AskAiChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        rfmData={rfmData}
        apiKey={apiKey}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        rfmData={rfmData}
        activeDatasetName={activeDatasetName}
      />

      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={(k) => setApiKey(k)}
        provider={llmProvider}
        onProviderChange={(p) => setLlmProvider(p)}
      />

    </div>
  );
}
