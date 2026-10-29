import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Role, 
  UserProfile, 
  Institution, 
  FDRRecord, 
  ReleaseRefundRequest, 
  AutomationRuleConfig, 
  AutomationAlert, 
  AutomationScanSummary, 
  AuditLogEntry, 
  NotificationItem,
  FDRVerificationStatus,
  ReleaseRequestStatus
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_INSTITUTIONS, 
  INITIAL_FDR_RECORDS, 
  INITIAL_RELEASE_REQUESTS, 
  INITIAL_AUTOMATION_RULES, 
  INITIAL_AUDIT_LOG, 
  INITIAL_NOTIFICATIONS 
} from '../data/initialData';
import { loadStoredState, saveStoredState, clearStoredState } from '../services/storage';
import { runAutomationScan } from '../services/automationEngine';

interface AppState {
  currentRole: Role;
  currentUserId: string;
  users: UserProfile[];
  institutions: Institution[];
  fdrRecords: FDRRecord[];
  releaseRequests: ReleaseRefundRequest[];
  rulesConfig: AutomationRuleConfig[];
  alerts: AutomationAlert[];
  scanSummary: AutomationScanSummary | null;
  auditLogs: AuditLogEntry[];
  notifications: NotificationItem[];
  activeModule: string;
  selectedFdrId: string | null;
  selectedInstitutionId: string | null;
  submissionWizardOpen: boolean;
  submissionPreselectedInstitutionId?: string;
  submissionRenewalOfFdrId?: string;
  mobileNavOpen: boolean;
}

interface AppContextType extends AppState {
  currentUser: UserProfile;
  currentInstitution?: Institution;
  isInstitutionalScoped: boolean;
  
  // Navigation & UI
  setActiveModule: (module: string) => void;
  setSelectedFdrId: (id: string | null) => void;
  setSelectedInstitutionId: (id: string | null) => void;
  openSubmissionWizard: (preselectedInstId?: string, renewalOfFdrId?: string) => void;
  closeSubmissionWizard: () => void;
  setMobileNavOpen: (open: boolean) => void;
  
  // Role & User
  switchRole: (role: Role, userId?: string) => void;
  
  // Workflows
  submitFDR: (recordData: Partial<FDRRecord>) => string;
  updateFDRVerification: (fdrId: string, status: FDRVerificationStatus, note?: string) => void;
  flagDiscrepancy: (fdrId: string, field: string, submitted: string, extracted: string, reason: string) => void;
  requestAdditionalInfo: (fdrId: string, queryText: string) => void;
  respondToQuery: (fdrId: string, responseText: string) => void;
  initiateRenewal: (fdrId: string) => void;
  submitReplacementFDR: (originalFdrId: string, replacementData: Partial<FDRRecord>) => string;
  submitReleaseRequest: (requestData: Partial<ReleaseRefundRequest>) => string;
  updateReleaseStatus: (requestId: string, status: ReleaseRequestStatus, note?: string, approvalRef?: string) => void;
  
  // Automation
  executeAutomationScan: () => AutomationScanSummary;
  updateRuleConfig: (ruleId: string, updates: Partial<AutomationRuleConfig>) => void;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string, resolutionNote?: string) => void;
  
  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  
  // Demo Controls
  resetToInitialData: () => void;
  addAuditLog: (action: string, targetType: any, targetId: string, description: string) => void;
}

