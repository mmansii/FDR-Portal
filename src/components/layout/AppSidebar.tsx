import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Building2,
  CheckSquare,
  Cpu,
  CalendarClock,
  ArrowUpRight,
  BarChart3,
  History,
  Users,
  Sliders,
  Shield,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AppSidebar: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    currentRole,
    isInstitutionalScoped,
    fdrRecords,
    alerts,
    releaseRequests,
    mobileNavOpen,
    setMobileNavOpen
  } = useApp();

  // Dynamic badge counts
  const pendingVerificationCount = fdrRecords.filter(f => f.verificationStatus === 'PENDING' || f.verificationStatus === 'UNDER_REVIEW').length;
  const criticalAlertsCount = alerts.filter(a => a.status === 'ACTIVE' && (a.severity === 'CRITICAL' || a.severity === 'HIGH')).length;
  const upcomingMaturityCount = fdrRecords.filter(f => f.maturityStatus.startsWith('UPCOMING') || f.maturityStatus === 'OVERDUE_REVIEW').length;
  const openReleaseRequestsCount = releaseRequests.filter(r => r.status !== 'CLOSED' && r.status !== 'REJECTED_WITH_REASON').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Overview Dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'VERIFIER', 'INSTITUTION'],
    },
    {
      id: 'repository',
      label: 'FDR Repository',
      icon: FileText,
      roles: ['ADMIN', 'VERIFIER', 'INSTITUTION'],
      badge: fdrRecords.length,
      badgeColor: 'bg-slate-200 text-slate-700',
    },
    {
      id: 'institutions',
      label: isInstitutionalScoped ? 'My Institution Profile' : 'Institutions Directory',
      icon: Building2,
      roles: ['ADMIN', 'VERIFIER', 'INSTITUTION'],
    },
    {
      id: 'verification',
      label: 'Verification Centre',
      icon: CheckSquare,
      roles: ['ADMIN', 'VERIFIER'],
      badge: pendingVerificationCount > 0 ? pendingVerificationCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 font-bold',
    },
    {
      id: 'automation',
      label: 'Smart Automation Centre',
      icon: Cpu,
      roles: ['ADMIN', 'VERIFIER', 'INSTITUTION'],
      badge: criticalAlertsCount > 0 ? criticalAlertsCount : undefined,
      badgeColor: 'bg-red-100 text-red-800 font-bold animate-pulse',
    },
    {
      id: 'maturity',
      label: 'Maturity & Renewal Tracker',
      icon: CalendarClock,
      roles: ['ADMIN', 'VERIFIER', 'INSTITUTION'],
      badge: upcomingMaturityCount > 0 ? upcomingMaturityCount : undefined,
      badgeColor: 'bg-blue-100 text-blue-800 font-semibold',
    },
    {
      id: 'release',
      label: 'Release / Refund Requests',
      icon: ArrowUpRight,
      roles: ['ADMIN', 'VERIFIER', 'INSTITUTION'],
      badge: openReleaseRequestsCount > 0 ? openReleaseRequestsCount : undefined,
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      roles: ['ADMIN', 'VERIFIER', 'INSTITUTION'],
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: History,
      roles: ['ADMIN', 'VERIFIER'],
    },
    {
      id: 'users',
      label: 'User & Role Management',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      id: 'settings',
      label: 'Settings & Demo Controls',
      icon: Sliders,
      roles: ['ADMIN'],
    },
  ];

  return (
    <aside className={`fixed top-[100px] bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col select-none transform transition-transform duration-200 lg:static lg:top-auto lg:bottom-auto lg:translate-x-0 lg:z-auto lg:min-h-[calc(100vh-80px)] ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
      {/* Module Title / Section */}
      <div className="px-4 py-3 border-b border-slate-200">        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
        Navigation Modules
      </span>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isAllowed = item.roles.includes(currentRole);
          const isActive = activeModule === item.id;
          const Icon = item.icon;

          if (!isAllowed) {
            // Render locked item so user knows the role difference
            return (
              <div
                key={item.id}
                title={`Requires ${item.roles.join(' or ')} permission`}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-500 text-xs cursor-not-allowed opacity-60"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.label}</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-slate-500" />
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveModule(item.id);
                setMobileNavOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                ? 'bg-blue-50 text-blue-800 ring-1 ring-inset ring-blue-200'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-700' : 'text-slate-500'}`} />                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] shrink-0 ${item.badgeColor || 'bg-slate-700 text-slate-200'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Automation Status */}
      <div className="p-3 border-t border-slate-200 mt-auto">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <div className="flex items-center gap-2 text-xs text-emerald-800">
            <Shield className="w-4 h-4 shrink-0" />
            <span className="font-semibold">Automation Monitoring</span>
          </div>

          <p className="text-xs text-emerald-800/80 mt-1.5 leading-relaxed">
            Rule-based checks are available in this demonstration. No live bank or government-system integration is connected.
          </p>
        </div>
      </div>

    </aside>
  );
};
