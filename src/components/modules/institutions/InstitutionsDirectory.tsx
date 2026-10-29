import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  MapPin, 
  GraduationCap, 
  ShieldAlert, 
  FileText, 
  Eye, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink,
  PlusCircle
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Institution, FDRRecord } from '../../../types';
import { formatINR, formatINRShort } from '../../../utils/currencyUtils';
import { StatusBadge } from '../../common/StatusBadge';
import { Modal } from '../../common/Modal';

export const InstitutionsDirectory: React.FC = () => {
  const { 
    institutions, 
    fdrRecords, 
    releaseRequests, 
    isInstitutionalScoped, 
    currentInstitution,
    setSelectedFdrId,
    setActiveModule,
    openSubmissionWizard
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected institution for detailed inspection modal
  const [viewingInst, setViewingInst] = useState<Institution | null>(
    isInstitutionalScoped && currentInstitution ? currentInstitution : null
  );

  const baseInstitutions = useMemo(() => {
    if (isInstitutionalScoped && currentInstitution) {
      return [currentInstitution];
    }
    return institutions;
  }, [institutions, isInstitutionalScoped, currentInstitution]);

  const uniqueStates = useMemo(() => {
    return Array.from(new Set(institutions.map(i => i.state))).sort();
  }, [institutions]);

  const filteredInstitutions = useMemo(() => {
    return baseInstitutions.filter(inst => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const match = 
          inst.name.toLowerCase().includes(q) ||
          inst.code.toLowerCase().includes(q) ||
          inst.city.toLowerCase().includes(q) ||
          inst.headName.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (categoryFilter && inst.category !== categoryFilter) return false;
      if (stateFilter && inst.state !== stateFilter) return false;
      if (statusFilter && inst.status !== statusFilter) return false;
      return true;
    });
  }, [baseInstitutions, searchTerm, categoryFilter, stateFilter, statusFilter]);

  // Institution stats helper
  const getInstStats = (instId: string) => {
    const list = fdrRecords.filter(f => f.institutionId === instId);
    const totalSecured = list.filter(f => f.verificationStatus === 'VERIFIED').reduce((sum, f) => sum + f.fdrAmount, 0);
    const pendingCount = list.filter(f => f.verificationStatus === 'PENDING' || f.verificationStatus === 'UNDER_REVIEW').length;
    const upcomingCount = list.filter(f => f.maturityStatus.startsWith('UPCOMING') || f.maturityStatus === 'OVERDUE_REVIEW').length;
    const requestsCount = releaseRequests.filter(r => r.institutionId === instId && r.status !== 'CLOSED').length;
    return {
      fdrCount: list.length,
      totalSecured,
      pendingCount,
      upcomingCount,
      requestsCount,
      fdrs: list,
    };
  };

  const viewingStats = viewingInst ? getInstStats(viewingInst.id) : null;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              {isInstitutionalScoped ? 'Institutional Compliance Profile' : 'Technical Institutions Directory'}
            </h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {filteredInstitutions.length} Institutions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Surveillance ledger of AICTE approved colleges, required endowment reserves, and security deposit coverage.
          </p>
        </div>

        {isInstitutionalScoped && (
          <button
            onClick={() => openSubmissionWizard(currentInstitution?.id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Submit Deposit for My College</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar (Only when multiple institutions available) */}
      {!isInstitutionalScoped && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by Institution Name, Approval Code, City, or Head of Institute..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="p-2 text-xs rounded-lg border border-slate-300 bg-white"
            >
              <option value="">All Categories</option>
              <option value="ENGINEERING">Engineering</option>
              <option value="MANAGEMENT">Management</option>
              <option value="POLYTECHNIC">Polytechnic</option>
              <option value="PHARMACY">Pharmacy</option>
            </select>

            <select
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
              className="p-2 text-xs rounded-lg border border-slate-300 bg-white"
            >
              <option value="">All States</option>
              {uniqueStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="p-2 text-xs rounded-lg border border-slate-300 bg-white"
            >
              <option value="">All Compliance Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="UNDER_SCRUTINY">Under Scrutiny</option>
              <option value="DEFAULTER_FLAGGED">Defaulter Flagged</option>
            </select>
          </div>
        </div>
      )}

      {/* Institutions Cards / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInstitutions.map(inst => {
          const stats = getInstStats(inst.id);
          const isCompliant = stats.totalSecured >= inst.totalDepositRequired;

          return (
            <div
              key={inst.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {inst.code}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    inst.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : inst.status === 'UNDER_SCRUTINY'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {inst.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                  {inst.name}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{inst.city}, {inst.state}</span>
                  <span className="text-slate-300">•</span>
                  <span className="font-medium text-slate-700">{inst.category}</span>
                </div>
              </div>

              {/* Deposit Coverage Summary Box */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Secured in FDRs:</span>
                  <span className="font-bold text-emerald-800">{formatINR(stats.totalSecured)}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Statutory Required:</span>
                  <span className="font-semibold text-slate-700">{formatINR(inst.totalDepositRequired)}</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isCompliant ? 'bg-emerald-600' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, (stats.totalSecured / inst.totalDepositRequired) * 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] pt-1 border-t border-slate-200 text-slate-600">
                  <span>{stats.fdrCount} FDR Instruments</span>
                  {stats.pendingCount > 0 && (
                    <span className="text-amber-700 font-bold">{stats.pendingCount} Scrutiny Pending</span>
                  )}
                </div>
              </div>

              {/* Card Footer Button */}
              <button
                onClick={() => setViewingInst(inst)}
                className="w-full py-2 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect Institutional Dossier</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* INSTITUTION DETAILS DOSSIER MODAL */}
      {viewingInst && (
        <Modal
          isOpen={!!viewingInst}
          onClose={() => setViewingInst(null)}
          title={`Institutional Dossier: ${viewingInst.name}`}
          subtitle={`AICTE Permanent Approval Code: ${viewingInst.code}`}
          maxWidth="4xl"
          footer={
            <div className="w-full flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Registered Head: {viewingInst.headName} • Intake: {viewingInst.approvedIntake} Seats
              </span>
              <button
                onClick={() => setViewingInst(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800"
              >
                Close Dossier
              </button>
            </div>
          }
        >
          <div className="space-y-6">
            
            {/* Summary Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Approved Intake</span>
                <span className="text-base font-bold text-slate-900">{viewingInst.approvedIntake} Seats</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Total Secured</span>
                <span className="text-base font-bold text-emerald-700">{formatINRShort(viewingStats?.totalSecured || 0)}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">FDR Instruments</span>
                <span className="text-base font-bold text-blue-700">{viewingStats?.fdrCount} Recorded</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Pending Reviews</span>
                <span className="text-base font-bold text-amber-700">{viewingStats?.pendingCount} in Queue</span>
              </div>
            </div>

            {/* Contact Details */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Official Email</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  {viewingInst.contactEmail}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Telephone</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  {viewingInst.contactPhone}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Campus Location</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  {viewingInst.city}, {viewingInst.state}
                </span>
              </div>
            </div>

            {/* Associated FDR Records Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Associated Fixed Deposit Instruments ({viewingStats?.fdrs.length})
                </h4>
                <button
                  onClick={() => {
                    setViewingInst(null);
                    openSubmissionWizard(viewingInst.id);
                  }}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900"
                >
                  + Add New FDR
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">FDR Ref</th>
                      <th className="py-2.5 px-3">Bank & Instrument #</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Maturity Date</th>
                      <th className="py-2.5 px-3">Verification</th>
                      <th className="py-2.5 px-3 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewingStats?.fdrs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">
                          No FDR instruments lodged for this institution.
                        </td>
                      </tr>
                    ) : (
                      viewingStats?.fdrs.map(fdr => (
                        <tr key={fdr.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-800">{fdr.id}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-medium text-slate-800">{fdr.bankName}</span>
                            <span className="block text-[11px] text-slate-400 font-mono">#{fdr.instrumentNumber}</span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{formatINR(fdr.fdrAmount)}</td>
                          <td className="py-2.5 px-3">{fdr.maturityDate}</td>
                          <td className="py-2.5 px-3">
                            <StatusBadge type="verification" value={fdr.verificationStatus} size="sm" />
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => {
                                setViewingInst(null);
                                setSelectedFdrId(fdr.id);
                              }}
                              className="text-blue-700 hover:underline font-semibold"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </Modal>
      )}

    </div>
  );
};
