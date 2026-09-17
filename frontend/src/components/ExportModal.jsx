import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Code, CheckCircle2, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ExportModal({ isOpen, onClose, rfmData, activeDatasetName }) {
  if (!isOpen || !rfmData) return null;

  const { kpis, segments, top_customers } = rfmData;

  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  const exportCustomersCsv = () => {
    if (!top_customers || top_customers.length === 0) return;
    
    const headers = ["CustomerID", "Segment", "Monetary", "Frequency", "RecencyDays", "R_Score", "F_Score", "M_Score", "RFM_Score", "AvgOrderValue"];
    const rows = top_customers.map(c => [
      c.customer_id,
      c.segment,
      c.monetary,
      c.frequency,
      c.recency_days,
      c.r_score,
      c.f_score,
      c.m_score,
      c.rfm_score,
      c.avg_order_value
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rfm_customer_segments_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerConfetti();
  };

  const exportSegmentsCsv = () => {
    if (!segments || segments.length === 0) return;

    const headers = ["Segment", "CustomerCount", "PctCustomers", "TotalRevenue", "PctRevenue", "AvgRecencyDays", "AvgFrequency", "AvgMonetary", "AvgOrderValue", "ChurnRisk", "Priority"];
    const rows = segments.map(s => [
      `"${s.segment}"`,
      s.customer_count,
      s.pct_of_customers,
      s.total_revenue,
      s.pct_of_revenue,
      s.avg_recency_days,
      s.avg_frequency,
      s.avg_monetary,
      s.avg_order_value,
      `"${s.insight?.churn_risk || 'N/A'}"`,
      `"${s.insight?.retention_priority || 'N/A'}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rfm_segment_summary_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerConfetti();
  };

  const exportJsonReport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rfmData, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `rfm_analytics_report_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerConfetti();
  };

  const exportPdfReport = () => {
    const doc = new jsPDF();

    // Title & Header
    doc.setFontSize(20);
    doc.setTextColor(30, 27, 75); // Dark Indigo
    doc.text("RFM Customer Analytics Executive Report", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | Dataset: ${activeDatasetName || 'Online Retail'}`, 14, 27);

    // KPI Summary
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Executive Summary KPIs", 14, 38);

    const kpiData = [
      ["Total Customers", `${kpis.total_customers.toLocaleString()}`],
      ["Total Revenue", `$${kpis.total_revenue.toLocaleString()}`],
      ["Average Order Value", `$${kpis.avg_order_value.toFixed(2)}`],
      ["Champions Revenue Share", `${kpis.champions_revenue_pct}%`],
      ["At-Risk Revenue Exposure", `${kpis.at_risk_revenue_pct}%`],
      ["Average Recency", `${kpis.avg_recency_days} days`]
    ];

    autoTable(doc, {
      startY: 42,
      head: [["Metric", "Value"]],
      body: kpiData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 9 }
    });

    // Segment Summary Table
    const lastY = doc.lastAutoTable.finalY || 100;
    doc.setFontSize(12);
    doc.text("Segment Breakdown & AI Risk Assessment", 14, lastY + 12);

    const segRows = segments.map(s => [
      s.segment,
      s.customer_count.toLocaleString(),
      `${s.pct_of_customers}%`,
      `$${s.total_revenue.toLocaleString()}`,
      `${s.pct_of_revenue}%`,
      `${s.avg_recency_days}d`,
      s.insight?.churn_risk || 'N/A',
      s.insight?.retention_priority || 'N/A'
    ]);

    autoTable(doc, {
      startY: lastY + 16,
      head: [["Segment", "Customers", "% Cust", "Revenue", "% Rev", "Avg Rec", "Churn Risk", "Priority"]],
      body: segRows,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 8 }
    });

    doc.save(`rfm_executive_report_${Date.now()}.pdf`);
    triggerConfetti();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Export Analytics & Reports</h3>
              <p className="text-xs text-slate-500">Download customer lists, segments, or PDF summary</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="py-5 space-y-3">
          
          {/* PDF Executive Report */}
          <button
            onClick={exportPdfReport}
            className="w-full p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 flex items-center justify-between transition-all group text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Executive PDF Summary Report</p>
                <p className="text-[11px] text-slate-500">Includes KPIs, segment distribution, and AI risk analysis</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
          </button>

          {/* Customer Roster CSV */}
          <button
            onClick={exportCustomersCsv}
            className="w-full p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 flex items-center justify-between transition-all group text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Customer Segments Roster (.CSV)</p>
                <p className="text-[11px] text-slate-500">Row-by-row customer IDs with scores and assigned segments</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
          </button>

          {/* Segment Summary CSV */}
          <button
            onClick={exportSegmentsCsv}
            className="w-full p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 flex items-center justify-between transition-all group text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Segment Aggregation Table (.CSV)</p>
                <p className="text-[11px] text-slate-500">11 segment metrics, revenues, average order values, and churn tiers</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
          </button>

          {/* Full JSON Payload */}
          <button
            onClick={exportJsonReport}
            className="w-full p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 flex items-center justify-between transition-all group text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 group-hover:scale-105 transition-transform">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Complete Raw JSON Payload (.JSON)</p>
                <p className="text-[11px] text-slate-500">Includes all calculated distributions, AI narratives, and histograms</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
          </button>

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
