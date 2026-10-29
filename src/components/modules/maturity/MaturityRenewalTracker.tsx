import React, { useState, useMemo } from 'react';
import { 
  CalendarClock, 
  AlertCircle, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  Search, 
  Filter, 
  ExternalLink,
  PlusCircle,
  Building2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { StatusBadge } from '../../common/StatusBadge';
import { formatINR } from '../../../utils/currencyUtils';
import { formatDate, getDaysDifference, getDaysPast } from '../../../utils/dateUtils';
import { FDRDetailModal } from '../repository/FDRDetailModal';

export const MaturityRenewalTracker: React.FC = () => {
  const { 
    fdrRecords, 
    institutions, 
    isInstitutionalScoped, 
    currentInstitution,
    selectedFdrId, 
    setSelectedFdrId, 
    openSubmissionWizard,
    initiateRenewal,
    currentRole
  } = useApp();

  const [activeBucket, setActiveBucket] = useState<'all' | '7d' | '15d' | '30d' | 'overdue'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const baseRecords = useMemo(() => {
    if (isInstitutionalScoped && currentInstitution) {
      return fdrRecords.filter(f => f.institutionId === currentInstitution.id);
    }
    return fdrRecords;
  }, [fdrRecords, isInstitutionalScoped, currentInstitution]);

  // Buckets
  const immediate7d = baseRecords.filter(f => f.maturityStatus === 'UPCOMING_7');
  const critical15d = baseRecords.filter(f => f.maturityStatus === 'UPCOMING_15');
  const upcoming30d = baseRecords.filter(f => f.maturityStatus === 'UPCOMING_30');
  const overdueRecords = baseRecords.filter(f => f.maturityStatus === 'OVERDUE_REVIEW' || f.maturityStatus === 'MATURED');
  const activeRecords = baseRecords.filter(f => f.maturityStatus === 'ACTIVE');

  // Filtered by bucket
  const bucketList = useMemo(() => {
    if (activeBucket === '7d') return immediate7d;
    if (activeBucket === '15d') return critical15d;
    if (activeBucket === '30d') return upcoming30d;
    if (activeBucket === 'overdue') return overdueRecords;
    return [...immediate7d, ...critical15d, ...upcoming30d, ...overdueRecords, ...activeRecords];
  }, [activeBucket, immediate7d, critical15d, upcoming30d, overdueRecords, activeRecords]);

  const filteredRecords = bucketList.filter(f => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.id.toLowerCase().includes(q) ||
      f.institutionName.toLowerCase().includes(q) ||
      f.instrumentNumber.toLowerCase().includes(q) ||
      f.bankName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Maturity & Renewal Lifecycle Tracker
            </h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
              Surveillance Horizon
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Surveillance timeline for upcoming maturities, renewal pipelines, and linked replacement instrument verification.
          </p>
        </div>

        <button
          onClick={() => openSubmissionWizard(isInstitutionalScoped ? currentInstitution?.id : undefined)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Lodgement Rollover FDR</span>
        </button>
      </div>

      {/* Horizon Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        <div
          onClick={() => setActiveBucket('7d')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeBucket === '7d' ? 'bg-red-50 border-red-400 ring-2 ring-red-300' : 'bg-white border-red-200 hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-900 flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-red-600" />
              &lt; 7 Days
            </span>
            <span className="text-xl font-black text-red-700">{immediate7d.length}</span>
          </div>
          <p className="text-[11px] text-red-600/80 mt-1">Urgent Rollover Notice</p>
        </div>

        <div
          onClick={() => setActiveBucket('15d')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeBucket === '15d' ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-300' : 'bg-white border-orange-200 hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-900 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              8 - 15 Days
            </span>
            <span className="text-xl font-black text-orange-800">{critical15d.length}</span>
          </div>
          <p className="text-[11px] text-orange-600/80 mt-1">High Priority Window</p>
        </div>

        <div
          onClick={() => setActiveBucket('30d')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeBucket === '30d' ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300' : 'bg-white border-amber-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
              <Clock className="w-4 h-4 text-amber-600" />
              16 - 30 Days
            </span>
            <span className="text-xl font-black text-amber-800">{upcoming30d.length}</span>
          </div>
          <p className="text-[11px] text-amber-600/80 mt-1">Proactive Renewal Buffer</p>
        </div>

        <div
          onClick={() => setActiveBucket('overdue')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeBucket === 'overdue' ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-300' : 'bg-white border-purple-200 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900 flex items-center gap-1">
              <RefreshCw className="w-4 h-4 text-purple-600" />
              Overdue Review
            </span>
            <span className="text-xl font-black text-purple-800">{overdueRecords.length}</span>
          </div>
          <p className="text-[11px] text-purple-600/80 mt-1">Expired Without Rollover</p>
        </div>

      </div>

      {/* Tracker Table Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveBucket('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              activeBucket === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Horizon Records ({baseRecords.length})
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search maturing records..."
            className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 w-56"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs min-w-0 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
            <tr>
              <th className="py-3 px-4">FDR Ref / Instrument</th>
              <th className="py-3 px-4">Institution</th>
              <th className="py-3 px-4">Bank & Amount</th>
              <th className="py-3 px-4">Maturity Date & Countdown</th>
              <th className="py-3 px-4">Renewal Pipeline Stage</th>
              <th className="py-3 px-4">Linked Replacement</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No records match the active maturity category.
                </td>
              </tr>
            ) : (
              filteredRecords.map(record => {
                const daysLeft = getDaysDifference(record.maturityDate);
                const isOverdue = daysLeft < 0;

                return (
                  <tr
                    key={record.id}
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedFdrId(record.id)}
                  >
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-blue-900 block">{record.id}</span>
                      <span className="text-[11px] text-slate-400 font-mono">#{record.instrumentNumber}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block truncate max-w-xs">{record.institutionName}</span>
                      <span className="font-mono text-[11px] text-slate-400">{record.institutionCode}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{formatINR(record.fdrAmount)}</span>
                      <span className="text-[11px] text-slate-500">{record.bankName}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-900 block">{formatDate(record.maturityDate)}</span>
                      <span className={`text-[11px] font-bold ${
                        isOverdue ? 'text-red-700 bg-red-50 px-1.5 py-0.2 rounded' :
                        daysLeft <= 7 ? 'text-red-600 bg-red-50 px-1.5 py-0.2 rounded' :
                        daysLeft <= 15 ? 'text-orange-600' :
                        daysLeft <= 30 ? 'text-amber-600' : 'text-slate-400'
                      }`}>
                        {isOverdue ? `${getDaysPast(record.maturityDate)} days overdue` : `${daysLeft} days remaining`}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge type="renewal" value={record.renewalStatus} size="sm" />
                    </td>

                    <td className="py-3.5 px-4">
                      {record.replacementFDRId ? (
                        <div className="flex items-center gap-1 font-mono font-bold text-purple-700">
                          <span>{record.replacementFDRId}</span>
                          <span className="text-[10px] font-sans font-medium text-slate-400">(Successor)</span>
                        </div>
                      ) : record.replacesFDRId ? (
                        <div className="flex items-center gap-1 font-mono font-bold text-blue-700">
                          <span>{record.replacesFDRId}</span>
                          <span className="text-[10px] font-sans font-medium text-slate-400">(Predecessor)</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None linked</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                        {!record.replacementFDRId && record.renewalStatus === 'PENDING_INITIATION' && (
                          <button
                            onClick={() => openSubmissionWizard(record.institutionId, record.id)}
                            className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-bold border border-blue-200 transition-colors inline-flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Submit Replacement</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedFdrId(record.id)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <FDRDetailModal
        fdrId={selectedFdrId}
        onClose={() => setSelectedFdrId(null)}
      />

    </div>
  );
};
