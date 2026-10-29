import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  AlertCircle, 
  XCircle, 
  RefreshCw, 
  ShieldCheck, 
  FileSearch,
  FileQuestion,
  CheckCheck
} from 'lucide-react';
import { 
  FDRVerificationStatus, 
  FDRMaturityStatus, 
  RenewalStatus, 
  AlertSeverity,
  ReleaseRequestStatus
} from '../../types';

interface StatusBadgeProps {
  type: 'verification' | 'maturity' | 'renewal' | 'severity' | 'release';
  value: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, size = 'md' }) => {
  const isSm = size === 'sm';
  const sizeClasses = isSm ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1 font-medium';

  // 1. Verification Status
  if (type === 'verification') {
    const v = value as FDRVerificationStatus;
    switch (v) {
      case 'VERIFIED':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses}`}>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Scrutiny</span>
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
            <FileSearch className="w-3.5 h-3.5 text-blue-600" />
            <span>Under Review</span>
          </span>
        );
      case 'DISCREPANCY_FLAGGED':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-300 font-semibold ${sizeClasses}`}>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Discrepancy</span>
          </span>
        );
      case 'INFO_REQUIRED':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses}`}>
            <FileQuestion className="w-3.5 h-3.5 text-purple-600" />
            <span>Info Required</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 ${sizeClasses}`}>
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Rejected</span>
          </span>
        );
      default:
        return <span className={`bg-gray-100 text-gray-700 border border-gray-200 rounded-full ${sizeClasses}`}>{value}</span>;
    }
  }

  // 2. Maturity Status
  if (type === 'maturity') {
    const m = value as FDRMaturityStatus;
    switch (m) {
      case 'ACTIVE':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Active Term</span>
          </span>
        );
      case 'UPCOMING_30':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Matures &lt; 30d</span>
          </span>
        );
      case 'UPCOMING_15':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 font-medium ${sizeClasses}`}>
            <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
            <span>Matures &lt; 15d</span>
          </span>
        );
      case 'UPCOMING_7':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-semibold ${sizeClasses}`}>
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Matures &lt; 7d</span>
          </span>
        );
      case 'MATURED':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses}`}>
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span>Matured</span>
          </span>
        );
      case 'OVERDUE_REVIEW':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-red-100 text-red-800 border border-red-300 font-bold ${sizeClasses}`}>
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Overdue Review</span>
          </span>
        );
      case 'RELEASED':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 ${sizeClasses}`}>
            <CheckCheck className="w-3.5 h-3.5 text-gray-500" />
            <span>Released</span>
          </span>
        );
      default:
        return <span className={`bg-gray-100 text-gray-700 rounded-full ${sizeClasses}`}>{value}</span>;
    }
  }

  // 3. Renewal Status
  if (type === 'renewal') {
    const r = value as RenewalStatus;
    switch (r) {
      case 'NONE_REQUIRED':
        return <span className={`text-gray-500 ${sizeClasses}`}>Not Due</span>;
      case 'PENDING_INITIATION':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Renewal Due</span>
          </span>
        );
      case 'INITIATED':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            <span>Initiated</span>
          </span>
        );
      case 'REPLACEMENT_SUBMITTED':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses}`}>
            <FileSearch className="w-3.5 h-3.5 text-purple-600" />
            <span>Replacement In Queue</span>
          </span>
        );
      case 'REPLACEMENT_VERIFIED':
      case 'RENEWAL_COMPLETED':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Completed</span>
          </span>
        );
      default:
        return <span className={`bg-gray-100 text-gray-700 rounded-full ${sizeClasses}`}>{value}</span>;
    }
  }

  // 4. Severity
  if (type === 'severity') {
    const s = value as AlertSeverity;
    switch (s) {
      case 'CRITICAL':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full bg-red-100 text-red-800 border border-red-300 font-bold ${sizeClasses}`}>
            <AlertCircle className="w-3 h-3 text-red-600" />
            <span>CRITICAL</span>
          </span>
        );
      case 'HIGH':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full bg-orange-100 text-orange-800 border border-orange-300 font-semibold ${sizeClasses}`}>
            <AlertTriangle className="w-3 h-3 text-orange-600" />
            <span>HIGH</span>
          </span>
        );
      case 'MEDIUM':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 ${sizeClasses}`}>
            <Clock className="w-3 h-3 text-amber-600" />
            <span>MEDIUM</span>
          </span>
        );
      case 'LOW':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
            <span>LOW</span>
          </span>
        );
      default:
        return <span className={`bg-gray-100 text-gray-700 rounded-full ${sizeClasses}`}>{value}</span>;
    }
  }

  // 5. Release Request Status
  if (type === 'release') {
    const rel = value as ReleaseRequestStatus;
    switch (rel) {
      case 'SUBMITTED':
        return <span className={`inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses}`}><Clock className="w-3 h-3" /> Submitted</span>;
      case 'DOCUMENTS_UNDER_REVIEW':
        return <span className={`inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}><FileSearch className="w-3 h-3" /> Docs Under Review</span>;
      case 'ADDITIONAL_INFO_REQUIRED':
        return <span className={`inline-flex items-center gap-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses}`}><FileQuestion className="w-3 h-3" /> Info Required</span>;
      case 'AWAITING_COMPETENT_AUTHORITY':
        return <span className={`inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-medium ${sizeClasses}`}><Clock className="w-3 h-3" /> Awaiting Authority</span>;
      case 'APPROVED_FOR_PROCESSING':
        return <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold ${sizeClasses}`}><CheckCircle2 className="w-3 h-3" /> Approved</span>;
      case 'REJECTED_WITH_REASON':
        return <span className={`inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-semibold ${sizeClasses}`}><XCircle className="w-3 h-3" /> Rejected</span>;
      case 'PROCESSING_RECORDED':
        return <span className={`inline-flex items-center gap-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 ${sizeClasses}`}><CheckCheck className="w-3 h-3" /> Recorded</span>;
      case 'CLOSED':
        return <span className={`inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200 ${sizeClasses}`}>Closed</span>;
      default:
        return <span className={`bg-gray-100 text-gray-700 rounded-full ${sizeClasses}`}>{value}</span>;
    }
  }

  return <span className={`bg-gray-100 text-gray-700 rounded-full ${sizeClasses}`}>{value}</span>;
};
