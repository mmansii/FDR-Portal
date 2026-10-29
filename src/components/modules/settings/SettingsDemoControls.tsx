import React, { useState } from 'react';
import { 
  Sliders, 
  RotateCcw, 
  ShieldAlert, 
  Cpu, 
  Database, 
  Server, 
  CheckCircle2, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { ConfirmDialog } from '../../common/ConfirmDialog';

export const SettingsDemoControls: React.FC = () => {
  const { currentRole, resetToInitialData } = useApp();

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [resetSuccessNotice, setResetSuccessNotice] = useState(false);

  const handleExecuteReset = () => {
    resetToInitialData();
    setResetSuccessNotice(true);
    setTimeout(() => setResetSuccessNotice(false), 5000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              System Settings & Demonstration Controls
            </h2>
            <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2 py-0.5 rounded-full">
              
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational environment variables, rule engine presets, and demonstration dataset restore tools.
          </p>
        </div>
      </div>

      {resetSuccessNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">
            Demonstration dataset restored successfully! All 18 technical institutions, 36+ FDRs, audit trails, and rules have been re-initialized to initial baseline state.
          </span>
        </div>
      )}

      {/* Grid: Demo Controls & Environment Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Demo Dataset Reset */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Demonstration State Management</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
             Use this control to restore the clean initial dataset at any time.
          </p>

          <div className="p-3.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
            <span className="font-bold block">Reset Baseline Contents:</span>
            <ul className="list-disc list-inside space-y-0.5 text-amber-800">
              <li>18 Technical Institutions across 18 Indian States</li>
              <li>36+ Interconnected Fixed Deposit Records</li>
              <li>Intentional test discrepancy records & date anomalies</li>
              <li>6 Release & Refund files in varying review stages</li>
              <li>10 Configurable Surveillance Rules with baseline thresholds</li>
            </ul>
          </div>

          <button
            onClick={() => setConfirmResetOpen(true)}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restore Initial Demonstration Dataset</span>
          </button>
        </div>

        {/* Card 2: Environment Information */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Server className="w-4 h-4 text-emerald-600" />
            <span>Application Architecture & Stack</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Frontend Framework:</span>
              <span className="font-mono font-bold text-slate-800">React 19 + TypeScript (Strict)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Build Tool & Bundler:</span>
              <span className="font-mono font-bold text-slate-800">Vite 8.3 + Tailwind CSS v4</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Client-Side Persistence:</span>
              <span className="font-mono font-bold text-slate-800">HTML5 LocalStorage (v2 Schema)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Design Foundation:</span>
              <span className="font-semibold text-slate-800">Gov-Tech Navy / Emerald / Amber UI</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Rule Engine Execution:</span>
              <span className="font-mono font-bold text-blue-700">Client-side Deterministic Multi-Rule Scan</span>
            </div>
            <div className="flex justify-between py-2">
            </div>
          </div>
        </div>

      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={handleExecuteReset}
        title="Restore Initial Dataset"
        message="Are you sure you want to reset the application state to its initial demonstration dataset?\n\nThis will clear any local records you created and restore all fictional institutions, FDRs, and seed logs."
        confirmLabel="Reset Everything"
        variant="danger"
      />

    </div>
  );
};
