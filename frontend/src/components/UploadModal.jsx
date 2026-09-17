import React, { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle, Download, CheckCircle2 } from 'lucide-react';
import { uploadFilePreview } from '../services/api';

export default function UploadModal({ isOpen, onClose, onFileReady, onLoadSample }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (file) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith('.csv') && !name.endsWith('.xlsx') && !name.endsWith('.xls')) {
      setError('Please upload a valid CSV or Excel (.xlsx) file.');
      return;
    }

    setError(null);
    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const previewData = await uploadFilePreview(file);
      setIsProcessing(false);
      onFileReady(file, previewData);
    } catch (err) {
      setIsProcessing(false);
      setError(err.message || 'Failed to parse file preview. Check file structure.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Upload Transaction Dataset</h3>
            <p className="text-xs text-slate-500 mt-0.5">Upload your raw e-commerce or SaaS transaction data</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-5 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50'
              : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Upload className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              {isProcessing ? 'Inspecting file structure...' : 'Click to browse or drag & drop'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Supports CSV or Excel (.xlsx, .xls) up to 50MB</p>
          </div>
        </div>

        {/* Required Data Shape Guide */}
        <div className="mt-5 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Required Transaction Columns</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600">
            <div className="bg-white p-2 rounded-lg border border-slate-200/60">
              <span className="font-semibold text-indigo-700 block">CustomerID</span>
              <span className="text-[11px] text-slate-400">e.g. C1001, 1234</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200/60">
              <span className="font-semibold text-indigo-700 block">Order Date</span>
              <span className="text-[11px] text-slate-400">e.g. 2024-05-01</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200/60">
              <span className="font-semibold text-indigo-700 block">Order / Inv ID</span>
              <span className="text-[11px] text-slate-400">e.g. INV-1001</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200/60">
              <span className="font-semibold text-indigo-700 block">Amount / Spend</span>
              <span className="text-[11px] text-slate-400">e.g. 149.50</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          
          <a
            href="/api/rfm/sample-csv"
            download
            className="inline-flex items-center text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Download Sample CSV Template
          </a>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onLoadSample();
              }}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
            >
              Use Built-In Sample
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
