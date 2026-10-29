import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  ShieldCheck, 
  Clock, 
  User, 
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { exportToCSV } from '../../../services/exportCsv';
import { formatDateTime } from '../../../utils/dateUtils';

export const AuditTrailModule: React.FC = () => {
  const { auditLogs } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const filteredLogs = auditLogs.filter(log => {
    if (roleFilter && log.userRole !== roleFilter) return false;
    if (actionFilter && !log.action.includes(actionFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.id.toLowerCase().includes(q) ||
        log.description.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        (log.targetId && log.targetId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    exportToCSV(filteredLogs, 'AICTE_Regulatory_Audit_Trail_Export', [
      { header: 'Event Log ID', key: 'id' },
      { header: 'Timestamp', key: 'timestamp' },
      { header: 'Operator Name', key: 'userName' },
      { header: 'Simulated Role', key: 'userRole' },
      { header: 'Action Code', key: 'action' },
      { header: 'Target Type', key: 'targetType' },
      { header: 'Target Record ID', key: l => l.targetId || 'N/A' },
      { header: 'Audit Description', key: 'description' },
    ]);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Statutory Audit Trail & Traceability Ledger
            </h2>
            <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {filteredLogs.length} Events Logged
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable, append-oriented log of administrative decisions, automated scans, and scrutiny actions.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-white shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Log CSV</span>
        </button>
      </div>

      {/* Prototype Governance Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800">Production Governance Disclosure:</span> In this demonstration prototype, audit entries are persisted to local memory for live demonstration traceability. In a deployed government system, audit events are streamed to tamper-proof server logs with cryptographic hashing to guarantee legal non-repudiation.
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
              placeholder="Search by action, operator, or record ID..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 w-64"
            />
          </div>

          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="p-1.5 rounded-lg border border-slate-300 bg-white"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="VERIFIER">VERIFIER</option>
            <option value="INSTITUTION">INSTITUTION</option>
          </select>

          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="p-1.5 rounded-lg border border-slate-300 bg-white"
          >
            <option value="">All Action Categories</option>
            <option value="FDR">FDR Submissions & Statuses</option>
            <option value="SCAN">Automation Scans</option>
            <option value="RELEASE">Release Requests</option>
            <option value="DISCREPANCY">Discrepancy Flags</option>
            <option value="RULE">Rule Configuration Changes</option>
            <option value="ROLE">Role Switches</option>
          </select>

          {(searchQuery || roleFilter || actionFilter) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('');
                setActionFilter('');
              }}
              className="text-blue-700 hover:text-blue-900 font-semibold inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        <div className="text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{filteredLogs.length}</span> audit event(s)
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs min-w-0 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
            <tr>
              <th className="py-3 px-4">Event ID & Timestamp</th>
              <th className="py-3 px-4">Action Code</th>
              <th className="py-3 px-4">Operator & Simulated Role</th>
              <th className="py-3 px-4">Target Record</th>
              <th className="py-3 px-4">Event Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  No audit log entries match the search criteria.
                </td>
              </tr>
            ) : (
              filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono">
                    <span className="font-bold text-slate-900 block">{log.id}</span>
                    <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-blue-800">
                    <span className="bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 block">{log.userName}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                      log.userRole === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                      log.userRole === 'VERIFIER' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {log.userRole}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono">
                    {log.targetId ? (
                      <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                        {log.targetId}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Global System</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-slate-700 leading-relaxed max-w-md">
                    {log.description}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
