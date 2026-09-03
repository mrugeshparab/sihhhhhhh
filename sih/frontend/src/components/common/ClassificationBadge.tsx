import React from 'react';
import { Classification } from '@/types';
import { Shield, ShieldAlert, Lock, Eye } from 'lucide-react';

interface ClassificationBadgeProps {
  classification: Classification | string;
  className?: string;
}

export const ClassificationBadge: React.FC<ClassificationBadgeProps> = ({
  classification,
  className = '',
}) => {
  const norm = String(classification).toUpperCase();

  switch (norm) {
    case 'RESTRICTED':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-rose-950 text-rose-300 border border-rose-700 shadow-sm ${className}`}
          title="Restricted: Highly sensitive investigation or national security document"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          RESTRICTED
        </span>
      );
    case 'CONFIDENTIAL':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-amber-950/90 text-amber-300 border border-amber-700 ${className}`}
          title="Confidential: Department internal legal/case document"
        >
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          CONFIDENTIAL
        </span>
      );
    case 'INTERNAL':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-800 ${className}`}
          title="Internal: Departmental staff access"
        >
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          INTERNAL
        </span>
      );
    case 'PUBLIC':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 ${className}`}
          title="Public: Authorized for public disclosure"
        >
          <Eye className="w-3.5 h-3.5 text-slate-400" />
          PUBLIC
        </span>
      );
  }
};
