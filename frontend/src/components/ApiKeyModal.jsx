import React, { useState } from 'react';
import { Key, Sparkles, X, ShieldCheck } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-[#0e121a] text-slate-100 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/[0.10] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">LLM Provider Settings</h3>
              <p className="text-xs text-slate-400">Connect your custom AI API key (Optional)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-5 space-y-4">
          
          <div className="p-3.5 bg-white/[0.03] rounded-2xl border border-white/[0.07] flex items-start space-x-2.5 text-xs text-slate-300 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              The platform includes a built-in offline analytical intelligence engine that works 100% out-of-the-box. Providing an API key enables live frontier LLM reasoning.
            </span>
          </div>

          {/* Provider Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Select LLM Provider</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'gemini', label: 'Google Gemini' },
                { id: 'claude', label: 'Anthropic Claude' },
                { id: 'openai', label: 'OpenAI GPT-4' }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProvider(p.id)}
                  className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                    selectedProvider === p.id
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'border-white/[0.08] text-slate-400 hover:bg-white/[0.04]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Key Input */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">API Key</label>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="Paste your API key here..."
              className="w-full px-3.5 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:border-amber-400/50 font-mono text-white placeholder:text-slate-500"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
          <button
            onClick={() => {
              setTempKey('');
              onSaveApiKey('');
              onClose();
            }}
            className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
          >
            Clear Key
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Save Settings
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
