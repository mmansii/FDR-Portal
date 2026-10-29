import React from 'react';
import {
  Building2,
  FileText,
  ShieldCheck,
  Clock,
  CalendarClock,
  AlertTriangle,
  RefreshCw,
  ArrowUpRight,
  AlertCircle,
  FileSearch,
  ExternalLink,
  CheckCircle2,
  ChevronRight,
  Cpu
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { StatCard } from '../../common/StatCard';
import { StatusBadge } from '../../common/StatusBadge';
import { formatINR, formatINRShort } from '../../../utils/currencyUtils';

export const OverviewDashboard: React.FC = () => {
  const {
    institutions,
    fdrRecords,
    releaseRequests,
    alerts,
    auditLogs,
    isInstitutionalScoped,
    currentInstitution,
    setSelectedFdrId,
    setActiveModule,
    openSubmissionWizard
  } = useApp();

  // Baseline records respecting role scope
  const scopedFDRs = isInstitutionalScoped && currentInstitution
    ? fdrRecords.filter(f => f.institutionId === currentInstitution.id)
    : fdrRecords;

  const scopedRequests = isInstitutionalScoped && currentInstitution
    ? releaseRequests.filter(r => r.institutionId === currentInstitution.id)
    : releaseRequests;

  const scopedAlerts = isInstitutionalScoped && currentInstitution
    ? alerts.filter(a => a.institutionId === currentInstitution.id && a.status === 'ACTIVE')
    : alerts.filter(a => a.status === 'ACTIVE');

  // --- Dynamic KPI Calculations ---
  const totalInstitutions = isInstitutionalScoped ? 1 : institutions.length;
  const totalFDRs = scopedFDRs.length;
  const verifiedActiveFDRs = scopedFDRs.filter(f => f.verificationStatus === 'VERIFIED');
  const totalSecuredAmount = verifiedActiveFDRs.reduce((sum, f) => sum + f.fdrAmount, 0);

  const pendingVerificationFDRs = scopedFDRs.filter(f => f.verificationStatus === 'PENDING' || f.verificationStatus === 'UNDER_REVIEW');
  const maturingNext30Days = scopedFDRs.filter(f => f.maturityStatus === 'UPCOMING_30' || f.maturityStatus === 'UPCOMING_15' || f.maturityStatus === 'UPCOMING_7');
  const overdueOrMatured = scopedFDRs.filter(f => f.maturityStatus === 'OVERDUE_REVIEW' || f.maturityStatus === 'MATURED');
  const renewalsPending = scopedFDRs.filter(f => f.renewalStatus === 'PENDING_INITIATION' || f.renewalStatus === 'INITIATED' || f.renewalStatus === 'REPLACEMENT_SUBMITTED');
  const openReleaseRequests = scopedRequests.filter(r => r.status !== 'CLOSED' && r.status !== 'REJECTED_WITH_REASON');
  const discrepanciesCount = scopedFDRs.filter(f => f.hasDiscrepancy || f.verificationStatus === 'DISCREPANCY_FLAGGED').length;

  // --- Verification Status Counts for Visualization ---
  const countVerified = scopedFDRs.filter(f => f.verificationStatus === 'VERIFIED').length;
  const countPending = scopedFDRs.filter(f => f.verificationStatus === 'PENDING').length;
  const countUnderReview = scopedFDRs.filter(f => f.verificationStatus === 'UNDER_REVIEW').length;
  const countDiscrepancy = scopedFDRs.filter(f => f.verificationStatus === 'DISCREPANCY_FLAGGED').length;
  const countInfoReq = scopedFDRs.filter(f => f.verificationStatus === 'INFO_REQUIRED').length;

  // --- Maturity Distribution ---
  const countActiveMaturity = scopedFDRs.filter(f => f.maturityStatus === 'ACTIVE').length;
  const count7d = scopedFDRs.filter(f => f.maturityStatus === 'UPCOMING_7').length;
  const count15d = scopedFDRs.filter(f => f.maturityStatus === 'UPCOMING_15').length;
  const count30d = scopedFDRs.filter(f => f.maturityStatus === 'UPCOMING_30').length;
  const countOverdue = overdueOrMatured.length;

  // Bank Distribution
  const bankCounts: Record<string, number> = {};
  scopedFDRs.forEach(f => {
    bankCounts[f.bankName] = (bankCounts[f.bankName] || 0) + 1;
  });
  const topBanks = Object.entries(bankCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Priority Action Queue (Top 6 active high/critical alerts)
  const priorityActions = scopedAlerts
    .filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH')
    .slice(0, 6);

  // Recent Activity Feed (Top 6 logs)
  const recentActivities = auditLogs.slice(0, 6);

  return (
    <div className="space-y-6">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-xl border border-slate-700 shadow-md">       <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              AICTE FDR Regulatory Command Centre
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              DEMO DATA
            </span>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Surveillance and automated lifecycle oversight for technical institution security deposits, rollover tracking, and statutory release requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveModule('automation')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Cpu className="w-4 h-4" />
            <span>Smart Automation Centre</span>
          </button>
          <button
            onClick={() => openSubmissionWizard()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-100 border border-blue-500/30 text-xs font-semibold shadow-xs transition-colors"          >
            <span>Submit FDR</span>
          </button>
        </div>
      </div>
      </div>

      {/* SUMMARY STAT CARDS GRID (Calculated from real records) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

        <StatCard
          title="Registered Institutions"
          value={totalInstitutions}
          subtitle={isInstitutionalScoped ? 'Scoped to My College' : 'Pan-India Technical Institutions'}
          icon={Building2}
          colorScheme="navy"
          onClick={() => setActiveModule('institutions')}
        />

        <StatCard
          title="Total Secured Deposits"
          value={formatINRShort(totalSecuredAmount)}
          subtitle={`${verifiedActiveFDRs.length} verified FDR instruments`}
          icon={ShieldCheck}
          colorScheme="emerald"
          badge={`${totalFDRs} in Registry`}
          onClick={() => setActiveModule('repository')}
        />

        <StatCard
          title="Pending Verification"
          value={pendingVerificationFDRs.length}
          subtitle="Citizen Charter SLA: 14 Days"
          icon={Clock}
          colorScheme="amber"
          badge={pendingVerificationFDRs.some(f => f.submissionDate < '2026-10-10') ? 'SLA Delays' : 'Normal Queue'}
          onClick={() => setActiveModule('verification')}
        />

        <StatCard
          title="Upcoming Maturities (&lt; 30d)"
          value={maturingNext30Days.length}
          subtitle={`${count7d} maturing within 7 days`}
          icon={CalendarClock}
          colorScheme={count7d > 0 ? 'rose' : 'blue'}
          badge={count7d > 0 ? 'Urgent Notice' : 'Surveillance Active'}
          onClick={() => setActiveModule('maturity')}
        />

        <StatCard
          title="Matured / Overdue Review"
          value={overdueOrMatured.length}
          subtitle="Rollover replacement pending"
          icon={AlertCircle}
          colorScheme="purple"
          badge="Compliance Alert"
          onClick={() => setActiveModule('maturity')}
        />

        <StatCard
          title="Renewals in Pipeline"
          value={renewalsPending.length}
          subtitle="Replacement instruments tracking"
          icon={RefreshCw}
          colorScheme="blue"
          onClick={() => setActiveModule('maturity')}
        />

        <StatCard
          title="Open Release Requests"
          value={openReleaseRequests.length}
          subtitle="Clearance & refund files"
          icon={ArrowUpRight}
          colorScheme="navy"
          onClick={() => setActiveModule('release')}
        />

        <StatCard
          title="Critical Discrepancies"
          value={discrepanciesCount}
          subtitle="Form vs OCR document mismatches"
          icon={AlertTriangle}
          colorScheme="rose"
          badge={discrepanciesCount > 0 ? 'Action Required' : 'Clean'}
          onClick={() => setActiveModule('verification')}
        />

      </div>

      {/* VISUAL SUMMARIES & CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Verification Queue Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-blue-600" />
              Scrutiny Queue Breakdown
            </h3>
            <span className="text-xs text-slate-500 font-medium">{totalFDRs} Total</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Verified Bar */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-emerald-700">Verified & Active</span>
                <span className="text-slate-800">{countVerified} ({totalFDRs > 0 ? Math.round((countVerified / totalFDRs) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${totalFDRs > 0 ? (countVerified / totalFDRs) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Pending Scrutiny */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-amber-700">Pending Scrutiny</span>
                <span className="text-slate-800">{countPending} ({totalFDRs > 0 ? Math.round((countPending / totalFDRs) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${totalFDRs > 0 ? (countPending / totalFDRs) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Under Review */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-blue-700">Under Review</span>
                <span className="text-slate-800">{countUnderReview}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${totalFDRs > 0 ? (countUnderReview / totalFDRs) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Discrepancy Flagged */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-rose-700">Discrepancy Flagged</span>
                <span className="text-slate-800">{countDiscrepancy}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${totalFDRs > 0 ? (countDiscrepancy / totalFDRs) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Info Required */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-purple-700">Clarification Required</span>
                <span className="text-slate-800">{countInfoReq}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${totalFDRs > 0 ? (countInfoReq / totalFDRs) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveModule('verification')}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-blue-700 text-xs font-bold rounded-lg border border-slate-200 flex items-center justify-center gap-1 transition-colors"
          >
            Launch Verification Queue <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Maturity Forecast Timeline */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-amber-600" />
              Maturity Surveillance Horizon
            </h3>
            <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              30-Day Windows
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-red-50/70 border border-red-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                <span className="font-bold text-red-900">Immediate (&lt; 7 Days)</span>
              </div>
              <span className="font-extrabold text-red-700 text-sm">{count7d} Records</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-orange-50/70 border border-orange-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span className="font-semibold text-orange-900">Critical (8 - 15 Days)</span>
              </div>
              <span className="font-bold text-orange-800 text-sm">{count15d} Records</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/70 border border-amber-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="font-semibold text-amber-900">Proactive (16 - 30 Days)</span>
              </div>
              <span className="font-bold text-amber-800 text-sm">{count30d} Records</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-purple-50/70 border border-purple-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                <span className="font-semibold text-purple-900">Overdue Review Required</span>
              </div>
              <span className="font-bold text-purple-800 text-sm">{countOverdue} Records</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="font-medium text-slate-700">Active Term (&gt; 30 Days)</span>
              </div>
              <span className="font-bold text-slate-800 text-sm">{countActiveMaturity} Records</span>
            </div>
          </div>

          <button
            onClick={() => setActiveModule('maturity')}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-blue-700 text-xs font-bold rounded-lg border border-slate-200 flex items-center justify-center gap-1 transition-colors"
          >
            Open Renewal Tracker <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Issuing Bank Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              Top Issuing Banks Exposure
            </h3>
            <span className="text-xs text-slate-400">Registry Share</span>
          </div>

          <div className="space-y-3 text-xs">
            {topBanks.map(([bank, count], idx) => {
              const pct = totalFDRs > 0 ? Math.round((count / totalFDRs) * 100) : 0;
              return (
                <div key={bank} className="space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span className="font-semibold truncate max-w-[170px]">{bank}</span>
                    <span className="font-bold text-slate-900">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${idx === 0 ? 'bg-blue-600' : idx === 1 ? 'bg-emerald-600' : idx === 2 ? 'bg-purple-600' : 'bg-amber-600'
                        }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
            Illustrative distribution based on demo records. Actual bank exposure may vary.
          </div>
        </div>

      </div>

      {/* PRIORITY ACTION QUEUE & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Priority Action Queue (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                Priority Regulatory Action Queue
              </h3>
              <p className="text-xs text-slate-500">
                Active alerts generated by the rule engine requiring administrative determination
              </p>
            </div>
            <button
              onClick={() => setActiveModule('automation')}
              className="text-xs font-bold text-blue-700 hover:text-blue-900"
            >
              View All ({scopedAlerts.length})
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
            {priorityActions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                No critical or high-priority surveillance alerts pending.
              </div>
            ) : (
              priorityActions.map(action => (
                <div key={action.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge type="severity" value={action.severity} size="sm" />
                      <span className="text-xs font-bold text-slate-900">{action.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">({action.ruleCode})</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{action.evidence}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Institution: <span className="font-medium text-slate-700">{action.institutionName}</span></span>
                      {action.fdrId && (
                        <span>FDR: <span className="font-mono text-blue-700 font-semibold">{action.fdrId}</span></span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (action.fdrId) setSelectedFdrId(action.fdrId);
                      setActiveModule(action.targetModule);
                    }}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-bold border border-blue-200 transition-colors inline-flex items-center gap-1"
                  >
                    <span>Action</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Regulatory Activity (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Recent Audit Events</h3>
            <button
              onClick={() => setActiveModule('audit')}
              className="text-xs font-bold text-blue-700 hover:text-blue-900"
            >
              Full Trail
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto p-4 space-y-3">
            {recentActivities.map(act => (
              <div key={act.id} className="text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-900 text-[11px]">{act.action}</span>
                  <span className="text-[10px] text-slate-400">{act.timestamp.split(' ')[1]}</span>
                </div>
                <p className="text-slate-600 line-clamp-2 leading-relaxed">{act.description}</p>
                <div className="text-[10px] text-slate-400 font-medium">By: {act.userName} ({act.userRole})</div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
