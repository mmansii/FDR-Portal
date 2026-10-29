export type Role = 'ADMIN' | 'VERIFIER' | 'INSTITUTION';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  designation: string;
  department: string;
  institutionId?: string; // Present if role is INSTITUTION
  institutionName?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export type FDRVerificationStatus = 
  | 'PENDING' 
  | 'UNDER_REVIEW' 
  | 'DISCREPANCY_FLAGGED' 
  | 'INFO_REQUIRED' 
  | 'VERIFIED' 
  | 'REJECTED';

export type FDRMaturityStatus = 
  | 'ACTIVE' 
  | 'UPCOMING_30' 
  | 'UPCOMING_15' 
  | 'UPCOMING_7' 
  | 'MATURED' 
  | 'OVERDUE_REVIEW'
  | 'CLOSED' 
  | 'RELEASED';

export type RenewalStatus = 
  | 'NONE_REQUIRED' 
  | 'PENDING_INITIATION' 
  | 'INITIATED' 
  | 'REPLACEMENT_SUBMITTED' 
  | 'REPLACEMENT_VERIFIED' 
  | 'RENEWAL_COMPLETED';

export interface DocumentMetadata {
  id: string;
  fileName: string;
  fileSize: string; // e.g., '1.8 MB'
  fileType: string; // 'application/pdf'
  uploadDate: string;
  category: 'FDR_RECEIPT' | 'BANK_CONFIRMATION' | 'JOINT_VENTURE_AFFIDAVIT' | 'BOARD_RESOLUTION' | 'OTHER';
  isLocallySelected: boolean;
  simulatedExtractedText?: {
    bankName?: string;
    instrumentNumber?: string;
    amount?: number;
    issueDate?: string;
    maturityDate?: string;
    jointHolder?: string;
    confidenceScore?: number; // e.g. 0.94
  };
}

export interface ScrutinyNote {
  id: string;
  authorName: string;
  authorRole: Role;
  timestamp: string;
  note: string;
  type: 'GENERAL' | 'DISCREPANCY' | 'QUERY' | 'APPROVAL' | 'REJECTION';
}

export interface FDRRecord {
  id: string; // e.g. 'FDR-2026-001'
  institutionId: string;
  institutionName: string;
  institutionCode: string;
  
  // Bank & Instrument Details
  bankName: string;
  branchName: string;
  ifscCode: string;
  instrumentNumber: string; // FDR receipt number
  fdrAmount: number; // in INR
  issueDate: string; // YYYY-MM-DD
  maturityDate: string; // YYYY-MM-DD
  tenureMonths: number;
  interestRate: number; // percentage
  purpose: 'SECURITY_DEPOSIT' | 'PROGRAMME_ENDOWMENT' | 'INFRASTRUCTURE_FUND' | 'NEW_INSTITUTION_DEPOSIT';
  
  // Statuses
  verificationStatus: FDRVerificationStatus;
  maturityStatus: FDRMaturityStatus;
  renewalStatus: RenewalStatus;
  
  // Links for Renewal/Replacement Lifecycle
  isReplacement: boolean;
  replacesFDRId?: string; // links to previous FDR
  replacementFDRId?: string; // links to new replacement FDR
  
  // Documents & Metadata
  documents: DocumentMetadata[];
  submittedBy: string;
  submissionDate: string;
  lastUpdatedDate: string;
  verifiedBy?: string;
  verifiedDate?: string;
  
  // Field-level Discrepancy details
  hasDiscrepancy: boolean;
  discrepancyDetails?: {
    field: string;
    submittedValue: string;
    extractedValue: string;
    reason: string;
  }[];
  
  // Additional info query
  pendingQuery?: {
    requestedAt: string;
    requestedBy: string;
    queryText: string;
    isResolved: boolean;
    response?: string;
    responseDate?: string;
  };
  
  // Scrutiny History
  scrutinyNotes: ScrutinyNote[];
}

export interface Institution {
  id: string;
  code: string; // e.g. 'AICTE-DL-ENG-1042'
  name: string;
  state: string;
  city: string;
  type: 'UNIVERSITY_DEPT' | 'GOVT_AIDED' | 'SELF_FINANCED' | 'CENTRAL_INSTITUTION';
  category: 'ENGINEERING' | 'MANAGEMENT' | 'PHARMACY' | 'POLYTECHNIC' | 'APPLIED_ARTS';
  status: 'ACTIVE' | 'UNDER_SCRUTINY' | 'DEFAULTER_FLAGGED';
  headName: string;
  contactEmail: string;
  contactPhone: string;
  approvedIntake: number;
  totalDepositRequired: number; // in INR
  registeredYear: number;
}

