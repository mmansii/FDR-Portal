import React, { useState } from 'react';
import { 
  CheckSquare, 
  Search, 
  Clock, 
  AlertTriangle, 
  FileQuestion, 
  CheckCircle2, 
  Eye, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  Building2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { StatusBadge } from '../../common/StatusBadge';
import { formatINR } from '../../../utils/currencyUtils';
import { formatDate, getDaysPast } from '../../../utils/dateUtils';
import { FDRDetailModal } from '../repository/FDRDetailModal';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { Modal } from '../../common/Modal';

export const VerificationCentre: React.FC = () => {
  const { 
    fdrRecords, 
    selectedFdrId, 
    setSelectedFdrId, 
    currentRole,
    updateFDRVerification,
    flagDiscrepancy,
    requestAdditionalInfo
  } = useApp();

  const [activeQueueTab, setActiveQueueTab] = useState<'pending' | 'discrepancy' | 'info_required' | 'verified'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Fast action states from table
  const [quickApproveId, setQuickApproveId] = useState<string | null>(null);

  // Filter queues
  const pendingQueue = fdrRecords.filter(f => f.verificationStatus === 'PENDING' || f.verificationStatus === 'UNDER_REVIEW');
  const discrepancyQueue = fdrRecords.filter(f => f.verificationStatus === 'DISCREPANCY_FLAGGED' || f.hasDiscrepancy);
  const infoReqQueue = fdrRecords.filter(f => f.verificationStatus === 'INFO_REQUIRED');
  const verifiedQueue = fdrRecords.filter(f => f.verificationStatus === 'VERIFIED');

  const currentList = {
    pending: pendingQueue,
    discrepancy: discrepancyQueue,
    info_required: infoReqQueue,
    verified: verifiedQueue,
  }[activeQueueTab];

  const filteredList = currentList.filter(f => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.id.toLowerCase().includes(q) ||
      f.institutionName.toLowerCase().includes(q) ||
      f.instrumentNumber.toLowerCase().includes(q) ||
      f.bankName.toLowerCase().includes(q)
    );
  });

  const handleConfirmQuickApprove = () => {
    if (quickApproveId) {
      updateFDRVerification(quickApproveId, 'VERIFIED', 'Endorsed in Verification Centre scrutiny docket.');
      setQuickApproveId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Regulatory Verification & Scrutiny Centre
            </h2>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingQueue.length} Pending Scrutiny
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Surveillance queue for authorized officers to inspect submitted instruments, verify bank liens, and reconcile discrepancies.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600">
            Citizen Charter SLA: <span className="font-bold text-slate-900">14 Working Days</span>
          </div>
        </div>
      </div>

      {/* Queue Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200">
        <div className="flex gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveQueueTab('pending')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeQueueTab === 'pending'
                ? 'border-blue-600 text-blue-900 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Pending Scrutiny Queue</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px]">
              {pendingQueue.length}
            </span>
          </button>

          <button
            onClick={() => setActiveQueueTab('discrepancy')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeQueueTab === 'discrepancy'
                ? 'border-blue-600 text-blue-900 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Discrepancies Flagged</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px]">
              {discrepancyQueue.length}
            </span>
          </button>

          <button
            onClick={() => setActiveQueueTab('info_required')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeQueueTab === 'info_required'
                ? 'border-blue-600 text-blue-900 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileQuestion className="w-4 h-4 text-purple-600" />
            <span>Awaiting Information</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px]">
              {infoReqQueue.length}
            </span>
          </button>

          <button
            onClick={() => setActiveQueueTab('verified')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeQueueTab === 'verified'
                ? 'border-blue-600 text-blue-900 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Verified Records</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
              {verifiedQueue.length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search queue..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 w-52"
            />
          </div>
        </div>
      </div>

      {/* Queue Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs min-w-0 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
            <tr>
              <th className="py-3 px-4">FDR Ref / Instrument</th>
              <th className="py-3 px-4">Institution</th>
              <th className="py-3 px-4">Bank & Amount</th>
              <th className="py-3 px-4">Submission Age</th>
              <th className="py-3 px-4">Status & Scrutiny Finding</th>
              <th className="py-3 px-4 text-right">Verification Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No records in this scrutiny queue.
                </td>
              </tr>
            ) : (
              filteredList.map(record => {
                const daysPending = getDaysPast(record.submissionDate);
                const isOverdueSla = (record.verificationStatus === 'PENDING' || record.verificationStatus === 'UNDER_REVIEW') && daysPending > 14;

                return (
                  <tr
                    key={record.id}
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedFdrId(record.id)}
                  >
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-blue-900 block">{record.id}</span>
                      <span className="text-[11px] text-slate-400">#{record.instrumentNumber}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block truncate max-w-xs">{record.institutionName}</span>
                      <span className="font-mono text-[11px] text-slate-400">{record.institutionCode}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{formatINR(record.fdrAmount)}</span>
                      <span className="text-[11px] text-slate-500">{record.bankName}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-700 block">{formatDate(record.submissionDate)}</span>
                      <span className={`text-[11px] font-semibold ${isOverdueSla ? 'text-red-600 bg-red-50 px-1.5 py-0.2 rounded' : 'text-slate-400'}`}>
                        {daysPending} days ago {isOverdueSla && '• SLA Breached'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 space-y-1">
                      <StatusBadge type="verification" value={record.verificationStatus} size="sm" />
                      {record.hasDiscrepancy && (
                        <span className="text-[10px] text-rose-700 block font-semibold truncate max-w-[200px]">
                          Mismatch in {record.discrepancyDetails?.[0]?.field || 'face value'}
                        </span>
                      )}
                      {record.pendingQuery && (
                        <span className="text-[10px] text-purple-700 block font-medium truncate max-w-[200px]">
                          Query: {record.pendingQuery.queryText}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                        {record.verificationStatus !== 'VERIFIED' && (currentRole === 'ADMIN' || currentRole === 'VERIFIER') && (
                          <button
                            onClick={() => setQuickApproveId(record.id)}
                            className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-xs font-bold border border-emerald-300 transition-colors"
                          >
                            Approve
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedFdrId(record.id)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Scrutinize</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Quick Approve Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!quickApproveId}
        onClose={() => setQuickApproveId(null)}
        onConfirm={handleConfirmQuickApprove}
        title="Approve FDR Verification"
        message={`Confirm regulatory approval for ${quickApproveId}?\n\nThis certifies that instrument amount, bank lien endorsement, and maturity terms comply with statutory AICTE requirements.`}
        confirmLabel="Confirm Approval"
        variant="primary"
      />

      {/* Inspect Modal */}
      <FDRDetailModal
        fdrId={selectedFdrId}
        onClose={() => setSelectedFdrId(null)}
      />

    </div>
  );
};
