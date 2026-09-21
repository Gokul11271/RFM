import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Code, CheckCircle2, X, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ExportModal({ isOpen, onClose, rfmData, activeDatasetName }) {
  const [isExportingPdf, setIsExportingPdf] = useState(false);

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

  const exportPdfReport = async () => {
    setIsExportingPdf(true);
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);

      const doc = new jsPDF();

      // Title & Header
      doc.setFontSize(20);
      doc.setTextColor(30, 27, 75);
      doc.text("RFM Customer Analytics Executive Report", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} | Dataset: ${activeDatasetName || 'Customer Transactions'}`, 14, 27);

      // KPI Summary
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("Executive Summary KPIs", 14, 38);

      const kpiData = [
        ["Total Customers", `${kpis.total_customers.toLocaleString()}`],
        ["Total Revenue", `₹${kpis.total_revenue.toLocaleString()}`],
        ["Average Order Value", `₹${kpis.avg_order_value.toFixed(2)}`],
        ["Champions Revenue Share", `${kpis.champions_revenue_pct}%`],
        ["At-Risk Revenue Exposure", `${kpis.at_risk_revenue_pct}%`],
        ["Average Recency", `${kpis.avg_recency_days} days`]
      ];

      autoTable(doc, {
        startY: 42,
        head: [["Metric", "Value"]],
        body: kpiData,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] },
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
        `₹${s.total_revenue.toLocaleString()}`,
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
        headStyles: { fillColor: [15, 23, 42] },
        styles: { fontSize: 8 }
      });

      doc.save(`rfm_executive_report_${Date.now()}.pdf`);
      setIsExportingPdf(false);
      triggerConfetti();
    } catch (err) {
      console.error("PDF generation failed:", err);
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-[#0e121a] text-slate-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-white/[0.10] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Export Analytics & Reports</h3>
              <p className="text-xs text-slate-400">Download customer lists, segments, or PDF summary</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="py-5 space-y-3">
          
          {/* PDF Executive Report */}
          <button
            onClick={exportPdfReport}
            disabled={isExportingPdf}
            className="w-full p-4 rounded-2xl border border-white/[0.08] hover:border-amber-400/40 bg-white/[0.02] hover:bg-white/[0.05] flex items-center justify-between transition-all group text-left cursor-pointer disabled:opacity-60"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:scale-105 transition-transform">
                {isExportingPdf ? <RefreshCw className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-xs font-bold text-white">Executive PDF Summary Report</p>
                <p className="text-[11px] text-slate-400">Includes KPIs, segment distribution, and AI risk analysis</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
          </button>

          {/* Customer Roster CSV */}
          <button
            onClick={exportCustomersCsv}
            className="w-full p-4 rounded-2xl border border-white/[0.08] hover:border-emerald-400/40 bg-white/[0.02] hover:bg-white/[0.05] flex items-center justify-between transition-all group text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Customer Segments Roster (.CSV)</p>
                <p className="text-[11px] text-slate-400">Row-by-row customer IDs with scores and assigned segments</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
          </button>

          {/* Segment Summary CSV */}
          <button
            onClick={exportSegmentsCsv}
            className="w-full p-4 rounded-2xl border border-white/[0.08] hover:border-indigo-400/40 bg-white/[0.02] hover:bg-white/[0.05] flex items-center justify-between transition-all group text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Segment Aggregation Table (.CSV)</p>
                <p className="text-[11px] text-slate-400">11 segment metrics, revenues, and churn risk tiers</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
          </button>

          {/* Full JSON Payload */}
          <button
            onClick={exportJsonReport}
            className="w-full p-4 rounded-2xl border border-white/[0.08] hover:border-purple-400/40 bg-white/[0.02] hover:bg-white/[0.05] flex items-center justify-between transition-all group text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Complete Raw JSON Payload (.JSON)</p>
                <p className="text-[11px] text-slate-400">Includes all calculated distributions, AI narratives, and histograms</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-500 group-hover:text-purple-400" />
          </button>

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/[0.08] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
