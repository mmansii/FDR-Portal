import React from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  Building2, 
  Lock, 
  Check, 
  X, 
  Info,
  KeyRound,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Role } from '../../../types';

export const UserManagementModule: React.FC = () => {
  const { users, currentUser, currentRole, switchRole } = useApp();

  const permissionsMatrix = [
    { feature: 'Cross-Institutional FDR Visibility', admin: true, verifier: true, institution: false },
    { feature: 'New FDR Submission Lodgement', admin: true, verifier: false, institution: true },
    { feature: 'FDR Scrutiny & Approval Endorsement', admin: true, verifier: true, institution: false },
    { feature: 'Flagging Data Discrepancies', admin: true, verifier: true, institution: false },
    { feature: 'Issuing Clarification Queries to Colleges', admin: true, verifier: true, institution: false },
    { feature: 'Responding to Regulatory Clarifications', admin: false, verifier: false, institution: true },
    { feature: 'Submitting Replacement Rollover FDRs', admin: true, verifier: false, institution: true },
    { feature: 'Lodging Statutory Deposit Release Requests', admin: true, verifier: false, institution: true },
    { feature: 'Sanctioning Release / Refund Determinations', admin: true, verifier: true, institution: false },
    { feature: 'Automation Engine Threshold Configuration', admin: true, verifier: false, institution: false },
    { feature: 'Running Batch Automation Scans', admin: true, verifier: true, institution: true },
    { feature: 'Prototype Dataset Reset & Demo Controls', admin: true, verifier: false, institution: false },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Role-Based Access Control (RBAC) & User Directory
            </h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
              3 Simulated Personas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Surveillance of user credentials, simulated personas, and institutional data isolation boundaries.
          </p>
        </div>
      </div>

      {/* Security Disclaimer */}
      

      {/* User Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {users.map(u => {
          const isCurrent = u.id === currentUser.id;

          return (
            <div
              key={u.id}
              className={`p-5 rounded-xl border bg-white shadow-xs space-y-3 flex flex-col justify-between transition-all ${
                isCurrent ? 'border-blue-500 ring-2 ring-blue-100 shadow-md' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                    u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                    u.role === 'VERIFIER' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {u.role}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                      Active User
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{u.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{u.designation}</p>
                </div>

                <div className="text-xs text-slate-600 pt-2 border-t border-slate-100 space-y-1">
                  <div>Department: <span className="font-medium text-slate-800 block text-[11px]">{u.department}</span></div>
                  <div>Email: <span className="font-medium text-slate-800 block text-[11px]">{u.email}</span></div>
                  {u.institutionName && (
                    <div className="pt-1 text-[11px] text-amber-800 font-semibold">
                      Bound to: {u.institutionName}
                    </div>
                  )}
                </div>
              </div>

              <button
                disabled={isCurrent}
                onClick={() => switchRole(u.role, u.id)}
                className={`w-full py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  isCurrent
                    ? 'bg-slate-100 text-slate-400 cursor-default'
                    : 'bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-200'
                }`}
              >
                {isCurrent ? <Check className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                <span>{isCurrent ? 'Currently Active' : 'Switch to this User'}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Privileges & Role-Based Permissions Matrix</h3>
          <p className="text-xs text-slate-500">Comparison of operational capabilities across administrative and institutional roles.</p>
        </div>

        <div className="border border-slate-200 rounded-xl min-w-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-2.5 px-4">Operational Capability / Workflow Action</th>
                <th className="py-2.5 px-4 text-center">Bureau Administrator</th>
                <th className="py-2.5 px-4 text-center">Verification Officer</th>
                <th className="py-2.5 px-4 text-center">Institutional User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionsMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-medium text-slate-800">{row.feature}</td>
                  <td className="py-2.5 px-4 text-center">
                    {row.admin ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {row.verifier ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {row.institution ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
