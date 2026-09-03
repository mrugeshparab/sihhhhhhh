import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Package,
  Search,
  History,
  Users,
  Building2,
  ShieldCheck,
  Lock,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { isAdmin, canViewAudit } = useAuth();

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Cases & Matters', to: '/cases', icon: Briefcase },
    { label: 'Documents Vault', to: '/documents', icon: FileText },
    { label: 'Evidence Register', to: '/evidence', icon: Package },
    { label: 'Search & OCR', to: '/search', icon: Search },
  ];

  const adminItems = [
    ...(canViewAudit
      ? [{ label: 'Audit Logs & Ledger', to: '/audit-logs', icon: History }]
      : []),
    ...(isAdmin
      ? [
          { label: 'User Management', to: '/users', icon: Users },
          { label: 'Departments', to: '/departments', icon: Building2 },
        ]
      : []),
  ];

  const settingsItems = [
    { label: 'Security & Profile', to: '/settings/security', icon: Lock },
  ];

  const renderNavList = (items: typeof navItems) => (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
              }`
            }
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 lg:hidden">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <span>Operations Menu</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Core Operations
            </div>
            {renderNavList(navItems)}
          </div>

          {adminItems.length > 0 && (
            <div>
              <div className="px-3 mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Governance & Auditing
              </div>
              {renderNavList(adminItems)}
            </div>
          )}

          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Account & Credentials
            </div>
            {renderNavList(settingsItems)}
          </div>
        </div>

        {/* Legal notice footer in sidebar */}
        <div className="p-3 m-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cryptographic Attestation</span>
          </div>
          <p className="text-[10px] text-slate-400">
            All document uploads and access events are immutably hashed and recorded in the audit ledger.
          </p>
        </div>
      </aside>
    </>
  );
};
