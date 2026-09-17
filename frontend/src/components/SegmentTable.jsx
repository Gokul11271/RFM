import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight,
  Sparkles,
  Download
} from 'lucide-react';

const SEGMENT_CLASSES = {
  "Champions": "bg-emerald-50 text-emerald-800 border-emerald-200",
  "Loyal Customers": "bg-blue-50 text-blue-800 border-blue-200",
  "Potential Loyalists": "bg-teal-50 text-teal-800 border-teal-200",
  "Recent Customers": "bg-sky-50 text-sky-800 border-sky-200",
  "Promising": "bg-purple-50 text-purple-800 border-purple-200",
  "Customers Needing Attention": "bg-amber-50 text-amber-800 border-amber-200",
  "About to Sleep": "bg-orange-50 text-orange-800 border-orange-200",
  "At Risk": "bg-rose-50 text-rose-800 border-rose-200",
  "Can't Lose Them": "bg-red-50 text-red-800 border-red-200",
  "Hibernating": "bg-slate-100 text-slate-700 border-slate-200",
  "Lost": "bg-gray-100 text-gray-700 border-gray-200"
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
      const matchSearch = c.customer_id.toLowerCase().includes(searchTerm.toLowerCase());
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
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Customer RFM Segment Roster</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing top {customers.length} analyzed customer accounts
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Search Input */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Customer ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Segment Dropdown Filter */}
          <div className="flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSegmentFilter || ''}
              onChange={(e) => handleFilterChange(e.target.value || null)}
              className="text-xs bg-slate-50 hover:bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 bg-indigo-50 rounded-md cursor-pointer"
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
            <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              
              <th className="py-3 px-4">
                <button
                  onClick={() => handleSort('customer_id')}
                  className="flex items-center space-x-1 hover:text-slate-800 cursor-pointer"
                >
                  <span>Customer ID</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>

              <th className="py-3 px-4">Segment</th>

              <th className="py-3 px-4 text-right">
                <button
                  onClick={() => handleSort('monetary')}
                  className="flex items-center justify-end space-x-1 hover:text-slate-800 ml-auto cursor-pointer"
                >
                  <span>Total Spend (M)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>

              <th className="py-3 px-4 text-center">
                <button
                  onClick={() => handleSort('frequency')}
                  className="flex items-center justify-center space-x-1 hover:text-slate-800 mx-auto cursor-pointer"
                >
                  <span>Orders (F)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>

              <th className="py-3 px-4 text-right">
                <button
                  onClick={() => handleSort('avg_order_value')}
                  className="flex items-center justify-end space-x-1 hover:text-slate-800 ml-auto cursor-pointer"
                >
                  <span>AOV</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>

              <th className="py-3 px-4 text-right">
                <button
                  onClick={() => handleSort('recency_days')}
                  className="flex items-center justify-end space-x-1 hover:text-slate-800 ml-auto cursor-pointer"
                >
                  <span>Recency (R)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>

              <th className="py-3 px-4 text-center">
                <button
                  onClick={() => handleSort('rfm_score')}
                  className="flex items-center justify-center space-x-1 hover:text-slate-800 mx-auto cursor-pointer"
                >
                  <span>RFM Score (1-5)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>

              <th className="py-3 px-4 text-center">Action</th>

            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {paginatedCustomers.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No customer records match your filter criteria.
                </td>
              </tr>
            ) : (
              paginatedCustomers.map((row) => (
                <tr key={row.customer_id} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Customer ID */}
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    {row.customer_id}
                  </td>

                  {/* Segment Badge */}
                  <td className="py-3 px-4">
                    <span 
                      onClick={() => {
                        const targetSeg = segments.find(s => s.segment === row.segment);
                        if (targetSeg) onSelectSegment(targetSeg);
                      }}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border cursor-pointer hover:opacity-80 transition-opacity ${
                        SEGMENT_CLASSES[row.segment] || 'bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      {row.segment}
                    </span>
                  </td>

                  {/* Monetary */}
                  <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700">
                    ${row.monetary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>

                  {/* Frequency */}
                  <td className="py-3 px-4 text-center font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium">
                      {row.frequency}
                    </span>
                  </td>

                  {/* AOV */}
                  <td className="py-3 px-4 text-right font-mono text-slate-600">
                    ${row.avg_order_value.toFixed(2)}
                  </td>

                  {/* Recency */}
                  <td className="py-3 px-4 text-right font-mono text-slate-600">
                    {row.recency_days}d ago
                  </td>

                  {/* RFM Score Quintiles */}
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center space-x-1 font-mono text-xs">
                      <span className="w-5 h-5 rounded bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold" title="Recency Score">
                        {row.r_score}
                      </span>
                      <span className="w-5 h-5 rounded bg-blue-50 text-blue-700 flex items-center justify-center font-bold" title="Frequency Score">
                        {row.f_score}
                      </span>
                      <span className="w-5 h-5 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold" title="Monetary Score">
                        {row.m_score}
                      </span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        const targetSeg = segments.find(s => s.segment === row.segment);
                        if (targetSeg) onSelectSegment(targetSeg);
                      }}
                      className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                    >
                      <span>Playbook</span>
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
      <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Showing <strong className="text-slate-700">{filteredCustomers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{' '}
          <strong className="text-slate-700">{Math.min(currentPage * pageSize, filteredCustomers.length)}</strong> of{' '}
          <strong className="text-slate-700">{filteredCustomers.length}</strong> filtered results
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
              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-700"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="font-medium text-slate-700">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

        </div>
      </div>

    </div>
  );
}
