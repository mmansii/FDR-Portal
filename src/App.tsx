import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { BannerDisclaimer } from './components/layout/BannerDisclaimer';
import { AppHeader } from './components/layout/AppHeader';
import { AppSidebar } from './components/layout/AppSidebar';
import { SubmissionWizardModal } from './components/modules/submission/SubmissionWizardModal';

// 11 Required Navigation Modules
import { OverviewDashboard } from './components/modules/dashboard/OverviewDashboard';
import { FDRRepository } from './components/modules/repository/FDRRepository';
import { InstitutionsDirectory } from './components/modules/institutions/InstitutionsDirectory';
import { VerificationCentre } from './components/modules/verification/VerificationCentre';
import { SmartAutomationCentre } from './components/modules/automation/SmartAutomationCentre';
import { MaturityRenewalTracker } from './components/modules/maturity/MaturityRenewalTracker';
import { ReleaseRefundModule } from './components/modules/release/ReleaseRefundModule';
import { ReportsAnalytics } from './components/modules/reports/ReportsAnalytics';
import { AuditTrailModule } from './components/modules/audit/AuditTrailModule';
import { UserManagementModule } from './components/modules/users/UserManagementModule';
import { SettingsDemoControls } from './components/modules/settings/SettingsDemoControls';

const MainContent: React.FC = () => {
  const { activeModule, mobileNavOpen, setMobileNavOpen } = useApp();

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <OverviewDashboard />;
      case 'repository':
        return <FDRRepository />;
      case 'institutions':
        return <InstitutionsDirectory />;
      case 'verification':
        return <VerificationCentre />;
      case 'automation':
        return <SmartAutomationCentre />;
      case 'maturity':
        return <MaturityRenewalTracker />;
      case 'release':
        return <ReleaseRefundModule />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'audit':
        return <AuditTrailModule />;
      case 'users':
        return <UserManagementModule />;
      case 'settings':
        return <SettingsDemoControls />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900 font-sans overflow-x-hidden">      {/* 1. Prototype Disclaimer Banner */}
      <BannerDisclaimer />

      {/* 2. Official Header */}
      <AppHeader />

      {/* 3. Main Workspace with Sidebar and Content Area */}
      <div className="relative flex-1 flex min-h-0">
        {mobileNavOpen && (
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileNavOpen(false)}
            className="fixed inset-x-0 bottom-0 top-[100px] z-20 bg-slate-900/40 lg:hidden"
          />
        )}

        <AppSidebar />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 overflow-visible">         {renderActiveModule()}
        </main>
      </div>

      {/* 4. Global Submission Wizard Modal */}
      <SubmissionWizardModal />

      {/* 5. Subdued Official Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 px-6 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">AICTE Smart FDR Command Centre</span>
          <span>•</span>
          <span>Regulation Bureau, All India Council for Technical Education, New Delhi</span>
        </div>
        <div className="text-slate-400">
         Client-Side Surveillance Architecture Demonstration
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
