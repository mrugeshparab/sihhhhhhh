import { api, setTokens, getRefreshToken } from './api';
import {
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  TokenResponse,
  User,
} from '@/types';

export const authService = {
  login: async (payload: LoginPayload): Promise<{ tokens: TokenResponse; user: User }> => {
    const res = await api.post<TokenResponse>('/auth/login', payload);
    setTokens({
      access_token: res.data.access_token,
      refresh_token: res.data.refresh_token,
    });
    const userRes = await api.get<User>('/auth/me');
    return { tokens: res.data, user: userRes.data };
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },

  logout: async (): Promise<void> => {
    const refresh = getRefreshToken();
    try {
      if (refresh) {
        await api.post('/auth/logout', { refresh_token: refresh });
      }
    } finally {
      setTokens(null);
    }
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    await api.post('/auth/change-password', payload);
  },

  register: async (payload: RegisterPayload): Promise<User> => {
    const res = await api.post<User>('/auth/register', payload);
    return res.data;
  },
};
