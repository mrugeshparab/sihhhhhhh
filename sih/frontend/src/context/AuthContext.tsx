import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User, UserRole, LoginPayload, Case } from '@/types';
import { authService } from '@/services/auth.service';
import { getAccessToken, setTokens } from '@/services/api';

export interface DemoAccount {
  label: string;
  email: string;
  role: UserRole;
  password: string;
  department: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: 'System Admin',
    email: 'admin@demo.local',
    role: 'SYSTEM_ADMIN',
    password: 'DemoAdmin!234',
    department: 'CID',
  },
  {
    label: 'Investigating Officer',
    email: 'officer@demo.local',
    role: 'INVESTIGATING_OFFICER',
    password: 'DemoOfficer!234',
    department: 'CID',
  },
  {
    label: 'Legal Officer',
    email: 'legal@demo.local',
    role: 'LEGAL_OFFICER',
    password: 'DemoLegal!234',
    department: 'LAW',
  },
  {
    label: 'Prosecutor',
    email: 'prosecutor@demo.local',
    role: 'PROSECUTOR',
    password: 'DemoProsecutor!234',
    department: 'LAW',
  },
  {
    label: 'Auditor',
    email: 'auditor@demo.local',
    role: 'AUDITOR',
    password: 'DemoAuditor!234',
    department: 'CID',
  },
  {
    label: 'Court User',
    email: 'court@demo.local',
    role: 'COURT_USER',
    password: 'DemoCourt!234',
    department: 'LAW',
  },
  {
    label: 'Viewer',
    email: 'viewer@demo.local',
    role: 'VIEWER',
    password: 'DemoViewer!234',
    department: 'CID',
  },
];

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (account: DemoAccount) => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
  isAuditor: boolean;
  isInvestigator: boolean;
  isLegalOfficer: boolean;
  canCreateCase: boolean;
  canManageCase: (c?: Case | null) => boolean;
  canUploadDocument: (c?: Case | null) => boolean;
  canComment: boolean;
  canViewAudit: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        setUser(null);
        return;
      }
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch {
      setUser(null);
      setTokens(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    const handleAuthExpired = () => {
      setUser(null);
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const { user: loggedInUser } = await authService.login(payload);
      setUser(loggedInUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setTokens(null);
    }
  };

  const switchDemoRole = async (account: DemoAccount) => {
    setIsLoading(true);
    try {
      const { user: loggedInUser } = await authService.login({
        email: account.email,
        password: account.password,
      });
      setUser(loggedInUser);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const updated = await authService.getCurrentUser();
      setUser(updated);
    } catch {
      // Ignored
    }
  };

  const role = user?.role;

  const permissions = useMemo(() => {
    const isAdmin = role === 'SYSTEM_ADMIN';
    const isAuditor = role === 'AUDITOR';
    const isInvestigator = role === 'INVESTIGATING_OFFICER';
    const isLegalOfficer = role === 'LEGAL_OFFICER';

    const canCreateCase = isAdmin || isInvestigator || isLegalOfficer;

    const canManageCase = (c?: Case | null) => {
      if (!user) return false;
      if (isAdmin) return true;
      if (!c) return false;
      return c.created_by === user.id || c.assigned_officer_id === user.id;
    };

    const canUploadDocument = (c?: Case | null) => {
      if (!user) return false;
      if (isAdmin) return true;
      if (user.role === 'VIEWER' || user.role === 'COURT_USER') return false;
      if (!c) return true; // Can attempt if authorized by backend
      return c.created_by === user.id || c.assigned_officer_id === user.id;
    };

    const canComment = user?.role !== 'VIEWER';
    const canViewAudit = isAdmin || isAuditor;

    return {
      isAdmin,
      isAuditor,
      isInvestigator,
      isLegalOfficer,
      canCreateCase,
      canManageCase,
      canUploadDocument,
      canComment,
      canViewAudit,
    };
  }, [user, role]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    switchDemoRole,
    refreshProfile,
    ...permissions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
