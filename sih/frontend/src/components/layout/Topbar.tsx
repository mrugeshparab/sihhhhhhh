import React from 'react';
import { useAuth, DEMO_ACCOUNTS } from '@/context/AuthContext';
import {
  ShieldCheck,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Menu,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface TopbarProps {
  onMenuToggle: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuToggle }) => {
  const { user, logout, switchDemoRole } = useAuth();
  const [isSwitcherOpen, setIsSwitcherOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 flex flex-col bg-slate-900 border-b border-slate-800">
      {/* Classification & Disclaimer Banner */}
      <div className="bg-navy-950 px-4 py-1 flex items-center justify-between text-[11px] font-mono tracking-wider border-b border-navy-900 text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-amber-300 font-semibold">RESTRICTED PROTOTYPE</span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400">DEMO ENVIRONMENT // FICTIONAL DATA ONLY</span>
        </div>
        <div className="text-slate-400 text-right">
          INTEGRITY MONITORED
        </div>
      </div>

      {/* Main Topbar */}
      <div className="flex items-center justify-between h-14 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            aria-label="Toggle navigation menu"
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg lg:hidden transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2.5 text-slate-100 font-semibold tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-900/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <span className="text-sm font-bold tracking-normal block text-slate-100">SECURE LEGAL DMS</span>
              <span className="text-[10px] text-slate-400 font-normal hidden sm:block">Investigation & Evidence Vault</span>
            </div>
          </Link>
        </div>

        {/* Right side: Quick Role Switcher + User info + Logout */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Quick Demo Role Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700/80 text-slate-200 rounded-lg border border-slate-700 transition"
              title="Switch demo account to test role permissions"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Test Role:</span>
              <span className="font-semibold text-blue-400 truncate max-w-[120px]">
                {user?.role.replace(/_/g, ' ')}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isSwitcherOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-fade-in">
                <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  SWITCH DEMO TEST ACCOUNT
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => {
                        setIsSwitcherOpen(false);
                        switchDemoRole(acc);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-slate-800 transition ${
                        user?.role === acc.role ? 'bg-blue-950/50 text-blue-400' : 'text-slate-300'
                      }`}
                    >
                      <div className="font-semibold flex items-center justify-between">
                        <span>{acc.label}</span>
                        <span className="text-[10px] text-slate-500">{acc.department}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{acc.email}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User profile info */}
          <Link
            to="/profile"
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-slate-100 transition"
            title="View Profile"
          >
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="hidden lg:block text-left text-xs leading-tight">
              <div className="font-medium text-slate-200 truncate max-w-[130px]">{user?.full_name}</div>
              <div className="text-[10px] text-slate-400">{user?.employee_id}</div>
            </div>
          </Link>

          {/* Logout */}
          <button
            type="button"
            onClick={logout}
            aria-label="Log out"
            title="Log out of secure session"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