const defaultInitialState: AppState = {
  currentRole: 'ADMIN',
  currentUserId: 'USR-ADMIN-01',
  users: INITIAL_USERS,
  institutions: INITIAL_INSTITUTIONS,
  fdrRecords: INITIAL_FDR_RECORDS,
  releaseRequests: INITIAL_RELEASE_REQUESTS,
  rulesConfig: INITIAL_AUTOMATION_RULES,
  alerts: [],
  scanSummary: null,
  auditLogs: INITIAL_AUDIT_LOG,
  notifications: INITIAL_NOTIFICATIONS,
  activeModule: 'dashboard',
  selectedFdrId: null,
  selectedInstitutionId: null,
  submissionWizardOpen: false,
  mobileNavOpen: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const loaded = loadStoredState<AppState>(defaultInitialState);
    // If alerts are empty upon load, execute initial scan
    if (!loaded.alerts || loaded.alerts.length === 0) {
      const { alerts, summary } = runAutomationScan(
        loaded.fdrRecords,
        loaded.releaseRequests,
        loaded.rulesConfig,
        []
      );
      loaded.alerts = alerts;
      loaded.scanSummary = summary;
    }
    return loaded;
  });

  // Persist state changes
  useEffect(() => {
    saveStoredState(state);
  }, [state]);

  const currentUser = state.users.find(u => u.id === state.currentUserId) || state.users[0];
  const isInstitutionalScoped = state.currentRole === 'INSTITUTION';
  const currentInstitution = isInstitutionalScoped && currentUser.institutionId
    ? state.institutions.find(i => i.id === currentUser.institutionId)
    : undefined;

  const setActiveModule = (module: string) => {
    setState(prev => ({ ...prev, activeModule: module, mobileNavOpen: false }));
  };

  const setMobileNavOpen = (open: boolean) => {
    setState(prev => ({ ...prev, mobileNavOpen: open }));
  };

  const setSelectedFdrId = (id: string | null) => {
    setState(prev => ({ ...prev, selectedFdrId: id }));
  };

  const setSelectedInstitutionId = (id: string | null) => {
    setState(prev => ({ ...prev, selectedInstitutionId: id }));
  };

  const openSubmissionWizard = (preselectedInstId?: string, renewalOfFdrId?: string) => {
    setState(prev => ({
      ...prev,
      submissionWizardOpen: true,
      submissionPreselectedInstitutionId: preselectedInstId,
      submissionRenewalOfFdrId: renewalOfFdrId,
    }));
  };

  const closeSubmissionWizard = () => {
    setState(prev => ({
      ...prev,
      submissionWizardOpen: false,
      submissionPreselectedInstitutionId: undefined,
      submissionRenewalOfFdrId: undefined,
    }));
  };

  const addAuditLog = (action: string, targetType: any, targetId: string, description: string) => {
    const newEntry: AuditLogEntry = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userName: currentUser.name,
      userRole: state.currentRole,
      action,
      targetType,
      targetId,
      description,
    };
    setState(prev => ({
      ...prev,
      auditLogs: [newEntry, ...prev.auditLogs],
    }));
  };

  const switchRole = (role: Role, userId?: string) => {
    let targetUser: UserProfile | undefined;
    if (userId) {
      targetUser = state.users.find(u => u.id === userId);
    } else {
      targetUser = state.users.find(u => u.role === role);
    }
    const finalUser = targetUser || state.users[0];

    // If institutional user, automatically switch to repository or dashboard
    let nextModule = state.activeModule;
    if (role === 'INSTITUTION' && ['users', 'settings'].includes(state.activeModule)) {
      nextModule = 'repository';
    }

    setState(prev => ({
      ...prev,
      currentRole: role,
      currentUserId: finalUser.id,
      activeModule: nextModule,
    }));

    addAuditLog(
      'ROLE_SWITCHED',
      'SYSTEM',
      finalUser.id,
      `User session switched to ${role} (${finalUser.name} - ${finalUser.department})`
    );
  };

  const executeAutomationScan = (): AutomationScanSummary => {
    const { alerts, summary } = runAutomationScan(
      state.fdrRecords,
      state.releaseRequests,
      state.rulesConfig,
      state.alerts
    );

    // Create notifications for newly created alerts
    const newNotifications: NotificationItem[] = alerts
      .filter(a => a.status === 'ACTIVE' && (a.severity === 'CRITICAL' || a.severity === 'HIGH'))
      .slice(0, 3)
      .map(a => ({
        id: `NOTIF-${Date.now()}-${a.id}`,
        title: a.title,
        message: a.evidence,
        category: a.category,
        severity: a.severity,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        isRead: false,
        relatedFdrId: a.fdrId,
        targetModule: a.targetModule,
      }));

    setState(prev => ({
      ...prev,
      alerts,
      scanSummary: summary,
      notifications: [...newNotifications, ...prev.notifications],
    }));

    addAuditLog(
      'AUTOMATION_SCAN_EXECUTED',
      'AUTOMATION_SCAN',
      'AICTE-SCANNER',
      `Manual automation scan run. Evaluated ${summary.recordsEvaluated} records against ${summary.rulesEvaluated} rules. Found ${summary.activeAlertsCount} active alerts (${summary.criticalAlertsCount} critical).`
    );

    return summary;
  };

  const submitFDR = (recordData: Partial<FDRRecord>): string => {
    const count = state.fdrRecords.length + 1;
    const generatedId = `FDR-2026-${count.toString().padStart(4, '0')}`;
    const todayStr = new Date().toISOString().slice(0, 10);

    const institution = state.institutions.find(i => i.id === recordData.institutionId) || state.institutions[0];

    const newRecord: FDRRecord = {
      id: generatedId,
      institutionId: institution.id,
      institutionName: institution.name,
      institutionCode: institution.code,
      bankName: recordData.bankName || 'State Bank of India',
      branchName: recordData.branchName || 'Main Branch',
      ifscCode: recordData.ifscCode || 'SBIN0000001',
      instrumentNumber: recordData.instrumentNumber || `FDR-SUB-${Date.now().toString().slice(-6)}`,
      fdrAmount: recordData.fdrAmount || 5000000,
      issueDate: recordData.issueDate || todayStr,
      maturityDate: recordData.maturityDate || '2031-10-24',
      tenureMonths: recordData.tenureMonths || 60,
      interestRate: recordData.interestRate || 7.10,
      purpose: recordData.purpose || 'SECURITY_DEPOSIT',
      verificationStatus: 'PENDING',
      maturityStatus: 'ACTIVE',
      renewalStatus: recordData.isReplacement ? 'REPLACEMENT_SUBMITTED' : 'NONE_REQUIRED',
      isReplacement: !!recordData.isReplacement,
      replacesFDRId: recordData.replacesFDRId,
      documents: recordData.documents || [],
      submittedBy: currentUser.name,
      submissionDate: todayStr,
      lastUpdatedDate: todayStr,
      hasDiscrepancy: false,
      scrutinyNotes: [
        {
          id: `NOTE-${Date.now()}`,
          authorName: currentUser.name,
          authorRole: state.currentRole,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          note: `New FDR instrument submitted via AICTE institutional portal. Awaiting Bureau verification.`,
          type: 'GENERAL',
        }
      ],
    };

    // If this is a replacement, update the original FDR's replacementFDRId and renewalStatus
    let updatedRecords = [newRecord, ...state.fdrRecords];
    if (recordData.replacesFDRId) {
      updatedRecords = updatedRecords.map(r => {
        if (r.id === recordData.replacesFDRId) {
          return {
            ...r,
            replacementFDRId: generatedId,
            renewalStatus: 'REPLACEMENT_SUBMITTED',
            lastUpdatedDate: todayStr,
          };
        }
        return r;
      });
    }

    setState(prev => ({
      ...prev,
      fdrRecords: updatedRecords,
      notifications: [
        {
          id: `NOTIF-NEW-${Date.now()}`,
          title: 'New FDR Submission Received',
          message: `${institution.name} submitted FDR #${newRecord.instrumentNumber} (${newRecord.bankName}) for verification.`,
          category: 'SYSTEM',
          severity: 'INFO',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          isRead: false,
          relatedFdrId: generatedId,
          targetModule: 'verification',
        },
        ...prev.notifications,
      ],
    }));

    addAuditLog(
      'FDR_SUBMITTED',
      'FDR',
      generatedId,
      `New FDR ${generatedId} (${newRecord.instrumentNumber}) submitted for ${institution.name}. Amount: ₹${newRecord.fdrAmount.toLocaleString('en-IN')}`
    );

    return generatedId;
  };

  const updateFDRVerification = (fdrId: string, status: FDRVerificationStatus, note?: string) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const nowTime = new Date().toISOString().replace('T', ' ').slice(0, 19);

    setState(prev => {
      const updated = prev.fdrRecords.map(fdr => {
        if (fdr.id !== fdrId) return fdr;
        const newNotes = [...fdr.scrutinyNotes];
        if (note) {
          newNotes.push({
            id: `NOTE-${Date.now()}`,
            authorName: currentUser.name,
            authorRole: prev.currentRole,
            timestamp: nowTime,
            note,
            type: status === 'VERIFIED' ? 'APPROVAL' : status === 'REJECTED' ? 'REJECTION' : 'GENERAL',
          });
        }
        return {
          ...fdr,
          verificationStatus: status,
          verifiedBy: status === 'VERIFIED' ? currentUser.name : fdr.verifiedBy,
          verifiedDate: status === 'VERIFIED' ? todayStr : fdr.verifiedDate,
          lastUpdatedDate: todayStr,
          hasDiscrepancy: status === 'DISCREPANCY_FLAGGED' ? true : (status === 'VERIFIED' ? false : fdr.hasDiscrepancy),
          renewalStatus: (fdr.isReplacement && status === 'VERIFIED') ? 'REPLACEMENT_VERIFIED' : fdr.renewalStatus,
          scrutinyNotes: newNotes,
        };
      });

      return { ...prev, fdrRecords: updated };
    });

    addAuditLog(
      `VERIFICATION_STATUS_${status}`,
      'FDR',
      fdrId,
      `Verification status updated to '${status}' by ${currentUser.name}. ${note ? `Note: ${note}` : ''}`
    );
  };

  const flagDiscrepancy = (fdrId: string, field: string, submitted: string, extracted: string, reason: string) => {
    const nowTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setState(prev => {
      const updated = prev.fdrRecords.map(fdr => {
        if (fdr.id !== fdrId) return fdr;
        const existingDiscrepancies = fdr.discrepancyDetails || [];
        const newDiscrepancy = { field, submittedValue: submitted, extractedValue: extracted, reason };
        const newNotes = [
          ...fdr.scrutinyNotes,
          {
            id: `NOTE-${Date.now()}`,
            authorName: currentUser.name,
            authorRole: prev.currentRole,
            timestamp: nowTime,
            note: `Discrepancy flagged on ${field}: Form (${submitted}) vs Extraction (${extracted}). Reason: ${reason}`,
            type: 'DISCREPANCY' as const,
          }
        ];
        return {
          ...fdr,
          verificationStatus: 'DISCREPANCY_FLAGGED' as FDRVerificationStatus,
          hasDiscrepancy: true,
          discrepancyDetails: [...existingDiscrepancies, newDiscrepancy],
          scrutinyNotes: newNotes,
          lastUpdatedDate: new Date().toISOString().slice(0, 10),
        };
      });
      return { ...prev, fdrRecords: updated };
    });

    addAuditLog(
      'DISCREPANCY_FLAGGED',
      'FDR',
      fdrId,
      `Discrepancy recorded in ${field} for record ${fdrId}. ${reason}`
    );
  };

  const requestAdditionalInfo = (fdrId: string, queryText: string) => {
    const nowTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setState(prev => {
      const updated = prev.fdrRecords.map(fdr => {
        if (fdr.id !== fdrId) return fdr;
        return {
          ...fdr,
          verificationStatus: 'INFO_REQUIRED' as FDRVerificationStatus,
          pendingQuery: {
            requestedAt: nowTime,
            requestedBy: currentUser.name,
            queryText,
            isResolved: false,
          },
          scrutinyNotes: [
            ...fdr.scrutinyNotes,
            {
              id: `NOTE-${Date.now()}`,
              authorName: currentUser.name,
              authorRole: prev.currentRole,
              timestamp: nowTime,
              note: `Information clarification query sent to institute: "${queryText}"`,
              type: 'QUERY' as const,
            }
          ],
          lastUpdatedDate: new Date().toISOString().slice(0, 10),
        };
      });
      return { ...prev, fdrRecords: updated };
    });

    addAuditLog(
      'INFORMATION_REQUESTED',
      'FDR',
      fdrId,
      `Additional clarification requested for record ${fdrId}: ${queryText}`
    );
  };

  const respondToQuery = (fdrId: string, responseText: string) => {
    const nowTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setState(prev => {
      const updated = prev.fdrRecords.map(fdr => {
        if (fdr.id !== fdrId || !fdr.pendingQuery) return fdr;
        return {
          ...fdr,
          verificationStatus: 'UNDER_REVIEW' as FDRVerificationStatus,
          pendingQuery: {
            ...fdr.pendingQuery,
            isResolved: true,
            response: responseText,
            responseDate: nowTime,
          },
          scrutinyNotes: [
            ...fdr.scrutinyNotes,
            {
              id: `NOTE-${Date.now()}`,
              authorName: currentUser.name,
              authorRole: prev.currentRole,
              timestamp: nowTime,
              note: `Institution response submitted: "${responseText}"`,
              type: 'GENERAL' as const,
            }
          ],
          lastUpdatedDate: new Date().toISOString().slice(0, 10),
        };
      });
      return { ...prev, fdrRecords: updated };
    });

    addAuditLog(
      'QUERY_RESPONDED',
      'FDR',
      fdrId,
      `Institution responded to clarification query for FDR ${fdrId}`
    );
  };

  const initiateRenewal = (fdrId: string) => {
    setState(prev => {
      const updated = prev.fdrRecords.map(fdr => {
        if (fdr.id !== fdrId) return fdr;
        return {
          ...fdr,
          renewalStatus: 'INITIATED' as const,
          lastUpdatedDate: new Date().toISOString().slice(0, 10),
        };
      });
      return { ...prev, fdrRecords: updated };
    });

    addAuditLog('RENEWAL_INITIATED', 'FDR', fdrId, `Renewal workflow initiated for maturing FDR ${fdrId}`);
  };

  const submitReplacementFDR = (originalFdrId: string, replacementData: Partial<FDRRecord>): string => {
    const newId = submitFDR({
      ...replacementData,
      isReplacement: true,
      replacesFDRId: originalFdrId,
    });
    return newId;
  };

  const submitReleaseRequest = (requestData: Partial<ReleaseRefundRequest>): string => {
    const count = state.releaseRequests.length + 1;
    const reqId = `REL-2026-${count.toString().padStart(3, '0')}`;
    const todayStr = new Date().toISOString().slice(0, 10);
    const nowTime = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const fdr = state.fdrRecords.find(f => f.id === requestData.fdrId) || state.fdrRecords[0];

    const newReq: ReleaseRefundRequest = {
      id: reqId,
      fdrId: fdr.id,
      fdrInstrumentNumber: fdr.instrumentNumber,
      institutionId: fdr.institutionId,
      institutionName: fdr.institutionName,
      institutionCode: fdr.institutionCode,
      requestType: requestData.requestType || 'FULL_RELEASE',
      requestAmount: requestData.requestAmount || fdr.fdrAmount,
      reason: requestData.reason || 'Statutory maturity completion',
      supportingDocuments: requestData.supportingDocuments || [],
      status: 'SUBMITTED',
      submissionDate: todayStr,
      lastUpdatedDate: todayStr,
      reviewNotes: [
        {
          id: `RNOTE-${Date.now()}`,
          authorName: currentUser.name,
          authorRole: state.currentRole,
          timestamp: nowTime,
          note: `Release request lodged via institutional portal.`,
          type: 'GENERAL',
        }
      ],
    };

    setState(prev => ({
      ...prev,
      releaseRequests: [newReq, ...prev.releaseRequests],
      notifications: [
        {
          id: `NOTIF-REL-${Date.now()}`,
          title: 'New Release Request Lodged',
          message: `${newReq.institutionName} requested release of ₹${newReq.requestAmount.toLocaleString('en-IN')} for FDR #${newReq.fdrInstrumentNumber}.`,
          category: 'SYSTEM',
          severity: 'INFO',
          timestamp: nowTime,
          isRead: false,
          targetModule: 'release',
        },
        ...prev.notifications,
      ],
    }));

    addAuditLog(
      'RELEASE_REQUEST_SUBMITTED',
      'RELEASE_REQUEST',
      reqId,
      `Release request ${reqId} submitted for ${fdr.institutionName}. Type: ${newReq.requestType}, Amount: ₹${newReq.requestAmount.toLocaleString('en-IN')}`
    );

    return reqId;
  };

  const updateReleaseStatus = (requestId: string, status: ReleaseRequestStatus, note?: string, approvalRef?: string) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const nowTime = new Date().toISOString().replace('T', ' ').slice(0, 19);

    setState(prev => {
      const updated = prev.releaseRequests.map(req => {
        if (req.id !== requestId) return req;
        const newNotes = [...req.reviewNotes];
        if (note) {
          newNotes.push({
            id: `RNOTE-${Date.now()}`,
            authorName: currentUser.name,
            authorRole: prev.currentRole,
            timestamp: nowTime,
            note,
            type: status === 'APPROVED_FOR_PROCESSING' ? 'APPROVAL' : status === 'REJECTED_WITH_REASON' ? 'REJECTION' : 'GENERAL',
          });
        }
        return {
          ...req,
          status,
          assignedReviewer: currentUser.name,
          authorityApprovalRef: approvalRef || req.authorityApprovalRef,
          lastUpdatedDate: todayStr,
          reviewNotes: newNotes,
        };
      });

      return { ...prev, releaseRequests: updated };
    });

    addAuditLog(
      `RELEASE_STATUS_${status}`,
      'RELEASE_REQUEST',
      requestId,
      `Release request ${requestId} updated to '${status}'. ${note ? `Note: ${note}` : ''}`
    );
  };

  const updateRuleConfig = (ruleId: string, updates: Partial<AutomationRuleConfig>) => {
    setState(prev => {
      const updatedRules = prev.rulesConfig.map(r => r.id === ruleId ? { ...r, ...updates } : r);
      return { ...prev, rulesConfig: updatedRules };
    });

    addAuditLog(
      'RULE_CONFIG_UPDATED',
      'RULE_CONFIG',
      ruleId,
      `Automation rule ${ruleId} settings modified.`
    );
  };

  const acknowledgeAlert = (alertId: string) => {
    setState(prev => ({
      ...prev,
      alerts: prev.alerts.map(a => a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' } : a),
    }));
    addAuditLog('ALERT_ACKNOWLEDGED', 'AUTOMATION_SCAN', alertId, `Alert ${alertId} acknowledged.`);
  };

  const resolveAlert = (alertId: string, resolutionNote?: string) => {
    setState(prev => ({
      ...prev,
      alerts: prev.alerts.map(a => a.id === alertId ? {
        ...a,
        status: 'RESOLVED',
        resolvedAt: new Date().toISOString(),
        resolvedBy: currentUser.name,
        resolutionNote: resolutionNote || 'Resolved by administrative review',
      } : a),
    }));
    addAuditLog('ALERT_RESOLVED', 'AUTOMATION_SCAN', alertId, `Alert ${alertId} marked as resolved: ${resolutionNote || 'By user'}`);
  };

  const markNotificationRead = (id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
    }));
  };

  const markAllNotificationsRead = () => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, isRead: true })),
    }));
  };

  const resetToInitialData = () => {
    clearStoredState();
    const { alerts, summary } = runAutomationScan(
      INITIAL_FDR_RECORDS,
      INITIAL_RELEASE_REQUESTS,
      INITIAL_AUTOMATION_RULES,
      []
    );
    const resetState: AppState = {
      ...defaultInitialState,
      alerts,
      scanSummary: summary,
      activeModule: 'dashboard',
    };
    setState(resetState);
    saveStoredState(resetState);
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        currentUser,
        currentInstitution,
        isInstitutionalScoped,
        setActiveModule,
        setSelectedFdrId,
        setSelectedInstitutionId,
        openSubmissionWizard,
        closeSubmissionWizard,
        setMobileNavOpen,
        switchRole,
        submitFDR,
        updateFDRVerification,
        flagDiscrepancy,
        requestAdditionalInfo,
        respondToQuery,
        initiateRenewal,
        submitReplacementFDR,
        submitReleaseRequest,
        updateReleaseStatus,
        executeAutomationScan,
        updateRuleConfig,
        acknowledgeAlert,
        resolveAlert,
        markNotificationRead,
        markAllNotificationsRead,
        resetToInitialData,
        addAuditLog,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
