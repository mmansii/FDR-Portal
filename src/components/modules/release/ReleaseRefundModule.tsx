import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  Search, 
  Filter, 
  PlusCircle, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Building2,
  FileQuestion,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { StatusBadge } from '../../common/StatusBadge';
import { formatINR } from '../../../utils/currencyUtils';
import { formatDate, getDaysPast } from '../../../utils/dateUtils';
import { ReleaseRefundRequest, ReleaseRequestStatus } from '../../../types';
import { Modal } from '../../common/Modal';

export const ReleaseRefundModule: React.FC = () => {
  const { 
    releaseRequests, 
    fdrRecords, 
    institutions, 
    currentRole, 
    currentInstitution, 
    isInstitutionalScoped,
    submitReleaseRequest,
    updateReleaseStatus,
    setSelectedFdrId
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ReleaseRefundRequest | null>(null);

  // New Request Modal State
  const [newRequestModalOpen, setNewRequestModalOpen] = useState(false);
  const [reqFdrId, setReqFdrId] = useState('');
  const [reqType, setReqType] = useState<any>('FULL_RELEASE');
  const [reqAmount, setReqAmount] = useState<number>(5000000);
  const [reqReason, setReqReason] = useState('');

  // Status Action Modal State
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<ReleaseRequestStatus>('DOCUMENTS_UNDER_REVIEW');
  const [actionNote, setActionNote] = useState('');
  const [approvalRef, setApprovalRef] = useState('');

  // Scoped baseline
  const scopedRequests = isInstitutionalScoped && currentInstitution
    ? releaseRequests.filter(r => r.institutionId === currentInstitution.id)
    : releaseRequests;

  const eligibleFdrsForRelease = fdrRecords.filter(f => {
    if (isInstitutionalScoped && currentInstitution && f.institutionId !== currentInstitution.id) return false;
    return f.verificationStatus === 'VERIFIED';
  });

  const filteredRequests = scopedRequests.filter(r => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.institutionName.toLowerCase().includes(q) ||
        r.fdrInstrumentNumber.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenNewRequest = () => {
    if (eligibleFdrsForRelease.length > 0) {
      const first = eligibleFdrsForRelease[0];
      setReqFdrId(first.id);
      setReqAmount(first.fdrAmount);
      setReqReason('Statutory 5-year lock-in period successfully completed.');
    }
    setNewRequestModalOpen(true);
  };

  const handleSubmitNewRequest = () => {
    if (!reqFdrId || !reqReason.trim()) return;
    submitReleaseRequest({
      fdrId: reqFdrId,
      requestType: reqType,
      requestAmount: reqAmount,
      reason: reqReason,
    });
    setNewRequestModalOpen(false);
  };

  const handleOpenActionModal = (status: ReleaseRequestStatus) => {
    setTargetStatus(status);
    setActionNote('');
    setApprovalRef(`AICTE/REG/2026/APPR-${Math.floor(1000 + Math.random() * 9000)}`);
    setActionModalOpen(true);
  };

  const handleConfirmStatusUpdate = () => {
    if (selectedRequest) {
      updateReleaseStatus(selectedRequest.id, targetStatus, actionNote, approvalRef);
      // Refresh local selected
      setSelectedRequest(prev => prev ? { ...prev, status: targetStatus } : null);
      setActionModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Security Deposit Release & Refund Management
            </h2>
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {scopedRequests.length} File Requests
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Surveillance of deposit liquidation, substitution releases for rollovers, and statutory lien surrender approvals.
          </p>
        </div>

        <button
          onClick={handleOpenNewRequest}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Lodge Release Request</span>
        </button>
      </div>

      {/* Disclaimers */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800">Administrative Governance Note:</span> Release/refund workflows signify official surrender of AICTE joint lien endorsement to the issuing bank. All requests undergo statutory vigilance scrutiny to protect student fees and faculty retirement endowments.
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search release files..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 w-56"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="p-1.5 rounded-lg border border-slate-300 bg-white"
          >
            <option value="">All Workflow Stages</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="DOCUMENTS_UNDER_REVIEW">Documents Under Review</option>
            <option value="ADDITIONAL_INFO_REQUIRED">Additional Info Required</option>
            <option value="AWAITING_COMPETENT_AUTHORITY">Awaiting Competent Authority</option>
            <option value="APPROVED_FOR_PROCESSING">Approved for Processing</option>
            <option value="REJECTED_WITH_REASON">Rejected with Reason</option>
            <option value="PROCESSING_RECORDED">Processing Recorded</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        <div className="text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{filteredRequests.length}</span> file request(s)
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs min-w-0 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
            <tr>
              <th className="py-3 px-4">Request File ID</th>
              <th className="py-3 px-4">Institution</th>
              <th className="py-3 px-4">Related FDR & Amount</th>
              <th className="py-3 px-4">Request Category</th>
              <th className="py-3 px-4">Submission Date</th>
              <th className="py-3 px-4">Workflow Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No release/refund requests match criteria.
                </td>
              </tr>
            ) : (
              filteredRequests.map(req => {
                const daysInReview = getDaysPast(req.submissionDate);
                const isDelayed = req.status !== 'CLOSED' && req.status !== 'REJECTED_WITH_REASON' && daysInReview > 21;

                return (
                  <tr
                    key={req.id}
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedRequest(req)}
                  >
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-blue-900 block">{req.id}</span>
                      {isDelayed && (
                        <span className="text-[10px] text-red-600 bg-red-50 px-1 py-0.2 rounded font-sans font-bold">
                          Review Delayed ({daysInReview}d)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block truncate max-w-xs">{req.institutionName}</span>
                      <span className="font-mono text-[11px] text-slate-400">{req.institutionCode}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{formatINR(req.requestAmount)}</span>
                      <span className="text-[11px] text-slate-500 font-mono">FDR #{req.fdrInstrumentNumber}</span>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {req.requestType.replace(/_/g, ' ')}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{formatDate(req.submissionDate)}</div>
                      <div className="text-[10px] text-slate-400">{daysInReview} days ago</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge type="release" value={req.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedRequest(req);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-semibold transition-colors"
                      >
                        Inspect Dossier
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* DETAIL MODAL */}
      {selectedRequest && (
        <Modal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          title={`Deposit Release File: ${selectedRequest.id}`}
          subtitle={`${selectedRequest.institutionName} • Type: ${selectedRequest.requestType}`}
          maxWidth="4xl"
          footer={
            <div className="w-full flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Submitted on {selectedRequest.submissionDate} • Amount: {formatINR(selectedRequest.requestAmount)}
              </span>
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800"
              >
                Close File
              </button>
            </div>
          }
        >
          <div className="space-y-6 text-xs">
            
            {/* Status Stepper Banner */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">Current Stage</span>
                <StatusBadge type="release" value={selectedRequest.status} />
              </div>

              {selectedRequest.authorityApprovalRef && (
                <div className="text-right">
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Sanction Reference</span>
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {selectedRequest.authorityApprovalRef}
                  </span>
                </div>
              )}
            </div>

            {/* Action Bar for Admin / Verifier */}
            {(currentRole === 'ADMIN' || currentRole === 'VERIFIER') && (
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
                <span className="font-bold text-blue-950">Administrative Determination:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedRequest.status === 'SUBMITTED' && (
                    <button
                      onClick={() => handleOpenActionModal('DOCUMENTS_UNDER_REVIEW')}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    >
                      Begin Document Review
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenActionModal('ADDITIONAL_INFO_REQUIRED')}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold"
                  >
                    Seek Clarification
                  </button>

                  <button
                    onClick={() => handleOpenActionModal('AWAITING_COMPETENT_AUTHORITY')}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold"
                  >
                    Refer to Authority
                  </button>

                  <button
                    onClick={() => handleOpenActionModal('APPROVED_FOR_PROCESSING')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    Endorse Approval
                  </button>

                  <button
                    onClick={() => handleOpenActionModal('REJECTED_WITH_REASON')}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold"
                  >
                    Reject Request
                  </button>
                </div>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-slate-200 bg-white">
              <div>
                <span className="text-slate-400 block text-[11px]">Institution</span>
                <span className="font-bold text-slate-900">{selectedRequest.institutionName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Related FDR Record</span>
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setSelectedFdrId(selectedRequest.fdrId);
                  }}
                  className="font-mono font-bold text-blue-700 hover:underline flex items-center gap-1"
                >
                  {selectedRequest.fdrId} (#{selectedRequest.fdrInstrumentNumber})
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">Institution Justification & Reason</span>
                <p className="font-medium text-slate-800 leading-relaxed mt-1">{selectedRequest.reason}</p>
              </div>
            </div>

            {/* Scrutiny Notes History */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Reviewer Case Notes ({selectedRequest.reviewNotes.length})
              </h4>
              {selectedRequest.reviewNotes.length === 0 ? (
                <p className="text-slate-400 py-2">No scrutiny notes added to this file yet.</p>
              ) : (
                selectedRequest.reviewNotes.map(n => (
                  <div key={n.id} className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{n.authorName} ({n.authorRole})</span>
                      <span className="text-slate-400 text-[10px]">{n.timestamp}</span>
                    </div>
                    <p className="text-slate-700">{n.note}</p>
                  </div>
                ))
              )}
            </div>

          </div>
        </Modal>
      )}

      {/* Lodgement Modal */}
      <Modal
        isOpen={newRequestModalOpen}
        onClose={() => setNewRequestModalOpen(false)}
        title="Lodge Deposit Release / Refund Request"
        subtitle="Submit statutory release application to AICTE Regulation Bureau"
        maxWidth="md"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setNewRequestModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitNewRequest}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              Lodge Request
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Maturing / Eligible FDR *</label>
            <select
              value={reqFdrId}
              onChange={e => {
                setReqFdrId(e.target.value);
                const chosen = eligibleFdrsForRelease.find(f => f.id === e.target.value);
                if (chosen) setReqAmount(chosen.fdrAmount);
              }}
              className="w-full p-2 border rounded-lg bg-white"
            >
              {eligibleFdrsForRelease.map(f => (
                <option key={f.id} value={f.id}>
                  {f.id} ({f.institutionName}) - {formatINR(f.fdrAmount)} - Matures: {f.maturityDate}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Request Category</label>
            <select
              value={reqType}
              onChange={e => setReqType(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white"
            >
              <option value="FULL_RELEASE">Full Release (5-year lock-in completed)</option>
              <option value="PARTIAL_RELEASE">Partial Release (Approved intake reduction)</option>
              <option value="SUBSTITUTION_RELEASE">Substitution Release (Replacement FDR lodged)</option>
              <option value="CLOSURE_REFUND">Closure Refund (Department closure approved)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Requested Release Amount (INR)</label>
            <input
              type="number"
              value={reqAmount}
              onChange={e => setReqAmount(Number(e.target.value))}
              className="w-full p-2 border rounded-lg font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Supporting Justification *</label>
            <textarea
              rows={3}
              value={reqReason}
              onChange={e => setReqReason(e.target.value)}
              placeholder="State regulatory justification, AICTE approval order numbers, or no-dues status..."
              className="w-full p-2.5 border rounded-lg"
            />
          </div>
        </div>
      </Modal>

      {/* Action Status Update Modal */}
      <Modal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        title={`Update Request Stage to: ${targetStatus}`}
        subtitle={`File: ${selectedRequest?.id}`}
        maxWidth="md"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setActionModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmStatusUpdate}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              Confirm Determination
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          {targetStatus === 'APPROVED_FOR_PROCESSING' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Authority Sanction Ref # *</label>
              <input
                type="text"
                value={approvalRef}
                onChange={e => setApprovalRef(e.target.value)}
                className="w-full p-2 border rounded-lg font-mono"
              />
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Review Case Note *</label>
            <textarea
              rows={4}
              value={actionNote}
              onChange={e => setActionNote(e.target.value)}
              placeholder="Record official reasoning and bureau findings..."
              className="w-full p-2.5 border rounded-lg"
            />
          </div>
        </div>
      </Modal>

    </div>
  );
};
