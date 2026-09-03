import React from 'react';
import {
  CaseStatus,
  CasePriority,
  DocumentStatus,
  VirusScanStatus,
  OcrStatus,
  EvidenceStatus,
} from '@/types';

interface StatusBadgeProps {
  status:
    | CaseStatus
    | CasePriority
    | DocumentStatus
    | VirusScanStatus
    | OcrStatus
    | EvidenceStatus
    | string;
  type?: 'status' | 'priority' | 'virus' | 'ocr' | 'evidence';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'status',
  className = '',
}) => {
  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  const normalized = String(status).toUpperCase();

  // Virus Scan
  if (type === 'virus' || normalized in { CLEAN: 1, INFECTED: 1, SKIPPED: 1 }) {
    if (normalized === 'CLEAN') colorClasses = 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60';
    else if (normalized === 'INFECTED') colorClasses = 'bg-rose-950/80 text-rose-400 border-rose-800/60 animate-pulse';
    else if (normalized === 'PENDING') colorClasses = 'bg-amber-950/80 text-amber-400 border-amber-800/60';
    else colorClasses = 'bg-slate-800 text-slate-400 border-slate-700';
  }
  // Case Priority
  else if (type === 'priority' || normalized in { LOW: 1, MEDIUM: 1, HIGH: 1, CRITICAL: 1 }) {
    if (normalized === 'CRITICAL') colorClasses = 'bg-rose-950/90 text-rose-400 border-rose-700 font-semibold';
    else if (normalized === 'HIGH') colorClasses = 'bg-amber-950/80 text-amber-400 border-amber-700';
    else if (normalized === 'MEDIUM') colorClasses = 'bg-blue-950/70 text-blue-400 border-blue-800';
    else colorClasses = 'bg-slate-800 text-slate-400 border-slate-700';
  }
  // Case / Document / Evidence Status
  else {
    if (normalized === 'OPEN' || normalized === 'ACTIVE' || normalized === 'IN_CUSTODY') {
      colorClasses = 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60';
    } else if (normalized === 'UNDER_INVESTIGATION' || normalized === 'PENDING_REVIEW' || normalized === 'QUEUED') {
      colorClasses = 'bg-amber-950/70 text-amber-400 border-amber-800/60';
    } else if (normalized === 'CLOSED' || normalized === 'ARCHIVED' || normalized === 'DISPOSED') {
      colorClasses = 'bg-slate-800 text-slate-400 border-slate-700';
    } else if (normalized === 'TRANSFERRED' || normalized === 'SUBMITTED_TO_COURT') {
      colorClasses = 'bg-indigo-950/70 text-indigo-300 border-indigo-800/60';
    } else if (normalized === 'FAILED') {
      colorClasses = 'bg-rose-950/80 text-rose-400 border-rose-800/60';
    }
  }

  const label = normalized.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colorClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {label}
    </span>
  );
};
