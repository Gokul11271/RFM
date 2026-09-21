import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

const SEGMENT_CLASSES = {
  "Champions": "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  "Loyal Customers": "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  "Potential Loyalists": "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  "Recent Customers": "bg-sky-500/15 text-sky-300 border-sky-500/30",
  "Promising": "bg-purple-500/15 text-purple-300 border-purple-500/30",
  "Customers Needing Attention": "bg-amber-500/15 text-amber-300 border-amber-500/30",
  "About to Sleep": "bg-orange-500/15 text-orange-300 border-orange-500/30",
  "At Risk": "bg-rose-500/15 text-rose-300 border-rose-500/30",
  "Can't Lose Them": "bg-red-500/20 text-red-300 border-red-500/40",
  "Hibernating": "bg-slate-700/30 text-slate-300 border-slate-600/40",
  "Lost": "bg-slate-800/50 text-slate-400 border-slate-700/50"
};

export default function SegmentTable({ 
  customers = [], 
  segments = [], 
  onSelectSegment, 
  selectedSegmentFilter, 
  onSetSegmentFilter 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('monetary');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter & Search
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchSearch = String(c.customer_id).toLowerCase().includes(searchTerm.toLowerCase());
      const matchSegment = !selectedSegmentFilter || c.segment === selectedSegmentFilter;
      return matchSearch && matchSegment;
    });
  }, [customers, searchTerm, selectedSegmentFilter]);

  // Sort
  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [filteredCustomers, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedCustomers.length / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedCustomers.slice(start, start + pageSize);
  }, [sortedCustomers, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleFilterChange = (segName) => {
    onSetSegmentFilter(segName === selectedSegmentFilter ? null : segName);
    setCurrentPage(1);
  };

  return (
    <div className="material-card overflow-hidden">
      
      {/* Table Header Controls */}
      <div className="p-5 border-b border-white/[0.06] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">Customer RFM Segment Roster</h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Showing top {customers.length} analyzed accounts
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Search Input */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Customer ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/[0.04] hover:bg-white/[0.07] focus:bg-white/[0.09] text-white placeholder:text-slate-500 border border-white/[0.08] rounded-xl focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>

          {/* Segment Dropdown Filter */}
          <div className="flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSegmentFilter || ''}
              onChange={(e) => handleFilterChange(e.target.value || null)}
              className="text-xs bg-[#0e121a] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl px-2.5 py-1.5 font-medium text-slate-200 focus:outline-none focus:border-amber-500/50"
            >
              <option value="">All Segments ({customers.length})</option>
              {segments.map(s => (
                <option key={s.segment} value={s.segment}>
                  {s.segment} ({s.customer_count})
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filter */}
          {selectedSegmentFilter && (
            <button
              onClick={() => onSetSegmentFilter(null)}
              className="text-xs text-amber-300 hover:text-amber-200 font-medium px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg cursor-pointer"
            >
              Clear Filter
            </button>
          )}

        </div>

      </div>

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/[0.06] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              
              <th className="py-3.5 px-4">
                <button
                  onClick={() => handleSort('customer_id')}
                  className="flex items-center space-x-1 hover:text-white cursor-pointer"
                >
                  <span>Customer ID</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>

              <th className="py-3.5 px-4">Segment</th>

              <th className="py-3.5 px-4 text-right">
                <button
                  onClick={() => handleSort('monetary')}
                  className="flex items-center justify-end space-x-1 hover:text-white ml-auto cursor-pointer"
                >
                  <span>Total Spend (M)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>

              <th className="py-3.5 px-4 text-center">
                <button
                  onClick={() => handleSort('frequency')}
                  className="flex items-center justify-center space-x-1 hover:text-white mx-auto cursor-pointer"
                >
                  <span>Orders (F)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>

              <th className="py-3.5 px-4 text-right">
                <button
                  onClick={() => handleSort('avg_order_value')}
                  className="flex items-center justify-end space-x-1 hover:text-white ml-auto cursor-pointer"
                >
                  <span>AOV</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>

              <th className="py-3.5 px-4 text-right">
                <button
                  onClick={() => handleSort('recency_days')}
                  className="flex items-center justify-end space-x-1 hover:text-white ml-auto cursor-pointer"
                >
                  <span>Recency (R)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>

              <th className="py-3.5 px-4 text-center">
                <button
                  onClick={() => handleSort('rfm_score')}
                  className="flex items-center justify-center space-x-1 hover:text-white mx-auto cursor-pointer"
                >
                  <span>RFM Score (1-5)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>

              <th className="py-3.5 px-4 text-center">Playbook</th>

            </tr>
          </thead>

          <tbody className="divide-y divide-white/[0.04] font-medium text-slate-300">
            {paginatedCustomers.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-500 text-xs">
                  No customer records match your filter criteria.
                </td>
              </tr>
            ) : (
              paginatedCustomers.map((row) => (
                <tr key={row.customer_id} className="hover:bg-white/[0.03] transition-colors">
                  
                  {/* Customer ID */}
                  <td className="py-3.5 px-4 font-mono font-semibold text-white">
                    {row.customer_id}
                  </td>

                  {/* Segment Badge */}
                  <td className="py-3.5 px-4">
                    <span 
                      onClick={() => {
                        const targetSeg = segments.find(s => s.segment === row.segment);
                        if (targetSeg) onSelectSegment(targetSeg);
                      }}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border cursor-pointer hover:opacity-80 transition-opacity ${
                        SEGMENT_CLASSES[row.segment] || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {row.segment}
                    </span>
                  </td>

                  {/* Monetary */}
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-400">
                    ${row.monetary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>

                  {/* Frequency */}
                  <td className="py-3.5 px-4 text-center font-mono">
                    <span className="px-2 py-0.5 rounded-md bg-white/[0.05] text-slate-200 font-medium">
                      {row.frequency}
                    </span>
                  </td>

                  {/* AOV */}
                  <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                    ${row.avg_order_value.toFixed(2)}
                  </td>

                  {/* Recency */}
                  <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                    {row.recency_days}d ago
                  </td>

                  {/* RFM Score Quintiles */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center space-x-1 font-mono text-xs">
                      <span className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-[10px]" title="Recency Score">
                        {row.r_score}
                      </span>
                      <span className="w-5 h-5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center justify-center font-bold text-[10px]" title="Frequency Score">
                        {row.f_score}
                      </span>
                      <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold text-[10px]" title="Monetary Score">
                        {row.m_score}
                      </span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => {
                        const targetSeg = segments.find(s => s.segment === row.segment);
                        if (targetSeg) onSelectSegment(targetSeg);
                      }}
                      className="inline-flex items-center text-xs font-semibold text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
                    >
                      <span>AI Tactics</span>
                      <ArrowUpRight className="w-3 h-3 ml-0.5" />
                    </button>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          Showing <strong className="text-white">{filteredCustomers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{' '}
          <strong className="text-white">{Math.min(currentPage * pageSize, filteredCustomers.length)}</strong> of{' '}
          <strong className="text-white">{filteredCustomers.length}</strong> filtered accounts
        </div>

        <div className="flex items-center space-x-2">
          
          <div className="flex items-center space-x-1 mr-2">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#0e121a] border border-white/[0.08] rounded-lg px-2 py-1 text-xs text-slate-200"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded-lg border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="font-mono text-slate-300 text-xs">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 rounded-lg border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

        </div>
      </div>

    </div>
  );
}
