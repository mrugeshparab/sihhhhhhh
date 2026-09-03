export type UserRole =
  | 'SYSTEM_ADMIN'
  | 'INVESTIGATING_OFFICER'
  | 'LEGAL_OFFICER'
  | 'PROSECUTOR'
  | 'COURT_USER'
  | 'AUDITOR'
  | 'VIEWER';

export interface User {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  department_id: string | null;
  is_active: boolean;
  is_verified: boolean;
  mfa_enabled: boolean;
  last_login_at: string | null;
  created_at: string | null;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  mfa_required?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
  mfa_code?: string;
}

export interface RegisterPayload {
  employee_id: string;
  full_name: string;
  email: string;
  phone?: string;
  password: string;
  department_id?: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
  created_at: string | null;
}

export interface UserStatusUpdatePayload {
  is_active: boolean;
  is_verified?: boolean;
  role?: UserRole;
}
