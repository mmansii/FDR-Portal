import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  RotateCcw,
  PlusCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Building2,
  Calendar,
  Layers
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { StatusBadge } from '../../common/StatusBadge';
import { formatINR } from '../../../utils/currencyUtils';
import { formatDate } from '../../../utils/dateUtils';
import { exportToCSV } from '../../../services/exportCsv';
import { FDRDetailModal } from './FDRDetailModal';
import { FDRRecord } from '../../../types';

export const FDRRepository: React.FC = () => {
  const {
    fdrRecords,
    institutions,
    isInstitutionalScoped,
    currentInstitution,
    selectedFdrId,
    setSelectedFdrId,
    openSubmissionWizard,
    currentRole
  } = useApp();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstFilter, setSelectedInstFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [maturityFilter, setMaturityFilter] = useState('');
  const [bankFilter, setBankFilter] = useState('');
  const [amountFilter, setAmountFilter] = useState('');

  // Sort State
  const [sortField, setSortField] = useState<keyof FDRRecord>('lastUpdatedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Institution-scoped baseline records
  const baseRecords = useMemo(() => {
    if (isInstitutionalScoped) {
      if (!currentInstitution) return [];

      return fdrRecords.filter(
        f => f.institutionId === currentInstitution.id
      );
    }

    return fdrRecords;
  }, [fdrRecords, isInstitutionalScoped, currentInstitution]);

  // Unique banks list for filter
  const uniqueBanks = useMemo(() => {
    return Array.from(new Set(baseRecords.map(r => r.bankName))).sort();
  }, [baseRecords]);

  // Filtered & Sorted Records
  const filteredRecords = useMemo(() => {
    return baseRecords
      .filter(record => {
        // Global text search
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const match =
            record.id.toLowerCase().includes(q) ||
            record.institutionName.toLowerCase().includes(q) ||
            record.institutionCode.toLowerCase().includes(q) ||
            record.bankName.toLowerCase().includes(q) ||
            record.instrumentNumber.toLowerCase().includes(q);
          if (!match) return false;
        }

        // Institution Filter
        if (selectedInstFilter && record.institutionId !== selectedInstFilter) return false;

        // Verification Status Filter
        if (verificationFilter && record.verificationStatus !== verificationFilter) return false;

        // Maturity Status Filter
        if (maturityFilter && record.maturityStatus !== maturityFilter) return false;

        // Bank Filter
        if (bankFilter && record.bankName !== bankFilter) return false;

        // Amount Filter
        if (amountFilter) {
          if (amountFilter === 'BELOW_50L' && record.fdrAmount >= 5000000) return false;
          if (amountFilter === '50L_TO_1CR' && (record.fdrAmount < 5000000 || record.fdrAmount > 10000000)) return false;
          if (amountFilter === 'ABOVE_1CR' && record.fdrAmount <= 10000000) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') valA = (valA as string).toLowerCase();
        if (typeof valB === 'string') valB = (valB as string).toLowerCase();

        if (valA! < valB!) return sortOrder === 'asc' ? -1 : 1;
        if (valA! > valB!) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [baseRecords, searchTerm, selectedInstFilter, verificationFilter, maturityFilter, bankFilter, amountFilter, sortField, sortOrder]);

  // Paginated Slice
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage]);

  const handleSort = (field: keyof FDRRecord) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedInstFilter('');
    setVerificationFilter('');
    setMaturityFilter('');
    setBankFilter('');
    setAmountFilter('');
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    exportToCSV(filteredRecords, 'AICTE_FDR_Repository_Export', [
      { header: 'FDR Reference ID', key: 'id' },
      { header: 'Institution Name', key: 'institutionName' },
      { header: 'AICTE Code', key: 'institutionCode' },
      { header: 'Bank Name', key: 'bankName' },
      { header: 'Branch Name', key: 'branchName' },
      { header: 'IFSC Code', key: 'ifscCode' },
      { header: 'Instrument Receipt #', key: 'instrumentNumber' },
      { header: 'Amount (INR)', key: r => r.fdrAmount },
      { header: 'Issue Date', key: 'issueDate' },
      { header: 'Maturity Date', key: 'maturityDate' },
      { header: 'Verification Status', key: 'verificationStatus' },
      { header: 'Maturity Status', key: 'maturityStatus' },
      { header: 'Renewal Status', key: 'renewalStatus' },
      { header: 'Last Updated', key: 'lastUpdatedDate' },
    ]);
  };

  return (
    <div className="space-y-6">

      {/* Top Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              {isInstitutionalScoped ? 'My Institution FDR Repository' : 'Central Fixed Deposit (FDR) Repository'}
            </h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {filteredRecords.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Surveillance registry of institutional fixed deposit receipts, lien endorsements, and rollover compliance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => openSubmissionWizard(isInstitutionalScoped ? currentInstitution?.id : undefined)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Submit New FDR</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        {/* Row 1: Search bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Institution, AICTE Code, FDR ID, Instrument #, or Bank..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {(searchTerm || selectedInstFilter || verificationFilter || maturityFilter || bankFilter || amountFilter) && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-semibold px-2 py-1"
            >
              <RotateCcw className="w-3 h-3" /> Clear Filters
            </button>
          )}
        </div>

        {/* Row 2: Select Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
          {/* Institution Filter (Only for Admin / Verifier) */}
          {!isInstitutionalScoped && (
            <select
              value={selectedInstFilter}
              onChange={e => {
                setSelectedInstFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="p-1.5 rounded-lg border border-slate-300 bg-white"
            >
              <option value="">All Institutions</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
          )}

          {/* Verification Status */}
          <select
            value={verificationFilter}
            onChange={e => {
              setVerificationFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="p-1.5 rounded-lg border border-slate-300 bg-white"
          >
            <option value="">All Verification Statuses</option>
            <option value="VERIFIED">Verified</option>
            <option value="PENDING">Pending Scrutiny</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="DISCREPANCY_FLAGGED">Discrepancy Flagged</option>
            <option value="INFO_REQUIRED">Info Required</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Maturity Status */}
          <select
            value={maturityFilter}
            onChange={e => {
              setMaturityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="p-1.5 rounded-lg border border-slate-300 bg-white"
          >
            <option value="">All Maturity Stages</option>
            <option value="ACTIVE">Active Term</option>
            <option value="UPCOMING_30">Matures &lt; 30 Days</option>
            <option value="UPCOMING_15">Matures &lt; 15 Days</option>
            <option value="UPCOMING_7">Matures &lt; 7 Days</option>
            <option value="MATURED">Matured</option>
            <option value="OVERDUE_REVIEW">Overdue Review</option>
            <option value="RELEASED">Released</option>
          </select>

          {/* Bank Filter */}
          <select
            value={bankFilter}
            onChange={e => {
              setBankFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="p-1.5 rounded-lg border border-slate-300 bg-white"
          >
            <option value="">All Banks</option>
            {uniqueBanks.map(bank => (
              <option key={bank} value={bank}>{bank}</option>
            ))}
          </select>

          {/* Amount Range Filter */}
          <select
            value={amountFilter}
            onChange={e => {
              setAmountFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="p-1.5 rounded-lg border border-slate-300 bg-white"
          >
            <option value="">All Amounts</option>
            <option value="BELOW_50L">&lt; ₹50 Lakhs</option>
            <option value="50L_TO_1CR">₹50L - ₹1 Crore</option>
            <option value="ABOVE_1CR">&gt; ₹1 Crore</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs min-w-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">FDR Ref / Instrument</th>
                <th className="py-3 px-4">Institution Details</th>
                <th className="py-3 px-4">Bank & Branch</th>
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('fdrAmount')}>
                  <div className="flex items-center gap-1">
                    <span>Amount (INR)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('maturityDate')}>
                  <div className="flex items-center gap-1">
                    <span>Maturity Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Maturity Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No FDR records match the specified search or filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map(record => (
                  <tr
                    key={record.id}
                    className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedFdrId(record.id)}
                  >
                    {/* Ref & Instrument */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-blue-900 group-hover:underline flex items-center gap-1">
                        {record.id}
                        {record.isReplacement && (
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-1 py-0.2 rounded font-sans font-medium">
                            Rollover
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">#{record.instrumentNumber}</div>
                    </td>

                    {/* Institution */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 truncate max-w-[200px]" title={record.institutionName}>
                        {record.institutionName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">{record.institutionCode}</div>
                    </td>

                    {/* Bank & Branch */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{record.bankName}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[160px]">{record.branchName}</div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatINR(record.fdrAmount)}
                    </td>

                    {/* Maturity Date */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">{formatDate(record.maturityDate)}</div>
                      <div className="text-[10px] text-slate-400">Issue: {formatDate(record.issueDate)}</div>
                    </td>

                    {/* Verification Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge type="verification" value={record.verificationStatus} size="sm" />
                    </td>

                    {/* Maturity Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge type="maturity" value={record.maturityStatus} size="sm" />
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedFdrId(record.id);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing <span className="font-bold">{paginatedRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{' '}
            <span className="font-bold">{Math.min(currentPage * pageSize, filteredRecords.length)}</span> of{' '}
            <span className="font-bold">{filteredRecords.length}</span> records
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-1 rounded border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-1 rounded border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Modal/Drawer */}
      <FDRDetailModal
        fdrId={selectedFdrId}
        onClose={() => setSelectedFdrId(null)}
      />
    </div>
  );
};
