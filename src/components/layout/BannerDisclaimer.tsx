import React from 'react';
import { Info, Building, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BannerDisclaimer: React.FC = () => {
  const { currentRole, isInstitutionalScoped, currentInstitution } = useApp();

  const roleLabel = {
    ADMIN: 'Regulation Bureau Administrator',
    VERIFIER: 'Verification Officer',
    INSTITUTION: 'Institutional User',
  }[currentRole];

  return (
    <div className="bg-[#FFFFFF] text-[#64748B] border-b border-[#DCE3EB] text-xs py-1.5 px-3 sm:px-6 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="inline-flex items-center gap-1 font-semibold text-[#24476B] bg-[#E8F0F8] px-2 py-0.5 rounded border border-[#DCE3EB] text-[10px] tracking-wide cursor-help"
          title="Demonstration environment using fictional records. No live AICTE or bank integrations are connected."
        >
          <Info className="w-3 h-3 text-[#24476B]" />
          DEMO ENVIRONMENT
        </span>
        <span className="text-[#64748B] hidden md:inline text-[11px]">
          Fictional records for evaluation. No live AICTE or bank systems are connected.
        </span>
      </div>

      <div className="flex items-center gap-2">
        {isInstitutionalScoped && currentInstitution ? (
          <div className="flex items-center gap-1 text-[#24476B] bg-[#F5F7FA] border border-[#DCE3EB] px-2 py-0.5 rounded text-[11px]">
            <Building className="w-3 h-3 text-[#24476B] shrink-0" />
            <span className="font-medium truncate max-w-[180px] sm:max-w-xs">{currentInstitution.name} ({currentInstitution.code})</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[#24476B] bg-[#F5F7FA] border border-[#DCE3EB] px-2 py-0.5 rounded text-[11px]">
            <UserCheck className="w-3 h-3 text-[#24476B] shrink-0" />
            <span className="font-medium">{roleLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
};