export type ReleaseRequestStatus = 
  | 'SUBMITTED' 
  | 'DOCUMENTS_UNDER_REVIEW' 
  | 'ADDITIONAL_INFO_REQUIRED' 
  | 'AWAITING_COMPETENT_AUTHORITY' 
  | 'APPROVED_FOR_PROCESSING' 
  | 'REJECTED_WITH_REASON' 
  | 'PROCESSING_RECORDED' 
  | 'CLOSED';

export interface ReleaseRefundRequest {
  id: string; // e.g. 'REL-2026-014'
  fdrId: string;
  fdrInstrumentNumber: string;
  institutionId: string;
  institutionName: string;
  institutionCode: string;
  requestType: 'FULL_RELEASE' | 'PARTIAL_RELEASE' | 'SUBSTITUTION_RELEASE' | 'CLOSURE_REFUND';
  requestAmount: number;
  reason: string;
  supportingDocuments: DocumentMetadata[];
  status: ReleaseRequestStatus;
  submissionDate: string;
  lastUpdatedDate: string;
  assignedReviewer?: string;
  reviewNotes: ScrutinyNote[];
  authorityApprovalRef?: string;
  closureRemarks?: string;
}

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type AlertCategory = 
  | 'UPCOMING_MATURITY' 
  | 'MATURITY_PASSED' 
  | 'MISSING_INFO' 
  | 'DATE_INCONSISTENCY' 
  | 'POTENTIAL_DUPLICATE' 
  | 'RENEWAL_TRACKING' 
  | 'VERIFICATION_DELAY' 
  | 'DISCREPANCY_DETECTED' 
  | 'RELEASE_DELAY' 
  | 'UNRESOLVED_ACTION';

export interface AutomationRuleConfig {
  id: string;
  ruleCode: string; // 'RULE_1' through 'RULE_10'
  name: string;
  category: AlertCategory;
  description: string;
  enabled: boolean;
  severity: AlertSeverity;
  thresholdDays?: number; // e.g. 30 for maturity, 14 for verification delay
  secondaryThresholdDays?: number; // e.g. 15, 7
  conditionDescription: string;
  recommendedAction: string;
}

export interface AutomationAlert {
  id: string; // e.g. 'ALT-2026-004'
  ruleId: string;
  ruleCode: string;
  category: AlertCategory;
  severity: AlertSeverity;
  fdrId?: string;
  fdrReferenceNumber?: string;
  institutionId: string;
  institutionName: string;
  title: string;
  evidence: string;
  explanation: string;
  recommendedNextAction: string;
  targetModule: 'repository' | 'verification' | 'maturity' | 'release' | 'institutions';
  detectedAt: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNote?: string;
}

export interface AutomationScanSummary {
  scanTimestamp: string;
  recordsEvaluated: number;
  rulesEvaluated: number;
  alertsCreated: number;
  alertsUpdated: number;
  alertsResolved: number;
  activeAlertsCount: number;
  criticalAlertsCount: number;
  highAlertsCount: number;
}

export interface AuditLogEntry {
  id: string; // e.g. 'AUD-2026-0089'
  timestamp: string;
  userName: string;
  userRole: Role;
  action: string; // e.g. 'FDR_SUBMITTED', 'VERIFICATION_APPROVED', 'SCAN_RUN', 'DISCREPANCY_FLAGGED'
  targetType: 'FDR' | 'INSTITUTION' | 'RELEASE_REQUEST' | 'RULE_CONFIG' | 'AUTOMATION_SCAN' | 'SYSTEM';
  targetId?: string;
  description: string;
  details?: Record<string, any>;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: AlertCategory | 'SYSTEM';
  severity: AlertSeverity | 'INFO';
  timestamp: string;
  isRead: boolean;
  relatedFdrId?: string;
  relatedInstitutionId?: string;
  targetModule?: string;
}

export interface ImpactMetrics {
  recordsEvaluated: number;
  upcomingMaturitiesFlagged: number;
  discrepanciesUncovered: number;
  duplicatesPrevented: number;
  missingInfoDetected: number;
  simulatedManualHoursSaved: number;
  simulatedAvgResolutionDays: number;
  illustrativeSlaCompliance: number; // e.g. 96.4%
}
