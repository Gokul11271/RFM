import React, { useState } from 'react';
import { Key, Sparkles, CheckCircle2, X, ShieldCheck } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose, apiKey, onSaveApiKey, onProviderChange, provider }) {
  const [tempKey, setTempKey] = useState(apiKey || '');
  const [selectedProvider, setSelectedProvider] = useState(provider || 'gemini');

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(tempKey.trim());
    if (onProviderChange) onProviderChange(selectedProvider);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">LLM Provider Configuration</h3>
              <p className="text-xs text-slate-500">Connect your custom AI API key (Optional)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-5 space-y-4">
          
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start space-x-2 text-xs text-indigo-900">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              The app includes a built-in offline analytical intelligence engine that works 100% out-of-the-box. Supplying an API key enables live frontier model responses.
            </span>
          </div>

          {/* Provider Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Select LLM Provider</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'gemini', label: 'Google Gemini' },
                { id: 'claude', label: 'Claude (Anthropic)' },
                { id: 'openai', label: 'OpenAI GPT-4' }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProvider(p.id)}
                  className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                    selectedProvider === p.id
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Key Input */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">API Key</label>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="Paste your API key here..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-slate-800"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              setTempKey('');
              onSaveApiKey('');
              onClose();
            }}
            className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Clear Key
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Save Settings
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
