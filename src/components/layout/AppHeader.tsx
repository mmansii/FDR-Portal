import React, { useState } from 'react';
import {
  Bell,
  PlusCircle,
  Shield,
  ChevronDown,
  User,
  Check,
  Building2,
  RefreshCw,
  Menu
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationDrawer } from '../common/NotificationDrawer';

export const AppHeader: React.FC = () => {
  const {
    currentRole,
    currentUser,
    users,
    switchRole,
    notifications,
    openSubmissionWizard,
    executeAutomationScan,
    mobileNavOpen,
    setMobileNavOpen
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      executeAutomationScan();
      setIsScanning(false);
    }, 500);
  };

  return (
    <>
      <header className="bg-[#FFFFFF] text-[#1F2937] border-b border-[#DCE3EB] sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Left Brand Identity & Mobile Hamburger Toggle */}
<div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 rounded-lg text-[#1F2937] hover:bg-[#F5F7FA] border border-[#DCE3EB] touch-target focus:outline-none focus:ring-2 focus:ring-[#24476B]"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileNavOpen}
            >
              <Menu className="w-5 h-5 text-[#24476B]" />
            </button>

            {/* Emblem/Shield Icon */}
            <div className="w-9 h-9 rounded-lg bg-[#E8F0F8] border border-[#DCE3EB] flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-[#24476B]" />
            </div>

            {/* Titles */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#1F2937] text-sm sm:text-base tracking-tight">
                  <span className="sm:hidden">Smart FDR Centre</span>
                  <span className="hidden sm:inline">AICTE Smart FDR Command Centre</span>
                </span>
                <span className="hidden md:inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#E8F0F8] text-[#24476B] border border-[#DCE3EB]">
                  Regulation Bureau
                </span>
              </div>
              <p className="text-[#64748B] text-xs hidden sm:block truncate">
                Security Deposit and FDR Management
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 max-w-full">

            {/* Quick Action: Check Records for Issues */}
            <button
              onClick={handleRunScan}
              disabled={isScanning}
              title="Audit records against verification and maturity rules"
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium border border-[#DCE3EB] transition-colors ${isScanning
                ? 'bg-[#FEF7EB] text-[#A85B00] border-[#A85B00]/30'
                : 'bg-[#FFFFFF] hover:bg-[#F5F7FA] text-[#1F2937]'
                }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-[#A85B00]' : 'text-[#24476B]'}`} />
              <span className="hidden md:inline">{isScanning ? 'Checking Records...' : 'Check Records for Issues'}</span>
            </button>

            {/* Quick Action: Submit New FDR */}
            <button
              onClick={() => openSubmissionWizard()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#24476B] hover:bg-[#1a3550] text-[#FFFFFF] text-xs font-semibold shadow-xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Submit New FDR</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setNotifDrawerOpen(true)}
              className="relative p-2 rounded-lg text-[#64748B] hover:text-[#1F2937] hover:bg-[#F5F7FA] border border-[#DCE3EB] transition-colors"
              title="View Alerts & Notifications"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4 text-[#24476B]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#B42318] text-[#FFFFFF] text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F5F7FA] border border-[#DCE3EB] text-xs text-left transition-colors"
                aria-haspopup="true"
                aria-expanded={roleMenuOpen}
              >
                <div className="w-6 h-6 rounded-full bg-[#E8F0F8] text-[#24476B] font-bold text-xs flex items-center justify-center shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <div className="font-semibold text-[#1F2937] leading-tight truncate max-w-[130px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-[#64748B] font-medium leading-none">
                    {currentRole === 'ADMIN' ? 'Bureau Admin' : currentRole === 'VERIFIER' ? 'Verification Officer' : 'Institution User'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
              </button>

              {/* Role Switcher Menu */}
              {roleMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 rounded-xl bg-[#FFFFFF] border border-[#DCE3EB] shadow-lg py-2 z-50 text-xs text-[#1F2937] animate-in fade-in zoom-in-95 duration-100"

                >
                  <div className="px-3 py-1.5 border-b border-[#DCE3EB] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                    Switch User Role
                  </div>

                  {users.map(u => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchRole(u.role, u.id);
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 flex items-start gap-2.5 transition-colors ${isSelected ? 'bg-[#E8F0F8] text-[#24476B] font-medium' : 'hover:bg-[#F5F7FA] text-[#1F2937]'
                          }`}
                      >
                        <div className="mt-0.5 p-1 rounded-full bg-[#F5F7FA] text-[#24476B]">
                          {u.role === 'INSTITUTION' ? <Building2 className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#1F2937] truncate">{u.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#24476B] shrink-0" />}
                          </div>
                          <p className="text-[11px] text-[#64748B] truncate">{u.designation}</p>
                          <p className="text-[10px] text-[#24476B] truncate mt-0.5 font-medium">
                            Role: {u.role === 'ADMIN' ? 'Regulation Bureau Admin' : u.role === 'VERIFIER' ? 'Verification Officer' : 'Institutional User'}
                          </p>
                        </div>
                      </button>
                    );
                  })}

                  <div className="mt-2 pt-2 border-t border-[#DCE3EB] px-3 text-[11px] text-[#64748B] leading-relaxed">
                    Selecting a role adjusts available workflows and access permissions.
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Slide-out Notification Centre */}
      <NotificationDrawer
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
      />
    </>
  );
};
