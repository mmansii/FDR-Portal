import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  AlertCircle, 
  History, 
  MessageSquare, 
  RefreshCw, 
  FileQuestion,
  ExternalLink,
  Tag,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Modal } from '../../common/Modal';
import { StatusBadge } from '../../common/StatusBadge';
import { formatINR } from '../../../utils/currencyUtils';
import { formatDate, getDaysDifference, getDaysPast } from '../../../utils/dateUtils';
import { ConfirmDialog } from '../../common/ConfirmDialog';

interface FDRDetailModalProps {
  fdrId: string | null;
  onClose: () => void;
}

export const FDRDetailModal: React.FC<FDRDetailModalProps> = ({ fdrId, onClose }) => {
  const { 
    fdrRecords, 
    institutions, 
    currentRole, 
    currentUser, 
    alerts, 
    auditLogs, 
    releaseRequests,
    updateFDRVerification,
    flagDiscrepancy,
    requestAdditionalInfo,
    respondToQuery,
    openSubmissionWizard,
    setActiveModule,
    setSelectedFdrId
  } = useApp();

  const [activeTab, setActiveTab] = useState<'details' | 'scrutiny' | 'documents' | 'timeline' | 'alerts' | 'audit'>('details');

  // Action Dialog States
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [approvalNote, setApprovalNote] = useState('Satisfactory verification of instrument details and bank lien clause.');
  
  const [discrepancyModalOpen, setDiscrepancyModalOpen] = useState(false);
  const [discrepancyField, setDiscrepancyField] = useState('FDR Amount');
  const [discrepancySubmitted, setDiscrepancySubmitted] = useState('');
  const [discrepancyExtracted, setDiscrepancyExtracted] = useState('');
  const [discrepancyReason, setDiscrepancyReason] = useState('');

  const [queryModalOpen, setQueryModalOpen] = useState(false);
  const [queryText, setQueryText] = useState('');

  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [responseText, setResponseText] = useState('');

  if (!fdrId) return null;

  const fdr = fdrRecords.find(f => f.id === fdrId);
  if (!fdr) return null;

  const institution = institutions.find(i => i.id === fdr.institutionId);
  const relatedAlerts = alerts.filter(a => a.fdrId === fdr.id && a.status === 'ACTIVE');
  const relatedAuditLogs = auditLogs.filter(a => a.targetId === fdr.id);
  const relatedRelease = releaseRequests.find(r => r.fdrId === fdr.id);

  // Replacement / Original links
  const replacedOriginalFDR = fdr.replacesFDRId ? fdrRecords.find(f => f.id === fdr.replacesFDRId) : null;
  const successorReplacementFDR = fdr.replacementFDRId ? fdrRecords.find(f => f.id === fdr.replacementFDRId) : null;

  const daysLeft = getDaysDifference(fdr.maturityDate);

  const handleApprove = () => {
    updateFDRVerification(fdr.id, 'VERIFIED', approvalNote);
    setConfirmApproveOpen(false);
  };

  const handleFlagDiscrepancySubmit = () => {
    if (!discrepancyReason.trim()) return;
    flagDiscrepancy(
      fdr.id,
      discrepancyField,
      discrepancySubmitted || 'Submitted Form Value',
      discrepancyExtracted || 'Extracted Receipt Value',
      discrepancyReason
    );
    setDiscrepancyModalOpen(false);
    setDiscrepancyReason('');
  };

  const handleQuerySubmit = () => {
    if (!queryText.trim()) return;
    requestAdditionalInfo(fdr.id, queryText);
    setQueryModalOpen(false);
    setQueryText('');
  };

  const handleResponseSubmit = () => {
    if (!responseText.trim()) return;
    respondToQuery(fdr.id, responseText);
    setResponseModalOpen(false);
    setResponseText('');
  };

  return (
    <>
      <Modal
        isOpen={!!fdrId}
        onClose={onClose}
        title={`FDR Instrument Record: ${fdr.id}`}
        subtitle={`${fdr.institutionName} (${fdr.institutionCode})`}
        maxWidth="4xl"
        footer={
          <div className="w-full flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">
              Instrument: {fdr.instrumentNumber} • Last updated: {fdr.lastUpdatedDate}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800"
            >
              Close Record
            </button>
          </div>
        }
      >
        {/* Status Header Banner */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div>
              <span className="text-[11px] text-slate-500 block uppercase font-bold tracking-wider">Verification</span>
              <StatusBadge type="verification" value={fdr.verificationStatus} />
            </div>
            <div className="border-l border-slate-200 pl-3">
              <span className="text-[11px] text-slate-500 block uppercase font-bold tracking-wider">Maturity Status</span>
              <StatusBadge type="maturity" value={fdr.maturityStatus} />
            </div>
            <div className="border-l border-slate-200 pl-3">
              <span className="text-[11px] text-slate-500 block uppercase font-bold tracking-wider">Renewal</span>
              <StatusBadge type="renewal" value={fdr.renewalStatus} />
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-500">Secured Amount</div>
            <div className="text-xl font-extrabold text-slate-900">{formatINR(fdr.fdrAmount)}</div>
          </div>
        </div>

        {/* ROLE CONTEXT ACTION BAR */}
        <div className="mb-6 p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span className="text-xs font-bold text-blue-950">
              Permitted Actions ({currentRole}):
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Bureau Admin & Verifier Actions */}
            {(currentRole === 'ADMIN' || currentRole === 'VERIFIER') && (
              <>
                {fdr.verificationStatus !== 'VERIFIED' && (
                  <button
                    onClick={() => setConfirmApproveOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve Verification
                  </button>
                )}

                <button
                  onClick={() => {
                    setDiscrepancySubmitted(formatINR(fdr.fdrAmount));
                    setDiscrepancyExtracted('₹45,00,000');
                    setDiscrepancyModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs inline-flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Flag Discrepancy
                </button>

                <button
                  onClick={() => setQueryModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs inline-flex items-center gap-1.5"
                >
                  <FileQuestion className="w-3.5 h-3.5" /> Request Info
                </button>
              </>
            )}

            {/* Institutional User Actions */}
            {currentRole === 'INSTITUTION' && (
              <>
                {fdr.pendingQuery && !fdr.pendingQuery.isResolved && (
                  <button
                    onClick={() => setResponseModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5 animate-pulse"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Respond to Regulatory Query
                  </button>
                )}

                {/* Initiate Renewal */}
                {fdr.renewalStatus === 'PENDING_INITIATION' && (
                  <button
                    onClick={() => openSubmissionWizard(fdr.institutionId, fdr.id)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Submit Replacement FDR
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 mb-6 flex gap-4 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'details', label: 'Instrument & Bank' },
            { id: 'documents', label: `Documents (${fdr.documents.length})` },
            { id: 'scrutiny', label: `Scrutiny & Notes (${fdr.scrutinyNotes.length})` },
            { id: 'timeline', label: 'Renewal Lineage' },
            { id: 'alerts', label: `Automation Alerts (${relatedAlerts.length})` },
            { id: 'audit', label: `Audit Events (${relatedAuditLogs.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-900 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: DETAILS */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Institution Section */}
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                Technical Institution Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Institution Name</span>
                  <span className="font-semibold text-slate-900">{fdr.institutionName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">AICTE Permanent Code</span>
                  <span className="font-mono font-semibold text-blue-800">{fdr.institutionCode}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Location</span>
                  <span className="font-medium text-slate-900">{institution?.city}, {institution?.state}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Institutional Category</span>
                  <span className="font-medium text-slate-900">{institution?.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Contact Email</span>
                  <span className="font-medium text-slate-900">{institution?.contactEmail}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Contact Telephone</span>
                  <span className="font-medium text-slate-900">{institution?.contactPhone}</span>
                </div>
              </div>
            </div>

            {/* Instrument Section */}
            <div className="rounded-xl border border-slate-200 p-4 bg-white">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                Fixed Deposit Instrument Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Issuing Bank Name</span>
                  <span className="font-semibold text-slate-900">{fdr.bankName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Bank Branch</span>
                  <span className="font-medium text-slate-900">{fdr.branchName || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">IFSC Code</span>
                  <span className="font-mono font-bold text-slate-900">{fdr.ifscCode || 'MISSING'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Instrument / Receipt Number</span>
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {fdr.instrumentNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Deposit Purpose</span>
                  <span className="font-medium text-slate-900">{fdr.purpose.replace(/_/g, ' ')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Annual Interest Rate</span>
                  <span className="font-bold text-slate-900">{fdr.interestRate}% p.a.</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Date of Issue</span>
                  <span className="font-medium text-slate-900">{formatDate(fdr.issueDate)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Maturity Date</span>
                  <span className="font-bold text-slate-900">{formatDate(fdr.maturityDate)}</span>
                  <span className="text-[11px] text-slate-500 ml-1">
                    ({daysLeft >= 0 ? `${daysLeft} days remaining` : `${getDaysPast(fdr.maturityDate)} days overdue`})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tenure</span>
                  <span className="font-medium text-slate-900">{fdr.tenureMonths} Months</span>
                </div>
              </div>
            </div>

            {/* Pending Query Warning if active */}
            {fdr.pendingQuery && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-2 text-xs">
                <div className="font-bold text-purple-900 flex items-center gap-1.5">
                  <FileQuestion className="w-4 h-4 text-purple-700" />
                  Regulatory Clarification Query ({fdr.pendingQuery.isResolved ? 'Resolved' : 'Pending Response'})
                </div>
                <p className="text-purple-800">"{fdr.pendingQuery.queryText}"</p>
                <div className="text-[11px] text-purple-600">
                  Issued by {fdr.pendingQuery.requestedBy} on {fdr.pendingQuery.requestedAt}
                </div>
                {fdr.pendingQuery.response && (
                  <div className="mt-2 pt-2 border-t border-purple-200 bg-white/70 p-2 rounded">
                    <span className="font-bold text-slate-800 block">Institution Response:</span>
                    <p className="text-slate-700">{fdr.pendingQuery.response}</p>
                    <span className="text-[10px] text-slate-500">Submitted on {fdr.pendingQuery.responseDate}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-lg text-xs text-amber-800">
              <span className="font-bold">Surveillance Distinction:</span> The system distinguishes between institution-submitted form declarations and simulated OCR text extraction findings. Documents are stored in client-side demonstration memory.
            </div>

            {fdr.documents.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No supporting documents attached to this record.
              </div>
            ) : (
              fdr.documents.map(doc => (
                <div key={doc.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900">{doc.fileName}</span>
                        <p className="text-[11px] text-slate-500">{doc.fileSize} • Uploaded on {doc.uploadDate}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                      {doc.category}
                    </span>
                  </div>

                  {/* Simulated OCR Extraction Table */}
                  {doc.simulatedExtractedText && (
                    <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                      <div className="font-bold text-slate-800 mb-2 flex items-center justify-between">
                        <span>Simulated OCR Extraction Comparison</span>
                        <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Confidence: {((doc.simulatedExtractedText.confidenceScore || 0.95) * 100).toFixed(0)}%
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 bg-white rounded border border-slate-200">
                          <span className="text-slate-400 block font-semibold">Form Submitted Value</span>
                          <div className="mt-1 space-y-1">
                            <div>Amount: <span className="font-bold">{formatINR(fdr.fdrAmount)}</span></div>
                            <div>Instrument #: <span className="font-mono">{fdr.instrumentNumber}</span></div>
                            <div>Bank: <span>{fdr.bankName}</span></div>
                          </div>
                        </div>

                        <div className="p-2 bg-white rounded border border-slate-200">
                          <span className="text-slate-400 block font-semibold">Simulated OCR Extracted Value</span>
                          <div className="mt-1 space-y-1">
                            <div>
                              Amount:{' '}
                              <span className={`font-bold ${
                                doc.simulatedExtractedText.amount && doc.simulatedExtractedText.amount !== fdr.fdrAmount
                                  ? 'text-rose-600 bg-rose-50 px-1 rounded'
                                  : 'text-slate-800'
                              }`}>
                                {formatINR(doc.simulatedExtractedText.amount)}
                              </span>
                            </div>
                            <div>Instrument #: <span className="font-mono">{doc.simulatedExtractedText.instrumentNumber || fdr.instrumentNumber}</span></div>
                            <div>Bank: <span>{doc.simulatedExtractedText.bankName || fdr.bankName}</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: SCRUTINY & NOTES */}
        {activeTab === 'scrutiny' && (
          <div className="space-y-4">
            {/* Discrepancy details banner if flagged */}
            {fdr.hasDiscrepancy && fdr.discrepancyDetails && (
              <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl space-y-2">
                <div className="font-bold text-rose-900 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Active Regulatory Discrepancies
                </div>
                {fdr.discrepancyDetails.map((d, i) => (
                  <div key={i} className="text-xs bg-white p-3 rounded border border-rose-200 space-y-1">
                    <div className="font-bold text-slate-900">{d.field}</div>
                    <div className="grid grid-cols-2 gap-2 text-slate-700">
                      <div>Submitted Form: <span className="font-semibold">{d.submittedValue}</span></div>
                      <div>Document Extracted: <span className="font-semibold text-rose-700">{d.extractedValue}</span></div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{d.reason}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Scrutiny Notes History */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Scrutiny Log & Audit Notes
              </h4>
              {fdr.scrutinyNotes.length === 0 ? (
                <p className="text-xs text-slate-400 py-4">No scrutiny notes recorded yet.</p>
              ) : (
                fdr.scrutinyNotes.map(n => (
                  <div key={n.id} className="p-3 rounded-lg border border-slate-200 bg-white text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{n.authorName} ({n.authorRole})</span>
                      <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{n.note}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: RENEWAL LINEAGE */}
        {activeTab === 'timeline' && (
          <div className="space-y-6 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider">
                FDR Lifecycle & Rollover Lineage
              </h4>
              <p className="text-slate-600">
                AICTE mandates continuous financial coverage. When an FDR reaches maturity, a replacement instrument is linked without erasing original historical records.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                {/* Predecessor */}
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[11px] font-semibold">Predecessor (Original FDR)</span>
                  {replacedOriginalFDR ? (
                    <div className="mt-1 space-y-1">
                      <span className="font-mono font-bold text-blue-700">{replacedOriginalFDR.id}</span>
                      <div>Instrument: {replacedOriginalFDR.instrumentNumber}</div>
                      <div>Amount: {formatINR(replacedOriginalFDR.fdrAmount)}</div>
                      <button
                        onClick={() => setSelectedFdrId(replacedOriginalFDR.id)}
                        className="text-blue-700 font-semibold hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        Open Predecessor <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-slate-500 mt-1 italic">This is an original root instrument (No predecessor).</p>
                  )}
                </div>

                {/* Successor */}
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[11px] font-semibold">Successor (Replacement FDR)</span>
                  {successorReplacementFDR ? (
                    <div className="mt-1 space-y-1">
                      <span className="font-mono font-bold text-emerald-700">{successorReplacementFDR.id}</span>
                      <div>Instrument: {successorReplacementFDR.instrumentNumber}</div>
                      <div>Status: <StatusBadge type="verification" value={successorReplacementFDR.verificationStatus} size="sm" /></div>
                      <button
                        onClick={() => setSelectedFdrId(successorReplacementFDR.id)}
                        className="text-blue-700 font-semibold hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        Open Successor <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <p className="text-slate-500 italic">No replacement linked yet.</p>
                      {currentRole === 'INSTITUTION' && fdr.renewalStatus === 'PENDING_INITIATION' && (
                        <button
                          onClick={() => openSubmissionWizard(fdr.institutionId, fdr.id)}
                          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold"
                        >
                          Submit Replacement Now
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ALERTS */}
        {activeTab === 'alerts' && (
          <div className="space-y-3">
            {relatedAlerts.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No active automation alerts triggered for this record.
              </div>
            ) : (
              relatedAlerts.map(alert => (
                <div key={alert.id} className="p-4 rounded-xl border border-red-200 bg-red-50/50 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-950 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      {alert.title}
                    </span>
                    <StatusBadge type="severity" value={alert.severity} size="sm" />
                  </div>
                  <p className="text-slate-700"><span className="font-semibold">Evidence:</span> {alert.evidence}</p>
                  <p className="text-slate-600"><span className="font-semibold">Why this matters:</span> {alert.explanation}</p>
                  <div className="p-2 bg-white rounded border border-red-200 text-red-900 font-medium">
                    Recommended Action: {alert.recommendedNextAction}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 6: AUDIT */}
        {activeTab === 'audit' && (
          <div className="space-y-2 text-xs">
            {relatedAuditLogs.length === 0 ? (
              <p className="text-slate-400 text-center py-6">No specific audit entries logged for this record ID.</p>
            ) : (
              relatedAuditLogs.map(log => (
                <div key={log.id} className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-blue-800">{log.action}</span>
                    <span className="text-[11px] text-slate-400">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-700">{log.description}</p>
                  <div className="text-[10px] text-slate-500">Performed by: {log.userName} ({log.userRole})</div>
                </div>
              ))
            )}
          </div>
        )}
      </Modal>

      {/* Approve Confirmation Modal */}
      <ConfirmDialog
        isOpen={confirmApproveOpen}
        onClose={() => setConfirmApproveOpen(false)}
        onConfirm={handleApprove}
        title="Approve FDR Verification"
        message={`Are you sure you want to mark FDR ${fdr.id} (${fdr.instrumentNumber}) as VERIFIED?\n\nThis will update compliance metrics and clear pending verification flags.`}
        confirmLabel="Endorse & Approve"
        variant="primary"
      />

      {/* Discrepancy Flagging Modal */}
      <Modal
        isOpen={discrepancyModalOpen}
        onClose={() => setDiscrepancyModalOpen(false)}
        title="Flag Instrument Discrepancy"
        subtitle={`Record: ${fdr.id} - ${fdr.institutionName}`}
        maxWidth="md"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setDiscrepancyModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleFlagDiscrepancySubmit}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white"
            >
              Confirm Discrepancy
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Discrepant Field</label>
            <select
              value={discrepancyField}
              onChange={e => setDiscrepancyField(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white"
            >
              <option value="FDR Amount">FDR Face Amount</option>
              <option value="Maturity Date">Maturity Date</option>
              <option value="Instrument Number">Instrument / Receipt Number</option>
              <option value="Bank Name">Issuing Bank Name</option>
              <option value="Lien Clause">AICTE Joint Lien Endorsement</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Form Submitted Value</label>
            <input
              type="text"
              value={discrepancySubmitted}
              onChange={e => setDiscrepancySubmitted(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Document / Bank Extracted Value</label>
            <input
              type="text"
              value={discrepancyExtracted}
              onChange={e => setDiscrepancyExtracted(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Discrepancy Scrutiny Findings *</label>
            <textarea
              rows={3}
              value={discrepancyReason}
              onChange={e => setDiscrepancyReason(e.target.value)}
              placeholder="Detail the conflict observed between submitted record and verified document scan..."
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>
      </Modal>

      {/* Query Request Modal */}
      <Modal
        isOpen={queryModalOpen}
        onClose={() => setQueryModalOpen(false)}
        title="Request Additional Information / Rectification"
        subtitle={`Dispatch query to ${fdr.institutionName}`}
        maxWidth="md"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setQueryModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleQuerySubmit}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
            >
              Dispatch Clarification Query
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Specify the deficient information or document requirement. The record will move to "INFO_REQUIRED" status and notify the institutional user.
          </p>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Clarification Notice Text *</label>
            <textarea
              rows={4}
              value={queryText}
              onChange={e => setQueryText(e.target.value)}
              placeholder="e.g. Bank confirmation letter does not contain branch seal and joint lien clause. Please furnish certified certificate from branch manager."
              className="w-full p-2.5 border rounded-lg"
            />
          </div>
        </div>
      </Modal>

      {/* Institution Respond to Query Modal */}
      <Modal
        isOpen={responseModalOpen}
        onClose={() => setResponseModalOpen(false)}
        title="Respond to Regulatory Clarification Query"
        subtitle={`FDR Record: ${fdr.id}`}
        maxWidth="md"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setResponseModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleResponseSubmit}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              Submit Response
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <span className="font-bold text-purple-900 block mb-1">Bureau Query:</span>
            <p className="text-purple-800">{fdr.pendingQuery?.queryText}</p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Institution Response *</label>
            <textarea
              rows={4}
              value={responseText}
              onChange={e => setResponseText(e.target.value)}
              placeholder="State institutional explanation and details of revised documentation..."
              className="w-full p-2.5 border rounded-lg"
            />
          </div>
        </div>
      </Modal>
    </>
  );
};
