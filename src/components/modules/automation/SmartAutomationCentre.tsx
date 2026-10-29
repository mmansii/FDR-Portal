import React, { useState } from 'react';
import {
  Cpu,
  RefreshCw,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Check,
  RotateCcw,
  Clock,
  Filter,
  Eye,
  Settings2,
  FileText
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { StatusBadge } from '../../common/StatusBadge';
import { AutomationRuleConfig, AutomationAlert, AlertCategory, AlertSeverity } from '../../../types';
import { formatDateTime } from '../../../utils/dateUtils';
import { Modal } from '../../common/Modal';

export const SmartAutomationCentre: React.FC = () => {
  const {
    rulesConfig,
    alerts,
    scanSummary,
    executeAutomationScan,
    updateRuleConfig,
    acknowledgeAlert,
    resolveAlert,
    setSelectedFdrId,
    setActiveModule,
    currentRole,
    isInstitutionalScoped,
    currentInstitution,
    fdrRecords
  } = useApp();
  const [activeTab, setActiveTab] = useState<'alerts' | 'rules'>('alerts');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanReport, setLastScanReport] = useState(scanSummary);

  // Alert Filters
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Resolve Alert Modal State
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [targetAlertToResolve, setTargetAlertToResolve] = useState<AutomationAlert | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  // Edit Rule Modal State
  const [editingRule, setEditingRule] = useState<AutomationRuleConfig | null>(null);
  const [tempThreshold, setTempThreshold] = useState<number>(30);
  const [tempSeverity, setTempSeverity] = useState<AlertSeverity>('HIGH');

  const handleTriggerScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const summary = executeAutomationScan();
      setLastScanReport(summary);
      setIsScanning(false);
    }, 600);
  };

  const handleOpenResolveModal = (alert: AutomationAlert) => {
    setTargetAlertToResolve(alert);
    setResolutionNote(`Condition reviewed and reconciled by ${currentRole}.`);
    setResolveModalOpen(true);
  };

  const handleConfirmResolve = () => {
    if (targetAlertToResolve) {
      resolveAlert(targetAlertToResolve.id, resolutionNote);
      setResolveModalOpen(false);
      setTargetAlertToResolve(null);
    }
  };

  const handleOpenRuleEdit = (rule: AutomationRuleConfig) => {
    setEditingRule(rule);
    setTempThreshold(rule.thresholdDays || 0);
    setTempSeverity(rule.severity);
  };

  const handleSaveRuleConfig = () => {
    if (editingRule) {
      updateRuleConfig(editingRule.id, {
        thresholdDays: tempThreshold,
        severity: tempSeverity,
      });
      setEditingRule(null);
    }
  };

  // Filter alerts according to the user's institution
  const scopedAlerts = isInstitutionalScoped
    ? alerts.filter(alert => {
      if (!currentInstitution) return false;

      if (alert.fdrId) {
        return fdrRecords.some(
          fdr =>
            fdr.id === alert.fdrId &&
            fdr.institutionId === currentInstitution.id
        );
      }

      return alert.institutionName === currentInstitution.name;
    })
    : alerts;

  // Filtered Alerts
  const filteredAlerts = scopedAlerts.filter(alert => {
    if (filterStatus !== 'ALL' && alert.status !== filterStatus) return false;
    if (filterSeverity !== 'ALL' && alert.severity !== filterSeverity) return false;
    if (filterCategory !== 'ALL' && alert.category !== filterCategory) return false;
    return true;
  });

  const activeAlertsCount = scopedAlerts.filter(
    alert => alert.status === 'ACTIVE'
  ).length;

  const criticalCount = scopedAlerts.filter(
    alert => alert.status === 'ACTIVE' && alert.severity === 'CRITICAL'
  ).length;

  const highCount = scopedAlerts.filter(
    alert => alert.status === 'ACTIVE' && alert.severity === 'HIGH'
  ).length;
  return (
    <div className="space-y-6">

      {/* Top Banner & Scan Action Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-xl border border-slate-700 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Cpu className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-black tracking-tight">Smart Automation Engine</h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                10 Configurable Rules Online
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Surveillance engine continuously evaluates repository instruments, detects discrepancies, flags delayed reviews, and triggers explainable actionable alerts.
            </p>
          </div>

          {!isInstitutionalScoped && (
            <button
              onClick={handleTriggerScan}
              disabled={isScanning}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold shadow-md transition-all ${isScanning
                ? 'bg-amber-600 text-white cursor-wait'
                : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-105'
                }`}
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Evaluating Demonstration Records...' : 'Run Automation Scan'}</span>
            </button>
          )}
        </div>

        {/* Scan Summary Banner */}
        {lastScanReport && (
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Last Scan Run</span>
              <span className="font-semibold text-slate-200">{formatDateTime(lastScanReport.scanTimestamp)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Records Audited</span>
              <span className="font-bold text-white">{lastScanReport.recordsEvaluated} Records</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Rules Applied</span>
              <span className="font-bold text-blue-300">{lastScanReport.rulesEvaluated} Rules Active</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Active Alerts</span>
              <span className="font-bold text-amber-400">{lastScanReport.activeAlertsCount} Alerts</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Critical Alerts</span>
              <span className="font-bold text-red-400">{lastScanReport.criticalAlertsCount} Critical</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Cleared / Resolved</span>
              <span className="font-bold text-emerald-400">{lastScanReport.alertsResolved} Resolved</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'alerts'
              ? 'border-blue-600 text-blue-900 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            <span>Surveillance Alerts</span>
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px]">
              {activeAlertsCount}
            </span>
          </button>

          {!isInstitutionalScoped && (
            <button
              onClick={() => setActiveTab('rules')}
              className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'rules'
                ? 'border-blue-600 text-blue-900 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              <span>Configurable Automation Rules</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px]">
                {rulesConfig.filter(r => r.enabled).length}/{rulesConfig.length} Active
              </span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: EXPLAINABLE ALERTS */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">

          {/* Filters Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filters:
              </span>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="p-1.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Alerts Only</option>
                <option value="ACKNOWLEDGED">Acknowledged</option>
                <option value="RESOLVED">Resolved / Cleared</option>
              </select>

              {/* Severity Filter */}
              <select
                value={filterSeverity}
                onChange={e => setFilterSeverity(e.target.value)}
                className="p-1.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="p-1.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="ALL">All Rule Categories</option>
                <option value="UPCOMING_MATURITY">Upcoming Maturity</option>
                <option value="MATURITY_PASSED">Maturity Date Passed</option>
                <option value="MISSING_INFO">Missing Information</option>
                <option value="DATE_INCONSISTENCY">Date Inconsistency</option>
                <option value="POTENTIAL_DUPLICATE">Potential Duplicate</option>
                <option value="RENEWAL_TRACKING">Renewal Lineage</option>
                <option value="VERIFICATION_DELAY">Verification Delay SLA</option>
                <option value="DISCREPANCY_DETECTED">Discrepancy Detected</option>
                <option value="RELEASE_DELAY">Release Delay</option>
                <option value="UNRESOLVED_ACTION">Unresolved Action Reminder</option>
              </select>
            </div>

            <div className="text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-900">{filteredAlerts.length}</span> alert(s)
            </div>
          </div>

          {/* Alert Cards List */}
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-80" />
                <p className="text-sm font-bold text-slate-700">No alerts match the active filter criteria</p>
                <p className="mt-1">All monitored records are currently compliant under selected rules.</p>
              </div>
            ) : (
              filteredAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`rounded-xl border p-4 shadow-xs transition-all ${alert.status === 'RESOLVED'
                    ? 'bg-slate-50/70 border-slate-200 opacity-75'
                    : alert.severity === 'CRITICAL'
                      ? 'bg-white border-red-200 hover:border-red-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">

                    {/* Left: Titles & Tags */}
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge type="severity" value={alert.severity} size="sm" />
                        <span className="font-mono text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {alert.ruleCode}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">{alert.title}</h3>
                        {alert.status === 'ACKNOWLEDGED' && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">
                            Acknowledged
                          </span>
                        )}
                        {alert.status === 'RESOLVED' && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                            Resolved
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                        <span>Institution: <span className="font-semibold text-slate-800">{alert.institutionName}</span></span>
                        {alert.fdrId && (
                          <span>• FDR: <span className="font-mono text-blue-700 font-semibold">{alert.fdrId}</span></span>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                      {alert.status === 'ACTIVE' && (
                        <>
                          <button
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                            title="Acknowledge alert receipt"
                          >
                            Acknowledge
                          </button>
                          <button
                            onClick={() => handleOpenResolveModal(alert)}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-300 transition-colors"
                          >
                            Mark Resolved
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          if (alert.fdrId) setSelectedFdrId(alert.fdrId);
                          setActiveModule(alert.targetModule);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                      >
                        <span>Investigate</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                  {/* Explainability Breakdown Box */}
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Factual Evidence
                      </span>
                      <p className="text-slate-800 font-medium">{alert.evidence}</p>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Regulatory Significance
                      </span>
                      <p className="text-slate-600">{alert.explanation}</p>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Recommended Next Action
                      </span>
                      <p className="text-blue-900 font-semibold">{alert.recommendedNextAction}</p>
                    </div>
                  </div>

                  {alert.resolutionNote && (
                    <div className="mt-2 text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200 flex items-center justify-between">
                      <span>Resolution: {alert.resolutionNote}</span>
                      {alert.resolvedBy && <span>By {alert.resolvedBy}</span>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CONFIGURABLE RULES */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-xl text-xs text-blue-900 flex items-start gap-3">
            <Settings2 className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Configurable Rule Engine Parameters:</span>
              Regulatory thresholds, warning windows, and SLA grace periods can be calibrated live. Any modified thresholds immediately alter subsequent scans and alert generations.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rulesConfig.map(rule => (
              <div
                key={rule.id}
                className={`p-4 rounded-xl border bg-white shadow-xs space-y-3 ${rule.enabled ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
                  }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {rule.ruleCode}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{rule.name}</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{rule.description}</p>
                  </div>

                  {/* Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={e => updateRuleConfig(rule.id, { enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <StatusBadge type="severity" value={rule.severity} size="sm" />
                    {rule.thresholdDays !== undefined && (
                      <span className="text-slate-600 font-medium">
                        Threshold: <span className="font-bold text-slate-900">{rule.thresholdDays} Days</span>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenRuleEdit(rule)}
                    className="text-blue-700 hover:text-blue-900 font-bold text-xs"
                  >
                    Configure Thresholds
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolve Alert Confirmation Modal */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Resolve Regulatory Alert"
        subtitle={targetAlertToResolve ? `Alert ID: ${targetAlertToResolve.id}` : ''}
        maxWidth="md"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setResolveModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmResolve}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Mark as Resolved
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Provide an audit remark explaining how the underlying regulatory discrepancy or condition was reviewed and settled.
          </p>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Resolution Remark *</label>
            <textarea
              rows={3}
              value={resolutionNote}
              onChange={e => setResolutionNote(e.target.value)}
              className="w-full p-2.5 border rounded-lg"
            />
          </div>
        </div>
      </Modal>

      {/* Edit Rule Configuration Modal */}
      <Modal
        isOpen={!!editingRule}
        onClose={() => setEditingRule(null)}
        title={`Configure ${editingRule?.ruleCode}: ${editingRule?.name}`}
        subtitle="Calibrate operational trigger parameters and severity"
        maxWidth="md"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setEditingRule(null)}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveRuleConfig}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              Apply Settings
            </button>
          </div>
        }
      >
        {editingRule && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Alert Severity Classification</label>
              <select
                value={tempSeverity}
                onChange={e => setTempSeverity(e.target.value as AlertSeverity)}
                className="w-full p-2 border rounded-lg bg-white"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            {editingRule.thresholdDays !== undefined && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Threshold Duration (Days)
                </label>
                <input
                  type="number"
                  value={tempThreshold}
                  onChange={e => setTempThreshold(Number(e.target.value))}
                  min={1}
                  max={180}
                  className="w-full p-2 border rounded-lg font-bold"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Trigger condition: {editingRule.conditionDescription}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
};
