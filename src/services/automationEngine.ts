import { 
  FDRRecord, 
  ReleaseRefundRequest, 
  AutomationRuleConfig, 
  AutomationAlert, 
  AutomationScanSummary 
} from '../types';
import { getDaysDifference, getDaysPast, isDatePassed } from '../utils/dateUtils';
import { formatINR } from '../utils/currencyUtils';

export function runAutomationScan(
  fdrRecords: FDRRecord[],
  releaseRequests: ReleaseRefundRequest[],
  rulesConfig: AutomationRuleConfig[],
  existingAlerts: AutomationAlert[] = []
): { alerts: AutomationAlert[]; summary: AutomationScanSummary } {
  const generatedAlerts: AutomationAlert[] = [];
  const rulesMap = new Map(rulesConfig.map(r => [r.ruleCode, r]));

  let alertsCreated = 0;
  let alertsUpdated = 0;
  let alertsResolved = 0;

  // RULE 1: Upcoming Maturity (Configurable windows e.g. 30, 15, 7 days)
  const rule1 = rulesMap.get('RULE_1');
  if (rule1 && rule1.enabled) {
    const threshold = rule1.thresholdDays ?? 30;
    fdrRecords.forEach(fdr => {
      if (fdr.verificationStatus === 'REJECTED' || fdr.maturityStatus === 'RELEASED') return;
      const daysLeft = getDaysDifference(fdr.maturityDate);
      if (daysLeft >= 0 && daysLeft <= threshold) {
        let severity = rule1.severity;
        if (daysLeft <= 7) severity = 'CRITICAL';
        else if (daysLeft <= 15) severity = 'HIGH';

        generatedAlerts.push({
          id: `ALT-R1-${fdr.id}`,
          ruleId: rule1.id,
          ruleCode: 'RULE_1',
          category: 'UPCOMING_MATURITY',
          severity,
          fdrId: fdr.id,
          fdrReferenceNumber: fdr.instrumentNumber,
          institutionId: fdr.institutionId,
          institutionName: fdr.institutionName,
          title: `Upcoming FDR Maturity (${daysLeft} Days Remaining)`,
          evidence: `Maturity date is ${fdr.maturityDate} (${daysLeft} calendar days left). Bank: ${fdr.bankName}, Amount: ${formatINR(fdr.fdrAmount)}.`,
          explanation: 'Technical institute security deposits must be proactively monitored. If renewal is not initiated before maturity, statutory interest stops and institution may fall out of regulatory compliance.',
          recommendedNextAction: 'Dispatch automated renewal notice to Registrar and request replacement instrument submission.',
          targetModule: 'maturity',
          detectedAt: new Date().toISOString(),
          status: 'ACTIVE',
        });
      }
    });
  }

  // RULE 2: Maturity Date Reached or Passed
  const rule2 = rulesMap.get('RULE_2');
  if (rule2 && rule2.enabled) {
    fdrRecords.forEach(fdr => {
      if (fdr.verificationStatus === 'REJECTED' || fdr.maturityStatus === 'RELEASED') return;
      if (isDatePassed(fdr.maturityDate) && fdr.renewalStatus !== 'RENEWAL_COMPLETED') {
        const daysPast = getDaysPast(fdr.maturityDate);
        generatedAlerts.push({
          id: `ALT-R2-${fdr.id}`,
          ruleId: rule2.id,
          ruleCode: 'RULE_2',
          category: 'MATURITY_PASSED',
          severity: rule2.severity,
          fdrId: fdr.id,
          fdrReferenceNumber: fdr.instrumentNumber,
          institutionId: fdr.institutionId,
          institutionName: fdr.institutionName,
          title: `Maturity Date Passed (${daysPast} Days Overdue)`,
          evidence: `Maturity date ${fdr.maturityDate} expired ${daysPast} days ago without recorded rollover or approved release.`,
          explanation: 'A security deposit that has passed its maturity date without an active replacement leaves institutional endowment unsecured. Human regulatory scrutiny required to verify status.',
          recommendedNextAction: 'Issue regulatory notice for immediate submission of renewed FDR and mark institution under compliance monitoring.',
          targetModule: 'maturity',
          detectedAt: new Date().toISOString(),
          status: 'ACTIVE',
        });
      }
    });
  }

  // RULE 3: Missing Required Information & Document Metadata
  const rule3 = rulesMap.get('RULE_3');
  if (rule3 && rule3.enabled) {
    fdrRecords.forEach(fdr => {
      const missingFields: string[] = [];
      if (!fdr.ifscCode || fdr.ifscCode.trim() === '') missingFields.push('Bank IFSC Code');
      if (!fdr.branchName || fdr.branchName.trim() === '') missingFields.push('Branch Name');
      if (!fdr.documents || fdr.documents.length === 0) missingFields.push('Supporting FDR Document Scan');
      if (!fdr.instrumentNumber || fdr.instrumentNumber.trim() === '') missingFields.push('Instrument / Receipt Number');

      if (missingFields.length > 0) {
        generatedAlerts.push({
          id: `ALT-R3-${fdr.id}`,
          ruleId: rule3.id,
          ruleCode: 'RULE_3',
          category: 'MISSING_INFO',
          severity: rule3.severity,
          fdrId: fdr.id,
          fdrReferenceNumber: fdr.instrumentNumber || 'UNASSIGNED',
          institutionId: fdr.institutionId,
          institutionName: fdr.institutionName,
          title: `Incomplete Submission: Missing ${missingFields.join(', ')}`,
          evidence: `Record ${fdr.id} is missing mandatory statutory fields: ${missingFields.join(', ')}.`,
          explanation: 'Incomplete deposit metadata prevents independent bank lien verification and automated ledger auditing.',
          recommendedNextAction: 'Return submission to institution with a clarification query requesting the missing details.',
          targetModule: 'verification',
          detectedAt: new Date().toISOString(),
          status: 'ACTIVE',
        });
      }
    });
  }

  // RULE 4: Date Inconsistency Detection
  const rule4 = rulesMap.get('RULE_4');
  if (rule4 && rule4.enabled) {
    fdrRecords.forEach(fdr => {
      const issue = new Date(fdr.issueDate);
      const maturity = new Date(fdr.maturityDate);
      if (!isNaN(issue.getTime()) && !isNaN(maturity.getTime())) {
        if (maturity.getTime() <= issue.getTime()) {
          generatedAlerts.push({
            id: `ALT-R4-${fdr.id}`,
            ruleId: rule4.id,
            ruleCode: 'RULE_4',
            category: 'DATE_INCONSISTENCY',
            severity: rule4.severity,
            fdrId: fdr.id,
            fdrReferenceNumber: fdr.instrumentNumber,
            institutionId: fdr.institutionId,
            institutionName: fdr.institutionName,
            title: 'Critical Date Inconsistency: Maturity Precedes Issue Date',
            evidence: `Issue date is ${fdr.issueDate} while entered maturity date is ${fdr.maturityDate}.`,
            explanation: 'Deposits cannot logically mature before or on their date of issuance. Indicates clerical error or fraudulent document dates.',
            recommendedNextAction: 'Halt verification, flag record, and seek official bank reconciliation certificate.',
            targetModule: 'verification',
            detectedAt: new Date().toISOString(),
            status: 'ACTIVE',
          });
        }
      }
    });
  }

  // RULE 5: Potential Duplicate Instrument References
  const rule5 = rulesMap.get('RULE_5');
  if (rule5 && rule5.enabled) {
    const instrumentMap = new Map<string, FDRRecord[]>();
    fdrRecords.forEach(fdr => {
      if (!fdr.instrumentNumber) return;
      const key = `${fdr.bankName.trim().toLowerCase()}:::${fdr.instrumentNumber.trim().toLowerCase()}`;
      const list = instrumentMap.get(key) || [];
      list.push(fdr);
      instrumentMap.set(key, list);
    });

    instrumentMap.forEach((matches, key) => {
      if (matches.length > 1) {
        matches.forEach(fdr => {
          const matchingIds = matches.filter(m => m.id !== fdr.id).map(m => m.id).join(', ');
          generatedAlerts.push({
            id: `ALT-R5-${fdr.id}`,
            ruleId: rule5.id,
            ruleCode: 'RULE_5',
            category: 'POTENTIAL_DUPLICATE',
            severity: rule5.severity,
            fdrId: fdr.id,
            fdrReferenceNumber: fdr.instrumentNumber,
            institutionId: fdr.institutionId,
            institutionName: fdr.institutionName,
            title: `Potential Duplicate Instrument Reference (${fdr.instrumentNumber})`,
            evidence: `Same instrument number '${fdr.instrumentNumber}' at '${fdr.bankName}' is claimed across multiple records: ${matchingIds}.`,
            explanation: 'Fixed deposit instrument receipts are distinct financial instruments. Duplicate references may represent accidental double-submission or fictitious deposit claims.',
            recommendedNextAction: 'Initiate manual integrity check and compare uploaded receipt image scans for serial number authenticity.',
            targetModule: 'repository',
            detectedAt: new Date().toISOString(),
            status: 'ACTIVE',
          });
        });
      }
    });
  }

  // RULE 6: Renewal / Replacement Lineage Tracking
  const rule6 = rulesMap.get('RULE_6');
  if (rule6 && rule6.enabled) {
    const threshold = rule6.thresholdDays ?? 30;
    fdrRecords.forEach(fdr => {
      if (fdr.verificationStatus === 'REJECTED' || fdr.maturityStatus === 'RELEASED') return;
      const daysLeft = getDaysDifference(fdr.maturityDate);
      if (daysLeft <= threshold && !fdr.replacementFDRId && fdr.renewalStatus === 'PENDING_INITIATION') {
        generatedAlerts.push({
          id: `ALT-R6-${fdr.id}`,
          ruleId: rule6.id,
          ruleCode: 'RULE_6',
          category: 'RENEWAL_TRACKING',
          severity: rule6.severity,
          fdrId: fdr.id,
          fdrReferenceNumber: fdr.instrumentNumber,
          institutionId: fdr.institutionId,
          institutionName: fdr.institutionName,
          title: 'Renewal Unlinked: Maturing Deposit Awaiting Replacement Instrument',
          evidence: `FDR ${fdr.id} expires in ${daysLeft} days with no replacement instrument linked in the repository.`,
          explanation: 'AICTE regulations require continuous financial security coverage. A replacement instrument must be bound to the historical record prior to expiration.',
          recommendedNextAction: 'Enable institution renewal wizard link to submit rollover FDR linked to original reference ID.',
          targetModule: 'maturity',
          detectedAt: new Date().toISOString(),
          status: 'ACTIVE',
        });
      }
    });
  }

  // RULE 7: Verification Delay Exceeded (SLA Threshold)
  const rule7 = rulesMap.get('RULE_7');
  if (rule7 && rule7.enabled) {
    const threshold = rule7.thresholdDays ?? 14;
    fdrRecords.forEach(fdr => {
      if (fdr.verificationStatus === 'PENDING' || fdr.verificationStatus === 'UNDER_REVIEW') {
        const daysPending = getDaysPast(fdr.submissionDate);
        if (daysPending > threshold) {
          generatedAlerts.push({
            id: `ALT-R7-${fdr.id}`,
            ruleId: rule7.id,
            ruleCode: 'RULE_7',
            category: 'VERIFICATION_DELAY',
            severity: rule7.severity,
            fdrId: fdr.id,
            fdrReferenceNumber: fdr.instrumentNumber,
            institutionId: fdr.institutionId,
            institutionName: fdr.institutionName,
            title: `Verification Overdue by ${daysPending - threshold} Days (SLA: ${threshold} Days)`,
            evidence: `Submitted on ${fdr.submissionDate} (${daysPending} days ago). Status remains ${fdr.verificationStatus}.`,
            explanation: 'Under AICTE citizen charter norms, security deposit submissions must be scrutinized within 14 working days.',
            recommendedNextAction: 'Assign verification officer directly and escalate in daily bureau morning docket.',
            targetModule: 'verification',
            detectedAt: new Date().toISOString(),
            status: 'ACTIVE',
          });
        }
      }
    });
  }

  // RULE 8: Discrepancy Detection (Submitted vs OCR Extracted)
  const rule8 = rulesMap.get('RULE_8');
  if (rule8 && rule8.enabled) {
    fdrRecords.forEach(fdr => {
      if (fdr.hasDiscrepancy || fdr.verificationStatus === 'DISCREPANCY_FLAGGED') {
        const details = fdr.discrepancyDetails?.[0];
        const evidenceStr = details
          ? `Discrepancy in ${details.field}: Form says "${details.submittedValue}" vs Document extracted "${details.extractedValue}".`
          : `Discrepancy flagged between submitted data and uploaded instrument metadata.`;

        generatedAlerts.push({
          id: `ALT-R8-${fdr.id}`,
          ruleId: rule8.id,
          ruleCode: 'RULE_8',
          category: 'DISCREPANCY_DETECTED',
          severity: rule8.severity,
          fdrId: fdr.id,
          fdrReferenceNumber: fdr.instrumentNumber,
          institutionId: fdr.institutionId,
          institutionName: fdr.institutionName,
          title: `Data Discrepancy in ${details?.field || 'FDR Record'}`,
          evidence: evidenceStr,
          explanation: 'Discrepancies between submitted form values and bank receipt image OCR indicate potential administrative oversight or altered documents.',
          recommendedNextAction: 'Launch Verification Centre side-by-side comparison panel and issue discrepancy notice to college.',
          targetModule: 'verification',
          detectedAt: new Date().toISOString(),
          status: 'ACTIVE',
        });
      }
    });
  }

  // RULE 9: Release / Refund Review Delay
  const rule9 = rulesMap.get('RULE_9');
  if (rule9 && rule9.enabled) {
    const threshold = rule9.thresholdDays ?? 21;
    releaseRequests.forEach(req => {
      if (req.status !== 'PROCESSING_RECORDED' && req.status !== 'CLOSED' && req.status !== 'REJECTED_WITH_REASON') {
        const daysInReview = getDaysPast(req.submissionDate);
        if (daysInReview > threshold) {
          generatedAlerts.push({
            id: `ALT-R9-${req.id}`,
            ruleId: rule9.id,
            ruleCode: 'RULE_9',
            category: 'RELEASE_DELAY',
            severity: rule9.severity,
            institutionId: req.institutionId,
            institutionName: req.institutionName,
            title: `Release Request ${req.id} Delayed in Review (${daysInReview} Days)`,
            evidence: `Request for ${formatINR(req.requestAmount)} lodged on ${req.submissionDate} (${daysInReview} days ago). Status: ${req.status}.`,
            explanation: 'Deposit releases involve statutory clearance for student welfare and faculty dues. Delays beyond 21 days lead to institutional grievance escalations.',
            recommendedNextAction: 'Prompt assigned reviewer to finalize recommendation or forward file to Competent Authority.',
            targetModule: 'release',
            detectedAt: new Date().toISOString(),
            status: 'ACTIVE',
          });
        }
      }
    });
  }

  // RULE 10: Unresolved Action / Query Reminders
  const rule10 = rulesMap.get('RULE_10');
  if (rule10 && rule10.enabled) {
    const threshold = rule10.thresholdDays ?? 10;
    fdrRecords.forEach(fdr => {
      if (fdr.pendingQuery && !fdr.pendingQuery.isResolved) {
        const daysOpen = getDaysPast(fdr.pendingQuery.requestedAt.split(' ')[0]);
        if (daysOpen > threshold) {
          generatedAlerts.push({
            id: `ALT-R10-${fdr.id}`,
            ruleId: rule10.id,
            ruleCode: 'RULE_10',
            category: 'UNRESOLVED_ACTION',
            severity: rule10.severity,
            fdrId: fdr.id,
            fdrReferenceNumber: fdr.instrumentNumber,
            institutionId: fdr.institutionId,
            institutionName: fdr.institutionName,
            title: `Clarification Query Unanswered for ${daysOpen} Days`,
            evidence: `Query issued on ${fdr.pendingQuery.requestedAt} remains pending. Institution response not yet submitted.`,
            explanation: 'Unresponsive institutions stall the regulatory compliance pipeline. May trigger automated penalty or inspection.',
            recommendedNextAction: 'Send automated escalation reminder to institutional leadership.',
            targetModule: 'verification',
            detectedAt: new Date().toISOString(),
            status: 'ACTIVE',
          });
        }
      }
    });
  }

  // Merge with existing alerts, maintaining user acknowledgements or resolutions where appropriate
  const existingMap = new Map(existingAlerts.map(a => [a.id, a]));
  const finalAlerts: AutomationAlert[] = [];

  generatedAlerts.forEach(newAlert => {
    const prev = existingMap.get(newAlert.id);
    if (!prev) {
      alertsCreated++;
      finalAlerts.push(newAlert);
    } else {
      alertsUpdated++;
      // preserve status if user acknowledged it
      finalAlerts.push({
        ...newAlert,
        status: prev.status === 'RESOLVED' ? 'ACTIVE' : prev.status,
        detectedAt: prev.detectedAt,
      });
      existingMap.delete(newAlert.id);
    }
  });

  // Remaining alerts in existingMap that were NOT generated in this scan have been resolved!
  existingMap.forEach(resolvedAlert => {
    alertsResolved++;
    finalAlerts.push({
      ...resolvedAlert,
      status: 'RESOLVED',
      resolvedAt: new Date().toISOString(),
      resolutionNote: 'Condition cleared in recent dataset audit scan.',
    });
  });

  const activeAlerts = finalAlerts.filter(a => a.status !== 'RESOLVED');

  const summary: AutomationScanSummary = {
    scanTimestamp: new Date().toISOString(),
    recordsEvaluated: fdrRecords.length,
    rulesEvaluated: rulesConfig.filter(r => r.enabled).length,
    alertsCreated,
    alertsUpdated,
    alertsResolved,
    activeAlertsCount: activeAlerts.length,
    criticalAlertsCount: activeAlerts.filter(a => a.severity === 'CRITICAL').length,
    highAlertsCount: activeAlerts.filter(a => a.severity === 'HIGH').length,
  };

  return { alerts: finalAlerts, summary };
}
