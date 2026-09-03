import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { casesService } from '@/services/cases.service';
import { searchService } from '@/services/search.service';
import { usersService } from '@/services/users.service';
import { auditService } from '@/services/audit.service';
import { Case, DocumentItem } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ClassificationBadge } from '@/components/common/ClassificationBadge';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import {
  Briefcase,
  FileText,
  Package,
  ShieldCheck,
  AlertCircle,
  Users,
  Building2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user, isAdmin, canViewAudit } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [totalCases, setTotalCases] = useState(0);
  const [totalDocs, setTotalDocs] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalDepts, setTotalDepts] = useState(0);
  const [auditCount, setAuditCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [casesRes, docsRes] = await Promise.all([
          casesService.listCases({ page: 1, page_size: 10 }),
          searchService.searchDocuments({ page: 1, page_size: 6 }),
        ]);

        if (!isMounted) return;

        setCases(casesRes.items);
        setTotalCases(casesRes.total);
        setDocuments(docsRes.items);
        setTotalDocs(docsRes.total);

        if (isAdmin) {
          try {
            const [usersRes, deptsRes] = await Promise.all([
              usersService.listUsers(1, 1),
              usersService.listDepartments(1, 1),
            ]);
            if (isMounted) {
              setTotalUsers(usersRes.total);
              setTotalDepts(deptsRes.total);
            }
          } catch {
            // Ignored if unauthorized
          }
        }

        if (canViewAudit) {
          try {
            const auditRes = await auditService.listAuditLogs(1, 1);
            if (isMounted) setAuditCount(auditRes.total);
          } catch {
            // Ignored
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, [isAdmin, canViewAudit]);

  // Analytics data for charts
  const statusCounts = cases.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const statusChartData = Object.entries(statusCounts).map(([name, count]) => ({
    name: name.replace(/_/g, ' '),
    count,
  }));

  const priorityCounts = cases.reduce<Record<string, number>>((acc, c) => {
    acc[c.priority] = (acc[c.priority] || 0) + 1;
    return acc;
  }, {});

  const priorityChartData = [
    { name: 'CRITICAL', count: priorityCounts.CRITICAL || 0, color: '#f43f5e' },
    { name: 'HIGH', count: priorityCounts.HIGH || 0, color: '#f59e0b' },
    { name: 'MEDIUM', count: priorityCounts.MEDIUM || 0, color: '#3b82f6' },
    { name: 'LOW', count: priorityCounts.LOW || 0, color: '#64748b' },
  ].filter((d) => d.count > 0);

  const activeCasesCount = cases.filter(
    (c) => c.status === 'UNDER_INVESTIGATION' || c.status === 'OPEN'
  ).length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100">
              Operations Center
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-950 text-blue-400 border border-blue-800">
              {user?.role.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <strong className="text-slate-200">{user?.full_name}</strong> (Employee ID: {user?.employee_id})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/cases/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition shadow-md shadow-blue-900/30"
          >
            <Briefcase className="w-4 h-4" />
            <span>Open Case</span>
          </Link>
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition"
          >
            <span>Search Vault</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      {isLoading ? (
        <LoadingSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-medium">Assigned Cases</div>
              <div className="text-2xl font-bold text-slate-100 mt-1">{totalCases}</div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <span>{activeCasesCount} under active investigation</span>
              </div>
            </div>
            <div className="p-3 bg-blue-950/80 text-blue-400 border border-blue-800/80 rounded-xl">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-medium">Documents Vault</div>
              <div className="text-2xl font-bold text-slate-100 mt-1">{totalDocs}</div>
              <div className="text-[11px] text-slate-500 mt-1">
                Across authorized files
              </div>
            </div>
            <div className="p-3 bg-indigo-950/80 text-indigo-400 border border-indigo-800/80 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          {isAdmin ? (
            <>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Departmental Staff</div>
                  <div className="text-2xl font-bold text-slate-100 mt-1">{totalUsers}</div>
                  <div className="text-[11px] text-blue-400 mt-1">
                    {totalDepts} Active Units
                  </div>
                </div>
                <div className="p-3 bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Audit Trail Ledger</div>
                  <div className="text-2xl font-bold text-slate-100 mt-1">{auditCount}</div>
                  <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Cryptographically attested</span>
                  </div>
                </div>
                <div className="p-3 bg-amber-950/80 text-amber-400 border border-amber-800/80 rounded-xl">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Evidence Chain</div>
                  <div className="text-2xl font-bold text-slate-100 mt-1">Monitored</div>
                  <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Custody tracked</span>
                  </div>
                </div>
                <div className="p-3 bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 rounded-xl">
                  <Package className="w-6 h-6" />
                </div>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Integrity Ledger</div>
                  <div className="text-2xl font-bold text-slate-100 mt-1">Tamper-Proof</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    SHA-256 Chained Hash
                  </div>
                </div>
                <div className="p-3 bg-navy-950 text-blue-400 border border-navy-800 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Visual Charts & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Bar Chart */}
        <div className="lg:col-span-2 p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              Case Status Distribution
            </h3>
            <span className="text-xs text-slate-400">Current Caseload</span>
          </div>

          <div className="h-60 w-full">
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No case data available for chart.
              </div>
            )}
          </div>
        </div>

        {/* Priority Breakdown Pie Chart */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider mb-4">
            Priority Breakdown
          </h3>

          <div className="h-60 w-full flex flex-col items-center justify-center">
            {priorityChartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="70%">
                  <PieChart>
                    <Pie
                      data={priorityChartData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                    >
                      {priorityChartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="flex flex-wrap items-center justify-center gap-3 text-xs mt-2">
                  {priorityChartData.map((p) => (
                    <div key={p.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-slate-300 font-medium">{p.name}: {p.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-500">No priority data available.</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Cases & Recent Documents Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cases */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-400" />
              <span>Recent Cases</span>
            </h3>
            <Link to="/cases" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {cases.slice(0, 4).map((c) => (
              <Link
                key={c.id}
                to={`/cases/${c.id}`}
                className="block p-3 bg-slate-950/70 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-xl transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-blue-400">
                    {c.case_number}
                  </span>
                  <StatusBadge status={c.status} />
                </div>
                <div className="text-sm font-medium text-slate-200 mt-1 line-clamp-1">
                  {c.title}
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                  <span>{c.case_type.replace(/_/g, ' ')}</span>
                  <span>|</span>
                  <span>{c.created_at ? new Date(c.created_at).toLocaleDateString() : ''}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recently Uploaded Documents */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Recent Documents</span>
            </h3>
            <Link to="/documents" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              <span>View Vault</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {documents.slice(0, 4).map((doc) => (
              <Link
                key={doc.id}
                to={`/documents/${doc.id}`}
                className="block p-3 bg-slate-950/70 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-xl transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-medium text-slate-400">
                    {doc.document_number}
                  </span>
                  <ClassificationBadge classification={doc.classification} />
                </div>
                <div className="text-sm font-medium text-slate-200 mt-1 line-clamp-1">
                  {doc.title}
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                  <span>{doc.document_type.replace(/_/g, ' ')}</span>
                  <span>{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : ''}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
